'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Bell, User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Welcome back!</h2>
        <p className="text-slate-500 text-sm">Manage your fields and subscriptions</p>
      </div>

      <div className="flex items-center gap-6">
        <button
          type="button"
          aria-label="View notifications"
          onClick={() => router.push('/dashboard/notifications')}
          className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Bell className="w-6 h-6 text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">{session?.user?.name || 'User'}</p>
            <p className="text-xs text-slate-500">{session?.user?.email}</p>
          </div>
          <Avatar className="h-10 w-10">
            <AvatarImage src={session?.user?.image || "/placeholder.svg"} alt={session?.user?.name || 'User'} />
            <AvatarFallback>
              <User className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
