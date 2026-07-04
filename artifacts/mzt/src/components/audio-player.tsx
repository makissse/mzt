import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
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
      />

      {/* Controls row */}
      <div className="flex items-center gap-3">
        {/* Play / Pause */}
        <button
          type="button"
          onClick={toggle}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-600 text-white transition-colors hover:bg-violet-500"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 translate-x-px" />}
        </button>

        {/* Time display */}
        <span className="flex-shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
          {formatTime(currentTime)}
          <span className="mx-1 opacity-40">/</span>
          {formatTime(duration)}
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Mute toggle */}
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

        {/* Volume slider */}
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

      {/* Progress bar row — full width, clearly separate from time */}
      <Slider
        min={0}
        max={duration || 1}
        step={0.1}
        value={[currentTime]}
        onValueChange={seek}
        className="w-full"
      />
    </div>
  );
}
