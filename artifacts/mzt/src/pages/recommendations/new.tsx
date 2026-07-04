import React, { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Music2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useCreateVideo, useFetchVideoMeta, useCreateMovie, useCreateMusic, getListVideosQueryKey, getListMoviesQueryKey, getListMusicQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

const videoSchema = z.object({
  url: z.string().url('Укажите корректную ссылку'),
  title: z.string().min(1, 'Укажите название'),
  description: z.string().optional(),
  thumbnailUrl: z.string().optional(),
});

const movieSchema = z.object({
  title: z.string().min(1, 'Укажите название'),
  description: z.string().optional(),
  genre: z.string().min(1, 'Укажите жанр'),
  rating: z.number().min(1).max(10),
});

const musicSchema = z.object({
  type: z.enum(['single', 'album']),
  title: z.string().min(1, 'Укажите название'),
  description: z.string().optional(),
});

type VideoValues = z.infer<typeof videoSchema>;
type MovieValues = z.infer<typeof movieSchema>;
type MusicValues = z.infer<typeof musicSchema>;


function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be');
  } catch {
    return false;
  }
}

export default function NewRecommendation() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'video' | 'movie' | 'music'>('video');

  const createVideo = useCreateVideo();
  const createMovie = useCreateMovie();
  const createMusic = useCreateMusic();
  const fetchVideoMeta = useFetchVideoMeta();

  const videoForm = useForm<VideoValues>({
    resolver: zodResolver(videoSchema),
    defaultValues: { url: '', title: '', description: '', thumbnailUrl: '' },
  });
  const movieForm = useForm<MovieValues>({
    resolver: zodResolver(movieSchema),
    defaultValues: { title: '', description: '', genre: '', rating: 5 },
  });
  const musicForm = useForm<MusicValues>({
    resolver: zodResolver(musicSchema),
    defaultValues: { type: 'single', title: '', description: '' },
  });

  const watchedVideoUrl = videoForm.watch('url');

  const maybeFetchMeta = async (url: string) => {
    if (!isYouTubeUrl(url)) return;
    fetchVideoMeta.mutate({ data: { url } }, {
      onSuccess: (meta) => {
        if (meta.title) videoForm.setValue('title', meta.title);
        if (meta.thumbnailUrl) videoForm.setValue('thumbnailUrl', meta.thumbnailUrl);
      },
    });
  };

  const videoPreview = useMemo(() => watchedVideoUrl && isYouTubeUrl(watchedVideoUrl), [watchedVideoUrl]);

  const onVideoSubmit = (data: VideoValues) => {
    createVideo.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListVideosQueryKey() });
        setLocation('/recommendations');
      },
    });
  };

  const onMovieSubmit = (data: MovieValues) => {
    createMovie.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMoviesQueryKey() });
        setLocation('/recommendations');
      },
    });
  };

  const onMusicSubmit = (data: MusicValues) => {
    createMusic.mutate({
      data: {
        type: data.type,
        artist: '',
        title: data.title,
        description: data.description,
        tracks: [],
      },
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMusicQueryKey() });
        setLocation('/recommendations');
      },
    });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <Button variant="ghost" className="pl-0 font-mono text-muted-foreground hover:text-violet-300" onClick={() => setLocation('/recommendations')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
        </Button>

        <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/80 via-background to-background p-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-violet-200">
            <Music2 className="h-3.5 w-3.5" /> Новая рекомендация
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Добавить рекомендацию</h1>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid w-full grid-cols-3 bg-card">
            <TabsTrigger value="video">Видео</TabsTrigger>
            <TabsTrigger value="movie">Фильм</TabsTrigger>
            <TabsTrigger value="music">Музыка</TabsTrigger>
          </TabsList>

          <TabsContent value="video" className="mt-6">
            <Form {...videoForm}>
              <form onSubmit={videoForm.handleSubmit(onVideoSubmit)} className="space-y-6 rounded-2xl border border-border bg-card p-6">
                <FormField control={videoForm.control} name="url" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Ссылка на видео</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.youtube.com/..." className="bg-background font-mono" {...field} onChange={(e) => { field.onChange(e); maybeFetchMeta(e.target.value); }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={videoForm.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Название</FormLabel>
                    <FormControl><Input placeholder="Название видео" className="bg-background" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={videoForm.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Описание (опционально)</FormLabel>
                    <FormControl><Textarea placeholder="Короткое описание..." className="bg-background resize-none" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {videoPreview && <Badge variant="outline" className="border-violet-500/30 text-violet-200">YouTube-ссылка распознана</Badge>}
                <Button type="submit" className="bg-violet-600 text-white hover:bg-violet-500" disabled={createVideo.isPending}>
                  {createVideo.isPending ? 'Сохраняю...' : 'Добавить видео'}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="movie" className="mt-6">
            <Form {...movieForm}>
              <form onSubmit={movieForm.handleSubmit(onMovieSubmit)} className="space-y-6 rounded-2xl border border-border bg-card p-6">
                <FormField control={movieForm.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Название фильма</FormLabel>
                    <FormControl><Input placeholder="Например, Дюна" className="bg-background" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={movieForm.control} name="genre" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Жанр</FormLabel>
                    <FormControl><Input placeholder="Например, Фантастика" className="bg-background" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={movieForm.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Описание (опционально)</FormLabel>
                    <FormControl><Textarea placeholder="Что стоит знать об этом фильме..." className="bg-background resize-none" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={movieForm.control} name="rating" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Оценка</FormLabel>
                      <span className="font-mono text-violet-200">{field.value}/10</span>
                    </div>
                    <FormControl>
                      <Slider min={1} max={10} step={1} value={[field.value]} onValueChange={(vals) => field.onChange(vals[0])} />
                    </FormControl>
                  </FormItem>
                )} />
                <Button type="submit" className="bg-violet-600 text-white hover:bg-violet-500" disabled={createMovie.isPending}>
                  {createMovie.isPending ? 'Сохраняю...' : 'Добавить фильм'}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="music" className="mt-6">
            <Form {...musicForm}>
              <form onSubmit={musicForm.handleSubmit(onMusicSubmit)} className="space-y-6 rounded-2xl border border-border bg-card p-6">
                <FormField control={musicForm.control} name="type" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Тип</FormLabel>
                    <FormControl>
                      <RadioGroup className="flex gap-6" onValueChange={field.onChange} defaultValue={field.value}>
                        <div className="flex items-center gap-2"><RadioGroupItem value="single" /><span className="font-mono">Сингл</span></div>
                        <div className="flex items-center gap-2"><RadioGroupItem value="album" /><span className="font-mono">Альбом</span></div>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={musicForm.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Название</FormLabel>
                    <FormControl><Input placeholder="Название релиза" className="bg-background" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={musicForm.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Описание (опционально)</FormLabel>
                    <FormControl><Textarea placeholder="Контекст рекомендации..." className="bg-background resize-none" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="bg-violet-600 text-white hover:bg-violet-500" disabled={createMusic.isPending}>
                  {createMusic.isPending ? 'Сохраняю...' : 'Добавить музыку'}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}