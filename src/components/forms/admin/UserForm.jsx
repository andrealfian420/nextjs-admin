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
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';
import { userService } from '@/services/userService';
import { utilService } from '@/services/utilService';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, RefreshCwIcon, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

function userSchema(isEdit = false) {
  return z.object({
    name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    password: isEdit
      ? z
          .string()
          .refine((val) => {
            // min 8, has 1 uppercase, 1 number and special character
            return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
              val,
            );
          }, 'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character')
          .optional()
          .or(z.literal(''))
      : z.string().refine((val) => {
          // min 8, has 1 uppercase, 1 number and special character
          return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
            val,
          );
        }, 'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character'),
    avatar: z
      .any()
      .refine(
        (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type),
        'Only JPG, PNG, and WEBP formats are allowed',
      )
      .refine(
        (file) => !file || file?.size <= MAX_FILE_SIZE,
        'Avatar size must not exceed 2MB',
      )
      .refine((file) => {
        if (isEdit) {
          return true; // Skip required check in edit mode
        }

        return file instanceof File;
      }, 'Avatar is required'),
    roleId: z.string().min(1, 'Role is required'),
  });
}

export default function UserForm({ isEdit = false }) {
  const params = useParams();
  const slug = isEdit ? params?.slug : null;
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  const [roles, setRoles] = useState([]);
  const redirectTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const schema = userSchema(isEdit);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      avatar: undefined,
      roleId: '',
    },
  });

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        const res = await userService.getUser(slug);
        const user = res.data;

        reset({
          name: user.name ?? '',
          email: user.email ?? '',
          password: '',
          avatar: undefined,
          roleId: user.roleId ? String(user.roleId) : '',
        });

        if (user.avatar) {
          setAvatarPreview(user.avatarUrl ?? null);
        }
      } catch (err) {
        toast.error('Error', {
          description: 'Failed to load user data.',
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [slug, reset]);

  useEffect(() => {
    setIsFetching(true);

    const fetchOptions = async () => {
      try {
        const res = await utilService.getRoleOptions();
        setRoles(res.data);
      } catch (err) {
        toast.error('Error', {
          description: 'Failed to load role options.',
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchOptions();
  }, []);

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
      payload.append('email', data.email);
      payload.append('roleId', data.roleId);

      if (data.password) {
        payload.append('password', data.password);
      }

      if (data.avatar instanceof File) {
        payload.append('avatar', data.avatar);
      }

      if (isEdit) {
        await userService.updateUser(slug, payload);
      } else {
        await userService.createUser(payload);
      }

      toast.success('Success', {
        description: isEdit
          ? 'User updated successfully!'
          : 'User created successfully!',
      });

      redirectTimerRef.current = setTimeout(() => {
        setIsSubmitting(false);
        router.push('/admin/users');
      }, 2000);
    } catch (err) {
      setIsSubmitting(false);
      let message = 'An error occurred. Please try again.';

      if (err.response?.data?.message) {
        message = err.response.data.message;
      }

      const toastMessage = `Failed to ${isEdit ? 'update' : 'create'} user.`;

      toast.error(toastMessage, {
        description: message,
        position: 'top-right',
      });
    }
  };

  const resetForm = async () => {
    if (avatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }

    if (!isEdit) {
      reset({
        name: '',
        email: '',
        password: '',
        avatar: undefined,
        roleId: '',
      });
      setAvatarPreview(null);
    } else {
      // Re-trigger fetch to restore original values
      setIsFetching(true);

      try {
        const res = await userService.getUser(slug);
        const user = res.data;
        reset({
          name: user.name ?? '',
          email: user.email ?? '',
          password: '',
          avatar: undefined,
          roleId: user.roleId ? String(user.roleId) : '',
        });
        setAvatarPreview(user.avatarUrl ?? null);
      } catch (error) {
        toast.error('Error', {
          description: 'Failed to reset form.',
        });
      } finally {
        setIsFetching(false);
      }
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
            <Label htmlFor='email'>
              Email
              <span className='text-red-500 ml-0.5'>*</span>
            </Label>
            <Input
              id='email'
              readOnly={isEdit}
              type='email'
              placeholder='Enter Email'
              aria-invalid={!!errors.email}
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
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              <Button
                type='button'
                size='icon-sm'
                variant='ghost'
                className='absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-transparent'
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
            <Label htmlFor='roleId'>
              Role
              <span className='text-red-500 ml-0.5'>*</span>
            </Label>
            <Controller
              name='roleId'
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id='roleId'
                    aria-invalid={!!errors.roleId}
                    className='w-full'
                  >
                    <SelectValue placeholder='Select a role' />
                  </SelectTrigger>
                  <SelectContent position='popper'>
                    {roles.map((role) => (
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
              {errors.roleId?.message}
            </p>
          </div>

          <div className='space-y-1.5'>
            <Label>
              Avatar {!isEdit && <span className='text-red-500 ml-0.5'>*</span>}
            </Label>
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
                {isEdit ? 'Saving…' : 'Creating…'}
              </>
            ) : isEdit ? (
              'Save Changes'
            ) : (
              'Create User'
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
    </div>
  );
}
