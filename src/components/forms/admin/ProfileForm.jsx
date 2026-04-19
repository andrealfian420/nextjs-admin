'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, RefreshCwIcon, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const profileSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  password: z
    .string()
    .refine((val) => {
      if (!val) {
        return true; // allow empty password (means no change)
      }

      // min 8, has 1 uppercase, 1 number and special character
      return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        val,
      );
    }, 'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character')
    .optional(),
  avatar: z
    .any()
    .optional()
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type),
      'Only JPG, PNG, and WEBP formats are allowed',
    )
    .refine(
      (file) => !file || file?.size <= MAX_FILE_SIZE,
      'Avatar size must not exceed 2MB',
    ),
});

export default function ProfileForm() {
  const user = useAuthStore((state) => state.user);
  const fileInputRef = useRef(null);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      password: '',
      avatar: undefined,
    },
  });

  useEffect(() => {
    if (!user) return;

    reset({
      name: user.name ?? '',
      password: '',
      avatar: undefined,
    });

    if (user.avatarUrl ?? user.avatar) {
      setAvatarPreview(user.avatarUrl ?? user.avatar);
    }

    setIsFetching(false);
  }, [user, reset]);

  if (isFetching) {
    return (
      <div className='flex justify-center items-center py-20'>
        <Spinner />
      </div>
    );
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValue('avatar', file, { shouldValidate: true });

    if (
      ACCEPTED_IMAGE_TYPES.includes(file.type) &&
      file.size <= MAX_FILE_SIZE
    ) {
      if (avatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
    } else {
      setAvatarPreview(null);
    }
  };

  const handleRemoveAvatar = () => {
    if (avatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }

    setValue('avatar', undefined, { shouldValidate: false });
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('name', data.name);

      if (data.password) {
        payload.append('password', data.password);
      }

      if (data.avatar instanceof File) {
        payload.append('avatar', data.avatar);
      }

      const res = await authService.updateProfile(payload);

      // reload user profile after successful update
      useAuthStore.setState({ user: res.data.data });

      toast.success('Success', {
        description: 'Profile updated successfully!',
      });
    } catch (err) {
      const message =
        err.response?.data?.message || 'An error occurred. Please try again.';
      toast.error('Failed to update profile', {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    reset({
      name: user?.name ?? '',
      password: '',
      avatar: undefined,
    });
    if (avatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(user?.avatarUrl ?? user?.avatar ?? null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className='bg-white dark:bg-slate-800 p-4 rounded-lg'>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          <div className='space-y-1.5'>
            <Label htmlFor='name'>
              Full Name
              <span className='text-red-500 ml-0.5'>*</span>
            </Label>
            <Input
              id='name'
              type='text'
              placeholder='Enter Name'
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            <p className='text-xs text-red-500 min-h-2'>
              {errors.name?.message}
            </p>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              value={user?.email ?? ''}
              readOnly
              className='bg-slate-50 dark:bg-slate-700 cursor-not-allowed'
            />
            <p className='text-xs text-muted-foreground min-h-2'>
              Email cannot be changed.
            </p>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='password'>
              Password
              <span className='text-xs font-normal text-muted-foreground ml-1'>
                (leave blank to keep current)
              </span>
            </Label>
            <div className='relative'>
              <Input
                id='password'
                type={isPasswordVisible ? 'text' : 'password'}
                placeholder='••••••••'
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              <Button
                type='button'
                size='icon-sm'
                variant='ghost'
                className='absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground'
                onClick={() => setIsPasswordVisible((v) => !v)}
              >
                {isPasswordVisible ? <EyeOff size={15} /> : <Eye size={15} />}
              </Button>
            </div>
            <p className='text-xs text-red-500 min-h-2'>
              {errors.password?.message}
            </p>
          </div>

          <div className='space-y-1.5'>
            <Label>Avatar</Label>
            <p className='text-xs text-muted-foreground -mt-1'>
              JPG, PNG, WEBP — max 2 MB
            </p>

            <input
              ref={fileInputRef}
              type='file'
              accept='.jpg,.jpeg,.png,.webp'
              className='hidden'
              onChange={handleAvatarChange}
            />

            {avatarPreview ? (
              <div className='relative w-full h-64 rounded-lg overflow-hidden border border-border group cursor-pointer'>
                <Image
                  src={avatarPreview}
                  alt='Avatar preview'
                  fill
                  className='object-cover'
                  unoptimized
                />
                <button
                  type='button'
                  onClick={handleRemoveAvatar}
                  className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg'
                >
                  <X size={20} className='text-white cursor-pointer' />
                </button>
              </div>
            ) : (
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                className='flex flex-col items-center justify-center w-full h-64 cursor-pointer rounded-lg border-2 border-dashed border-border hover:border-muted-foreground transition-colors text-muted-foreground hover:text-foreground'
              >
                <Upload size={20} />
                <span className='text-xs mt-1'>Upload</span>
              </button>
            )}

            <p className='text-xs text-red-500 min-h-2'>
              {errors.avatar ? String(errors.avatar.message) : undefined}
            </p>
          </div>
        </div>

        <div className='col-span-1 flex items-center justify-end gap-2 pt-2 mt-5'>
          <Button
            className='bg-slate-700 hover:bg-slate-800 text-white cursor-pointer'
            type='submit'
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner size='sm' className='text-white' />
                Saving…
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
          <Button
            type='button'
            className='cursor-pointer bg-gray-400 text-white hover:bg-gray-500'
            onClick={resetForm}
          >
            <RefreshCwIcon size={14} />
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
