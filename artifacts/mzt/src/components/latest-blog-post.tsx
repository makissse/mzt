import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { Image as ImageIcon, Loader2, Music2, Newspaper, Play, Radio, Video } from "lucide-react";
import { useGetBlog, type BlogPost } from "@workspace/api-client-react";

type BlogMedia = {
  type: string;
  url: string;
  isCircle?: boolean;
};

type FeedPost = BlogPost & {
  media?: BlogMedia[];
};

type FeedBlog = {
  handle: string;
  title: string;
  posts: FeedPost[];
};

function PostPreview({ post }: { post: FeedPost }) {
  const media = (post.media ?? []) as BlogMedia[];
  const visibleMedia = media.filter(
    (item) => item.isCircle || item.type === "image" || (item.type === "video" && !item.isCircle),
  );
  const hasAudio = media.some((item) => item.type === "audio");

  return (
    <div className="min-w-0 space-y-3">
      {post.content && (
        <p className="min-w-0 max-w-full whitespace-pre-wrap break-words text-sm leading-6 text-foreground/90 [overflow-wrap:anywhere]">
          {post.content}
        </p>
      )}

      {visibleMedia.map((item, index) =>
        item.isCircle ? (
          <div key={`${item.url}-${index}`} className="flex min-w-0 justify-center">
            <CirclePostPlayer src={item.url} size={150} />
          </div>
        ) : item.type === "video" ? (
          <div key={`${item.url}-${index}`} className="min-w-0 overflow-hidden rounded-xl border border-border/70 bg-black">
            <video
              src={item.url}
              className="block h-auto max-h-[clamp(140px,28vh,280px)] w-full object-contain"
              controls
              playsInline
              preload="metadata"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ) : (
          <div key={`${item.url}-${index}`} className="min-w-0 overflow-hidden rounded-xl border border-border/70 bg-black/20">
            <img
              src={item.url}
              alt=""
              className="block h-auto max-h-[clamp(140px,28vh,300px)] w-full object-contain"
              loading="lazy"
            />
          </div>
        ),
      )}

      {hasAudio && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/60 pt-2 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Music2 className="h-3 w-3" /> аудио есть в полном посте
          </span>
        </div>
      )}

      {!post.content && visibleMedia.length === 0 && !hasAudio && (
        <div className="flex min-h-[100px] items-center justify-center rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-center text-sm text-muted-foreground">
          Новая публикация
        </div>
      )}
    </div>
  );
}

function CirclePostPlayer({ src, size = 170 }: { src: string; size?: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const offset = Math.max(5, Math.round(size * 13 / 230));
  const container = size + offset * 2;
  const center = container / 2;
  const radius = center - offset / 2 - 1;
  const stroke = Math.max(2, Math.round(4 * size / 230));
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => { setPlaying(false); setProgress(0); };
    const onLoaded = () => setLoaded(true);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("loadedmetadata", onLoaded);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("loadedmetadata", onLoaded);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const tick = () => {
      const video = videoRef.current;
      if (video?.duration && Number.isFinite(video.duration)) {
        setProgress(video.currentTime / video.duration);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, []);

  return (
    <div
      className="relative shrink-0 cursor-pointer select-none"
      style={{ width: container, height: container }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          toggle();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={playing ? "Пауза" : "Воспроизвести кружок"}
    >
      <div
        className="absolute overflow-hidden rounded-full bg-black"
        style={{ width: size, height: size, top: offset, left: offset }}
      >
        <video
          ref={videoRef}
          src={src}
          className="pointer-events-none h-full w-full object-cover"
          preload="metadata"
          playsInline
        />
      </div>
      <svg
        width={container}
        height={container}
        className="pointer-events-none absolute inset-0"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={stroke} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
        />
      </svg>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        </div>
      )}
      {!playing && loaded && (
        <div
          className="absolute flex items-center justify-center rounded-full bg-black/35"
          style={{ width: size, height: size, top: offset, left: offset }}
        >
          <Play className="h-8 w-8 fill-white text-white drop-shadow-lg" />
        </div>
      )}
    </div>
  );
}

export function LatestBlogPost({ className = "" }: { className?: string }) {
  const pysy = useGetBlog("pysy-exe");
  const putzermann = useGetBlog("putzermann-core");
  const latest = useMemo(() => {
    const blogs: FeedBlog[] = [
      { handle: "pysy-exe", title: "pysy.exe", posts: (pysy.data?.posts ?? []) as FeedPost[] },
      { handle: "putzermann-core", title: "putzermann core", posts: (putzermann.data?.posts ?? []) as FeedPost[] },
    ];
    return blogs
      .flatMap((blog) => blog.posts.map((post) => ({ blog, post })))
      .sort((a, b) => new Date(b.post.createdAt).getTime() - new Date(a.post.createdAt).getTime())[0];
  }, [pysy.data, putzermann.data]);

  const isLoading = pysy.isLoading || putzermann.isLoading;

  return (
    <aside className={`latest-blog-post rounded-2xl border border-primary/25 bg-card/90 p-3 shadow-xl backdrop-blur ${className}`}>
      <div className="mb-2 flex items-center justify-between gap-2 border-b border-border/70 pb-2">
        <div className="flex min-w-0 items-center gap-2">
          <Radio className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Последний пост</span>
        </div>
        <Newspaper className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </div>

      {isLoading ? (
        <div className="space-y-2 py-4">
          <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
        </div>
      ) : latest ? (
        <Link href={`/blogs/${latest.blog.handle}`} className="group block">
          <div className="mb-2 flex items-center gap-2">
            <span className="truncate font-mono text-xs font-semibold text-foreground group-hover:text-primary">{latest.blog.title}</span>
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {new Date(latest.post.createdAt).toLocaleDateString("ru-RU")}
            </span>
          </div>
          {latest.post.title && <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-5 text-foreground">{latest.post.title}</h3>}
          <PostPreview post={latest.post} />
        </Link>
      ) : (
        <div className="flex min-h-[130px] items-center justify-center px-3 text-center text-xs leading-5 text-muted-foreground">
          Здесь появится последняя публикация из блогов.
        </div>
      )}
    </aside>
  );
}