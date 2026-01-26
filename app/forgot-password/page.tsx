'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authApi.forgotPassword({ email });
      toast.success('OTP sent to your email!');
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">Forgot Password</h1>
              <p className="text-slate-500">
                Enter your registered email address. we'll send you a code to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-medium"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>

            <div className="text-center">
              <Link href="/login" className="text-sm text-teal-600 hover:text-teal-700">
                Back to login
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
