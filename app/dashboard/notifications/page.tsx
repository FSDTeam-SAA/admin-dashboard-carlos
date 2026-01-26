'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { notificationApi, NotificationItem } from '@/lib/api';
import { Bell, CheckCircle2, Clock3 } from 'lucide-react';
import { toast } from 'sonner';

const normalizeNotifications = (payload: any): NotificationItem[] => {
  const list = Array.isArray(payload) ? payload : payload?.notifications;
  if (!Array.isArray(list)) return [];

  return list.map((item: any, index: number) => ({
    _id: item?._id ?? item?.id ?? `notification-${index}`,
    title: item?.title ?? item?.heading ?? 'Notification',
    message: item?.message ?? item?.body ?? 'No message provided.',
    type: item?.type ?? item?.category,
    isRead: Boolean(item?.isRead ?? item?.read),
    createdAt: item?.createdAt ?? item?.timestamp ?? new Date().toISOString(),
  }));
};

const formatTimestamp = (value: string) => {
  if (!value) return 'Date unavailable';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Date unavailable' : parsed.toLocaleString();
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
  } = useQuery<NotificationItem[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await notificationApi.getAll();
      return normalizeNotifications(response.data.data);
    },
  });

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationApi.markAsRead(notificationId),
    onSuccess: () => {
      toast.success('Notification marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message ?? 'Failed to update notification';
      toast.error(message);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message ?? 'Failed to update notifications';
      toast.error(message);
    },
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500">
            Stay on top of updates and activity across the platform
          </p>
        </div>

        <Button
          variant="outline"
          disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
          onClick={() => markAllAsReadMutation.mutate()}
          className="font-medium"
        >
          {markAllAsReadMutation.isPending ? 'Marking...' : 'Mark all as read'}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-5">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Empty className="border border-dashed border-slate-200 bg-white">
          <EmptyMedia variant="icon">
            <Bell className="h-6 w-6" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No notifications yet</EmptyTitle>
            <EmptyDescription>
              You&apos;ll see important updates, bookings, and alerts right here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification._id}
              className={`p-5 ${
                notification.isRead ? 'border-slate-200' : 'border-teal-200 bg-teal-50/60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      notification.isRead
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-teal-100 text-teal-700'
                    }`}
                  >
                    {notification.isRead ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Bell className="h-5 w-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock3 className="h-4 w-4" />
                      <span>{formatTimestamp(notification.createdAt)}</span>
                      {notification.type ? (
                        <span className="px-2 py-1 rounded-full bg-white text-teal-700 border border-teal-200">
                          {notification.type}
                        </span>
                      ) : null}
                    </div>

                    <p className="font-semibold text-slate-900">
                      {notification.title || 'Notification'}
                    </p>
                    <p className="text-sm text-slate-600 whitespace-pre-line">
                      {notification.message || 'No message provided.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge variant={notification.isRead ? 'secondary' : 'default'}>
                    {notification.isRead ? 'Read' : 'Unread'}
                  </Badge>

                  {!notification.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsReadMutation.mutate(notification._id)}
                      disabled={
                        markAsReadMutation.isPending &&
                        markAsReadMutation.variables === notification._id
                      }
                    >
                      {markAsReadMutation.isPending &&
                      markAsReadMutation.variables === notification._id
                        ? 'Updating...'
                        : 'Mark as read'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
