import React from 'react';
import { useLocation, useParams } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2, Music2 } from 'lucide-react';
import { useGetMe, useGetMusic, useDeleteMusic, getGetMusicQueryKey } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be');
  } catch {
    return false;
  }
}

function isAudioFileUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('/api/uploads/')) return true;
  try {
    const u = new URL(url);
    return /\.(mp3|mp4|m4a|ogg|wav|flac|aac|webm|weba)(\?.*)?$/.test(u.pathname.toLowerCase());
  } catch {
    return false;
  }
}

function AudioLink({ url, label }: { url: string; label: string }) {
  if (isYouTubeUrl(url)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-mono text-sm text-white transition-colors hover:bg-red-500">
        <Music2 className="h-4 w-4" /> {label}
      </a>
    );
  }
  if (!isAudioFileUrl(url)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 font-mono text-sm text-secondary-foreground transition-colors hover:bg-secondary/80">
        <Music2 className="h-4 w-4" /> {label}
      </a>
    );
  }
  return <audio src={url} controls className="w-full" />;
}

export default function RecommendationMusicDetail() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = Number(params.id);
  const { data: user } = useGetMe();
  const { data: music, isLoading } = useGetMusic(id, { query: { enabled: !!id, queryKey: getGetMusicQueryKey(id) } });
  const deleteMusic = useDeleteMusic();

  if (isLoading || !music) {
    return <div className="min-h-screen" />;
  }

  const isCreator = user?.id === music.createdBy.id;

  const handleDelete = () => {
    if (confirm('Удалить эту рекомендацию?')) {
      deleteMusic.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMusicQueryKey(id) });
          setLocation('/recommendations');
        },
      });
    }
  };

  return (
    <div className="min-h-screen p-8 pb-24">
      <div className="mx-auto max-w-5xl space-y-6">
        <Button variant="ghost" className="pl-0 font-mono text-muted-foreground hover:text-violet-300" onClick={() => setLocation('/recommendations')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
        </Button>

        <Card className="overflow-hidden rounded-3xl border border-violet-500/20 bg-card">
          <div className="grid gap-0 md:grid-cols-[360px,1fr]">
            <div className="bg-gradient-to-br from-violet-950/80 via-background to-background">
              {music.coverUrl ? (
                <img src={music.coverUrl} alt={`${music.artist} — ${music.title}`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex aspect-square items-center justify-center">
                  <Music2 className="h-16 w-16 text-violet-300" />
                </div>
              )}
            </div>
            <div className="p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-200">{music.artist}</p>
                  <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">{music.title}</h1>
                </div>
                <Badge className="bg-violet-600 text-white hover:bg-violet-600">
                  {music.type === 'album' ? 'Альбом' : 'Сингл'}
                </Badge>
              </div>
              {music.description && <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">{music.description}</p>}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Добавил</span>
                <span className="font-mono text-sm text-white">{music.createdBy.username}</span>
                {isCreator && (
                  <Button variant="outline" className="ml-auto text-destructive hover:text-destructive" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" /> Удалить
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {music.type === 'single' ? (
            music.tracks && music.tracks.length > 0 ? (
              <Card className="rounded-2xl border border-border bg-card p-6">
                <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-violet-200">Аудио</h2>
                <AudioLink url={music.tracks[0].audioUrl} label="Открыть аудио" />
              </Card>
            ) : (
              <Card className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                Аудио не указано.
              </Card>
            )
          ) : (
            <div className="space-y-4">
              {music.tracks?.map((track) => (
                <Card key={track.id} className="rounded-2xl border border-border bg-card p-6">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="font-mono text-sm text-violet-200">{track.order}. {track.title}</div>
                  </div>
                  <AudioLink url={track.audioUrl} label="Открыть аудио" />
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}