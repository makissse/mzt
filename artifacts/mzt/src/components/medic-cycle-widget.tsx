import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customFetch } from '@workspace/api-client-react';

type CycleData = {
  postCount: number;
  totalPosts: number;
  cycleStartedAt: string;
  cycleDurationHours: number;
};

function useCountdown(cycleStartedAt: string | undefined, cycleDurationHours: number) {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    if (!cycleStartedAt) return;

    function calc() {
      const start = new Date(cycleStartedAt!).getTime();
      const end = start + cycleDurationHours * 60 * 60 * 1000;
      const diff = end - Date.now();
      setRemaining(Math.max(0, diff));
    }

    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [cycleStartedAt, cycleDurationHours]);

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    expired: remaining === 0,
  };
}

const PIXEL_FONT: React.CSSProperties = {
  fontFamily: "'Silkscreen', monospace",
  imageRendering: 'pixelated',
};

const BODY_FONT: React.CSSProperties = {
  fontFamily: "'Pixelify Sans', 'Silkscreen', monospace",
};

export function MedicCycleWidget() {
  const { data, isLoading } = useQuery<CycleData>({
    queryKey: ['medic-cycle'],
    queryFn: () => customFetch<CycleData>('/api/blogs/medic-de-familie/cycle'),
    refetchInterval: 30_000,
  });

  const { hours, minutes, seconds, expired } = useCountdown(
    data?.cycleStartedAt,
    data?.cycleDurationHours ?? 72,
  );

  if (isLoading || !data) return null;

  const postCount = data.postCount;
  const totalPosts = data.totalPosts;
  const filled = postCount;
  const empty = totalPosts - filled;

  return (
    <div style={{
      border: '2px solid #F0C0C8',
      background: '#FFF5F7',
      padding: '8px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '7px',
      marginTop: '10px',
    }}>
      {/* Counter row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Pixel hearts as progress dots */}
        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
          {Array.from({ length: totalPosts }).map((_, i) => (
            <svg key={i} width="10" height="9" viewBox="0 0 10 9"
              style={{ imageRendering: 'pixelated', flexShrink: 0 }}
              fill={i < filled ? '#C72535' : '#F0C0C8'}
            >
              <rect x="1" y="0" width="3" height="1"/>
              <rect x="6" y="0" width="3" height="1"/>
              <rect x="0" y="1" width="4" height="1"/>
              <rect x="6" y="1" width="4" height="1"/>
              <rect x="0" y="2" width="10" height="1"/>
              <rect x="0" y="3" width="10" height="1"/>
              <rect x="1" y="4" width="8" height="1"/>
              <rect x="2" y="5" width="6" height="1"/>
              <rect x="3" y="6" width="4" height="1"/>
              <rect x="4" y="7" width="2" height="1"/>
            </svg>
          ))}
        </div>
        <span style={{ ...PIXEL_FONT, color: '#9B4550', fontSize: '9px', letterSpacing: '0.06em' }}>
          {postCount}/{totalPosts} ПОСТОВ
        </span>
      </div>

      {/* Timer row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        {/* Pixel hourglass icon */}
        <svg width="9" height="11" viewBox="0 0 9 11" style={{ imageRendering: 'pixelated', flexShrink: 0 }} fill="#C72535">
          <rect x="0" y="0" width="9" height="1"/>
          <rect x="1" y="1" width="7" height="1"/>
          <rect x="2" y="2" width="5" height="1"/>
          <rect x="3" y="3" width="3" height="1"/>
          <rect x="4" y="4" width="1" height="1"/>
          <rect x="3" y="5" width="3" height="1"/>
          <rect x="2" y="6" width="5" height="1"/>
          <rect x="1" y="7" width="7" height="1"/>
          <rect x="0" y="8" width="9" height="1"/>
          <rect x="0" y="9" width="9" height="1"/>
        </svg>
        <span style={{
          ...PIXEL_FONT,
          fontSize: '11px',
          color: expired ? '#C72535' : '#6B3540',
          letterSpacing: '0.1em',
        }}>
          {expired ? 'ВРЕМЯ ВЫШЛО' : `${hours}:${minutes}:${seconds}`}
        </span>
        <span style={{ ...PIXEL_FONT, fontSize: '8px', color: '#C0A0A8', letterSpacing: '0.04em' }}>
          ДО УДАЛЕНИЯ
        </span>
      </div>
    </div>
  );
}
