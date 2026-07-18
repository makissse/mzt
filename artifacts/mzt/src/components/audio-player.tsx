import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, AlertCircle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const MIME_BY_EXT: Record<string, string> = {
  '.mp3':  'audio/mpeg',
  '.wav':  'audio/wav',
  '.flac': 'audio/flac',
  '.alac': 'audio/x-alac',
  '.aac':  'audio/aac',
  '.m4a':  'audio/mp4',
  '.ogg':  'audio/ogg',
  '.opus': 'audio/ogg; codecs=opus',
  '.webm': 'audio/webm',
};

function getExtension(url: string): string {
  const clean = url.split('?')[0];
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot).toLowerCase() : '';
}

function getMimeType(url: string): string {
  return MIME_BY_EXT[getExtension(url)] ?? 'audio/mpeg';
}

function canBrowserPlay(mime: string): boolean {
  try {
    const a = document.createElement('audio');
    const result = a.canPlayType(mime);
    return result === 'probably' || result === 'maybe';
  } catch {
    return true;
  }
}

function DownloadFallback({ src, mime }: { src: string; mime: string }) {
  const ext = getExtension(src).replace('.', '').toUpperCase() || 'файл';

  const handleDownload = async () => {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const obj = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = obj;
      a.download = src.split('/').pop() ?? 'audio';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(obj);
    } catch {
      window.open(src, '_blank');
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 w-full">
      <AlertCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
      <span className="flex-1 font-mono text-xs text-muted-foreground">
        {ext} — браузер не поддерживает этот формат
      </span>
      <button
        type="button"
        onClick={handleDownload}
        className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground hover:border-primary/40 hover:text-primary transition-all"
      >
        <Download className="h-3.5 w-3.5" />
        Скачать
      </button>
    </div>
  );
}

export function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackError, setPlaybackError] = useState(false);

  const mime = getMimeType(src);
  const browserSupported = canBrowserPlay(mime);

  useEffect(() => {
    setPlaybackError(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [src]);

  if (!browserSupported || playbackError) {
    return <DownloadFallback src={src} mime={mime} />;
  }

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => setPlaybackError(true));
    }
  };

  const seek = (vals: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = vals[0];
    setCurrentTime(vals[0]);
  };

  const changeVolume = (vals: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const v = vals[0];
    audio.volume = v;
    setVolume(v);
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      const restored = volume > 0 ? volume : 1;
      audio.volume = restored;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3 w-full">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => setPlaybackError(true)}
      />

      {/* Controls row */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/80"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 translate-x-px" />}
        </button>

        <span className="flex-shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
          {formatTime(currentTime)}
          <span className="mx-1 opacity-40">/</span>
          {formatTime(duration)}
        </span>

        <div className="flex-1" />

        <button
          type="button"
          onClick={toggleMute}
          className="flex-shrink-0 text-muted-foreground transition-colors hover:text-foreground"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>

        <div className="w-20 flex-shrink-0">
          <Slider
            min={0}
            max={1}
            step={0.05}
            value={[isMuted ? 0 : volume]}
            onValueChange={changeVolume}
          />
        </div>
      </div>

      {/* Progress bar */}
      <Slider
        min={0}
        max={duration || 1}
        step={0.1}
        value={[currentTime]}
        onValueChange={seek}
        className="w-full mt-1.5"
      />
    </div>
  );
}
