'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LayoutGrid, Users, Layers, Settings, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';

const menuItems = [
  { icon: LayoutGrid, label: 'Overview', href: '/dashboard' },
  { icon: Users, label: 'Field Owner Lists', href: '/dashboard/field-owners' },
  { icon: Layers, label: 'Subscription', href: '/dashboard/plans' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    // Updated background to a deeper teal to match the image (#00897B approx)
    <div className="w-64 min-h-screen bg-[#008774] text-white flex flex-col">
      {/* Logo Section - Centered and padded */}
      <div className="pt-10 pb-10 flex justify-center">
        <Image 
          src="/logo.png" 
          alt="Logo" 
          width={40} 
          height={40} 
          className="opacity-90"
        />
      </div>

      <nav className="flex-1 flex flex-col">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Check if active (matching the image logic)
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 px-6 py-4 transition-colors relative',
                isActive 
                  ? 'bg-white text-[#008774]' // White background, teal text
                  : 'text-white hover:bg-teal-600/30'
              )}
            >
              {/* Optional: Blue indicator bar on the left if needed */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400" />
              )}
              <Icon className={cn("w-6 h-6", isActive ? "text-[#008774]" : "text-white")} />
              <span className="text-lg font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout - Positioned at the very bottom */}
      <div className="pb-8">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="flex items-center gap-4 w-full px-8 py-4 text-white hover:bg-teal-600/30 transition-colors"
            >
              <LogOut className="w-6 h-6" />
              <span className="text-lg font-medium">Logout</span>
            </button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Logout confirmation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to logout?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="outline">No</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="bg-[#008774] hover:bg-[#006d5e]"
                >
                  Yes
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}