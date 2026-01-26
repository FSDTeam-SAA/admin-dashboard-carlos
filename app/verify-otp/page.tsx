'use client';

import React from "react"

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.verifyOtp({ email, otp: otpString });
      toast.success('OTP verified!');
      router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${otpString}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
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
              <h1 className="text-3xl font-bold text-slate-900">Enter OTP</h1>
              <p className="text-slate-500">
                We have share a code of your registered email address
                <br />
                {email}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    disabled={isLoading}
                    className="h-14 w-12 text-center text-lg font-bold"
                  />
                ))}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-medium"
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
