import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useGetBlog, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost, useUpdateMyBlog, useGetMe, getGetBlogQueryKey } from '@workspace/api-client-react';
import { getStoredAuthToken } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AudioPlayer } from '@/components/audio-player';
import { uploadFile } from '@/lib/upload';
import { blogAvatarFallback, formatOwnerUsername } from '@/lib/blog-display';
import { ImageCropper } from '@/components/image-cropper';
import { useImageCropper } from '@/lib/use-image-cropper';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const _W1 = ['COLD','DARK','DEAD','DEEP','FAST','FLAT','GREY','HARD','IRON','LATE','LOST','LOUD','MUTE','NEON','NULL','PALE','PURE','ROGUE','RUST','SLOW','SOFT','VOID','WIDE','WIRE','WORN'];
const _W2 = ['BLADE','CHAIN','CHROME','CIPHER','CLOCK','CORE','CRASH','DAWN','DRIFT','ECHO','FLAME','GHOST','GRID','HAZE','LOOP','NERVE','NOISE','PATCH','PULSE','RADAR','RIFT','SHADE','SHIFT','SIGNAL','SMOKE','SPIKE','STATIC','SURGE','TRACE','VALE','WAVE'];

function postFileName(id: number): string {
  const w1 = _W1[id % _W1.length];
  const w2 = _W2[Math.floor(id * 17 + 5) % _W2.length];
  return `${w1}${w2}`;
}
import {
  Loader2,
  PenSquare,
  Trash2,
  Paperclip,
  Image as ImageIcon,
  X,
  Sparkles,
  Heart,
  MessageCircle,
  Send,
  Camera,
  FlipHorizontal,
  StopCircle,
  Play,
  Pause,
  Music,
  Video,
} from 'lucide-react';
import type { BlogPost } from '@workspace/api-client-react';

// ─── Extended types ────────────────────────────────────────────────────────────

type ExtMedia = { id: number; type: string; url: string; order: number; isCircle: boolean };

type ExtPost = BlogPost & {
  likesCount: number;
  isLikedByMe: boolean;
  commentsCount: number;
  media: ExtMedia[];
};

type ExtBlog = {
  id: number;
  title: string;
  handle: string;
  description: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  ownerUsername: string | null;
  user: { id: number; username: string };
  isOwner: boolean;
};

type MediaItem = { type: 'image' | 'video' | 'audio'; url: string; isCircle?: boolean };

// ─── Blog themes ───────────────────────────────────────────────────────────────

type BlogTheme = {
  accent: string;
  accentBg: string;
  accentBorder: string;
  coverGradient: string;
};

const BLOG_THEMES: Record<string, BlogTheme> = {
  'pysy-exe': {
    accent: '#000080',
    accentBg: '#c0c0c0',
    accentBorder: '#808080',
    coverGradient: '#008080',
  },
  'putzermann-core': {
    accent: '#e8e4dc',
    accentBg: 'rgba(232,228,220,0.08)',
    accentBorder: 'rgba(232,228,220,0.22)',
    coverGradient: 'linear-gradient(135deg, #050505 0%, #0a0a0a 60%, #0f0f0f 100%)',
  },
};

const DEFAULT_THEME: BlogTheme = {
  accent: 'hsl(var(--primary))',
  accentBg: 'hsl(var(--primary) / 0.09)',
  accentBorder: 'hsl(var(--primary) / 0.25)',
  coverGradient: 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--background)) 100%)',
};

function getTheme(handle: string): BlogTheme {
  return BLOG_THEMES[handle] ?? DEFAULT_THEME;
}

// ─── Auth headers helper ───────────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  const token = getStoredAuthToken();
  return token ? { 'x-auth-token': token, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

// ─── Circle Video Recorder ─────────────────────────────────────────────────────

function CircleVideoRecorder({
  onRecorded,
  onClose,
  theme,
  isPysy,
}: {
  onRecorded: (blob: Blob) => void;
  onClose: () => void;
  theme: BlogTheme;
  isPysy?: boolean;
}) {
  const [phase, setPhase] = useState<'idle' | 'preview' | 'recording' | 'done'>('idle');
  const [countdown, setCountdown] = useState(60);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const openCamera = useCallback(async (mode: 'user' | 'environment' = 'user') => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode }, audio: true });
      setStream(s);
      setFacingMode(mode);
      setPhase('preview');
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch {
      alert('Не удалось получить доступ к камере');
    }
  }, []);

  const toggleFacingMode = useCallback(() => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    if (stream) stream.getTracks().forEach((t) => t.stop());
    openCamera(next);
  }, [facingMode, stream, openCamera]);

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType });
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      onRecorded(blob);
    };
    recorder.start(100);
    recorderRef.current = recorder;
    setPhase('recording');
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          stopRecording();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const stopRecording = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (recorderRef.current?.state !== 'inactive') recorderRef.current?.stop();
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setPhase('done');
  }, [stream]);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    stream?.getTracks().forEach((t) => t.stop());
  }, [stream]);

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        className={isPysy ? "relative w-72 h-72 rounded-full overflow-hidden win95-sunken bg-black" : "relative w-72 h-72 rounded-full overflow-hidden border-4 bg-black"}
        style={!isPysy ? { borderColor: theme.accentBorder } : undefined}
      >
        {phase === 'idle' ? (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Camera className="h-14 w-14 opacity-40" />
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : undefined }}
          />
        )}
        {phase === 'preview' && (
          <button
            type="button"
            onClick={toggleFacingMode}
            className="absolute top-3 left-3 p-2 rounded-full bg-black/60 text-white z-10"
            title="Переключить камеру"
          >
            <FlipHorizontal className="h-4 w-4" />
          </button>
        )}
        {phase === 'recording' && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 rounded-full px-2 py-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-xs font-mono font-bold">{countdown}s</span>
          </div>
        )}
        {phase === 'done' && (
          <div className="w-full h-full flex items-center justify-center bg-black/70 text-white">
            <div className="text-center">
              <div className="text-2xl mb-1">✓</div>
              <p className="text-xs font-mono">Записано</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {phase === 'idle' && (
          <>
            <Button onClick={() => openCamera('user')} className={isPysy ? "win95-button gap-2" : "font-mono gap-2"} style={!isPysy ? { backgroundColor: theme.accent, color: '#000' } : undefined}>
              <Camera className="h-4 w-4" />
              Открыть камеру
            </Button>
            <Button variant="outline" onClick={onClose} className={isPysy ? "win95-button" : "font-mono"}>Отмена</Button>
          </>
        )}
        {phase === 'preview' && (
          <>
            <Button onClick={startRecording} className={isPysy ? "win95-button gap-2" : "font-mono gap-2 bg-red-500 hover:bg-red-600 text-white"}>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              Запись
            </Button>
            <Button variant="outline" onClick={() => { stream?.getTracks().forEach((t) => t.stop()); setStream(null); setPhase('idle'); }} className={isPysy ? "win95-button" : "font-mono"}>Отмена</Button>
          </>
        )}
        {phase === 'recording' && (
          <Button onClick={stopRecording} variant="outline" className={isPysy ? "win95-button gap-2" : "font-mono gap-2"}>
            <StopCircle className="h-4 w-4 text-red-500" />
            Остановить
          </Button>
        )}
        {phase === 'done' && (
          <>
            <Button onClick={onClose} className={isPysy ? "win95-button" : "font-mono"} style={!isPysy ? { backgroundColor: theme.accent, color: '#000' } : undefined}>Готово</Button>
            <Button variant="outline" onClick={() => setPhase('idle')} className={isPysy ? "win95-button" : "font-mono"}>Ещё раз</Button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Circle Video Player ───────────────────────────────────────────────────────

const CVIDEO_PX = 230;       // ~30% larger than the original 176px
const CVIDEO_OFFSET = 13;    // gap from video edge to container edge
const CONTAINER_SIZE = CVIDEO_PX + CVIDEO_OFFSET * 2; // 256
const RING_CENTER = CONTAINER_SIZE / 2;                // 128
const RING_R = RING_CENTER - CVIDEO_OFFSET / 2 - 1;   // ~121
const RING_STROKE = 4;
const CIRC = 2 * Math.PI * RING_R;

function CircleVideoPlayer({
  src,
  accentColor,
}: {
  src: string;
  accentColor: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0); // 0–1

  // Sync progress while the video is playing; stop on pause/end.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onPlay = () => setPhase('playing');
    const onPause = () => setPhase('paused');
    const onEnded = () => { setPhase('idle'); setProgress(0); };
    const onSeeked = () => {
      if (v.duration && isFinite(v.duration)) setProgress(v.currentTime / v.duration);
    };
    const onCanPlay = () => setLoaded(true);

    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('ended', onEnded);
    v.addEventListener('seeked', onSeeked);
    v.addEventListener('loadedmetadata', onSeeked);
    v.addEventListener('canplay', onCanPlay);

    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('ended', onEnded);
      v.removeEventListener('seeked', onSeeked);
      v.removeEventListener('loadedmetadata', onSeeked);
      v.removeEventListener('canplay', onCanPlay);
    };
  }, []);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const v = videoRef.current;
    if (!v) return;
    let raf: number;
    const tick = () => {
      // Guard against NaN/Infinity duration (metadata not yet loaded)
      if (v.duration && isFinite(v.duration) && v.currentTime >= 0) {
        setProgress(v.currentTime / v.duration);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const playPromiseRef = useRef<Promise<void> | null>(null);

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v || playPromiseRef.current) return;
    if (v.paused) {
      // Set phase optimistically so the ring appears immediately (don't wait for 'play' event)
      setPhase('playing');
      playPromiseRef.current = v
        .play()
        .then(() => { playPromiseRef.current = null; })
        .catch(() => {
          playPromiseRef.current = null;
          setPhase('idle');
        });
    } else {
      v.pause();
    }
  }, []);

  const dashOffset = CIRC * (1 - progress);

  return (
    <div
      className="relative flex-shrink-0 cursor-pointer select-none"
      style={{ width: CONTAINER_SIZE, height: CONTAINER_SIZE }}
      onClick={toggle}
    >
      {/* Video circle */}
      <div
        className="absolute rounded-full overflow-hidden bg-black"
        style={{
          width:  CVIDEO_PX,
          height: CVIDEO_PX,
          top:    CVIDEO_OFFSET,
          left:   CVIDEO_OFFSET,
        }}
      >
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-cover pointer-events-none"
          preload="auto"
          playsInline
          style={{ transform: 'scaleX(-1)' }}
        />
      </div>

      {/* Progress ring SVG — rotated so 0% starts at 12 o'clock */}
      <svg
        width={CONTAINER_SIZE}
        height={CONTAINER_SIZE}
        className="absolute inset-0 pointer-events-none"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={RING_R}
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={RING_STROKE}
        />
        {/* Progress — no CSS transition so it follows currentTime exactly */}
        <circle
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={RING_R}
          fill="none"
          stroke={accentColor}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={dashOffset}
        />
      </svg>

      {/* Loading overlay */}
      {!loaded && (
        <div
          className="absolute flex items-center justify-center"
          style={{ top: CVIDEO_OFFSET, left: CVIDEO_OFFSET, width: CVIDEO_PX, height: CVIDEO_PX, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)' }}
        >
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
      )}

      {/* Icon overlay — only when paused (play icon = "resume") */}
      {phase === 'paused' && (
        <div
          className="absolute flex items-center justify-center"
          style={{ top: CVIDEO_OFFSET, left: CVIDEO_OFFSET, width: CVIDEO_PX, height: CVIDEO_PX, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.38)' }}
        >
          <Play className="h-10 w-10 text-white drop-shadow-lg" fill="white" />
        </div>
      )}
    </div>
  );
}

// ─── Media Grid ────────────────────────────────────────────────────────────────

function MediaGrid({
  items,
  accentColor,
  isPutzermann,
  isPysy,
}: {
  items: Array<{ type: string; url: string; isCircle?: boolean }>;
  accentColor: string;
  isPutzermann?: boolean;
  isPysy?: boolean;
}) {
  if (items.length === 0) return null;

  const images = items.filter((m) => m.type === 'image');
  const videos = items.filter((m) => m.type === 'video');
  const audios = items.filter((m) => m.type === 'audio');

  return (
    <div className="space-y-3 mt-3">
      {images.length > 0 && (
        <div className={`grid gap-2 ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
          {images.map((img, idx) => (
            <div key={idx} className={`relative overflow-hidden ${isPysy ? 'win95-sunken rounded-none bg-[#c0c0c0]' : isPutzermann ? 'noir-sunken rounded-none' : 'rounded-2xl border border-border/60 bg-card'} ${images.length === 1 ? 'max-h-[460px]' : 'aspect-square'}`}>
              <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      )}
      {videos.map((vid, idx) => (
        vid.isCircle ? (
          <div key={idx} className="flex justify-center">
            <CircleVideoPlayer src={vid.url} accentColor={accentColor} />
          </div>
        ) : (
          <div key={idx} className={`${isPysy ? 'win95-sunken rounded-none bg-[#c0c0c0]' : isPutzermann ? 'noir-sunken rounded-none' : 'rounded-2xl border border-border/60 bg-card'} overflow-hidden`}>
            <video src={vid.url} controls className="w-full max-h-[460px]" preload="metadata" />
          </div>
        )
      ))}
      {audios.map((aud, idx) => (
        <div key={idx}><AudioPlayer src={aud.url} /></div>
      ))}
    </div>
  );
}

// ─── Comments section ──────────────────────────────────────────────────────────

type Comment = { id: number; content: string; createdAt: string; user: { username: string } };

function CommentsSection({ postId, me, theme, isPutzermann, isPysy }: { postId: number; me?: { username: string } | null; theme: BlogTheme; isPutzermann?: boolean; isPysy?: boolean }) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ['blog-comments', postId],
    queryFn: async () => {
      const res = await fetch(`/api/blogs/posts/${postId}/comments`, {
        credentials: 'include',
        headers: { 'x-auth-token': getStoredAuthToken() ?? '' },
      });
      return res.json();
    },
  });

  const submit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/blogs/posts/${postId}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({ content: text.trim() }),
      });
      setText('');
      queryClient.invalidateQueries({ queryKey: ['blog-comments', postId] });
    } catch {
      alert('Ошибка отправки комментария');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`mt-3 pt-3 space-y-3 ${isPysy ? 'border-t-2 border-white border-t-[#808080] border-b-2 border-b-[#ffffff] mb-2' : isPutzermann ? 'border-t-2 border-white mt-3 pt-3' : 'border-t border-border/40'}`}>
      {isLoading ? (
        <div className="flex justify-center py-2"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
      ) : comments.length === 0 ? (
        <p className={`text-xs px-1 ${isPysy ? 'win95-text-muted' : isPutzermann ? 'noir-text-muted' : 'text-muted-foreground font-mono'}`}>Комментариев пока нет</p>
      ) : (
        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <span className={`text-xs font-bold flex-shrink-0 ${isPysy ? 'win95-text font-bold' : isPutzermann ? 'noir-text' : 'font-mono'}`} style={!isPysy && !isPutzermann ? { color: theme.accent } : undefined}>
                {c.user.username}
              </span>
              <span className={`text-xs leading-relaxed ${isPysy ? 'win95-text' : isPutzermann ? 'noir-text opacity-80' : 'font-sans text-foreground'}`}>{c.content}</span>
            </div>
          ))}
        </div>
      )}
      {me && (
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Комментарий..."
            className={isPysy
              ? "h-8 win95-sunken win95-text px-2 rounded-none"
              : isPutzermann
              ? "h-8 noir-sunken noir-text px-2 rounded-none text-sm"
              : "h-8 text-xs font-sans bg-background/50 border-border/60"}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
          />
          <Button
            size="sm"
            onClick={submit}
            disabled={submitting || !text.trim()}
            className={isPysy ? "win95-button h-8 px-3" : isPutzermann ? "noir-button h-8 px-3" : "h-8 px-3 font-mono"}
            style={!isPysy && !isPutzermann ? { backgroundColor: theme.accent, color: '#000' } : undefined}
          >
            {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Post Card ─────────────────────────────────────────────────────────────────

function PostCard({
  post,
  blog,
  me,
  theme,
  likesState,
  isPutzermann,
  onToggleLike,
  onEdit,
  onDelete,
}: {
  post: ExtPost;
  blog: ExtBlog;
  me?: { username: string } | null;
  theme: BlogTheme;
  likesState: { count: number; liked: boolean };
  isPutzermann?: boolean;
  onToggleLike: (postId: number) => void;
  onEdit: (post: ExtPost) => void;
  onDelete: (post: ExtPost) => void;
}) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const isPysy = blog.handle === 'pysy-exe';

  return (
    <article
      className={isPysy
        ? "win95-window mb-6"
        : isPutzermann
          ? "noir-window mb-4"
          : "bg-card border rounded-2xl p-4 sm:p-5 transition-all duration-200"}
      style={{ borderColor: !isPysy && !isPutzermann && commentsOpen ? theme.accentBorder : undefined }}
    >
      {isPysy && (
        <div className="win95-title-bar">
          <div className="win95-title-bar-text flex items-center gap-1">
            <span className="w-3 h-3 bg-[#c0c0c0] border-t border-l border-white border-r border-b border-[#808080] inline-block"></span>
            {postFileName(post.id)}.EXE
          </div>
          <div className="flex gap-0.5">
            <button className="win95-button win95-button-small">_</button>
            <button className="win95-button win95-button-small">□</button>
          </div>
        </div>
      )}
      <div className={isPysy ? "p-3 sm:p-4" : isPutzermann ? "p-4 sm:p-5" : ""}>
      <div className="flex items-center gap-3 mb-3">
        <Avatar className={isPysy ? "h-10 w-10 flex-shrink-0 win95-sunken rounded-none bg-[#c0c0c0]" : isPutzermann ? "h-10 w-10 flex-shrink-0 noir-sunken rounded-none bg-black border border-white" : "h-10 w-10 border-2 border-background shadow-md flex-shrink-0"}>
          <AvatarImage src={blog.avatarUrl ?? undefined} className={isPutzermann ? "rounded-none" : ""} />
          <AvatarFallback
            className={isPysy ? "font-bold text-sm win95-text rounded-none" : isPutzermann ? "font-bold text-sm noir-text rounded-none" : "font-bold text-sm"}
            style={!isPysy && !isPutzermann ? { background: `linear-gradient(135deg, ${theme.accent}44, ${theme.accent}22)`, color: theme.accent } : undefined}
          >
            {blogAvatarFallback(blog.handle, blog.user.username)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className={isPysy ? "win95-text font-bold leading-tight" : isPutzermann ? "noir-text font-bold leading-tight tracking-wide" : "font-mono text-xs font-bold"} style={!isPysy && !isPutzermann ? { color: theme.accent } : undefined}>
            {isPutzermann ? (blog.title || blog.user.username) : (post.createdBy?.username ?? blog.user.username)}
          </p>
          {isPysy && (
            <p className="win95-text-muted">
              {formatOwnerUsername(blog.handle, blog.ownerUsername)}
            </p>
          )}
          {isPutzermann && (
            <p className="noir-text-muted text-sm">
              {formatOwnerUsername(blog.handle, blog.ownerUsername)}
            </p>
          )}
          <p className={isPysy ? "win95-text-muted mt-0.5" : isPutzermann ? "noir-text-muted text-xs mt-0.5" : "text-muted-foreground font-sans text-xs"}>
            {format(new Date(post.createdAt as string), 'd MMM yyyy, HH:mm', { locale: ru })}
            {post.updatedAt !== post.createdAt && ' · изм.'}
          </p>
        </div>
        {post.isOwner && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(post)}
              className={isPysy ? "win95-button p-1" : isPutzermann ? "noir-button p-1" : "p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"}
            >
              <PenSquare className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(post)}
              className={isPysy ? "win95-button p-1" : isPutzermann ? "noir-button p-1" : "p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {post.title && (
        <h2 className={isPysy ? "win95-text font-bold text-base sm:text-lg mb-1 leading-tight" : isPutzermann ? "noir-text font-bold text-lg mb-1 leading-tight tracking-widest uppercase" : "font-mono font-bold text-base sm:text-lg mb-1 leading-tight"}>{post.title}</h2>
      )}

      {post.content && (
        <div className={isPysy ? "whitespace-pre-wrap win95-text leading-relaxed" : isPutzermann ? "whitespace-pre-wrap noir-text text-base leading-relaxed" : "whitespace-pre-wrap font-sans text-sm sm:text-base text-foreground leading-relaxed"}>
          {post.content}
        </div>
      )}

      <MediaGrid items={post.media ?? []} accentColor={theme.accent} isPutzermann={isPutzermann} isPysy={isPysy} />

      {/* Action bar */}
      <div className={isPysy ? "flex items-center gap-5 mt-4 win95-text-muted" : isPutzermann ? "flex items-center gap-5 mt-4 noir-text-muted" : "flex items-center gap-5 mt-4 text-muted-foreground"}>
        <button
          onClick={() => onToggleLike(post.id)}
          disabled={!me}
          className={isPysy ? "win95-button flex items-center gap-1.5" : isPutzermann ? "noir-button flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed" : "flex items-center gap-1.5 transition-colors text-sm font-mono disabled:opacity-50 disabled:cursor-not-allowed"}
          style={likesState.liked ? { color: '#ef4444', borderColor: '#ef4444' } : undefined}
          title={me ? undefined : 'Войдите чтобы поставить лайк'}
        >
          <Heart className="h-4 w-4" fill={likesState.liked ? '#ef4444' : 'none'} />
          <span>{likesState.count}</span>
        </button>
        <button
          onClick={() => setCommentsOpen((o) => !o)}
          className={isPysy ? "win95-button flex items-center gap-1.5" : isPutzermann ? "noir-button flex items-center gap-1.5" : "flex items-center gap-1.5 transition-colors text-sm font-mono hover:text-foreground"}
          style={commentsOpen && !isPysy && !isPutzermann ? { color: theme.accent } : undefined}
        >
          <MessageCircle className="h-4 w-4" />
          <span>{post.commentsCount + (commentsOpen ? 0 : 0)}</span>
        </button>
      </div>

      {commentsOpen && (
        <CommentsSection postId={post.id} me={me} theme={theme} isPutzermann={isPutzermann} isPysy={isPysy} />
      )}
      </div>
    </article>
  );
}

// ─── Create Post Box ───────────────────────────────────────────────────────────

function CreatePostBox({
  handle,
  blog,
  me,
  theme,
  isPutzermann,
  onPosted,
}: {
  handle: string;
  blog: ExtBlog;
  me: { username: string };
  theme: BlogTheme;
  isPutzermann?: boolean;
  onPosted: () => void;
}) {
  const isPysy = blog.handle === 'pysy-exe';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [circleOpen, setCircleOpen] = useState(false);
  const create = useCreateBlogPost();
  const queryClient = useQueryClient();

  const handleFile = async (file: File, type: 'image' | 'video' | 'audio', isCircle = false) => {
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setMedia((prev) => [...prev, { type, url, isCircle }]);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };

  const handleCircleVideo = async (blob: Blob) => {
    setCircleOpen(false);
    const file = new File([blob], `circle-${Date.now()}.webm`, { type: 'video/webm' });
    await handleFile(file, 'video', true);
  };

  const removeMedia = (idx: number) => setMedia((prev) => prev.filter((_, i) => i !== idx));

  const canSubmit = title.trim().length > 0 || content.trim().length > 0 || media.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await create.mutateAsync({
        handle,
        data: {
          title: title.trim(),
          content,
          media: media.map((m) => ({ type: m.type, url: m.url, isCircle: m.isCircle })) as any,
        },
      });
      await queryClient.invalidateQueries({ queryKey: getGetBlogQueryKey(handle) });
      setTitle('');
      setContent('');
      setMedia([]);
      onPosted();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка публикации');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className={isPysy ? "win95-window mb-6" : isPutzermann ? "noir-card mb-4" : "border rounded-2xl p-4 sm:p-5 mb-6"} style={!isPysy && !isPutzermann ? { borderColor: theme.accentBorder, backgroundColor: theme.accentBg } : undefined}>
        {isPysy && (
          <div className="win95-title-bar">
            <div className="win95-title-bar-text flex items-center gap-1">
              <span className="w-3 h-3 bg-[#c0c0c0] border-t border-l border-white border-r border-b border-[#808080] inline-block"></span>
              NEW_POST.EXE
            </div>
            <div className="flex gap-0.5">
              <button className="win95-button win95-button-small">_</button>
              <button className="win95-button win95-button-small">□</button>
            </div>
          </div>
        )}
        <div className={isPysy ? "space-y-3 p-3 sm:p-4" : isPutzermann ? "space-y-3" : "space-y-3"}>
          <Input
            placeholder="Заголовок поста"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={isPysy ? "win95-sunken win95-text px-2 h-8 rounded-none w-full" : isPutzermann ? "noir-sunken noir-text px-2 h-8 rounded-none w-full border-white" : "bg-background/60 border-border/60 font-mono font-semibold"}
          />
          <Textarea
            placeholder="Что нового?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className={isPysy ? "win95-sunken win95-text px-2 py-1 resize-none rounded-none w-full min-h-[80px]" : isPutzermann ? "noir-sunken noir-text px-2 py-1 resize-none rounded-none w-full min-h-[80px] border-white" : "bg-background/60 border-border/60 font-sans resize-none"}
          />
          {(isPysy || isPutzermann) && <div className={`h-px w-full my-2 ${isPysy ? 'border-t-2 border-[#808080] border-b-2 border-[#ffffff]' : 'border-t border-dashed border-white/30'}`} />}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <label className={`cursor-pointer p-2 rounded-none transition-colors ${isPysy ? 'win95-button' : isPutzermann ? 'noir-button' : 'text-muted-foreground hover:text-foreground hover:bg-card rounded-full'}`} title="Прикрепить файл">
                <Paperclip className="h-5 w-5" />
                <input type="file" accept="image/*,video/*,audio/*" className="hidden" onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  files.forEach((f) => {
                    if (f.type.startsWith('image/')) handleFile(f, 'image');
                    else if (f.type.startsWith('video/')) handleFile(f, 'video');
                    else if (f.type.startsWith('audio/')) handleFile(f, 'audio');
                  });
                  e.target.value = '';
                }} />
              </label>
              {uploading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-1" />}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => setCircleOpen(true)}
                disabled={uploading}
                className={isPysy ? "win95-button gap-1.5 h-auto py-1" : isPutzermann ? "noir-button gap-1.5" : "font-mono gap-1.5"}
                style={!isPysy && !isPutzermann ? { backgroundColor: theme.accent, color: '#000' } : undefined}
                title="Снять кружок"
              >
                <Camera className="h-4 w-4" />
                Кружок
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving || uploading || !canSubmit}
                className={isPysy ? "win95-button gap-1.5 h-auto py-1 font-bold" : isPutzermann ? "noir-button gap-1.5 font-bold" : "font-mono gap-1.5"}
                style={!isPysy && !isPutzermann ? { backgroundColor: theme.accent, color: '#000' } : undefined}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Опубликовать
              </Button>
            </div>
          </div>
          {media.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {media.map((m, i) => (
                <div key={i} className={`relative group overflow-hidden w-16 h-16 ${isPysy ? 'win95-sunken rounded-none bg-[#c0c0c0]' : isPutzermann ? 'noir-sunken rounded-none border-white' : 'rounded-lg border border-border/60 bg-card'}`}>
                  {m.type === 'image' ? (
                    <img src={m.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full flex flex-col items-center justify-center gap-1 ${isPysy ? 'win95-text-muted' : isPutzermann ? 'noir-text-muted' : 'text-muted-foreground'}`}>
                      {m.isCircle ? <Camera className="h-4 w-4" /> : m.type === 'video' ? <Video className="h-4 w-4" /> : <Music className="h-4 w-4" />}
                      {m.isCircle && <span className="text-[9px] font-mono">кружок</span>}
                    </div>
                  )}
                  <button type="button" onClick={() => removeMedia(i)} className="absolute top-0.5 right-0.5 p-2 md:p-0.5 rounded-full bg-black/60 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <X className="h-4 w-4 md:h-3 md:w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={circleOpen} onOpenChange={setCircleOpen}>
        <DialogContent hideClose={isPysy || isPutzermann} className={isPysy ? "max-w-sm win95-window p-0 rounded-none border-0" : isPutzermann ? "max-w-sm noir-card p-0 rounded-none border-0" : "max-w-sm border border-border/60 bg-card/95 backdrop-blur"}>
          {isPysy && (
            <div className="win95-title-bar">
              <div className="win95-title-bar-text flex items-center gap-1">
                <Camera className="h-3 w-3" /> RECORD.EXE
              </div>
              <div className="flex gap-0.5">
                <button className="win95-button win95-button-small" onClick={() => setCircleOpen(false)}>X</button>
              </div>
            </div>
          )}
          {isPutzermann && (
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/30">
              <span className="noir-label">RECORD</span>
              <button className="noir-button noir-button-small" onClick={() => setCircleOpen(false)}>X</button>
            </div>
          )}
          {!isPysy && !isPutzermann && (
            <DialogHeader>
              <DialogTitle className="font-mono text-base font-bold flex items-center gap-2">
                <Camera className="h-4 w-4" style={{ color: theme.accent }} />
                Снять кружок
              </DialogTitle>
            </DialogHeader>
          )}
          <div className={isPysy || isPutzermann ? "p-4" : ""}>
            <CircleVideoRecorder onRecorded={handleCircleVideo} onClose={() => setCircleOpen(false)} theme={theme} isPysy={isPysy} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Edit Blog Dialog ──────────────────────────────────────────────────────────

function EditBlogDialog({
  blog,
  open,
  onClose,
  theme,
}: {
  blog: ExtBlog;
  open: boolean;
  onClose: () => void;
  theme: BlogTheme;
}) {
  const isPysy = blog.handle === 'pysy-exe';
  const [title, setTitle] = useState(blog.title);
  const [description, setDescription] = useState(blog.description);
  const [avatarUrl, setAvatarUrl] = useState(blog.avatarUrl ?? '');
  const [coverUrl, setCoverUrl] = useState(blog.coverUrl ?? '');

  // Reset form fields to current blog data every time the dialog opens
  useEffect(() => {
    if (open) {
      setTitle(blog.title);
      setDescription(blog.description);
      setAvatarUrl(blog.avatarUrl ?? '');
      setCoverUrl(blog.coverUrl ?? '');
    }
  }, [open, blog.title, blog.description, blog.avatarUrl, blog.coverUrl]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const update = useUpdateMyBlog();
  const queryClient = useQueryClient();
  const { cropperProps: editCropper, openCropper: openEditCropper } = useImageCropper();

  const handleFile = async (file: File, type: 'avatar' | 'cover') => {
    if (type === 'avatar') {
      openEditCropper(file, {
        aspect: 1,
        title: 'Обрезать аватар',
        circularPreview: true,
        onCropped: async (cropped) => {
          setUploading(true);
          try {
            const url = await uploadFile(cropped);
            setAvatarUrl(url);
          } catch (e) {
            alert(e instanceof Error ? e.message : 'Ошибка загрузки');
          } finally {
            setUploading(false);
          }
        },
      });
    } else {
      openEditCropper(file, {
        aspect: 2,
        title: 'Обрезать обложку',
        onCropped: async (cropped) => {
          setUploading(true);
          try {
            const url = await uploadFile(cropped);
            setCoverUrl(url);
          } catch (e) {
            alert(e instanceof Error ? e.message : 'Ошибка загрузки');
          } finally {
            setUploading(false);
          }
        },
      });
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await update.mutateAsync({
        handle: blog.handle,
        data: { title: title.trim(), description: description.trim(), avatarUrl: avatarUrl || null, coverUrl: coverUrl || null },
      });
      await queryClient.invalidateQueries({ queryKey: getGetBlogQueryKey(blog.handle) });
      onClose();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка обновления');
    } finally {
      setSaving(false);
    }
  };

  const isPutzermann = blog.handle === 'putzermann-core';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent hideClose={isPysy || isPutzermann} className={isPysy ? "max-w-lg win95-window p-0 rounded-none border-0" : isPutzermann ? "max-w-lg noir-card p-0 rounded-none border-0" : "max-w-lg border border-border/60 bg-card/95 backdrop-blur"}>
        {isPysy && (
          <div className="win95-title-bar">
            <div className="win95-title-bar-text">CONFIG.EXE</div>
            <div className="flex gap-0.5">
              <button className="win95-button win95-button-small" onClick={onClose}>X</button>
            </div>
          </div>
        )}
        {isPutzermann && (
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/30">
            <span className="noir-label">EDIT BLOG</span>
            <button className="noir-button noir-button-small" onClick={onClose}>X</button>
          </div>
        )}
        {!isPysy && !isPutzermann && (
          <DialogHeader>
            <DialogTitle className="font-mono text-lg font-bold flex items-center gap-2">
              <PenSquare className="h-5 w-5" style={{ color: theme.accent }} />
              Редактировать блог
            </DialogTitle>
          </DialogHeader>
        )}
        <div className={isPysy ? "p-4 space-y-4" : isPutzermann ? "p-4 space-y-4" : "space-y-4 pt-2"}>
          <Input placeholder={isPysy ? 'Название блога' : 'Название блога'} value={title} onChange={(e) => setTitle(e.target.value)} className={isPysy ? "win95-sunken win95-text px-2 rounded-none" : isPutzermann ? "noir-sunken noir-text px-2 rounded-none border-white" : "bg-background/50 border-border/60 font-mono"} />
          <Textarea placeholder={isPysy ? 'Описание' : 'Описание'} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={isPysy ? "win95-sunken win95-text px-2 py-1 resize-none rounded-none" : isPutzermann ? "noir-sunken noir-text px-2 py-1 resize-none rounded-none border-white" : "bg-background/50 border-border/60 font-sans resize-none"} />
          <div className="flex gap-3">
            <label className={`flex-1 cursor-pointer p-4 text-center transition-colors ${isPysy ? 'win95-button rounded-none' : isPutzermann ? 'noir-sunken' : 'rounded-xl border border-border/60 bg-background/50 hover:border-primary/50'}`}>
              {coverUrl ? (
                <div className="relative">
                  <img src={coverUrl} alt="" className={`w-full aspect-[2/1] object-cover ${isPysy ? 'rounded-none win95-sunken' : isPutzermann ? 'rounded-none noir-sunken border-white' : 'rounded-lg'}`} />
                  <button type="button" onClick={(e) => { e.preventDefault(); setCoverUrl(''); }} className={`absolute top-1 right-1 p-1 ${isPysy ? 'rounded-none win95-button win95-button-small' : isPutzermann ? 'noir-button noir-button-small' : 'rounded-lg bg-black/60 text-white'}`}><X className="h-3 w-3" /></button>
                </div>
              ) : (
                <div className={`flex flex-col items-center gap-1 ${isPysy ? 'win95-text' : isPutzermann ? 'noir-text-muted' : 'text-muted-foreground'}`}><ImageIcon className="h-5 w-5" /><span className={`text-xs ${isPysy ? 'win95-text' : isPutzermann ? 'noir-label' : 'font-sans'}`}>Обложка</span></div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f, 'cover'); e.target.value = ''; }} />
            </label>
            <label className={`flex-1 cursor-pointer p-4 text-center transition-colors ${isPysy ? 'win95-button rounded-none' : isPutzermann ? 'noir-sunken' : 'rounded-xl border border-border/60 bg-background/50 hover:border-primary/50'}`}>
              {avatarUrl ? (
                <div className="relative">
                  <img src={avatarUrl} alt="" className={`w-16 h-16 mx-auto object-cover ${isPysy ? 'rounded-none win95-sunken' : isPutzermann ? 'rounded-none noir-sunken border-white' : 'rounded-lg'}`} />
                  <button type="button" onClick={(e) => { e.preventDefault(); setAvatarUrl(''); }} className={`absolute top-1 right-1 p-1 ${isPysy ? 'rounded-none win95-button win95-button-small' : isPutzermann ? 'noir-button noir-button-small' : 'rounded-lg bg-black/60 text-white'}`}><X className="h-3 w-3" /></button>
                </div>
              ) : (
                <div className={`flex flex-col items-center gap-1 ${isPysy ? 'win95-text' : isPutzermann ? 'noir-text-muted' : 'text-muted-foreground'}`}><ImageIcon className="h-5 w-5" /><span className={`text-xs ${isPysy ? 'win95-text' : isPutzermann ? 'noir-label' : 'font-sans'}`}>Аватар</span></div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f, 'avatar'); e.target.value = ''; }} />
            </label>
          </div>
          {uploading && <div className={`flex items-center gap-2 text-xs ${isPysy ? 'win95-text-muted' : isPutzermann ? 'noir-text-muted' : 'text-muted-foreground font-mono'}`}><Loader2 className="h-3.5 w-3.5 animate-spin" />Загрузка...</div>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className={isPysy ? "win95-button" : isPutzermann ? "noir-button" : "font-mono"}>Отмена</Button>
            <Button onClick={handleSubmit} disabled={saving || uploading || !title.trim()} className={isPysy ? "win95-button gap-1.5 font-bold" : isPutzermann ? "noir-button gap-1.5 font-bold" : "font-mono gap-1.5"} style={!isPysy && !isPutzermann ? { backgroundColor: theme.accent, color: '#000' } : undefined}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Сохранить
            </Button>
          </div>
        </div>
      </DialogContent>
      <ImageCropper {...editCropper} />
    </Dialog>
  );
}

// ─── Edit Post Dialog ──────────────────────────────────────────────────────────

function EditPostDialog({
  post,
  handle,
  open,
  onClose,
  theme,
}: {
  post: ExtPost;
  handle: string;
  open: boolean;
  onClose: () => void;
  theme: BlogTheme;
}) {
  const isPysy = handle === 'pysy-exe';
  const isPutzermann = handle === 'putzermann-core';
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [media, setMedia] = useState<MediaItem[]>(
    (post.media ?? []).map((m) => ({ type: m.type as 'image' | 'video' | 'audio', url: m.url, isCircle: (m as any).isCircle as boolean | undefined }))
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const update = useUpdateBlogPost();
  const queryClient = useQueryClient();

  const handleFile = async (file: File, type: 'image' | 'video' | 'audio') => {
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setMedia((prev) => [...prev, { type, url }]);
    } catch (e) { alert(e instanceof Error ? e.message : 'Ошибка загрузки'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await update.mutateAsync({ id: post.id, data: { title: title.trim(), content, media: media.map((m) => ({ type: m.type, url: m.url, isCircle: m.isCircle })) as any } });
      await queryClient.invalidateQueries({ queryKey: getGetBlogQueryKey(handle) });
      onClose();
    } catch (e) { alert(e instanceof Error ? e.message : 'Ошибка сохранения'); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent hideClose={isPysy || isPutzermann} className={isPysy ? "max-w-lg win95-window p-0 rounded-none border-0" : isPutzermann ? "max-w-lg noir-card p-0 rounded-none border-0" : "max-w-lg border border-border/60 bg-card/95 backdrop-blur"}>
        {isPysy && (
          <div className="win95-title-bar">
            <div className="win95-title-bar-text">EDIT_POST.EXE</div>
            <div className="flex gap-0.5">
              <button className="win95-button win95-button-small" onClick={onClose}>X</button>
            </div>
          </div>
        )}
        {isPutzermann && (
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/30">
            <span className="noir-label">EDIT POST</span>
            <button className="noir-button noir-button-small" onClick={onClose}>X</button>
          </div>
        )}
        {!isPysy && !isPutzermann && (
          <DialogHeader>
            <DialogTitle className="font-mono text-lg font-bold">Редактировать пост</DialogTitle>
          </DialogHeader>
        )}
        <div className={isPysy ? "p-4 space-y-4" : isPutzermann ? "p-4 space-y-4" : "space-y-4"}>
          <Input placeholder='Заголовок' value={title} onChange={(e) => setTitle(e.target.value)} className={isPysy ? "win95-sunken win95-text px-2 rounded-none" : isPutzermann ? "noir-sunken noir-text px-2 rounded-none border-white" : "font-mono bg-background/50 border-border/60"} />
          <Textarea placeholder='Текст...' value={content} onChange={(e) => setContent(e.target.value)} rows={5} className={isPysy ? "win95-sunken win95-text px-2 py-1 resize-none rounded-none" : isPutzermann ? "noir-sunken noir-text px-2 py-1 resize-none rounded-none border-white" : "font-sans resize-none bg-background/50 border-border/60"} />
          <div className="flex flex-wrap gap-2">
            {(['image', 'video', 'audio'] as const).map((t) => (
              <label key={t} className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-xs transition-all ${isPysy ? 'win95-button rounded-none' : isPutzermann ? 'noir-button' : 'rounded-xl border border-border/60 bg-card text-muted-foreground hover:text-foreground hover:border-primary/50'}`}>
                {t === 'image' ? <ImageIcon className="h-3.5 w-3.5" /> : t === 'video' ? <Video className="h-3.5 w-3.5" /> : <Music className="h-3.5 w-3.5" />}
                {t === 'image' ? 'Фото' : t === 'video' ? 'Видео' : 'Аудио'}
                <input type="file" accept={`${t}/*`} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f, t); e.target.value = ''; }} />
              </label>
            ))}
            {uploading && <Loader2 className={`h-4 w-4 animate-spin ${isPysy ? 'win95-text-muted' : isPutzermann ? 'noir-text-muted' : 'text-muted-foreground'}`} />}
          </div>
          {media.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {media.map((m, i) => (
                <div key={i} className={`relative group overflow-hidden w-20 h-20 ${isPysy ? 'win95-sunken rounded-none bg-[#c0c0c0]' : isPutzermann ? 'noir-sunken rounded-none border-white' : 'rounded-xl border border-border/60 bg-card'}`}>
                  {m.type === 'image' ? <img src={m.url} alt="" className="w-full h-full object-cover" /> : (
                    <div className={`w-full h-full flex items-center justify-center ${isPysy ? 'win95-text-muted' : isPutzermann ? 'noir-text-muted' : 'text-muted-foreground'}`}>
                      {m.isCircle ? <Camera className="h-5 w-5" /> : m.type === 'video' ? <Video className="h-5 w-5" /> : <Music className="h-5 w-5" />}
                    </div>
                  )}
                  <button type="button" onClick={() => setMedia((prev) => prev.filter((_, j) => j !== i))} className={`absolute top-0.5 right-0.5 p-1 ${isPysy ? 'rounded-none win95-button win95-button-small' : isPutzermann ? 'noir-button noir-button-small' : 'rounded-lg bg-black/60 text-white'}`}><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className={isPysy ? "win95-button" : isPutzermann ? "noir-button" : "font-mono"}>Отмена</Button>
            <Button onClick={handleSubmit} disabled={saving || uploading || !title.trim()} className={isPysy ? "win95-button gap-1.5 font-bold" : isPutzermann ? "noir-button gap-1.5 font-bold" : "font-mono gap-1.5"} style={!isPysy && !isPutzermann ? { backgroundColor: theme.accent, color: '#000' } : undefined}>
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Сохранить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Blog Page ────────────────────────────────────────────────────────────

export default function BlogPage() {
  const [, params] = useRoute('/blogs/:username');
  const username = params?.username ?? '';
  const { data, isLoading, isFetching, error } = useGetBlog(username);
  const { data: me } = useGetMe();
  const [editingPost, setEditingPost] = useState<ExtPost | null>(null);
  const [isEditBlogOpen, setIsEditBlogOpen] = useState(false);
  const deletePost = useDeleteBlogPost();
  const queryClient = useQueryClient();

  const blog = data?.blog as ExtBlog | undefined;
  const posts = (data?.posts ?? []) as ExtPost[];

  const theme = React.useMemo(() => {
    return blog ? getTheme(blog.handle) : DEFAULT_THEME;
  }, [blog]);
  const isPutzermann = blog?.handle === 'putzermann-core';
  const isPysy = blog?.handle === 'pysy-exe';

  // Likes state — initialized from server data, updated optimistically
  const [likesState, setLikesState] = useState<Map<number, { count: number; liked: boolean }>>(new Map());

  useEffect(() => {
    if (posts.length > 0) {
      setLikesState(new Map(posts.map((p) => [p.id, { count: p.likesCount ?? 0, liked: p.isLikedByMe ?? false }])));
    }
  }, [data]);

  const toggleLike = async (postId: number) => {
    if (!me) return;
    const current = likesState.get(postId) ?? { count: 0, liked: false };
    setLikesState((prev) => new Map(prev).set(postId, { count: current.liked ? current.count - 1 : current.count + 1, liked: !current.liked }));
    try {
      const res = await fetch(`/api/blogs/posts/${postId}/like`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({}),
      });
      const json = await res.json();
      setLikesState((prev) => new Map(prev).set(postId, { count: json.count, liked: json.liked }));
    } catch {
      setLikesState((prev) => new Map(prev).set(postId, current));
    }
  };

  const handleDelete = async (post: ExtPost) => {
    if (!confirm('Удалить публикацию?')) return;
    try {
      await deletePost.mutateAsync({ id: post.id });
      await queryClient.invalidateQueries({ queryKey: getGetBlogQueryKey(username) });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка удаления');
    }
  };

  // Show loader when data is loading OR when cached data is from a different blog
  // (stale-while-revalidate would otherwise flash the previous blog's name/content)
  if (isLoading || (isFetching && data?.blog?.handle !== username)) {
    return (
      <div className="flex items-center justify-center py-32 text-muted-foreground font-mono">
        <Loader2 className="h-6 w-6 mr-2 animate-spin" />
        загрузка...
      </div>
    );
  }

  if (error && (error as any)?.status === 404) {
    return (
      <div className="max-w-3xl mx-auto w-full py-20 px-4 text-center">
        <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground font-mono text-lg">Блог не найден</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex items-center justify-center py-32 text-destructive font-mono text-sm text-center px-4">
        Не удалось загрузить блог.
      </div>
    );
  }

  return (
    <>
    {isPysy && <div className="fixed inset-0 win95-page -z-10" />}
    {isPutzermann && <div className="fixed inset-0 noir-page -z-10" />}
    <div className={isPysy ? "max-w-3xl mx-auto w-full pb-10 relative pt-4 sm:pt-8" : isPutzermann ? "max-w-3xl mx-auto w-full pb-10 relative" : "max-w-3xl mx-auto w-full pb-10"}>
      {isPysy ? (
        <div className="px-4 sm:px-6 mb-6">
          <div className="win95-window">
            <div className="win95-title-bar">
              <div className="win95-title-bar-text flex items-center gap-1">
                <span className="w-3 h-3 bg-[#c0c0c0] border-t border-l border-white border-r border-b border-[#808080] inline-block"></span>
                PYSY.EXE
              </div>
              <div className="flex gap-0.5">
                <button className="win95-button win95-button-small">_</button>
                <button className="win95-button win95-button-small">□</button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {blog.coverUrl && (
                <div className="win95-sunken mb-4 bg-[#c0c0c0] aspect-[2/1]">
                  <img src={blog.coverUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 mb-4">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 win95-sunken rounded-none bg-[#c0c0c0]">
                  <AvatarImage src={blog.avatarUrl ?? undefined} alt={blog.user.username} className="object-cover" />
                  <AvatarFallback className="font-bold text-3xl win95-text">
                    {blogAvatarFallback(blog.handle, blog.user.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h1 className="win95-text text-2xl sm:text-3xl font-bold tracking-tight">
                    {blog.title || blog.user.username}
                  </h1>
                  <p className="win95-text-muted text-sm mt-1">
                    user: {formatOwnerUsername(blog.handle, blog.ownerUsername)}
                  </p>
                </div>
                {blog.isOwner && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditBlogOpen(true)}
                    className="win95-button px-4"
                  >
                    Properties...
                  </Button>
                )}
              </div>
              {blog.description && (
                <div className="win95-sunken p-3 mt-4">
                  <p className="win95-text text-sm max-w-2xl">
                    {blog.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : isPutzermann ? (
        <div className="px-4 sm:px-6 mt-4 sm:mt-8 mb-6">
          <div className="noir-card">
            <div className="relative aspect-[2/1] bg-black overflow-hidden mb-4 noir-dither">
              <div className="noir-scanlines absolute inset-0 z-10" />
              {blog.coverUrl ? (
                <img src={blog.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-75" style={{ imageRendering: 'pixelated' }} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <span className="noir-text text-4xl sm:text-5xl font-bold tracking-[0.3em] uppercase opacity-20">PUTZERMANN</span>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 noir-sunken rounded-none bg-black border border-white">
                <AvatarImage src={blog.avatarUrl ?? undefined} alt={blog.user.username} className="object-cover rounded-none" style={{ imageRendering: 'pixelated' }} />
                <AvatarFallback className="font-bold text-3xl noir-text rounded-none" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '1.25rem' }}>
                  {blogAvatarFallback(blog.handle, blog.user.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="noir-text text-xl sm:text-2xl font-bold tracking-[0.15em] uppercase leading-none" style={{ fontFamily: "'Press Start 2P', 'VT323', monospace" }}>
                  {blog.title || blog.user.username}
                </h1>
                <p className="noir-text-muted mt-2 tracking-widest">
                  {formatOwnerUsername(blog.handle, blog.ownerUsername)}
                </p>
                {blog.description && (
                  <p className="noir-text mt-3 max-w-2xl opacity-80">
                    {blog.description}
                  </p>
                )}
              </div>
              {blog.isOwner && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditBlogOpen(true)}
                  className="noir-button px-4 self-start sm:self-auto"
                >
                  EDIT
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Cover — no blue fade, themed gradient or cover image */}
          <div className="relative h-36 sm:h-52 overflow-hidden bg-black">
            {blog.coverUrl ? (
              <img src={blog.coverUrl} alt="" className="w-full h-full object-cover opacity-80" />
            ) : (
              <div className="absolute inset-0" style={{ background: theme.coverGradient }} />
            )}
            {/* Subtle bottom-only fade just to merge into page bg */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
          </div>

          {/* Blog identity */}
          <div className="px-4 sm:px-6 -mt-10 sm:-mt-12 relative z-0">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-xl">
                <AvatarImage src={blog.avatarUrl ?? undefined} alt={blog.user.username} />
                <AvatarFallback
                  className="font-black text-2xl sm:text-3xl"
                  style={{ background: `linear-gradient(135deg, ${theme.accent}55, ${theme.accent}22)`, color: theme.accent }}
                >
                  {blogAvatarFallback(blog.handle, blog.user.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 pb-1">
                <h1 className="font-mono text-2xl sm:text-3xl font-black tracking-tight" style={{ color: theme.accent }}>
                  {blog.title || blog.user.username}
                </h1>
                <p className="text-muted-foreground font-mono text-sm">
                  {formatOwnerUsername(blog.handle, blog.ownerUsername)}
                </p>
              </div>
              {blog.isOwner && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditBlogOpen(true)}
                  className="font-mono gap-2 self-start sm:self-auto"
                  style={{ borderColor: theme.accentBorder }}
                >
                  <PenSquare className="h-4 w-4" />
                  Редактировать
                </Button>
              )}
            </div>

            {blog.description && (
              <p className="text-foreground/80 font-sans text-sm sm:text-base mt-4 max-w-2xl leading-relaxed">
                {blog.description}
              </p>
            )}
          </div>
        </>
      )}

      {/* Post feed */}
      <div className="px-4 sm:px-6 mt-8">
        {blog.isOwner && me && (
          <CreatePostBox handle={blog.handle} blog={blog} me={me} theme={theme} isPutzermann={isPutzermann} onPosted={() => {}} />
        )}

        {posts.length === 0 ? (
          <div className={`text-center py-20 ${isPysy ? 'win95-sunken bg-white border-0' : isPutzermann ? 'noir-panel' : 'border border-dashed bg-card/30 rounded-3xl'}`} style={!isPysy && !isPutzermann ? { borderColor: theme.accentBorder } : undefined}>
            {!isPysy && !isPutzermann && <Sparkles className="h-10 w-10 mx-auto mb-3" style={{ color: theme.accent }} />}
            <p className={`${isPysy ? 'win95-text-muted font-sans' : isPutzermann ? 'noir-text-muted tracking-widest uppercase' : 'text-muted-foreground font-mono'}`}>В блоге пока нет постов</p>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                blog={blog}
                me={me}
                theme={theme}
                likesState={likesState.get(post.id) ?? { count: post.likesCount ?? 0, liked: post.isLikedByMe ?? false }}
                isPutzermann={isPutzermann}
                onToggleLike={toggleLike}
                onEdit={setEditingPost}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {editingPost && (
        <EditPostDialog
          post={editingPost}
          handle={blog.handle}
          open={!!editingPost}
          onClose={() => setEditingPost(null)}
          theme={theme}
        />
      )}

      <EditBlogDialog blog={blog} open={isEditBlogOpen} onClose={() => setIsEditBlogOpen(false)} theme={theme} />
    </div>
    </>
  );
}
