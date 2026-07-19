import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateRelease, getListReleasesQueryKey, ReleaseInputType } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, Plus, Trash2, ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { uploadFile } from '@/lib/upload';
import { toast } from 'sonner';

const trackSchema = z.object({
  title: z.string(),
  audioUrl: z.string(),
});

const formSchema = z.object({
  type: z.enum([ReleaseInputType.single, ReleaseInputType.album]),
  artist: z.string().min(1, "Укажите исполнителя"),
  title: z.string().min(1, "Укажите название релиза"),
  description: z.string().optional(),
  coverUrl: z.string().min(1, "Загрузите обложку"),
  audioUrl: z.string().optional(),
  isOurTrack: z.boolean().optional(),
  tracks: z.array(trackSchema).optional(),
}).superRefine((data, ctx) => {
  if (data.type === ReleaseInputType.album) {
    const tracks = data.tracks || [];
    tracks.forEach((track, i) => {
      if (!track.title || track.title.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите название трека",
          path: [`tracks`, i, 'title'],
        });
      }
      if (!track.audioUrl || track.audioUrl.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите аудио для трека",
          path: [`tracks`, i, 'audioUrl'],
        });
      }
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

export default function NewRelease() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createRelease = useCreateRelease();
  const [isUploading, setIsUploading] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: ReleaseInputType.single,
      artist: '',
      title: '',
      description: '',
      coverUrl: '',
      audioUrl: '',
      isOurTrack: false,
      tracks: [{ title: '', audioUrl: '' }]
    },
  });

  const { fields: trackFields, append: appendTrack, remove: removeTrack } = useFieldArray({
    control: form.control,
    name: "tracks",
  });

  const releaseType = form.watch('type');

  const handleFileUpload = async (file: File, onChange: (url: string) => void) => {
    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ошибка загрузки файла';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      audioUrl: data.type === 'single' ? data.audioUrl : undefined,
      tracks: data.type === 'album' ? data.tracks : undefined,
      isOurTrack: data.isOurTrack ?? false,
    };

    createRelease.mutate({ data: payload as any }, {
      onSuccess: (release) => {
        queryClient.invalidateQueries({ queryKey: getListReleasesQueryKey() });
        setLocation(`/releases/${release.id}`);
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-8 py-12 min-h-screen animate-in fade-in duration-500">
      <Button 
        variant="ghost" 
        className="mb-8 font-mono text-muted-foreground hover:text-primary pl-0"
        onClick={() => setLocation('/releases')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Назад к коллекции
      </Button>

      <h1 className="text-4xl font-bold font-sans tracking-tight mb-8">Добавить релиз</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          
          {/* FORMAT */}
          <div className="bg-card p-6 border border-border rounded-xl">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Формат релиза</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-6"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="single" />
                        </FormControl>
                        <FormLabel className="font-sans font-medium cursor-pointer">Сингл</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="album" />
                        </FormControl>
                        <FormLabel className="font-sans font-medium cursor-pointer">Альбом / EP</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* OUR TRACK checkbox */}
          <FormField
            control={form.control}
            name="isOurTrack"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 space-y-0 bg-card border border-border rounded-xl p-5">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                    id="is-our-track"
                    className="h-5 w-5 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                </FormControl>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary fill-primary" />
                  <FormLabel htmlFor="is-our-track" className="font-mono text-sm cursor-pointer select-none">
                    Наш трек — добавить в раздел наших релизов
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          {/* METADATA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="artist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Исполнитель</FormLabel>
                    <FormControl>
                      <Input placeholder="напр. MC. putzermann" className="font-sans text-lg bg-card rounded-lg h-12 border-border focus-visible:ring-primary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Название</FormLabel>
                    <FormControl>
                      <Input placeholder="напр. diss na cuckolda" className="font-sans text-lg bg-card rounded-lg h-12 border-border focus-visible:ring-primary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Описание (опционально)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Контекст, история, вдохновение..." 
                        className="font-sans resize-none h-32 bg-card rounded-lg border-border focus-visible:ring-primary" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="coverUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Обложка</FormLabel>
                    <FormControl>
                      <div className="relative group aspect-square bg-card border-2 border-dashed border-border hover:border-primary/50 transition-colors flex items-center justify-center overflow-hidden rounded-xl">
                        {field.value ? (
                          <>
                            <img src={field.value} alt="Превью обложки" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button type="button" variant="secondary" onClick={() => field.onChange('')} className="font-mono">
                                Удалить
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-6 flex flex-col items-center">
                            <Upload className="h-8 w-8 text-muted-foreground mb-4" />
                            <p className="font-mono text-sm text-muted-foreground mb-4">Загрузите квадратное изображение</p>
                            <Input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              id="cover-upload"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, field.onChange);
                              }}
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="font-mono text-xs"
                              disabled={isUploading}
                              onClick={() => document.getElementById('cover-upload')?.click()}
                            >
                              {isUploading ? 'Загрузка...' : 'Выбрать файл'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* AUDIO */}
          <div className="border-t border-border pt-10">
            <h3 className="font-mono text-lg mb-6 text-primary uppercase tracking-widest">Аудио</h3>
            
            {releaseType === 'single' ? (
              <FormField
                control={form.control}
                name="audioUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Аудиофайл</FormLabel>
                    <FormControl>
                      <div className="flex gap-4">
                        <Input 
                          placeholder="https://... или загрузите файл" 
                          className="font-mono bg-card rounded-lg h-12" 
                          {...field} 
                          value={field.value || ''}
                        />
                        <Input 
                          type="file" 
                          accept="audio/*" 
                          className="hidden" 
                          id="single-audio"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, field.onChange);
                          }}
                        />
                        <Button 
                          type="button" 
                          variant="secondary" 
                          className="h-12 px-8 font-mono rounded-lg"
                          disabled={isUploading}
                          onClick={() => document.getElementById('single-audio')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" /> {isUploading ? '...' : 'Загрузить'}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-4">
                {trackFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-start bg-card p-4 border border-border rounded-xl">
                    <div className="font-mono text-muted-foreground pt-3 w-6 text-right">
                      {index + 1}.
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <FormField
                        control={form.control}
                        name={`tracks.${index}.title`}
                        render={({ field: inputField }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Название трека" className="font-sans bg-background rounded-lg border-border" {...inputField} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`tracks.${index}.audioUrl`}
                        render={({ field: inputField }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input placeholder="URL аудио" className="font-mono text-sm bg-background rounded-lg border-border" {...inputField} />
                                <Input 
                                  type="file" 
                                  accept="audio/*" 
                                  className="hidden" 
                                  id={`track-audio-${index}`}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file, inputField.onChange);
                                  }}
                                />
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="icon"
                                  disabled={isUploading}
                                  onClick={() => document.getElementById(`track-audio-${index}`)?.click()}
                                >
                                  <Upload className="h-4 w-4" />
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive mt-1"
                      onClick={() => removeTrack(index)}
                      disabled={trackFields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-12 font-mono border-dashed border-2 hover:border-primary/50 hover:bg-transparent rounded-xl"
                  onClick={() => appendTrack({ title: '', audioUrl: '' })}
                >
                  <Plus className="h-4 w-4 mr-2" /> Добавить трек
                </Button>
              </div>
            )}
          </div>

          <div className="pt-8 border-t border-border flex justify-end">
            <Button 
              type="submit" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold text-lg h-14 px-12 rounded-xl transition-all"
              disabled={createRelease.isPending || isUploading}
            >
              {createRelease.isPending ? "Сохраняю..." : "Сохранить релиз"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
