import React from 'react';
import { useGetSecretPhoto } from '@workspace/api-client-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Lock, Image } from 'lucide-react';

function ProgressBar({ label, current, needed }: { label: string; current: number; needed: number }) {
  const pct = Math.min(100, Math.round((current / needed) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={current >= needed ? 'text-green-400' : 'text-muted-foreground'}>
          {current.toLocaleString('ru')} / {needed.toLocaleString('ru')}
        </span>
      </div>
      <div className="h-2 w-full bg-card rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%`, opacity: current >= needed ? 1 : 0.6 }}
        />
      </div>
    </div>
  );
}

export default function SecretPhotoPage() {
  const { data, isLoading, error } = useGetSecretPhoto();

  const content = (() => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20 text-muted-foreground font-mono text-sm">
          загрузка...
        </div>
      );
    }

    if (error || !data) {
      return (
        <div className="flex items-center justify-center py-20 text-destructive font-mono text-sm text-center px-4">
          Не удалось проверить доступ.<br />Возможно, ты не вошёл в аккаунт.
        </div>
      );
    }

    if (!data.unlocked) {
      return (
        <div className="max-w-md mx-auto w-full space-y-6 py-8 px-4">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-16 w-16 rounded-2xl bg-card border border-border flex items-center justify-center">
              <Lock className="h-7 w-7 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold">Секретное фото</h1>
            <p className="text-sm text-muted-foreground font-mono leading-relaxed">
              Доступ открывается только очень активным пользователям. Набери нужное количество в одной из категорий:
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
            <ProgressBar
              label="Рекомендации"
              current={data.progress.recommendations.current}
              needed={data.progress.recommendations.needed}
            />
            <ProgressBar
              label="Рецензии"
              current={data.progress.reviews.current}
              needed={data.progress.reviews.needed}
            />
            <ProgressBar
              label="Добавленные треки"
              current={data.progress.tracks.current}
              needed={data.progress.tracks.needed}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto w-full py-8 px-4 space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs">
          <Image className="h-4 w-4" />
          <span>СЕКРЕТНОЕ ФОТО</span>
        </div>
        <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-lg">
          <img
            src={data.photoUrl!}
            alt="Секретное фото"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    );
  })();

  return <AppLayout>{content}</AppLayout>;
}
