import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  useListVideos,
  useListMovies,
  useListMusic,
  useGetMe,
  useDeleteVideo,
  useDeleteMovie,
  useDeleteMusic,
  getListVideosQueryKey,
  getListMoviesQueryKey,
  getListMusicQueryKey,
  getStoredAuthToken,
  type Video,
  type Movie,
  type RecommendationMusic,
} from "@workspace/api-client-react";
import {
  Plus,
  ExternalLink,
  PlayCircle,
  Film,
  Music2,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";

type VideoWithVotes = Video & { voteCount: number; userVote: number };

function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return (
      u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")
    );
  } catch {
    return false;
  }
}

function VideoThumbnail({
  url,
  title,
}: {
  url?: string | null;
  title: string;
}) {
  if (url) {
    return (
      <img
        src={url}
        alt={title}
        className="h-44 w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
    );
  }
  return (
    <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-background">
      <PlayCircle className="h-10 w-10 text-violet-300" />
    </div>
  );
}

function SectionHeading({
  title,
  icon: Icon,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-violet-200">
          <Icon className="h-3.5 w-3.5" />
          ADHD
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white">
          {title}
        </h2>
      </div>
    </div>
  );
}

function DeleteButton({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-red-400 opacity-0 transition-opacity hover:bg-black/80 hover:text-red-300 group-hover:opacity-100"
      title="Удалить"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

function VoteButtons({
  videoId,
  voteCount,
  userVote,
  onVote,
  isLoggedIn,
}: {
  videoId: number;
  voteCount: number;
  userVote: number;
  onVote: (id: number, vote: 1 | -1 | 0) => void;
  isLoggedIn: boolean;
}) {
  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) return;
    onVote(videoId, userVote === 1 ? 0 : 1);
  };

  const handleDownvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) return;
    onVote(videoId, userVote === -1 ? 0 : -1);
  };

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
      <button
        onClick={handleUpvote}
        disabled={!isLoggedIn}
        className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
          userVote === 1
            ? "text-orange-400"
            : "text-muted-foreground hover:text-orange-400"
        } disabled:opacity-40 disabled:cursor-default`}
        title="Наверх"
      >
        <ChevronUp className="h-5 w-5" />
      </button>
      <span
        className={`min-w-[1.5rem] text-center font-mono text-sm font-bold tabular-nums ${
          userVote === 1
            ? "text-orange-400"
            : userVote === -1
            ? "text-blue-400"
            : "text-muted-foreground"
        }`}
      >
        {voteCount}
      </span>
      <button
        onClick={handleDownvote}
        disabled={!isLoggedIn}
        className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
          userVote === -1
            ? "text-blue-400"
            : "text-muted-foreground hover:text-blue-400"
        } disabled:opacity-40 disabled:cursor-default`}
        title="Вниз"
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function RecommendationsDashboard() {
  const { data: rawVideos, isLoading: videosLoading } = useListVideos();
  const { data: movies, isLoading: moviesLoading } = useListMovies();
  const { data: music, isLoading: musicLoading } = useListMusic();
  const { data: currentUser } = useGetMe();
  const queryClient = useQueryClient();

  // Local vote state: map of videoId -> { voteCount, userVote }
  const [voteOverrides, setVoteOverrides] = useState<
    Map<number, { voteCount: number; userVote: number }>
  >(new Map());

  const videos = rawVideos as VideoWithVotes[] | undefined;

  const deleteVideo = useDeleteVideo();
  const deleteMovie = useDeleteMovie();
  const deleteMusic = useDeleteMusic();

  const loading = videosLoading || moviesLoading || musicLoading;

  const getVote = (v: VideoWithVotes) => {
    const override = voteOverrides.get(v.id);
    return override ?? { voteCount: v.voteCount ?? 0, userVote: v.userVote ?? 0 };
  };

  const handleVote = async (videoId: number, vote: 1 | -1 | 0) => {
    // Include x-auth-token so voting works when cookies are blocked (Replit iframe preview).
    const token = getStoredAuthToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["x-auth-token"] = token;

    try {
      const res = await fetch(`/api/recommendations/videos/${videoId}/vote`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ vote }),
      });
      if (res.ok) {
        const data = await res.json();
        setVoteOverrides((prev) => {
          const next = new Map(prev);
          next.set(videoId, { voteCount: data.voteCount, userVote: data.userVote });
          return next;
        });
      }
    } catch {
      // silently fail — vote state stays unchanged
    }
  };

  const handleDeleteVideo = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    const key = getListVideosQueryKey();
    await queryClient.cancelQueries({ queryKey: key });
    const snapshot = queryClient.getQueryData<Video[]>(key);
    queryClient.setQueryData<Video[]>(key, (old) =>
      old?.filter((v) => v.id !== id),
    );
    deleteVideo.mutate(
      { id },
      {
        onError: () => queryClient.setQueryData(key, snapshot),
        onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
      },
    );
  };

  const handleDeleteMovie = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    const key = getListMoviesQueryKey();
    await queryClient.cancelQueries({ queryKey: key });
    const snapshot = queryClient.getQueryData<Movie[]>(key);
    queryClient.setQueryData<Movie[]>(key, (old) =>
      old?.filter((m) => m.id !== id),
    );
    deleteMovie.mutate(
      { id },
      {
        onError: () => queryClient.setQueryData(key, snapshot),
        onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
      },
    );
  };

  const handleDeleteMusic = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    const key = getListMusicQueryKey();
    await queryClient.cancelQueries({ queryKey: key });
    const snapshot = queryClient.getQueryData<RecommendationMusic[]>(key);
    queryClient.setQueryData<RecommendationMusic[]>(key, (old) =>
      old?.filter((m) => m.id !== id),
    );
    deleteMusic.mutate(
      { id },
      {
        onError: () => queryClient.setQueryData(key, snapshot),
        onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
      },
    );
  };

  // Sort videos by current vote count (descending), breaking ties by createdAt
  const sortedVideos = videos
    ? [...videos].sort((a, b) => {
        const va = getVote(a).voteCount;
        const vb = getVote(b).voteCount;
        return vb - va || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
    : [];

  return (
    <div className="min-h-screen p-8 pb-24">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/80 via-background to-background p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_35%)]" />
          <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight text-white">
                Рекомендации
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Interzise: „The Sopranos", „Game of Thrones" și filme cu spire.
              </p>
            </div>
            <Link href="/recommendations/new" className="shrink-0 self-start">
              <Button className="font-mono bg-violet-600 text-white hover:bg-violet-500 w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Добавить рекомендацию
              </Button>
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="space-y-8">
            {[...Array(3)].map((_, sectionIndex) => (
              <div key={sectionIndex} className="space-y-4">
                <div className="h-8 w-40 animate-pulse rounded-full bg-card" />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {[...Array(3)].map((__, i) => (
                    <div
                      key={i}
                      className="h-72 animate-pulse rounded-2xl bg-card"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-14">
            {/* VIDEOS */}
            <section className="space-y-5">
              <SectionHeading title="Видео" icon={PlayCircle} />
              {sortedVideos.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-violet-500/20 bg-card/50 p-10 text-center text-sm text-muted-foreground">
                  Видео пока нет. Добавьте первую подборку.
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {sortedVideos.map((video) => {
                    const { voteCount, userVote } = getVote(video);
                    return (
                      <a
                        key={video.id}
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-violet-500/40"
                      >
                        {currentUser && (
                          <DeleteButton
                            onClick={(e) => handleDeleteVideo(e, video.id)}
                          />
                        )}
                        <VideoThumbnail
                          url={video.thumbnailUrl}
                          title={video.title}
                        />
                        <div className="space-y-3 p-5">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="line-clamp-2 text-lg font-semibold text-white">
                              {video.title}
                            </h3>
                            <Badge
                              variant="outline"
                              className="border-violet-500/30 text-violet-200 shrink-0"
                            >
                              Видео
                            </Badge>
                          </div>
                          {video.description && (
                            <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                              {video.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between gap-2">
                            <VoteButtons
                              videoId={video.id}
                              voteCount={voteCount}
                              userVote={userVote}
                              onVote={handleVote}
                              isLoggedIn={!!currentUser}
                            />
                            <div className="flex items-center gap-2 font-mono text-xs text-violet-200">
                              <ExternalLink className="h-3.5 w-3.5" />
                              Открыть
                            </div>
                          </div>
                          {video.createdBy && (
                            <span className="font-mono text-[10px] text-muted-foreground">
                              Добавил: {video.createdBy.username}
                            </span>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </section>

            {/* MOVIES */}
            <section className="space-y-5">
              <SectionHeading title="Фильмы" icon={Film} />
              {!movies || movies.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-violet-500/20 bg-card/50 p-10 text-center text-sm text-muted-foreground">
                  Фильмы пока не добавлены. Будьте первым.
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {movies.map((movie) => (
                    <Card
                      key={movie.id}
                      className="group relative rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-violet-500/40"
                    >
                      {currentUser && (
                        <DeleteButton
                          onClick={(e) => handleDeleteMovie(e, movie.id)}
                        />
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {movie.title}
                        </h3>
                        <Badge className="bg-violet-600 text-white hover:bg-violet-600">
                          {movie.rating}/10
                        </Badge>
                      </div>
                      {movie.genre && (
                        <p className="mt-2 font-mono text-xs uppercase tracking-wider text-violet-300">
                          {movie.genre}
                        </p>
                      )}
                      {movie.description ? (
                        <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground">
                          {movie.description}
                        </p>
                      ) : (
                        <p className="mt-3 text-sm text-muted-foreground">
                          Описание отсутствует.
                        </p>
                      )}
                      {movie.createdBy && (
                        <p className="mt-3 font-mono text-[10px] text-muted-foreground">
                          Добавил: {movie.createdBy.username}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* MUSIC */}
            <section className="space-y-5">
              <SectionHeading title="Музыка" icon={Music2} />
              {!music || music.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-violet-500/20 bg-card/50 p-10 text-center text-sm text-muted-foreground">
                  Музыкальных рекомендаций пока нет.
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {music.map((item) => (
                    <Link
                      key={item.id}
                      href={`/recommendations/music/${item.id}`}
                    >
                      <Card className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-violet-500/40">
                        {currentUser && (
                          <DeleteButton
                            onClick={(e) => handleDeleteMusic(e, item.id)}
                          />
                        )}
                        {item.coverUrl ? (
                          <img
                            src={item.coverUrl}
                            alt={`${item.artist} — ${item.title}`}
                            className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-56 w-full items-center justify-center bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-background">
                            <Music2 className="h-12 w-12 text-violet-300" />
                          </div>
                        )}
                        <div className="space-y-3 p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-mono text-xs uppercase tracking-[0.2em] text-violet-200">
                                {item.artist}
                              </p>
                              <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-white">
                                {item.title}
                              </h3>
                            </div>
                            <Badge
                              variant="outline"
                              className="border-violet-500/30 text-violet-200"
                            >
                              {item.type === "album" ? "Альбом" : "Сингл"}
                            </Badge>
                          </div>
                          {item.description && (
                            <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                          {item.createdBy && (
                            <p className="font-mono text-[10px] text-muted-foreground">
                              Добавил: {item.createdBy.username}
                            </p>
                          )}
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
