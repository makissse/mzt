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
  SwitchCamera,
  StopCircle,
  Play,
  Pause,
  Music,
  Video,
  Bell,
  BellOff,
  Reply,
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
  'medic-de-familie': {
    accent: '#C41E24',
    accentBg: 'rgba(196,30,36,0.10)',
    accentBorder: 'rgba(196,30,36,0.35)',
    coverGradient: 'linear-gradient(180deg, #040000 0%, #0D0000 100%)',
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
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isSwitching, setIsSwitching] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Persists across camera switches during recording
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const facingModeRef = useRef<'user' | 'environment'>('user');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopAllTracks = useCallback(() => {
    videoStreamRef.current?.getTracks().forEach((t) => t.stop());
    audioTrackRef.current?.stop();
    videoStreamRef.current = null;
    audioTrackRef.current = null;
  }, []);

  const openCamera = useCallback(async (mode: 'user' | 'environment' = 'user') => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 512 }, height: { ideal: 512 } },
        audio: true,
      });
      audioTrackRef.current = s.getAudioTracks()[0] ?? null;
      videoStreamRef.current = s;
      facingModeRef.current = mode;
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

  // Switch camera without interrupting recording.
  // During preview: full stream swap.
  // During recording: only video track swapped; audio + recorder continue uninterrupted.
  const toggleFacingMode = useCallback(async () => {
    if (isSwitching) return;
    setIsSwitching(true);
    const next = facingModeRef.current === 'user' ? 'environment' : 'user';
    try {
      if (phase === 'recording') {
        // Stop only the current video tracks, keep audio alive
        videoStreamRef.current?.getVideoTracks().forEach((t) => t.stop());
        const newVidStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: next, width: { ideal: 512 }, height: { ideal: 512 } },
          audio: false,
        });
        videoStreamRef.current = newVidStream;
        facingModeRef.current = next;
        setFacingMode(next);
        if (videoRef.current) {
          videoRef.current.srcObject = newVidStream;
          videoRef.current.play().catch(() => {});
        }
        // RAF loop picks up the new video element source automatically
      } else {
        videoStreamRef.current?.getTracks().forEach((t) => t.stop());
        audioTrackRef.current?.stop();
        await openCamera(next);
      }
    } catch {
      // If switching fails, stay on current camera
    } finally {
      setIsSwitching(false);
    }
  }, [isSwitching, phase, openCamera]);

  const startRecording = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    // RAF loop: draws the live video element to the canvas every frame.
    // Mirroring for front camera is applied here (not via CSS) so the
    // recording itself is correctly oriented.
    const drawFrame = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx || !videoRef.current) return;
      ctx.save();
      if (facingModeRef.current === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      ctx.restore();
      rafRef.current = requestAnimationFrame(drawFrame);
    };
    rafRef.current = requestAnimationFrame(drawFrame);

    // Record canvas video + original audio together
    const canvasStream = canvas.captureStream(30);
    const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
    if (audioTrackRef.current) tracks.push(audioTrackRef.current);
    const recordStream = new MediaStream(tracks);

    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm';
    const recorder = new MediaRecorder(recordStream, { mimeType });
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
        if (c <= 1) { stopRecording(); return 0; }
        return c - 1;
      });
    }, 1000);
  }, []);  // stopRecording defined below via ref to avoid stale closure

  const stopRecording = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (recorderRef.current?.state !== 'inactive') recorderRef.current?.stop();
    stopAllTracks();
    setPhase('done');
  }, [stopAllTracks]);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    stopAllTracks();
  }, [stopAllTracks]);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Hidden canvas used as the MediaRecorder source */}
      <canvas ref={canvasRef} width={512} height={512} className="hidden" />

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
            // Mirror front camera for preview display; the canvas applies the same
            // transform so the saved recording matches what was seen.
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : undefined }}
          />
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
            <Button variant="outline" onClick={toggleFacingMode} disabled={isSwitching} className={isPysy ? "win95-button gap-2" : "font-mono gap-2"} title="Переключить камеру">
              <SwitchCamera className={`h-4 w-4 ${isSwitching ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" onClick={() => { stopAllTracks(); setPhase('idle'); }} className={isPysy ? "win95-button" : "font-mono"}>Отмена</Button>
          </>
        )}
        {phase === 'recording' && (
          <>
            <Button onClick={stopRecording} variant="outline" className={isPysy ? "win95-button gap-2" : "font-mono gap-2"}>
              <StopCircle className="h-4 w-4 text-red-500" />
              Остановить
            </Button>
            <Button variant="outline" onClick={toggleFacingMode} disabled={isSwitching} className={isPysy ? "win95-button gap-2" : "font-mono gap-2"} title="Переключить камеру">
              <SwitchCamera className={`h-4 w-4 ${isSwitching ? 'animate-spin' : ''}`} />
            </Button>
          </>
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

function CircleVideoPlayer({
  src,
  accentColor,
  sizePx = 230,
}: {
  src: string;
  accentColor: string;
  sizePx?: number;
}) {
  const CVIDEO_PX = sizePx;
  const CVIDEO_OFFSET = Math.max(6, Math.round(sizePx * 13 / 230));
  const CONTAINER_SIZE = CVIDEO_PX + CVIDEO_OFFSET * 2;
  const RING_CENTER = CONTAINER_SIZE / 2;
  const RING_R = RING_CENTER - CVIDEO_OFFSET / 2 - 1;
  const RING_STROKE = Math.max(2, Math.round(4 * sizePx / 230));
  const CIRC = 2 * Math.PI * RING_R;

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
  isIsaac,
}: {
  items: Array<{ type: string; url: string; isCircle?: boolean }>;
  accentColor: string;
  isPutzermann?: boolean;
  isPysy?: boolean;
  isIsaac?: boolean;
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
            <div key={idx} className={`overflow-hidden ${isPysy ? 'win95-sunken rounded-none bg-[#c0c0c0]' : isPutzermann ? 'noir-sunken rounded-none' : isIsaac ? 'medic-sunken rounded-none' : 'rounded-2xl border border-border/60 bg-card'} ${images.length !== 1 ? 'aspect-square flex items-center justify-center' : ''}`}>
              <img src={img.url} alt="" className={images.length === 1 ? 'w-full h-auto' : 'w-full h-full object-contain'} loading="lazy" />
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
          <div key={idx} className={`${isPysy ? 'win95-sunken rounded-none bg-[#c0c0c0]' : isPutzermann ? 'noir-sunken rounded-none' : isIsaac ? 'medic-sunken rounded-none' : 'rounded-2xl border border-border/60 bg-card'} overflow-hidden`}>
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

// ─── Push notifications ────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from({ length: raw.length }, (_, i) => raw.charCodeAt(i));
}

function usePushSubscription() {
  const key = 'mzt-push-subscribed';
  const [subscribed, setSubscribed] = useState(() => localStorage.getItem(key) === '1');
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Ваш браузер не поддерживает уведомления');
      return;
    }
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      const vapidRes = await fetch('/api/push/vapid-public-key');
      if (!vapidRes.ok) { alert('Push не настроен на сервере'); return; }
      const { publicKey } = await vapidRes.json();

      if (!subscribed) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
        });
        const j = sub.toJSON();
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-auth-token': getStoredAuthToken() ?? '' },
          credentials: 'include',
          body: JSON.stringify({ endpoint: j.endpoint, keys: j.keys }),
        });
        localStorage.setItem(key, '1');
        setSubscribed(true);
      } else {
        const ready = await navigator.serviceWorker.ready;
        const sub = await ready.pushManager.getSubscription();
        if (sub) {
          await fetch('/api/push/unsubscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': getStoredAuthToken() ?? '' },
            credentials: 'include',
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe();
        }
        localStorage.removeItem(key);
        setSubscribed(false);
      }
    } catch (e) {
      console.error('[push]', e);
    } finally {
      setLoading(false);
    }
  };

  return { subscribed, loading, toggle };
}

function PushBellButton({ isPutzermann, isPysy, isIsaac, theme }: { isPutzermann?: boolean; isPysy?: boolean; isIsaac?: boolean; theme: BlogTheme }) {
  const { subscribed, loading, toggle } = usePushSubscription();
  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={subscribed ? 'Отписаться от уведомлений' : 'Получать уведомления о новых постах'}
      className={
        isPysy
          ? 'win95-button flex items-center gap-1.5 text-xs px-2 py-1'
          : isPutzermann
          ? 'noir-button flex items-center gap-1.5 text-xs px-2 py-1'
          : isIsaac
          ? 'medic-button flex items-center gap-1.5'
          : 'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono transition-colors'
      }
      style={!isPysy && !isPutzermann && !isIsaac ? { borderColor: theme.accentBorder, color: subscribed ? theme.accent : undefined } : undefined}
    >
      {subscribed ? <BellOff className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
      {subscribed ? 'Уведомления вкл.' : 'Уведомления'}
    </button>
  );
}

// ─── Comments section ──────────────────────────────────────────────────────────

type CommentAttachment = { type: 'video' | 'image'; url: string };
type Comment = { id: number; content: string; createdAt: string; user: { username: string }; attachments?: CommentAttachment[]; replyTo?: { id: number; username: string } | null };

/** Resize an image File to maxPx on its longest side, returns a JPEG File. */
async function resizeImage(file: File, maxPx = 800): Promise<File> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const { naturalWidth: w, naturalHeight: h } = img;
      const scale = Math.min(1, maxPx / Math.max(w, h));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => resolve(new File([blob!], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' })),
        'image/jpeg',
        0.85,
      );
    };
    img.src = objectUrl;
  });
}

/** Small attachment strip rendered inside a comment bubble. */
function CommentAttachments({ attachments, theme, isPutzermann, isPysy, isIsaac }: {
  attachments: CommentAttachment[];
  theme: BlogTheme;
  isPutzermann?: boolean;
  isPysy?: boolean;
  isIsaac?: boolean;
}) {
  const videos = attachments.filter((a) => a.type === 'video');
  const images = attachments.filter((a) => a.type === 'image');
  return (
    <div className="space-y-2 mt-1">
      {videos.map((v, i) => (
        <CircleVideoPlayer key={i} src={v.url} accentColor={theme.accent} sizePx={160} />
      ))}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {images.map((img, i) => (
            <a key={i} href={img.url} target="_blank" rel="noopener noreferrer" className="block">
              <div className={`w-20 h-20 overflow-hidden ${isPysy ? 'win95-sunken rounded-none' : isPutzermann ? 'noir-sunken rounded-none' : isIsaac ? 'medic-sunken rounded-none' : 'rounded border border-border/40'}`}>
                <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

type PendingAttachment = CommentAttachment & { localPreview?: string };

function CommentsSection({ postId, me, theme, isPutzermann, isPysy, isIsaac, onCountChange }: { postId: number; me?: { username: string } | null; theme: BlogTheme; isPutzermann?: boolean; isPysy?: boolean; isIsaac?: boolean; onCountChange?: (n: number) => void }) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pending, setPending] = useState<PendingAttachment[]>([]);
  const [showRecorder, setShowRecorder] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => { onCountChange?.(comments.length); }, [comments.length, onCountChange]);

  const handleVideoRecorded = async (blob: Blob) => {
    setShowRecorder(false);
    setUploadingMedia(true);
    try {
      const file = new File([blob], 'circle.webm', { type: 'video/webm' });
      const url = await uploadFile(file);
      const localPreview = URL.createObjectURL(blob);
      setPending((prev) => [...prev, { type: 'video', url, localPreview }]);
    } catch {
      alert('Ошибка загрузки видео');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingMedia(true);
    try {
      const resized = await resizeImage(file, 800);
      const localPreview = URL.createObjectURL(resized);
      const url = await uploadFile(resized);
      setPending((prev) => [...prev, { type: 'image', url, localPreview }]);
    } catch {
      alert('Ошибка загрузки фото');
    } finally {
      setUploadingMedia(false);
    }
  };

  const removePending = (idx: number) => {
    setPending((prev) => {
      const next = [...prev];
      const removed = next.splice(idx, 1)[0];
      if (removed.localPreview) URL.revokeObjectURL(removed.localPreview);
      return next;
    });
  };

  const canSend = !submitting && !uploadingMedia && (text.trim().length > 0 || pending.length > 0);

  const submit = async () => {
    if (!canSend) return;
    setSubmitting(true);
    try {
      await fetch(`/api/blogs/posts/${postId}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({
          content: text.trim(),
          attachments: pending.map(({ type, url }) => ({ type, url })),
          ...(replyingTo ? { replyToId: replyingTo.id } : {}),
        }),
      });
      setText('');
      pending.forEach((a) => { if (a.localPreview) URL.revokeObjectURL(a.localPreview); });
      setPending([]);
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: ['blog-comments', postId] });
    } catch {
      alert('Ошибка отправки комментария');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`mt-3 pt-3 space-y-3 ${isPysy ? 'border-t-2 border-white border-t-[#808080] border-b-2 border-b-[#ffffff] mb-2' : isPutzermann ? 'border-t-2 border-white mt-3 pt-3' : isIsaac ? 'border-t-2 border-t-[#3d2e14] mt-3 pt-3' : 'border-t border-border/40'}`}>
      {isLoading ? (
        <div className="flex justify-center py-2"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
      ) : comments.length === 0 ? (
        <p className={`text-xs px-1 ${isPysy ? 'win95-text-muted' : isPutzermann ? 'noir-text-muted' : isIsaac ? 'medic-text-muted' : 'text-muted-foreground font-mono'}`}>Комментариев пока нет</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="space-y-0.5 group">
              {c.replyTo && (
                <div className={`text-[10px] flex items-center gap-1 mb-0.5 ${isPysy ? 'win95-text-muted' : isPutzermann ? 'noir-text-muted' : isIsaac ? 'medic-text-muted' : 'text-muted-foreground font-mono'}`}>
                  <Reply className="h-2.5 w-2.5 shrink-0" />
                  <span>@{c.replyTo.username}</span>
                </div>
              )}
              <div className="flex gap-2 flex-wrap items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 flex-wrap">
                    <span className={`text-xs font-bold flex-shrink-0 ${isPysy ? 'win95-text font-bold' : isPutzermann ? 'noir-text' : isIsaac ? 'medic-text font-bold' : 'font-mono'}`} style={!isPysy && !isPutzermann && !isIsaac ? { color: theme.accent } : undefined}>
                      {c.user.username}
                    </span>
                    {c.content && (
                      <span className={`text-xs leading-relaxed ${isPysy ? 'win95-text' : isPutzermann ? 'noir-text opacity-80' : isIsaac ? 'medic-text opacity-80' : 'font-sans text-foreground'}`}>{c.content}</span>
                    )}
                  </div>
                  {c.attachments && c.attachments.length > 0 && (
                    <CommentAttachments attachments={c.attachments} theme={theme} isPutzermann={isPutzermann} isPysy={isPysy} isIsaac={isIsaac} />
                  )}
                </div>
                {me && (
                  <button
                    onClick={() => setReplyingTo(replyingTo?.id === c.id ? null : c)}
                    className={`sm:opacity-0 sm:group-hover:opacity-100 flex-shrink-0 transition-opacity text-[10px] flex items-center gap-0.5 mt-0.5 ${isPysy ? 'win95-text-muted' : isPutzermann ? 'noir-text-muted' : isIsaac ? 'medic-text-muted' : 'text-muted-foreground hover:text-foreground font-mono'}`}
                    style={replyingTo?.id === c.id && !isPysy && !isPutzermann && !isIsaac ? { color: theme.accent, opacity: 1 } : undefined}
                  >
                    <Reply className="h-3 w-3" /> ответить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {me && (
        <div className="space-y-2">
          {/* Inline circle recorder */}
          {showRecorder && (
            <div className="py-2 flex justify-center">
              <CircleVideoRecorder
                onRecorded={handleVideoRecorded}
                onClose={() => setShowRecorder(false)}
                theme={theme}
                isPysy={isPysy}
              />
            </div>
          )}

          {/* Pending attachment previews */}
          {(pending.length > 0 || uploadingMedia) && (
            <div className="flex flex-wrap gap-2 items-center">
              {pending.map((att, idx) => (
                <div key={idx} className="relative flex-shrink-0">
                  {att.type === 'video' ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-black border border-border/60">
                      <video src={att.localPreview ?? att.url} className="w-full h-full object-cover" muted playsInline />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded overflow-hidden border border-border/60">
                      <img src={att.localPreview ?? att.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <button
                    onClick={() => removePending(idx)}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-background border border-border flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
              {uploadingMedia && (
                <div className="w-12 h-12 flex items-center justify-center border border-border/40 rounded">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          )}

          {/* Reply chip */}
          {replyingTo && (
            <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded ${isPysy ? 'win95-sunken win95-text-muted' : isPutzermann ? 'noir-sunken noir-text-muted' : isIsaac ? 'medic-sunken medic-text-muted' : 'bg-muted/40 text-muted-foreground font-mono border border-border/50'}`}>
              <Reply className="h-3 w-3 shrink-0" />
              <span className="flex-1 truncate">Ответ → @{replyingTo.user.username}</span>
              <button onClick={() => setReplyingTo(null)} className="shrink-0 hover:opacity-70"><X className="h-3 w-3" /></button>
            </div>
          )}

          {/* Input row */}
          <div className="flex gap-1.5">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Комментарий..."
              className={isPysy
                ? "h-8 win95-sunken win95-text px-2 rounded-none"
                : isPutzermann
                ? "h-8 noir-sunken noir-text px-2 rounded-none text-sm"
                : isIsaac
                ? "h-8 medic-sunken medic-text px-2 rounded-none text-sm"
                : "h-8 text-xs font-sans bg-background/50 border-border/60"}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRecorder((v) => !v)}
              disabled={uploadingMedia}
              title="Записать кружок"
              className={`flex-shrink-0 ${isPysy ? "win95-button h-8 px-2" : isPutzermann ? "noir-button h-8 px-2" : isIsaac ? "medic-button h-8 px-2" : "h-8 px-2"}`}
            >
              <Video className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => photoInputRef.current?.click()}
              disabled={uploadingMedia}
              title="Прикрепить фото"
              className={`flex-shrink-0 ${isPysy ? "win95-button h-8 px-2" : isPutzermann ? "noir-button h-8 px-2" : isIsaac ? "medic-button h-8 px-2" : "h-8 px-2"}`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              onClick={submit}
              disabled={!canSend}
              className={isPysy ? "win95-button h-8 px-3" : isPutzermann ? "noir-button h-8 px-3" : isIsaac ? "medic-button h-8 px-3" : "h-8 px-3 font-mono"}
              style={!isPysy && !isPutzermann && !isIsaac ? { backgroundColor: theme.accent, color: '#000' } : undefined}
            >
              {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            </Button>
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelected} />
          </div>
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
  const [liveCommentsCount, setLiveCommentsCount] = useState<number | null>(null);
  const isPysy = blog.handle === 'pysy-exe';
  const isIsaac = blog.handle === 'medic-de-familie';

  return (
    <article
      className={isPysy
        ? "win95-window mb-6"
        : isPutzermann
          ? "noir-window mb-4"
          : isIsaac
            ? "medic-card mb-4"
            : "bg-card border rounded-2xl p-4 sm:p-5 transition-all duration-200"}
      style={{ borderColor: !isPysy && !isPutzermann && !isIsaac && commentsOpen ? theme.accentBorder : undefined }}
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
      {isIsaac && (
        <div className="medic-title-bar">
          <div className="medic-title-bar-text">
            <span style={{ fontSize: '10px', opacity: 0.7 }}>✦</span>
            {post.title ? post.title.toUpperCase() : (post.createdBy?.username ?? blog.user.username).toUpperCase()}
          </div>
          <span style={{ fontSize: '9px', opacity: 0.6, letterSpacing: '0.08em' }}>
            {format(new Date(post.createdAt as string), 'dd.MM.yyyy', { locale: ru })}
          </span>
        </div>
      )}
      <div className={isPysy ? "p-3 sm:p-4" : isPutzermann ? "p-4 sm:p-5" : isIsaac ? "p-4 sm:p-5" : ""}>
      <div className="flex items-center gap-3 mb-3">
        <Avatar className={isPysy ? "h-10 w-10 flex-shrink-0 win95-sunken rounded-none bg-[#c0c0c0]" : isPutzermann ? "h-10 w-10 flex-shrink-0 noir-sunken rounded-none bg-black border border-white" : isIsaac ? "h-10 w-10 flex-shrink-0 rounded-none bg-black border border-[#C41E24]" : "h-10 w-10 border-2 border-background shadow-md flex-shrink-0"}>
          <AvatarImage src={blog.avatarUrl ?? undefined} className={isPutzermann || isIsaac ? "rounded-none" : ""} />
          <AvatarFallback
            className={isPysy ? "font-bold text-sm win95-text rounded-none" : isPutzermann ? "font-bold text-sm noir-text rounded-none" : isIsaac ? "font-bold text-sm rounded-none bg-[#C41E24] text-white" : "font-bold text-sm"}
            style={isIsaac ? { fontFamily: "'Russo One', sans-serif" } : !isPysy && !isPutzermann ? { background: `linear-gradient(135deg, ${theme.accent}44, ${theme.accent}22)`, color: theme.accent } : undefined}
          >
            {blogAvatarFallback(blog.handle, blog.user.username)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className={isPysy ? "win95-text font-bold leading-tight" : isPutzermann ? "noir-text font-bold leading-tight tracking-wide" : isIsaac ? "medic-text font-bold leading-tight tracking-wide uppercase" : "font-mono text-xs font-bold"} style={!isPysy && !isPutzermann && !isIsaac ? { color: theme.accent } : undefined}>
            {isPutzermann || isIsaac ? (blog.title || blog.user.username) : (post.createdBy?.username ?? blog.user.username)}
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
          {isIsaac && (
            <p className="medic-text-muted" style={{ fontSize: '11px' }}>
              {formatOwnerUsername(blog.handle, blog.ownerUsername)}
            </p>
          )}
          {!isIsaac && (
            <p className={isPysy ? "win95-text-muted mt-0.5" : isPutzermann ? "noir-text-muted text-xs mt-0.5" : "text-muted-foreground font-sans text-xs"}>
              {format(new Date(post.createdAt as string), 'd MMM yyyy, HH:mm', { locale: ru })}
              {post.updatedAt !== post.createdAt && ' · изм.'}
            </p>
          )}
        </div>
        {post.isOwner && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(post)}
              className={isPysy ? "win95-button p-1" : isPutzermann ? "noir-button p-1" : isIsaac ? "medic-button p-1.5" : "p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"}
            >
              <PenSquare className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(post)}
              className={isPysy ? "win95-button p-1" : isPutzermann ? "noir-button p-1" : isIsaac ? "medic-button p-1.5" : "p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {post.title && !isIsaac && (
        <h2 className={isPysy ? "win95-text font-bold text-base sm:text-lg mb-1 leading-tight" : isPutzermann ? "noir-text font-bold text-lg mb-1 leading-tight tracking-widest uppercase" : "font-mono font-bold text-base sm:text-lg mb-1 leading-tight"}>{post.title}</h2>
      )}

      {post.content && (
        <div className={`${isPysy ? "win95-text leading-relaxed" : isPutzermann ? "noir-text text-base leading-relaxed" : isIsaac ? "medic-text text-sm leading-relaxed opacity-90" : "font-sans text-sm sm:text-base text-foreground leading-relaxed"} min-w-0 max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere]`}>
          {post.content}
        </div>
      )}

      <MediaGrid items={post.media ?? []} accentColor={theme.accent} isPutzermann={isPutzermann} isPysy={isPysy} isIsaac={isIsaac} />

      {/* Action bar */}
      <div className={isPysy ? "flex items-center gap-5 mt-4 win95-text-muted" : isPutzermann ? "flex items-center gap-5 mt-4 noir-text-muted" : isIsaac ? "flex items-center gap-5 mt-4 medic-text-muted" : "flex items-center gap-5 mt-4 text-muted-foreground"}>
        <button
          onClick={() => onToggleLike(post.id)}
          disabled={!me}
          className={isPysy ? "win95-button flex items-center gap-1.5" : isPutzermann ? "noir-button flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed" : isIsaac ? "medic-button flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed" : "flex items-center gap-1.5 transition-colors text-sm font-mono disabled:opacity-50 disabled:cursor-not-allowed"}
          style={likesState.liked ? { color: '#ef4444', borderColor: '#ef4444' } : undefined}
          title={me ? undefined : 'Войдите чтобы поставить лайк'}
        >
          <Heart className="h-4 w-4" fill={likesState.liked ? '#ef4444' : 'none'} />
          <span>{likesState.count}</span>
        </button>
        <button
          onClick={() => setCommentsOpen((o) => !o)}
          className={isPysy ? "win95-button flex items-center gap-1.5" : isPutzermann ? "noir-button flex items-center gap-1.5" : isIsaac ? "medic-button flex items-center gap-1.5" : "flex items-center gap-1.5 transition-colors text-sm font-mono hover:text-foreground"}
          style={commentsOpen && !isPysy && !isPutzermann && !isIsaac ? { color: theme.accent } : undefined}
        >
          <MessageCircle className="h-4 w-4" />
          <span>{liveCommentsCount !== null ? liveCommentsCount : post.commentsCount}</span>
        </button>
      </div>

      {commentsOpen && (
        <CommentsSection postId={post.id} me={me} theme={theme} isPutzermann={isPutzermann} isPysy={isPysy} isIsaac={isIsaac} onCountChange={setLiveCommentsCount} />
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
  isIsaac,
  onPosted,
}: {
  handle: string;
  blog: ExtBlog;
  me: { username: string };
  theme: BlogTheme;
  isPutzermann?: boolean;
  isIsaac?: boolean;
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
      <div className={isPysy ? "win95-window mb-6" : isPutzermann ? "noir-card mb-4" : isIsaac ? "medic-window mb-4" : "border rounded-2xl p-4 sm:p-5 mb-6"} style={!isPysy && !isPutzermann && !isIsaac ? { borderColor: theme.accentBorder, backgroundColor: theme.accentBg } : undefined}>
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
        {isIsaac && (
          <div className="medic-title-bar">
            <div className="medic-title-bar-text">✦ НОВАЯ ЗАПИСЬ</div>
            <div className="flex gap-1">
              <button className="medic-button medic-button-small" onClick={() => {}}>—</button>
            </div>
          </div>
        )}
        <div className={isPysy ? "space-y-3 p-3 sm:p-4" : isPutzermann ? "space-y-3" : isIsaac ? "space-y-3 p-4" : "space-y-3"}>
          <Input
            placeholder="Заголовок поста"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={isPysy ? "win95-sunken win95-text px-2 h-8 rounded-none w-full" : isPutzermann ? "noir-sunken noir-text px-2 h-8 rounded-none w-full border-white" : isIsaac ? "medic-sunken medic-text px-2 h-8 rounded-none w-full" : "bg-background/60 border-border/60 font-mono font-semibold"}
          />
          <Textarea
            placeholder="Что нового?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className={isPysy ? "win95-sunken win95-text px-2 py-1 resize-none rounded-none w-full min-h-[80px]" : isPutzermann ? "noir-sunken noir-text px-2 py-1 resize-none rounded-none w-full min-h-[80px] border-white" : isIsaac ? "medic-sunken medic-text px-2 py-1 resize-none rounded-none w-full min-h-[80px]" : "bg-background/60 border-border/60 font-sans resize-none"}
          />
          {(isPysy || isPutzermann || isIsaac) && <div className={`h-px w-full my-2 ${isPysy ? 'border-t-2 border-[#808080] border-b-2 border-[#ffffff]' : isIsaac ? 'border-t border-[#C41E24]/40' : 'border-t border-dashed border-white/30'}`} />}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <label className={`cursor-pointer p-2 rounded-none transition-colors ${isPysy ? 'win95-button' : isPutzermann ? 'noir-button' : isIsaac ? 'medic-button' : 'text-muted-foreground hover:text-foreground hover:bg-card rounded-full'}`} title="Прикрепить файл">
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
                className={isPysy ? "win95-button gap-1.5 h-auto py-1" : isPutzermann ? "noir-button gap-1.5" : isIsaac ? "medic-button gap-1.5" : "font-mono gap-1.5"}
                style={!isPysy && !isPutzermann && !isIsaac ? { backgroundColor: theme.accent, color: '#000' } : undefined}
                title="Снять кружок"
              >
                <Camera className="h-4 w-4" />
                Кружок
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving || uploading || !canSubmit}
                className={isPysy ? "win95-button gap-1.5 h-auto py-1 font-bold" : isPutzermann ? "noir-button gap-1.5 font-bold" : isIsaac ? "medic-button gap-1.5" : "font-mono gap-1.5"}
                style={!isPysy && !isPutzermann && !isIsaac ? { backgroundColor: theme.accent, color: '#000' } : undefined}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Опубликовать
              </Button>
            </div>
          </div>
          {media.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {media.map((m, i) => (
                <div key={i} className={`relative group overflow-hidden w-16 h-16 ${isPysy ? 'win95-sunken rounded-none bg-[#c0c0c0]' : isPutzermann ? 'noir-sunken rounded-none border-white' : isIsaac ? 'medic-sunken rounded-none' : 'rounded-lg border border-border/60 bg-card'}`}>
                  {m.type === 'image' ? (
                    <img src={m.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full flex flex-col items-center justify-center gap-1 ${isPysy ? 'win95-text-muted' : isPutzermann ? 'noir-text-muted' : isIsaac ? 'medic-text-muted' : 'text-muted-foreground'}`}>
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
        <DialogContent hideClose={isPysy || isPutzermann || isIsaac} className={isPysy ? "max-w-sm win95-window p-0 rounded-none border-0" : isPutzermann ? "max-w-sm noir-card p-0 rounded-none border-0" : isIsaac ? "max-w-sm medic-window p-0 rounded-none border-0" : "max-w-sm border border-border/60 bg-card/95 backdrop-blur"}>
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
          {isIsaac && (
            <div className="medic-title-bar">
              <div className="medic-title-bar-text"><Camera className="h-3 w-3" /> RECORD</div>
              <button className="medic-button medic-button-small" onClick={() => setCircleOpen(false)}>X</button>
            </div>
          )}
          {!isPysy && !isPutzermann && !isIsaac && (
            <DialogHeader>
              <DialogTitle className="font-mono text-base font-bold flex items-center gap-2">
                <Camera className="h-4 w-4" style={{ color: theme.accent }} />
                Снять кружок
              </DialogTitle>
            </DialogHeader>
          )}
          <div className={isPysy || isPutzermann || isIsaac ? "p-4" : ""}>
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
  const isIsaac = blog.handle === 'medic-de-familie';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent hideClose={isPysy || isPutzermann || isIsaac} className={isPysy ? "max-w-lg win95-window p-0 rounded-none border-0" : isPutzermann ? "max-w-lg noir-card p-0 rounded-none border-0" : isIsaac ? "max-w-lg medic-window p-0 rounded-none border-0" : "max-w-lg border border-border/60 bg-card/95 backdrop-blur"}>
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
        {isIsaac && (
          <div className="medic-title-bar">
            <div className="medic-title-bar-text">✦ РЕДАКТИРОВАТЬ БЛОГ</div>
            <button className="medic-button medic-button-small" onClick={onClose}>X</button>
          </div>
        )}
        {!isPysy && !isPutzermann && !isIsaac && (
          <DialogHeader>
            <DialogTitle className="font-mono text-lg font-bold flex items-center gap-2">
              <PenSquare className="h-5 w-5" style={{ color: theme.accent }} />
              Редактировать блог
            </DialogTitle>
          </DialogHeader>
        )}
        <div className={isPysy ? "p-4 space-y-4" : isPutzermann ? "p-4 space-y-4" : isIsaac ? "p-4 space-y-4" : "space-y-4 pt-2"}>
          <Input placeholder='Название блога' value={title} onChange={(e) => setTitle(e.target.value)} className={isPysy ? "win95-sunken win95-text px-2 rounded-none" : isPutzermann ? "noir-sunken noir-text px-2 rounded-none border-white" : isIsaac ? "medic-sunken medic-text px-2 rounded-none" : "bg-background/50 border-border/60 font-mono"} />
          <Textarea placeholder='Описание' value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={isPysy ? "win95-sunken win95-text px-2 py-1 resize-none rounded-none" : isPutzermann ? "noir-sunken noir-text px-2 py-1 resize-none rounded-none border-white" : isIsaac ? "medic-sunken medic-text px-2 py-1 resize-none rounded-none" : "bg-background/50 border-border/60 font-sans resize-none"} />
          <div className="flex gap-3">
            <label className={`flex-1 cursor-pointer p-4 text-center transition-colors ${isPysy ? 'win95-button rounded-none' : isPutzermann ? 'noir-sunken' : isIsaac ? 'medic-sunken' : 'rounded-xl border border-border/60 bg-background/50 hover:border-primary/50'}`}>
              {coverUrl ? (
                <div className="relative">
                  <img src={coverUrl} alt="" className={`w-full aspect-[2/1] object-cover ${isPysy ? 'rounded-none win95-sunken' : isPutzermann ? 'rounded-none noir-sunken border-white' : isIsaac ? 'rounded-none medic-sunken' : 'rounded-lg'}`} />
                  <button type="button" onClick={(e) => { e.preventDefault(); setCoverUrl(''); }} className={`absolute top-1 right-1 p-1 ${isPysy ? 'rounded-none win95-button win95-button-small' : isPutzermann ? 'noir-button noir-button-small' : isIsaac ? 'medic-button medic-button-small' : 'rounded-lg bg-black/60 text-white'}`}><X className="h-3 w-3" /></button>
                </div>
              ) : (
                <div className={`flex flex-col items-center gap-1 ${isPysy ? 'win95-text' : isPutzermann ? 'noir-text-muted' : isIsaac ? 'medic-text-muted' : 'text-muted-foreground'}`}><ImageIcon className="h-5 w-5" /><span className={`text-xs ${isPysy ? 'win95-text' : isPutzermann ? 'noir-label' : isIsaac ? 'medic-label' : 'font-sans'}`}>Обложка</span></div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f, 'cover'); e.target.value = ''; }} />
            </label>
            <label className={`flex-1 cursor-pointer p-4 text-center transition-colors ${isPysy ? 'win95-button rounded-none' : isPutzermann ? 'noir-sunken' : isIsaac ? 'medic-sunken' : 'rounded-xl border border-border/60 bg-background/50 hover:border-primary/50'}`}>
              {avatarUrl ? (
                <div className="relative">
                  <img src={avatarUrl} alt="" className={`w-16 h-16 mx-auto object-cover ${isPysy ? 'rounded-none win95-sunken' : isPutzermann ? 'rounded-none noir-sunken border-white' : isIsaac ? 'rounded-none medic-sunken' : 'rounded-lg'}`} />
                  <button type="button" onClick={(e) => { e.preventDefault(); setAvatarUrl(''); }} className={`absolute top-1 right-1 p-1 ${isPysy ? 'rounded-none win95-button win95-button-small' : isPutzermann ? 'noir-button noir-button-small' : isIsaac ? 'medic-button medic-button-small' : 'rounded-lg bg-black/60 text-white'}`}><X className="h-3 w-3" /></button>
                </div>
              ) : (
                <div className={`flex flex-col items-center gap-1 ${isPysy ? 'win95-text' : isPutzermann ? 'noir-text-muted' : isIsaac ? 'medic-text-muted' : 'text-muted-foreground'}`}><ImageIcon className="h-5 w-5" /><span className={`text-xs ${isPysy ? 'win95-text' : isPutzermann ? 'noir-label' : isIsaac ? 'medic-label' : 'font-sans'}`}>Аватар</span></div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f, 'avatar'); e.target.value = ''; }} />
            </label>
          </div>
          {uploading && <div className={`flex items-center gap-2 text-xs ${isPysy ? 'win95-text-muted' : isPutzermann ? 'noir-text-muted' : isIsaac ? 'medic-text-muted' : 'text-muted-foreground font-mono'}`}><Loader2 className="h-3.5 w-3.5 animate-spin" />Загрузка...</div>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className={isPysy ? "win95-button" : isPutzermann ? "noir-button" : isIsaac ? "medic-button" : "font-mono"}>Отмена</Button>
            <Button onClick={handleSubmit} disabled={saving || uploading || !title.trim()} className={isPysy ? "win95-button gap-1.5 font-bold" : isPutzermann ? "noir-button gap-1.5 font-bold" : isIsaac ? "medic-button gap-1.5" : "font-mono gap-1.5"} style={!isPysy && !isPutzermann && !isIsaac ? { backgroundColor: theme.accent, color: '#000' } : undefined}>
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
  const isIsaac = handle === 'medic-de-familie';
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
      <DialogContent hideClose={isPysy || isPutzermann || isIsaac} className={isPysy ? "max-w-lg win95-window p-0 rounded-none border-0" : isPutzermann ? "max-w-lg noir-card p-0 rounded-none border-0" : isIsaac ? "max-w-lg medic-window p-0 rounded-none border-0" : "max-w-lg border border-border/60 bg-card/95 backdrop-blur"}>
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
        {isIsaac && (
          <div className="medic-title-bar">
            <div className="medic-title-bar-text">✦ РЕДАКТИРОВАТЬ ЗАПИСЬ</div>
            <button className="medic-button medic-button-small" onClick={onClose}>X</button>
          </div>
        )}
        {!isPysy && !isPutzermann && !isIsaac && (
          <DialogHeader>
            <DialogTitle className="font-mono text-lg font-bold">Редактировать пост</DialogTitle>
          </DialogHeader>
        )}
        <div className={isPysy ? "p-4 space-y-4" : isPutzermann ? "p-4 space-y-4" : isIsaac ? "p-4 space-y-4" : "space-y-4"}>
          <Input placeholder='Заголовок' value={title} onChange={(e) => setTitle(e.target.value)} className={isPysy ? "win95-sunken win95-text px-2 rounded-none" : isPutzermann ? "noir-sunken noir-text px-2 rounded-none border-white" : isIsaac ? "medic-sunken medic-text px-2 rounded-none" : "font-mono bg-background/50 border-border/60"} />
          <Textarea placeholder='Текст...' value={content} onChange={(e) => setContent(e.target.value)} rows={5} className={isPysy ? "win95-sunken win95-text px-2 py-1 resize-none rounded-none" : isPutzermann ? "noir-sunken noir-text px-2 py-1 resize-none rounded-none border-white" : isIsaac ? "medic-sunken medic-text px-2 py-1 resize-none rounded-none" : "font-sans resize-none bg-background/50 border-border/60"} />
          <div className="flex flex-wrap gap-2">
            {(['image', 'video', 'audio'] as const).map((t) => (
              <label key={t} className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-xs transition-all ${isPysy ? 'win95-button rounded-none' : isPutzermann ? 'noir-button' : isIsaac ? 'medic-button' : 'rounded-xl border border-border/60 bg-card text-muted-foreground hover:text-foreground hover:border-primary/50'}`}>
                {t === 'image' ? <ImageIcon className="h-3.5 w-3.5" /> : t === 'video' ? <Video className="h-3.5 w-3.5" /> : <Music className="h-3.5 w-3.5" />}
                {t === 'image' ? 'Фото' : t === 'video' ? 'Видео' : 'Аудио'}
                <input type="file" accept={`${t}/*`} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f, t); e.target.value = ''; }} />
              </label>
            ))}
            {uploading && <Loader2 className={`h-4 w-4 animate-spin ${isPysy ? 'win95-text-muted' : isPutzermann ? 'noir-text-muted' : isIsaac ? 'medic-text-muted' : 'text-muted-foreground'}`} />}
          </div>
          {media.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {media.map((m, i) => (
                <div key={i} className={`relative group overflow-hidden w-20 h-20 ${isPysy ? 'win95-sunken rounded-none bg-[#c0c0c0]' : isPutzermann ? 'noir-sunken rounded-none border-white' : isIsaac ? 'medic-sunken rounded-none' : 'rounded-xl border border-border/60 bg-card'}`}>
                  {m.type === 'image' ? <img src={m.url} alt="" className="w-full h-full object-cover" /> : (
                    <div className={`w-full h-full flex items-center justify-center ${isPysy ? 'win95-text-muted' : isPutzermann ? 'noir-text-muted' : isIsaac ? 'medic-text-muted' : 'text-muted-foreground'}`}>
                      {m.isCircle ? <Camera className="h-5 w-5" /> : m.type === 'video' ? <Video className="h-5 w-5" /> : <Music className="h-5 w-5" />}
                    </div>
                  )}
                  <button type="button" onClick={() => setMedia((prev) => prev.filter((_, j) => j !== i))} className={`absolute top-0.5 right-0.5 p-1 ${isPysy ? 'rounded-none win95-button win95-button-small' : isPutzermann ? 'noir-button noir-button-small' : isIsaac ? 'medic-button medic-button-small' : 'rounded-lg bg-black/60 text-white'}`}><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className={isPysy ? "win95-button" : isPutzermann ? "noir-button" : isIsaac ? "medic-button" : "font-mono"}>Отмена</Button>
            <Button onClick={handleSubmit} disabled={saving || uploading || !title.trim()} className={isPysy ? "win95-button gap-1.5 font-bold" : isPutzermann ? "noir-button gap-1.5 font-bold" : isIsaac ? "medic-button gap-1.5" : "font-mono gap-1.5"} style={!isPysy && !isPutzermann && !isIsaac ? { backgroundColor: theme.accent, color: '#000' } : undefined}>
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
  const isIsaac = blog?.handle === 'medic-de-familie';

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
    {isIsaac && <div className="fixed inset-0 medic-page -z-10" />}
    <div className={isPysy ? "max-w-3xl mx-auto w-full pb-10 relative pt-4 sm:pt-8" : isPutzermann ? "max-w-3xl mx-auto w-full pb-10 relative" : isIsaac ? "max-w-3xl mx-auto w-full pb-10 relative" : "max-w-3xl mx-auto w-full pb-10"}>
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
      ) : isIsaac ? (
        /* ── Gorecore × Medical Hero ── */
        <div className="mb-2">
          <div className="relative overflow-hidden" style={{ minHeight: '260px', background: '#040000' }}>
            {/* Blood pool radials */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse at 50% 115%, rgba(140,0,16,0.60) 0%, rgba(100,0,12,0.35) 30%, transparent 60%)',
            }} />
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse at 10% 85%, rgba(100,0,10,0.30) 0%, transparent 42%)',
            }} />
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse at 88% 15%, rgba(80,0,8,0.20) 0%, transparent 35%)',
            }} />

            {/* Organic vein SVG overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid slice" viewBox="0 0 900 280" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.14 }}>
              <path d="M0,140 C70,118 140,170 240,132 S390,95 470,155 S610,195 720,138 S820,112 900,140" stroke="#8B0010" strokeWidth="2" fill="none"/>
              <path d="M0,190 C90,168 175,210 285,182 S440,162 530,205 S660,235 900,188" stroke="#6A0008" strokeWidth="1.2" fill="none"/>
              <path d="M0,90 C60,105 100,75 150,95 S200,115 220,90 S260,65 900,85" stroke="#5A0008" strokeWidth="0.9" fill="none"/>
              <path d="M110,0 C128,55 98,115 138,175 S158,230 148,280" stroke="#7A0010" strokeWidth="1.2" fill="none"/>
              <path d="M620,0 C598,75 638,148 608,215 S578,268 608,280" stroke="#7A0010" strokeWidth="1" fill="none"/>
              <path d="M320,0 C300,48 342,98 318,158 S288,202 320,260" stroke="#5A0008" strokeWidth="0.8" fill="none"/>
              <path d="M820,0 C800,60 840,118 815,185 S790,240 815,280" stroke="#6A0008" strokeWidth="0.9" fill="none"/>
              {/* Branching capillaries */}
              <path d="M240,132 C260,120 275,108 295,118" stroke="#7A0010" strokeWidth="0.7" fill="none"/>
              <path d="M470,155 C490,142 508,130 525,140" stroke="#6A0008" strokeWidth="0.7" fill="none"/>
              <path d="M138,175 C155,182 168,190 162,205" stroke="#6A0008" strokeWidth="0.6" fill="none"/>
            </svg>

            {/* Cover image (multiply blend to stain over bg) */}
            {blog.coverUrl && (
              <img src={blog.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.12, mixBlendMode: 'lighten' }} />
            )}

            {/* Record label bar */}
            <div className="relative z-10 px-5 pt-5 flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 border" style={{ borderColor: 'rgba(196,30,36,0.40)', background: 'rgba(196,30,36,0.07)' }}>
                <span style={{ color: '#C41E24', fontFamily: 'Space Mono,monospace', fontSize: '9px', letterSpacing: '0.28em' }}>✚ CARTE MEDICALĂ</span>
              </div>
              <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, rgba(196,30,36,0.35), transparent)' }} />
              <span style={{ color: '#3A1015', fontFamily: 'Space Mono,monospace', fontSize: '9px', letterSpacing: '0.18em' }}>ID:{blog.handle}</span>
            </div>

            {/* Main content */}
            <div className="relative z-10 px-5 pt-6 pb-16 flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-10">
              <div className="flex-1 min-w-0">
                <h1
                  className="text-5xl sm:text-7xl font-black uppercase leading-none break-words"
                  style={{
                    fontFamily: 'Space Mono, monospace',
                    color: '#E8D8C0',
                    textShadow: '0 2px 24px rgba(196,30,36,0.35), 2px 0 rgba(140,0,10,0.55)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {blog.title || blog.user.username}
                </h1>
                <div className="mt-5 flex items-center gap-3">
                  <div style={{ width: '28px', height: '1px', background: '#C41E24' }} />
                  <p className="text-[11px] tracking-[0.28em] uppercase" style={{ color: '#5A3035', fontFamily: 'Space Mono,monospace' }}>
                    {formatOwnerUsername(blog.handle, blog.ownerUsername)}
                  </p>
                </div>
              </div>

              {/* Avatar */}
              <div className="shrink-0 relative self-start">
                <div className="absolute -inset-3 pointer-events-none" style={{
                  background: 'radial-gradient(ellipse, rgba(196,30,36,0.22) 0%, transparent 70%)',
                  filter: 'blur(6px)',
                }} />
                <Avatar className="relative h-24 w-24 sm:h-28 sm:w-28 border-2" style={{ borderColor: 'rgba(196,30,36,0.55)', boxShadow: '0 0 20px rgba(196,30,36,0.28), inset 0 0 14px rgba(100,0,10,0.35)' }}>
                  <AvatarImage src={blog.avatarUrl ?? undefined} alt={blog.user.username} className="object-cover" />
                  <AvatarFallback className="font-black text-2xl" style={{ background: '#0D0000', color: '#C41E24', fontFamily: 'Space Mono,monospace' }}>
                    {blogAvatarFallback(blog.handle, blog.user.username)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {blog.isOwner && (
                <Button variant="outline" onClick={() => setIsEditBlogOpen(true)} className="medic-button gap-2 self-start shrink-0">
                  <PenSquare className="h-4 w-4" />
                  Редактировать
                </Button>
              )}
            </div>

            {/* Blood drip divider at bottom */}
            <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none" style={{ lineHeight: 0 }}>
              <svg viewBox="0 0 1200 56" preserveAspectRatio="none" className="w-full block" style={{ height: '56px' }}>
                {/* Crimson band */}
                <rect x="0" y="0" width="1200" height="3" fill="rgba(122,0,16,0.90)"/>
                {/* Blood drips */}
                <ellipse cx="75"  cy="10" rx="6"  ry="14" fill="rgba(90,0,10,0.85)"/>
                <ellipse cx="195" cy="8"  rx="5"  ry="11" fill="rgba(110,0,14,0.80)"/>
                <ellipse cx="340" cy="12" rx="7"  ry="16" fill="rgba(85,0,10,0.85)"/>
                <ellipse cx="520" cy="9"  rx="5"  ry="12" fill="rgba(100,0,12,0.75)"/>
                <ellipse cx="680" cy="11" rx="6"  ry="15" fill="rgba(90,0,10,0.80)"/>
                <ellipse cx="850" cy="8"  rx="5"  ry="11" fill="rgba(110,0,14,0.75)"/>
                <ellipse cx="1020" cy="12" rx="7" ry="14" fill="rgba(85,0,10,0.80)"/>
                <ellipse cx="1150" cy="9"  rx="5" ry="12" fill="rgba(100,0,12,0.75)"/>
                {/* Dark fill below → merges to page bg */}
                <polygon points="0,56 0,20 1200,20 1200,56" fill="#040000"/>
              </svg>
            </div>
          </div>

          {/* Description */}
          {blog.description && (
            <div className="px-5 py-4" style={{ background: '#060000', borderBottom: '1px solid rgba(196,30,36,0.16)' }}>
              <p className="medic-text text-sm max-w-2xl leading-relaxed opacity-80">
                {blog.description}
              </p>
            </div>
          )}

          {/* Warning strip */}
          <div className="px-5 py-2.5 flex items-start gap-3" style={{ background: 'rgba(196,30,36,0.05)', borderBottom: '1px solid rgba(196,30,36,0.16)' }}>
            <span className="shrink-0 mt-0.5" style={{ color: '#7A0010', fontSize: '12px' }}>✚</span>
            <p className="flex-1 text-[9px] sm:text-[10px] leading-snug uppercase tracking-[0.15em]" style={{ color: '#5A3035', fontFamily: 'Space Mono,monospace' }}>
              ПОПЕРЕДЖЕННЯ: Тривале читання може призвести до надмірного самодіагностування · Читайте з обережністю
            </p>
            <span className="shrink-0 mt-0.5" style={{ color: '#7A0010', fontSize: '12px' }}>✚</span>
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
        <div className="flex justify-end mb-3">
          <PushBellButton isPutzermann={isPutzermann} isPysy={isPysy} isIsaac={isIsaac} theme={theme} />
        </div>
        {blog.isOwner && me && (
          <CreatePostBox handle={blog.handle} blog={blog} me={me} theme={theme} isPutzermann={isPutzermann} isIsaac={isIsaac} onPosted={() => {}} />
        )}

        {posts.length === 0 ? (
          <div className={`text-center py-20 ${isPysy ? 'win95-sunken bg-white border-0' : isPutzermann ? 'noir-panel' : isIsaac ? 'medic-panel border-0' : 'border border-dashed bg-card/30 rounded-3xl'}`} style={!isPysy && !isPutzermann && !isIsaac ? { borderColor: theme.accentBorder } : undefined}>
            {!isPysy && !isPutzermann && !isIsaac && <Sparkles className="h-10 w-10 mx-auto mb-3" style={{ color: theme.accent }} />}
            {isIsaac && <span className="text-3xl block mb-3">✦</span>}
            <p className={`${isPysy ? 'win95-text-muted font-sans' : isPutzermann ? 'noir-text-muted tracking-widest uppercase' : isIsaac ? 'medic-text-muted tracking-widest uppercase' : 'text-muted-foreground font-mono'}`}>В блоге пока нет постов</p>
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
