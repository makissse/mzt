import React, { useState, useCallback, useRef, useEffect } from 'react';
import timelineData from '@/data/timeline.json';
import {
  MessageCircle, Image, Mic, Video, Calendar, ChevronLeft, ChevronRight, Smile
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
type Month = typeof timelineData[number];

// ── Constants ────────────────────────────────────────────────────────────────
const TOTAL = timelineData.length;
const MAX_MSGS = Math.max(...timelineData.map(m => m.msgCount));

const SENDER_COLORS: Record<string, string> = {};
const PALETTE = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#22d3ee'];
let ci = 0;
function senderColor(name: string) {
  if (!SENDER_COLORS[name]) SENDER_COLORS[name] = PALETTE[ci++ % PALETTE.length];
  return SENDER_COLORS[name];
}

// Ensure all senders get stable colours on first render
timelineData.forEach(m => m.topSenders.forEach(s => senderColor(s.name)));

// ── Subcomponents ─────────────────────────────────────────────────────────────
function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-primary/60">{icon}</span>
      <span className="font-mono text-sm font-bold tabular-nums">{value.toLocaleString('ru')}</span>
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function ParticipantBars({ month }: { month: Month }) {
  return (
    <div className="space-y-2">
      {month.topSenders.map(s => {
        const pct = Math.round((s.count / month.msgCount) * 100);
        const color = senderColor(s.name);
        return (
          <div key={s.name} className="flex items-center gap-3">
            <span className="font-mono text-xs w-20 truncate shrink-0" style={{ color }}>
              {s.name.split(' ')[0]}
            </span>
            <div className="flex-1 h-1.5 bg-card rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
            <span className="font-mono text-xs text-muted-foreground w-8 text-right shrink-0">{s.count}</span>
          </div>
        );
      })}
    </div>
  );
}

function PhotoGrid({ photos }: { photos: string[] }) {
  if (!photos.length) return (
    <div className="flex items-center justify-center h-32 text-muted-foreground text-sm font-mono">
      нет фотографий
    </div>
  );
  return (
    <div className="grid gap-1" style={{
      gridTemplateColumns: photos.length === 1
        ? '1fr'
        : photos.length === 2
          ? '1fr 1fr'
          : photos.length <= 4
            ? 'repeat(2, 1fr)'
            : photos.length <= 9
              ? 'repeat(3, 1fr)'
              : 'repeat(4, 1fr)',
    }}>
      {photos.map((src, i) => (
        <a key={i} href={src} target="_blank" rel="noopener noreferrer"
          className="aspect-square overflow-hidden rounded-lg bg-card group block">
          <img src={src} alt="" loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </a>
      ))}
    </div>
  );
}

function FunnyQuotes({ month }: { month: Month }) {
  if (!month.funny?.length) return (
    <div className="text-muted-foreground text-sm font-mono text-center py-4">
      нет данных
    </div>
  );
  return (
    <div className="space-y-3">
      {month.funny.map((q, i) => (
        <div key={i} className="bg-background/50 border border-border/50 rounded-xl p-3.5">
          <p className="font-mono text-xs mb-2 font-bold" style={{ color: senderColor(q.sender) }}>
            {q.sender.split(' ')[0]}
          </p>
          <p className="font-sans text-sm leading-relaxed text-foreground/90">{q.text}</p>
        </div>
      ))}
    </div>
  );
}

// ── Month activity bar used in slider track ────────────────────────────────
function MiniBar({ month, active }: { month: Month; active: boolean }) {
  const h = Math.max(6, Math.round((month.msgCount / MAX_MSGS) * 56));
  return (
    <div className="flex items-end justify-center py-1" style={{ height: 64 }}>
      <div
        className="w-full rounded-md transition-all duration-150"
        style={{
          height: h,
          backgroundColor: active ? '#3b82f6' : 'rgba(255,255,255,0.12)',
        }}
      />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TimelinePage() {
  // Default to the most recent month
  const [idx, setIdx] = useState(TOTAL - 1);
  const sliderRef = useRef<HTMLInputElement>(null);
  const month = timelineData[idx];

  const go = useCallback((delta: number) => {
    setIdx(i => Math.max(0, Math.min(TOTAL - 1, i + delta)));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [go]);

  // Summary stats
  const totalMsgs = timelineData.reduce((s, m) => s + m.msgCount, 0);
  const totalPhotos = timelineData.reduce((s, m) => s + m.photoCount, 0);
  const totalVoice = timelineData.reduce((s, m) => s + m.voiceCount, 0);

  // Year markers for slider
  const yearMarkers: { year: number; idx: number }[] = [];
  timelineData.forEach((m, i) => {
    if (i === 0 || timelineData[i - 1].year !== m.year)
      yearMarkers.push({ year: m.year, idx: i });
  });

  return (
    <div className="min-h-screen flex flex-col max-w-3xl mx-auto px-4 py-6 gap-6 pb-20">

      {/* ── Header ── */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-0.5">Мужская лига</h1>
        <p className="font-mono text-xs text-muted-foreground mb-5">
          {timelineData[0].monthName} {timelineData[0].year}
          {' — '}
          {timelineData[TOTAL - 1].monthName} {timelineData[TOTAL - 1].year}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Сообщений', value: totalMsgs },
            { label: 'Фотографий', value: totalPhotos },
            { label: 'Голосовых', value: totalVoice },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-3.5">
              <div className="font-mono text-xl font-black text-primary">{s.value.toLocaleString('ru')}</div>
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </header>

      {/* ── Slider ── */}
      <div className="bg-card border border-border rounded-2xl p-4 select-none">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Перемотка по месяцам</span>
          <span className="font-mono text-xs text-muted-foreground">{idx + 1} / {TOTAL}</span>
        </div>
        {/* Mini activity bars */}
        <div className="flex gap-[3px] mb-3 items-end cursor-pointer"
          onClick={e => {
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            setIdx(Math.round(pct * (TOTAL - 1)));
          }}>
          {timelineData.map((m, i) => (
            <div key={m.key} className="flex-1" onClick={e => { e.stopPropagation(); setIdx(i); }}>
              <MiniBar month={m} active={i === idx} />
            </div>
          ))}
        </div>

        {/* Native range */}
        <input
          ref={sliderRef}
          type="range"
          min={0}
          max={TOTAL - 1}
          value={idx}
          onChange={e => setIdx(Number(e.target.value))}
          className="w-full h-2.5 accent-blue-500 cursor-pointer"
          style={{ accentColor: '#3b82f6' }}
        />

        {/* Year labels */}
        <div className="relative h-6 mt-3 px-4">
          {yearMarkers.map(({ year, idx: yi }, i) => {
            const isFirst = i === 0;
            const isLast = i === yearMarkers.length - 1;
            const pct = (yi / (TOTAL - 1)) * 100;
            return (
              <button
                key={year}
                onClick={() => setIdx(yi)}
                className="absolute top-0 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                style={{
                  left: `${pct}%`,
                  transform: isFirst ? 'translateX(0)' : isLast ? 'translateX(-100%)' : 'translateX(-50%)',
                }}
              >
                {year}
              </button>
            );
          })}
        </div>

        {/* Prev / current / next */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => go(-1)}
            disabled={idx === 0}
            className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {idx > 0 ? `${timelineData[idx - 1].monthName} ${timelineData[idx - 1].year}` : ''}
          </button>

          <div className="text-center">
            <span className="font-bold text-xl">{month.monthName}</span>
            <span className="font-mono text-sm text-muted-foreground ml-2">{month.year}</span>
          </div>

          <button
            onClick={() => go(1)}
            disabled={idx === TOTAL - 1}
            className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            {idx < TOTAL - 1 ? `${timelineData[idx + 1].monthName} ${timelineData[idx + 1].year}` : ''}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Month stats ── */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4">
          <Stat icon={<MessageCircle className="h-3.5 w-3.5" />} value={month.msgCount} label="сообщений" />
          <Stat icon={<Image className="h-3.5 w-3.5" />} value={month.photoCount} label="фото" />
          <Stat icon={<Mic className="h-3.5 w-3.5" />} value={month.voiceCount} label="голос." />
          <Stat icon={<Video className="h-3.5 w-3.5" />} value={month.videoCount} label="видео" />
          <Stat icon={<Smile className="h-3.5 w-3.5" />} value={month.stickerCount} label="стик." />
          <Stat icon={<Calendar className="h-3.5 w-3.5" />} value={month.activeDays} label="дней" />
        </div>
        <ParticipantBars month={month} />
      </div>

      {/* ── Photos ── */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          Фотографии {month.photos.length > 0 ? `· ${month.photos.length}` : ''}
        </p>
        <PhotoGrid photos={month.photos} />
      </div>

      {/* ── Funny quotes ── */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          Цитаты месяца 💀
        </p>
        <FunnyQuotes month={month} />
      </div>

      <div className="h-8" />
    </div>
  );
}
