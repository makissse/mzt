import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useListBlogs, useCreateMyBlog, getListBlogsQueryKey } from '@workspace/api-client-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { uploadFile } from '@/lib/upload';
import { blogAvatarFallback, formatOwnerUsername } from '@/lib/blog-display';
import { useQueryClient } from '@tanstack/react-query';
import { ImageCropper } from '@/components/image-cropper';
import { useImageCropper } from '@/lib/use-image-cropper';
import { Plus, Loader2, Sparkles, Image as ImageIcon, X, PenLine, ArrowRight } from 'lucide-react';
import type { Blog } from '@workspace/api-client-react';

function BlogAvatar({ blog }: { blog: Blog }) {
  const initial = blogAvatarFallback(blog.handle, blog.user.username);
  return (
    <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-background shadow-lg">
      <AvatarImage src={blog.avatarUrl ?? undefined} alt={blog.user.username} />
      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold text-lg sm:text-xl">
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}

function CreateBlogDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [handle, setHandle] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const create = useCreateMyBlog();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { cropperProps: createCropper, openCropper: openCreateCropper } = useImageCropper();

  const handleFile = async (file: File, type: 'avatar' | 'cover') => {
    if (type === 'avatar') {
      openCreateCropper(file, {
        aspect: 1,
        title: 'Обрезать аватар',
        circularPreview: true,
        onCropped: async (cropped) => {
          setUploading(true);
          try {
            const url = await uploadFile(cropped);
            setAvatarUrl(url);
          } catch (e) {
            alert(e instanceof Error ? e.message : 'Ошибка загрузки');
          } finally {
            setUploading(false);
          }
        },
      });
    } else {
      openCreateCropper(file, {
        aspect: 2,
        title: 'Обрезать обложку',
        onCropped: async (cropped) => {
          setUploading(true);
          try {
            const url = await uploadFile(cropped);
            setCoverUrl(url);
          } catch (e) {
            alert(e instanceof Error ? e.message : 'Ошибка загрузки');
          } finally {
            setUploading(false);
          }
        },
      });
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const blog = await create.mutateAsync({
        data: {
          title: title.trim(),
          description: description.trim(),
          handle: handle.trim() || undefined,
          avatarUrl: avatarUrl || undefined,
          coverUrl: coverUrl || undefined,
        },
      });
      await queryClient.invalidateQueries({ queryKey: getListBlogsQueryKey() });
      onClose();
      setLocation(`/blogs/${blog.handle}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка создания блога');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg border border-border/60 bg-card/95 backdrop-blur">
        <DialogHeader>
          <DialogTitle className="font-sans text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Создать блог
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Input
            placeholder="Название блога"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background/50 border-border/60 font-sans"
          />
          <Textarea
            placeholder="Описание — чему посвящён блог?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="bg-background/50 border-border/60 font-sans resize-none"
          />
          <Input
            placeholder="Адрес (латиницей, например: myblog) — не обязательно"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className="bg-background/50 border-border/60 font-sans"
          />

          <div className="flex gap-3">
            <label className="flex-1 cursor-pointer rounded-xl border border-border/60 bg-background/50 p-4 text-center hover:border-primary/50 transition-colors">
              {coverUrl ? (
                <div className="relative">
                  <img src={coverUrl} alt="" className="w-full aspect-[2/1] object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setCoverUrl(''); }}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-xs font-sans">Обложка</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f, 'cover'); e.target.value = ''; }}
              />
            </label>
            <label className="flex-1 cursor-pointer rounded-xl border border-border/60 bg-background/50 p-4 text-center hover:border-primary/50 transition-colors">
              {avatarUrl ? (
                <div className="relative">
                  <img src={avatarUrl} alt="" className="w-16 h-16 mx-auto object-cover rounded-full" />
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setAvatarUrl(''); }}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-xs font-sans">Аватар</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f, 'avatar'); e.target.value = ''; }}
              />
            </label>
          </div>

          {uploading && (
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-sans">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Загрузка...
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="font-sans">
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || uploading || !title.trim()}
              className="font-sans gap-1.5 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Создать
            </Button>
          </div>
        </div>
      </DialogContent>
      <ImageCropper {...createCropper} />
    </Dialog>
  );
}

export default function BlogsListPage() {
  const [, setLocation] = useLocation();
  const { data: blogs, isLoading, error } = useListBlogs();
  const [createOpen, setCreateOpen] = useState(false);

  const myBlog = blogs?.find((b) => b.isOwner);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-muted-foreground font-sans">
        <Loader2 className="h-6 w-6 mr-2 animate-spin" />
        загрузка блогов...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32 text-destructive font-sans text-sm text-center px-4">
        Не удалось загрузить блоги.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full py-8 px-4 sm:px-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-sans">
            Блоги
          </h1>
          <p className="text-muted-foreground font-sans mt-1 text-sm sm:text-base">
            Каналы, которые ведут пользователи МЗТ
          </p>
        </div>
        {myBlog ? (
            <Button
              onClick={() => setLocation(`/blogs/${myBlog.handle}`)}
              className="font-sans gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 animate-pulse-glow"
            >
              <PenLine className="h-4 w-4" />
              Мой блог
            </Button>
          ) : (
            <Button
              onClick={() => setCreateOpen(true)}
              className="font-sans gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 animate-wiggle hover:animate-none animate-wiggle-hover text-base px-6 py-5 h-auto"
            >
              <Plus className="h-5 w-5" />
              Добавить блог
            </Button>
          )}
      </div>

      {!blogs || blogs.length === 0 ? (
        <div className="text-center py-24 rounded-3xl border border-dashed border-border/60 bg-card/30">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground font-sans text-lg mb-2">Пока нет ни одного блога</p>
          {!myBlog && (
            <Button onClick={() => setCreateOpen(true)} variant="outline" className="font-sans gap-2">
              <Plus className="h-4 w-4" />
              Создать первый блог
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              onClick={() => setLocation(`/blogs/${blog.handle}`)}
              className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card hover:border-primary/40 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
            >
              <div className="h-36 sm:h-44 bg-gradient-to-br from-muted to-background relative overflow-hidden">
                {blog.coverUrl ? (
                  <img src={blog.coverUrl} alt="" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
              </div>
              <div className="relative px-5 pb-5 -mt-10">
                <div className="flex items-end gap-4 mb-3">
                  <BlogAvatar blog={blog} />
                  <div className="flex-1 min-w-0 pb-1">
                    <h3 className="font-sans text-lg font-bold truncate group-hover:text-primary transition-colors">
                      {blog.title || blog.user.username}
                    </h3>
                    <p className="text-muted-foreground font-sans text-sm">
                      {formatOwnerUsername(blog.handle, (blog as any).ownerUsername)}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground font-sans text-sm line-clamp-2 mb-4 min-h-[2.5rem]">
                  {blog.description || 'Блог без описания'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm font-sans text-muted-foreground">
                    {blog.isOwner && (
                      <span className="text-primary text-xs font-semibold">твой блог</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-primary font-sans text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Открыть
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateBlogDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
