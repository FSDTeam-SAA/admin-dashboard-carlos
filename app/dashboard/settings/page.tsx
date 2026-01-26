'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, userApi, UserProfile } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileFormState {
  name: string;
  email: string;
  phone: string;
  position: string;
  age: string;
  FavoriteClub: string;
  location: string;
}

const toAgeString = (value?: number) => (value === 0 || value ? String(value) : '');

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await userApi.getProfile();
      return response.data.data;
    },
  });

  const [formValues, setFormValues] = useState<ProfileFormState>({
    name: '',
    email: '',
    phone: '',
    position: '',
    age: '',
    FavoriteClub: '',
    location: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (profile) {
      setFormValues({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        position: profile.position || '',
        age: toAgeString(profile.age),
        FavoriteClub: profile.FavoriteClub || '',
        location: profile.location || '',
      });
      setAvatarPreview(profile.avatar?.url || '');
      setAvatarFile(null);
    }
  }, [profile]);

  useEffect(
    () => () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    },
    [avatarPreview]
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      if (formValues.name) formData.append('name', formValues.name);
      if (formValues.phone) formData.append('phone', formValues.phone);
      if (formValues.position) formData.append('position', formValues.position);
      if (formValues.FavoriteClub) formData.append('FavoriteClub', formValues.FavoriteClub);
      if (formValues.location) formData.append('location', formValues.location);
      if (formValues.age) formData.append('age', formValues.age);
      if (avatarFile) formData.append('avatar', avatarFile);

      return userApi.updateProfile(formData);
    },
    onSuccess: (response) => {
      const updated = response.data.data;
      toast.success(response.data.message || 'Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });

      if (updated) {
        setFormValues((prev) => ({
          ...prev,
          name: updated.name || prev.name,
          email: updated.email || prev.email,
          phone: updated.phone || prev.phone,
          position: updated.position || prev.position,
          age: updated.age === undefined ? prev.age : toAgeString(updated.age),
          FavoriteClub: updated.FavoriteClub || prev.FavoriteClub,
          location: updated.location || prev.location,
        }));
        setAvatarPreview(updated.avatar?.url || avatarPreview);
        setAvatarFile(null);
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    },
  });

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateProfileMutation.mutate();
  };

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const changePasswordMutation = useMutation({
    mutationFn: (payload: { oldPassword: string; newPassword: string }) =>
      authApi.changePassword(payload),
    onSuccess: (response) => {
      toast.success(response.data.message || 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to change password';
      toast.error(message);
    },
  });

  const handleChangePassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    changePasswordMutation.mutate({
      oldPassword: currentPassword,
      newPassword,
    });
  };

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Update your profile information and password</p>
      </div>

      <Card className="p-8 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-48" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={avatarPreview || '/placeholder.svg'}
                    alt={formValues.name || 'User avatar'}
                  />
                  <AvatarFallback>
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-3 left-1/2 -translate-x-1/2 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <span className="text-xs font-medium text-teal-700 bg-white border border-teal-200 px-3 py-1 rounded-full shadow-sm">
                    Change photo
                  </span>
                </label>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {formValues.name || 'Your name'}
                </h2>
                <p className="text-slate-500">{formValues.email}</p>
                <p className="text-sm text-slate-500">
                  Keep your contact details and role information up to date.
                </p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="name">
                    Full name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formValues.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    disabled={updateProfileMutation.isPending}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="email">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    value={formValues.email}
                    disabled
                    className="h-11 bg-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="phone">
                    Phone
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formValues.phone}
                    onChange={handleInputChange}
                    placeholder="Add a phone number"
                    disabled={updateProfileMutation.isPending}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="position">
                    Position
                  </label>
                  <Input
                    id="position"
                    name="position"
                    value={formValues.position}
                    onChange={handleInputChange}
                    placeholder="e.g. Admin"
                    disabled={updateProfileMutation.isPending}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="FavoriteClub">
                    Favorite club
                  </label>
                  <Input
                    id="FavoriteClub"
                    name="FavoriteClub"
                    value={formValues.FavoriteClub}
                    onChange={handleInputChange}
                    placeholder="Add your favorite club"
                    disabled={updateProfileMutation.isPending}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="age">
                    Age
                  </label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formValues.age}
                    onChange={handleInputChange}
                    placeholder="Add your age"
                    disabled={updateProfileMutation.isPending}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="location">
                    Location
                  </label>
                  <Input
                    id="location"
                    name="location"
                    value={formValues.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                    disabled={updateProfileMutation.isPending}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save profile'}
                </Button>
              </div>
            </form>
          </>
        )}
      </Card>

      <Card className="p-8 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Change password</h3>
          <p className="text-slate-500 text-sm">
            Create a strong password with at least 6 characters.
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="currentPassword">
                Current password
              </label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="********"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={changePasswordMutation.isPending}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="newPassword">
                New password
              </label>
              <Input
                id="newPassword"
                type="password"
                placeholder="********"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={changePasswordMutation.isPending}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="confirmPassword">
                Confirm new password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={changePasswordMutation.isPending}
                className="h-11"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-8"
            >
              {changePasswordMutation.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
