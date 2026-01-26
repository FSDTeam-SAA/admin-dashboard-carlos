'use client';

import React from "react"

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planApi, Plan } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface PlanFormData {
  name: string;
  price: number;
  description: string;
  billingCycle: 'monthly' | 'yearly';
  benefits: string;
}

export default function PlansPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    price: 0,
    description: '',
    billingCycle: 'monthly',
    benefits: '',
  });

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await planApi.getAllPlans();
      return response.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Plan, '_id'>) => planApi.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan created successfully!');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create plan');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Plan> }) =>
      planApi.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan updated successfully!');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update plan');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => planApi.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete plan');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      description: '',
      billingCycle: 'monthly',
      benefits: '',
    });
    setEditingId(null);
    setIsOpen(false);
  };

  const handleEdit = (plan: Plan) => {
    setFormData({
      name: plan.name,
      price: plan.price,
      description: plan.description,
      billingCycle: plan.billingCycle,
      benefits: plan.benefits.join('\n'),
    });
    setEditingId(plan._id);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const benefitsArray = formData.benefits
      .split('\n')
      .map((b) => b.trim())
      .filter((b) => b);

    const payload = {
      name: formData.name,
      price: formData.price,
      description: formData.description,
      billingCycle: formData.billingCycle,
      benefits: benefitsArray,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Plans Management</h1>
          <p className="text-slate-500">Create and manage subscription plans</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsOpen(true);
          }}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Plan
        </Button>
      </div>

      {isOpen && (
        <Card className="p-6 bg-white shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            {editingId ? 'Edit Plan' : 'Create New Plan'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Plan Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Basic Plan"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price ($)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  placeholder="9.99"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the plan"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Billing Cycle
              </label>
              <select
                value={formData.billingCycle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    billingCycle: e.target.value as 'monthly' | 'yearly',
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Benefits (one per line)
              </label>
              <textarea
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                placeholder="Unlimited chats&#10;Priority support&#10;Custom themes"
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingId
                    ? 'Update Plan'
                    : 'Create Plan'}
              </Button>
              <Button
                type="button"
                onClick={resetForm}
                className="bg-slate-200 hover:bg-slate-300 text-slate-900"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array(3)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-8 w-32 mb-4" />
                  <Skeleton className="h-6 w-16 mb-4" />
                  <div className="space-y-2 mb-4">
                    {Array(3)
                      .fill(0)
                      .map((_, j) => (
                        <Skeleton key={j} className="h-4 w-full" />
                      ))}
                  </div>
                  <Skeleton className="h-10 w-full" />
                </Card>
              ))
          : (plans || []).map((plan) => (
              <Card key={plan._id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-sm text-slate-500">
                      {plan.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this plan?')) {
                          deleteMutation.mutate(plan._id);
                        }
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
                </div>

                <p className="text-sm text-slate-600 mb-4">{plan.description}</p>

                <ul className="space-y-2">
                  {plan.benefits.map((benefit, index) => (
                    <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-teal-600 font-bold mt-0.5">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
      </div>

      {!isLoading && plans?.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-slate-600 mb-4">No plans found. Create your first plan to get started.</p>
          <Button
            onClick={() => {
              resetForm();
              setIsOpen(true);
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Plan
          </Button>
        </Card>
      )}
    </div>
  );
}
