'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, RefreshCwIcon, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const DUMMY_ROLES = [
  { label: 'Super Admin', value: 1 },
  { label: 'Backend User', value: 2 },
];

function userSchema(isEdit = false) {
  return z.object({
    full_name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    password: isEdit
      ? z.string().optional().or(z.literal(''))
      : z.string().min(8, 'Password must be at least 8 characters'),
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
    role_id: z.string().min(1, 'Role is required'),
  });
}

export default function UserForm({ data = {} }) {
  const isEdit = data?.id ? true : false;
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(data.avatar ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = userSchema(isEdit);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: data.full_name ?? '',
      email: data.email ?? '',
      password: '',
      avatar: undefined,
      role_id: data.role_id ? String(data.role_id) : '',
    },
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValue('avatar', file, { shouldValidate: true });

    if (
      ACCEPTED_IMAGE_TYPES.includes(file.type) &&
      file.size <= MAX_FILE_SIZE
    ) {
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
    } else {
      setAvatarPreview(null);
    }
  };

  const handleRemoveAvatar = () => {
    setValue('avatar', undefined, { shouldValidate: false });
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Dummy submit — replace with actual API call
      const payload = new FormData();
      payload.append('email', data.email);
      payload.append('role_id', data.role_id);
      if (data.password) payload.append('password', data.password);
      if (data.avatar instanceof File) payload.append('avatar', data.avatar);

      console.log(
        isEdit ? '[UserForm] Update payload:' : '[UserForm] Create payload:',
        Object.fromEntries(payload.entries()),
      );

      await new Promise((r) => setTimeout(r, 800)); // simulate API delay
      router.push('/admin/users');
    } catch (err) {
      console.error('[UserForm] Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = (e) => {
    setValue('full_name', data.full_name ?? '', {
      shouldValidate: false,
    });
    setValue('email', data.email ?? '', { shouldValidate: false });
    setValue('password', '', { shouldValidate: false });
    setValue('avatar', undefined, { shouldValidate: false });
    setValue('role_id', data.role_id ? String(data.role_id) : '', {
      shouldValidate: false,
    });
    setAvatarPreview(data.avatar ?? null);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
        <div className='space-y-1.5'>
          <Label htmlFor='full_name'>
            Full Name
            <span className='text-red-500 ml-0.5'>*</span>
          </Label>
          <Input
            id='full_name'
            type='text'
            placeholder='John Doe'
            className={`${errors.full_name ? 'border-red-500' : ''}`}
            {...register('full_name')}
          />
          <p className='text-xs text-red-500 min-h-2'>
            {errors.full_name?.message}
          </p>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='email'>
            Email
            <span className='text-red-500 ml-0.5'>*</span>
          </Label>
          <Input
            id='email'
            type='email'
            placeholder='user@example.com'
            className={`${errors.email ? 'border-red-500' : ''}`}
            {...register('email')}
          />
          <p className='text-xs text-red-500 min-h-2'>
            {errors.email?.message}
          </p>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='password'>
            Password
            {!isEdit && <span className='text-red-500 ml-0.5'>*</span>}
            {isEdit && (
              <span className='text-xs font-normal text-muted-foreground ml-1'>
                (leave blank to keep current)
              </span>
            )}
          </Label>
          <div className='relative'>
            <Input
              id='password'
              type={isPasswordVisible ? 'text' : 'password'}
              placeholder={isEdit ? '••••••••' : 'Min. 8 characters'}
              className={`${errors.password ? 'border-red-500' : ''}`}
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
          <Label htmlFor='role_id'>
            Role
            <span className='text-red-500 ml-0.5'>*</span>
          </Label>
          <Controller
            name='role_id'
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id='role_id'
                  className={`w-full ${errors.role_id ? 'border-red-500' : ''}`}
                >
                  <SelectValue placeholder='Select a role' />
                </SelectTrigger>
                <SelectContent position='popper' className='bg-white'>
                  {DUMMY_ROLES.map((role) => (
                    <SelectItem
                      key={role.value}
                      value={String(role.value)}
                      className='cursor-pointer'
                    >
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className='text-xs text-red-500 min-h-2'>
            {errors.role_id?.message}
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
          {isSubmitting
            ? isEdit
              ? 'Saving…'
              : 'Creating…'
            : isEdit
              ? 'Save Changes'
              : 'Create User'}
        </Button>
        <Button
          type='button'
          className='cursor-pointer bg-gray-400 text-white hover:bg-gray-500'
          onClick={resetForm}
        >
          <RefreshCwIcon size={14} />
          Reset
        </Button>
        <Button
          className='cursor-pointer'
          type='button'
          variant='outline'
          onClick={() => router.push('/admin/users')}
        >
          Back
        </Button>
      </div>
    </form>
  );
}
