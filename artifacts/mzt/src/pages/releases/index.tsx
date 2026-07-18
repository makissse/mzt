import React, { useState, useMemo } from 'react';
import { useListReleases, useGetStats, getListReleasesQueryKey, getStoredAuthToken, Release } from '@workspace/api-client-react';
import { Link, useLocation } from 'wouter';
import { Plus, Search, X, Star, Music2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type AnyRelease = Release;

export default function ReleasesDashboard() {
  const { data: releases, isLoading } = useListReleases();
  const { data: stats } = useGetStats();
  const [query, setQuery] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleImportFromPlaylist = async () => {
    setIsImporting(true);
    const token = getStoredAuthToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["x-auth-token"] = token;
    try {
      const res = await fetch('/api/releases/from-playlist', {
        method: 'POST',
        headers,
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'Не удалось добавить трек');
        return;
      }
      queryClient.invalidateQueries({ queryKey: getListReleasesQueryKey() });
      setLocation(`/releases/${data.id}`);
    } catch {
      toast.error('Ошибка сети. Попробуйте ещё раз.');
    } finally {
      setIsImporting(false);
    }
  };

  const { ourTracks, regular } = useMemo(() => {
    if (!releases) return { ourTracks: [], regular: [] };
    const q = query.trim().toLowerCase();
    const all = q
      ? releases.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.artist.toLowerCase().includes(q),
        )
      : releases;
    const ourTracks = all.filter((r) => (r as any).isOurTrack);
    const regular = all.filter((r) => !(r as any).isOurTrack);
    return { ourTracks, regular };
  }, [releases, query]);

  const filtered = useMemo(() => {
    if (!releases) return [];
    const q = query.trim().toLowerCase();
    if (!q) return releases;
    return releases.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.artist.toLowerCase().includes(q),
    );
  }, [releases, query]);

  if (isLoading) {
    return (
      <div className="p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="aspect-square bg-card animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  const renderCard = (release: AnyRelease, i: number) => (
    <Link key={release.id} href={`/releases/${release.id}`}>
      <Card
        className="group relative aspect-square overflow-hidden rounded-xl border-0 bg-card cursor-pointer animate-in fade-in zoom-in-95 duration-500 fill-mode-both"
        style={{ animationDelay: `${i * 50}ms` }}
      >
        <img
          src={release.coverUrl}
          alt={`${release.title} — ${release.artist}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-40 opacity-90"
          loading="lazy"
        />

        {release.averageScore !== null && (
          <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md border border-primary/30 px-2 py-1 rounded-md font-mono text-primary font-bold z-10 text-sm">
            {release.averageScore}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="font-bold text-lg leading-tight line-clamp-1">{release.title}</h3>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider truncate">{release.artist}</p>
            <div className="mt-2 flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="bg-secondary px-1.5 py-0.5 rounded-md">{release.type === 'album' ? 'Альбом' : 'Сингл'}</span>
              <span>{release.reviewCount} рец.</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-4xl font-bold font-sans tracking-tight mb-2">Мясо 30</h1>
          <div className="flex gap-6 font-mono text-sm text-muted-foreground uppercase tracking-wider">
            <span>{stats?.totalReleases || 0} релизов</span>
            <span>{stats?.totalReviews || 0} рецензий</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            onClick={handleImportFromPlaylist}
            disabled={isImporting}
            className="font-mono w-full sm:w-auto rounded-full border-2 border-[hsl(218,92%,62%)] bg-transparent text-[hsl(200,90%,65%)] hover:bg-[hsl(218,92%,55%)] hover:text-white hover:border-transparent shadow-[0_0_16px_rgba(59,130,246,0.25)] hover:shadow-[0_0_24px_rgba(59,130,246,0.5)] transition-all duration-300"
          >
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Music2 className="mr-2 h-4 w-4" />
            )}
            Трек из плейлиста Санька
          </Button>
          <Link href="/releases/new">
            <Button className="font-mono bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Добавить релиз
            </Button>
          </Link>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по артисту или названию..."
          className="pl-9 pr-9 font-mono bg-card border-border focus-visible:ring-primary/40"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {filtered.length === 0 && query ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <Search className="h-10 w-10 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground font-mono text-sm">
            Ничего не найдено по запросу «{query}»
          </p>
          <button
            onClick={() => setQuery('')}
            className="text-xs font-mono text-primary hover:underline"
          >
            Сбросить поиск
          </button>
        </div>
      ) : !releases || releases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
          <div className="w-24 h-24 border border-dashed border-muted flex items-center justify-center rounded-full opacity-50">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-medium font-sans">Релизов пока нет</h3>
            <p className="text-muted-foreground font-mono text-sm max-w-sm">
              Коллекция пуста. Будь первым, кто добавит релиз.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* OUR TRACKS section */}
          {ourTracks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Star className="h-4 w-4 text-primary fill-primary" />
                <h2 className="font-mono text-xs uppercase tracking-widest text-primary">Наши треки</h2>
                <div className="flex-1 h-px bg-primary/20" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {ourTracks.map((release, i) => renderCard(release, i))}
              </div>
            </div>
          )}

          {/* REGULAR releases section */}
          {regular.length > 0 && (
            <div className="space-y-4">
              {ourTracks.length > 0 && (
                <div className="flex items-center gap-3">
                  <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Коллекция</h2>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {regular.map((release, i) => renderCard(release, ourTracks.length + i))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
