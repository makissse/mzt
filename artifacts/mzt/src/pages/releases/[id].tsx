import React, { useMemo } from 'react';
import { useLocation, useParams } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  useGetRelease, 
  useCreateReview, 
  useDeleteReview, 
  useDeleteRelease,
  getGetReleaseQueryKey,
  useGetMe
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2, Disc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { calculateScore } from '@/lib/score';

const reviewSchema = z.object({
  rhymes: z.number().min(1).max(10),
  structure: z.number().min(1).max(10),
  styleExecution: z.number().min(1).max(10),
  individuality: z.number().min(1).max(10),
  atmosphere: z.number().min(1).max(10),
  comment: z.string().min(1, "Напишите рецензию"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

function ScoreDisplay({ score, label }: { score: number | null | undefined, label: string }) {
  if (score === null || score === undefined) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-xl">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">{label}</span>
        <span className="text-4xl font-bold font-mono text-muted-foreground mt-2">--</span>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-card border border-primary/20 rounded-xl shadow-[0_0_20px_rgba(66,133,244,0.12)]">
      <span className="font-mono text-xs text-primary uppercase tracking-widest">{label}</span>
      <span className="text-5xl font-bold font-mono text-primary mt-2">{score}</span>
    </div>
  );
}

function ReviewSlider({ 
  field, 
  label, 
  description 
}: { 
  field: any, 
  label: string, 
  description?: string 
}) {
  return (
    <FormItem className="space-y-3 bg-card/60 p-5 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <div>
          <FormLabel className="font-mono text-xs uppercase tracking-wider text-foreground/80">{label}</FormLabel>
          {description && <p className="text-xs font-mono text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <div className="text-2xl font-bold font-mono text-primary w-8 text-right tabular-nums">
          {field.value}
        </div>
      </div>
      <FormControl>
        <Slider
          min={1}
          max={10}
          step={1}
          value={[field.value]}
          onValueChange={(vals) => field.onChange(vals[0])}
          className="py-2"
        />
      </FormControl>
      <div className="flex justify-between font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
        <span>Слабо (1)</span>
        <span>Мастерски (10)</span>
      </div>
      <FormMessage />
    </FormItem>
  );
}

export default function ReleaseDetail() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const releaseId = Number(params.id);
  const queryClient = useQueryClient();
  
  const { data: user } = useGetMe();
  const { data: release, isLoading } = useGetRelease(releaseId, { query: { enabled: !!releaseId, queryKey: getGetReleaseQueryKey(releaseId) } });
  
  const createReview = useCreateReview();
  const deleteReview = useDeleteReview();
  const deleteRelease = useDeleteRelease();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rhymes: 5,
      structure: 5,
      styleExecution: 5,
      individuality: 5,
      atmosphere: 5,
      comment: '',
    },
  });

  const values = form.watch();
  const liveScore = useMemo(() => {
    return calculateScore(
      values.rhymes,
      values.structure,
      values.styleExecution,
      values.individuality,
      values.atmosphere
    );
  }, [values]);

  if (isLoading || !release) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Disc className="h-12 w-12 text-primary animate-spin" style={{ animationDuration: '3s' }} />
      </div>
    );
  }

  const isCreator = user?.id === release.createdBy.id;

  const handleDeleteRelease = () => {
    if (confirm("Удалить этот релиз? Это действие необратимо.")) {
      deleteRelease.mutate({ id: releaseId }, {
        onSuccess: () => setLocation('/releases')
      });
    }
  };

  const onSubmitReview = (data: ReviewFormValues) => {
    createReview.mutate({ releaseId, data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetReleaseQueryKey(releaseId) });
      }
    });
  };

  const handleDeleteReview = (reviewId: number) => {
    if (confirm("Удалить вашу рецензию?")) {
      deleteReview.mutate({ releaseId, id: reviewId }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetReleaseQueryKey(releaseId) });
        }
      });
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 h-[60vh] bg-gradient-to-b from-card to-background z-0" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-8 pt-12">
          <Button 
            variant="ghost" 
            className="mb-8 font-mono text-muted-foreground hover:text-primary pl-0"
            onClick={() => setLocation('/releases')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Коллекция
          </Button>

          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="w-full md:w-1/3 flex-shrink-0">
              <div className="aspect-square bg-card border border-border shadow-2xl relative overflow-hidden rounded-xl group">
                <img 
                  src={release.coverUrl} 
                  alt="Обложка" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <ScoreDisplay score={release.averageScore} label="Ср. оценка" />
                <ScoreDisplay score={release.reviewCount} label="Рецензии" />
              </div>
            </div>

            <div className="w-full md:w-2/3 space-y-6 pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-mono text-primary text-xl uppercase tracking-widest mb-2">{release.artist}</h2>
                  <h1 className="font-sans text-5xl md:text-6xl font-bold tracking-tighter leading-tight">{release.title}</h1>
                </div>
                {isCreator && (
                  <Button variant="ghost" size="icon" onClick={handleDeleteRelease} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3 font-mono text-sm text-muted-foreground">
                <span className="bg-secondary px-2 py-1 uppercase tracking-wider rounded-md">{release.type === 'album' ? 'Альбом' : 'Сингл'}</span>
                <span>Добавил {release.createdBy.username}</span>
              </div>

              {release.description && (
                <div className="prose prose-invert max-w-none pt-4">
                  <p className="text-lg leading-relaxed text-muted-foreground font-sans">
                    {release.description}
                  </p>
                </div>
              )}

              {/* Треки / Аудио */}
              <div className="pt-8">
                <h3 className="font-mono text-sm uppercase tracking-widest text-muted-foreground mb-4 border-b border-border pb-2">Аудио</h3>
                
                {release.type === 'single' && release.audioUrl && (
                  <div className="bg-card p-4 border border-border rounded-xl flex items-center justify-between">
                    <span className="font-sans font-medium">{release.title}</span>
                    <audio src={release.audioUrl} controls className="h-8 max-w-[200px]" />
                  </div>
                )}

                {release.type === 'album' && release.tracks && release.tracks.length > 0 && (
                  <div className="space-y-2">
                    {release.tracks.map((track, i) => (
                      <div key={track.id} className="bg-card p-3 border border-border rounded-xl flex items-center justify-between group hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-muted-foreground text-sm w-6 text-right">{i + 1}.</span>
                          <span className="font-sans font-medium">{track.title}</span>
                        </div>
                        {track.audioUrl && (
                          <audio src={track.audioUrl} controls className="h-8 max-w-[200px] opacity-50 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Раздел рецензий */}
      <div className="max-w-4xl mx-auto px-8 pt-24 border-t border-border mt-24">
        
        {release.userReview ? (
          <div className="mb-24">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold font-sans">Ваша рецензия</h2>
              <Button variant="outline" className="font-mono text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => handleDeleteReview(release.userReview!.id)}>
                <Trash2 className="h-4 w-4 mr-2" /> Отозвать
              </Button>
            </div>
            
            <div className="bg-card border border-primary/20 p-8 rounded-xl shadow-[0_0_30px_rgba(66,133,244,0.07)]">
              <div className="flex items-start gap-8">
                <div className="w-28 text-center flex-shrink-0">
                  <div className="text-6xl font-bold font-mono text-primary mb-1">{release.userReview.score}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">/90</div>
                </div>
                
                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { label: "Рифмы", val: release.userReview.rhymes },
                      { label: "Структура", val: release.userReview.structure },
                      { label: "Стиль", val: release.userReview.styleExecution },
                      { label: "Индивид.", val: release.userReview.individuality },
                      { label: "Атмос.", val: release.userReview.atmosphere }
                    ].map(m => (
                      <div key={m.label} className="text-center bg-background border border-border p-3 rounded-lg">
                        <div className="text-xl font-bold font-mono mb-1">{m.val}</div>
                        <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{m.label}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <p className="font-sans text-lg leading-relaxed">{release.userReview.comment}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-24">
            <h2 className="text-3xl font-bold font-sans mb-8">Написать рецензию</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="rhymes"
                      render={({ field }) => (
                        <ReviewSlider field={field} label="Рифмы / Образы" description="Сложность, глубина, игра слов" />
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="structure"
                      render={({ field }) => (
                        <ReviewSlider field={field} label="Структура / Ритмика" description="Аранжировка, темп, связность" />
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="styleExecution"
                      render={({ field }) => (
                        <ReviewSlider field={field} label="Реализация стиля" description="Подача, флоу, техническое мастерство" />
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="individuality"
                      render={({ field }) => (
                        <ReviewSlider field={field} label="Индивидуальность / Харизма" description="Оригинальность, уникальный голос" />
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="atmosphere"
                      render={({ field }) => (
                        <ReviewSlider field={field} label="Атмосфера / Вайб" description="Вайб, продакшн, погружение — множитель" />
                      )}
                    />
                  </div>
                  
                  <div className="space-y-6 flex flex-col">
                    <div className="bg-card border border-border p-8 rounded-xl flex flex-col items-center justify-center h-48">
                      <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">Подсчитанная оценка</div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-7xl font-bold font-mono text-primary tracking-tighter tabular-nums">
                          {liveScore}
                        </div>
                        <div className="font-mono text-sm text-muted-foreground">/90</div>
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="comment"
                      render={({ field }) => (
                        <FormItem className="flex-1 flex flex-col bg-card border border-border p-6 rounded-xl">
                          <FormLabel className="font-mono text-xs uppercase tracking-wider mb-4">Текст рецензии</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Обоснуй свою оценку..." 
                              className="font-sans resize-none flex-1 min-h-[200px] bg-transparent border-0 focus-visible:ring-0 p-0 text-lg placeholder:text-muted-foreground/30" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full h-16 bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold text-xl rounded-xl transition-all"
                      disabled={createReview.isPending}
                    >
                      {createReview.isPending ? "Отправляю..." : "Отправить рецензию"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        )}

        {/* Рецензии сообщества */}
        {release.reviews.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold font-sans mb-8">Рецензии пользователей</h2>
            <div className="space-y-6">
              {release.reviews.map(review => (
                <div key={review.id} className="bg-card border border-border p-6 rounded-xl flex items-start gap-6">
                  <div className="w-16 text-center flex-shrink-0">
                    <div className="text-3xl font-bold font-mono text-foreground mb-1">{review.score}</div>
                    <div className="font-mono text-[9px] text-muted-foreground">/90</div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-mono text-sm font-bold text-primary">{review.user.username}</div>
                      <div className="font-mono text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString('ru-RU')}</div>
                    </div>
                    <p className="font-sans text-muted-foreground leading-relaxed">{review.comment}</p>
                    <div className="mt-4 flex gap-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      <span>Р:{review.rhymes}</span>
                      <span>С:{review.structure}</span>
                      <span>Е:{review.styleExecution}</span>
                      <span>И:{review.individuality}</span>
                      <span>А:{review.atmosphere}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
