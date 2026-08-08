import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customFetch } from '@workspace/api-client-react';
import { useGetMe } from '@workspace/api-client-react';
import { Redirect } from 'wouter';
import { Trash2, ShieldCheck, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type AdminUser = {
  id: number;
  username: string;
  isAdmin: boolean;
  createdAt: string;
};

export default function AdminUsersPage() {
  const { data: me } = useGetMe();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);

  const { data: users, isLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => customFetch<AdminUser[]>('/api/admin/users'),
    enabled: !!me?.isAdmin,
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: number) =>
      customFetch(`/api/admin/users/${userId}`, { method: 'DELETE' }),
    onSuccess: (_data, userId) => {
      queryClient.setQueryData<AdminUser[]>(['admin', 'users'], (prev) =>
        prev ? prev.filter((u) => u.id !== userId) : prev
      );
      toast.success(`Пользователь удалён`);
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Ошибка удаления');
    },
  });

  if (!me) return null;
  if (!me.isAdmin) return <Redirect to="/releases" />;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-mono font-bold mb-6 text-foreground">Пользователи</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-card animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {users?.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-card border border-border"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  {user.isAdmin ? (
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  ) : (
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold text-foreground truncate">
                    {user.username}
                    {user.id === me.id && (
                      <span className="ml-2 text-[10px] font-normal text-muted-foreground">(вы)</span>
                    )}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    #{user.id} · {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    {user.isAdmin && <span className="ml-1 text-primary">· admin</span>}
                  </p>
                </div>
              </div>

              {user.id !== me.id && (
                <button
                  onClick={() => setConfirmDelete(user)}
                  disabled={deleteMutation.isPending}
                  className="flex-shrink-0 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Удалить пользователя"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
            <AlertDialogDescription>
              Пользователь <strong>{confirmDelete?.username}</strong> и все его данные будут удалены безвозвратно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDelete) {
                  deleteMutation.mutate(confirmDelete.id);
                  setConfirmDelete(null);
                }
              }}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
