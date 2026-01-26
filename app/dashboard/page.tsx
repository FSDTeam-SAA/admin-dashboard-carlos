'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { DollarSign, Users, MapPin } from 'lucide-react';
import DashboardChart from '@/components/dashboard/chart';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      const response = await dashboardApi.getOverview();
      return response.data.data;
    },
  });

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${data?.totalRevenue || 0}`,
      icon: DollarSign,
      bgColor: 'bg-rose-100',
      color: 'text-rose-600',
    },
    {
      label: 'Total User',
      value: data?.totalUsers || 0,
      icon: Users,
      bgColor: 'bg-blue-100',
      color: 'text-blue-600',
    },
    {
      label: 'Total Field Owner',
      value: data?.totalFieldOwners || 0,
      icon: MapPin,
      bgColor: 'bg-green-100',
      color: 'text-green-600',
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Welcome back to your admin panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading
          ? Array(3)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-8 w-32" />
                </Card>
              ))
          : stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-slate-500 text-sm mb-1">{stat.label}</p>
                      <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </Card>
              );
            })}
      </div>

      {/* Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">User Joining Overview</h2>
        {isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <DashboardChart data={data?.joiningOverview || []} />
        )}
      </Card>
    </div>
  );
}
