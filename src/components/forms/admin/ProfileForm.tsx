'use client';

import { AdminFormActions } from '@/components/ui/AdminFormActions';
import { Button } from '@/components/ui/Button';
import { ImagePickerField } from '@/components/ui/ImagePickerField';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { LoadFailed } from '@/components/ui/LoadFailed';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';
import { useLogout } from '@/hooks/useLogout';
import { useObjectUrl } from '@/hooks/useObjectUrl';
import { applyApiFieldErrors } from '@/lib/api-errors';
import { getApiErrorMessage } from '@/lib/utils';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { usePendingToastStore } from '@/store/usePendingToastStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import type { UserProfile } from '@/types/user';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const isAcceptedImage = (file: File) =>
  ACCEPTED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE;

// min 8, has 1 uppercase, 1 number and special character; blank keeps the current password.
const STRONG_PASSWORD = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const schema = z.object({
  name: z.string().min(1, 'Full name is required'),
  password: z
    .string()
    .refine(
      (val) => !val || STRONG_PASSWORD.test(val),
      'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character',
    ),
  avatar: z
    .custom<File | undefined>()
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only JPG, PNG, and WEBP formats are allowed',
    )
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      'Avatar size must not exceed 2MB',
    ),
});

type ProfileFormValues = z.infer<typeof schema>;

const toValues = (profile: UserProfile): ProfileFormValues => ({
  name: profile.name ?? '',
  password: '',
  avatar: undefined,
});

/**
 * The signed-in user's own profile. Loads GET /profile itself, so the session store's
 * background refreshes never overwrite what is being typed. A save becomes the new Discard
 * baseline and syncs the store; a password change ends every session, so the user is sent to
 * the login page with a notice.
 */
export default function ProfileForm() {
  // Opted out of React Compiler: it memoizes register() calls, but every reset() empties
  // react-hook-form's mounted-field set that those calls refill, so a later Discard would not
  // write the restored values back into the inputs.
  'use no memo';

  const router = useRouter();
  // Only synced after a save (navbar, permissions); the form never reads from it.
  const setStoreUser = useAuthStore((state) => state.setUser);
  const setPendingToast = usePendingToastStore((state) => state.setPendingToast);
  const { handleLogout } = useLogout();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    setError,
    getValues,
    clearErrors,
    formState: { errors, isDirty, defaultValues },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', password: '', avatar: undefined },
  });

  const avatar = useWatch({ control, name: 'avatar' });
  const avatarUrl = useObjectUrl(
    avatar instanceof File && isAcceptedImage(avatar) ? avatar : null,
  );

  useEffect(() => {
    let active = true;

    authService
      .profile()
      .then((res) => {
        if (!active) return;
        setProfile(res.data.data);
        reset(toValues(res.data.data));
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
    };
  }, [reset, attempt]);

  if (failed) {
    return (
      <LoadFailed
        message='Failed to load your profile.'
        onRetry={() => {
          setFailed(false);
          setAttempt((n) => n + 1);
        }}
      />
    );
  }

  if (!profile) {
    return (
      <div className='flex justify-center items-center py-20'>
        <Spinner />
      </div>
    );
  }

  // An invalid file is kept only so the schema can report it; it never gets a preview.
  const pickAvatar = (file: File) =>
    setValue('avatar', file, { shouldValidate: true, shouldDirty: true });

  // Drops the new pick only: the stored avatar comes back and is never deleted.
  const cancelAvatar = () => {
    setValue('avatar', undefined, { shouldDirty: true });
    clearErrors('avatar');
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await authService.updateProfile(data);

      if (data.password) {
        // The backend revoked every session; the notice survives the redirect to /login.
        setPendingToast({
          type: 'info',
          title: 'Password Changed',
          description: 'Your password has been updated. Please sign in again.',
        });
        // Stays submitting until the logout navigates away.
        await handleLogout('PROFILE_PASSWORD_CHANGED');
        return;
      }

      const updated = res.data.data;
      setProfile(updated);
      // The saved profile is the new Discard baseline. This also drops the uploaded file, now
      // the stored avatar, so it is not sent again.
      reset(toValues(updated), { keepFieldsRef: true });
      setStoreUser(updated);

      toast.success('Success', {
        description: 'Profile updated successfully!',
      });
      setIsSubmitting(false);
    } catch (err: unknown) {
      const { applied, description } = applyApiFieldErrors(err, {
        setError,
        getValues,
      });

      toast.error('Failed to update profile', {
        description: applied.length ? description : getApiErrorMessage(err),
      });
      setIsSubmitting(false);
    }
  };

  const discardChanges = () =>
    reset(defaultValues as ProfileFormValues, { keepFieldsRef: true });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className='bg-white dark:bg-zinc-800 p-4 rounded-lg'>
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
              value={profile.email}
              readOnly
              aria-describedby='email-hint'
              className='bg-zinc-50 dark:bg-zinc-700 cursor-not-allowed'
            />
            <p id='email-hint' className='text-xs text-muted-foreground min-h-2'>
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
                autoComplete='new-password'
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              <Button
                type='button'
                size='icon-sm'
                variant='ghost'
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                className='absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground'
                onClick={() => setIsPasswordVisible((v) => !v)}
              >
                {isPasswordVisible ? <EyeOff size={15} /> : <Eye size={15} />}
              </Button>
            </div>
            <p className='text-xs text-red-500 min-h-2'>
              {errors.password?.message}
            </p>
          </div>

          <ImagePickerField
            id='avatar'
            label='Avatar'
            hint='JPG, PNG, WEBP — max 2 MB'
            heightClass='h-64'
            preview={avatarUrl ?? profile.avatarUrl ?? null}
            isNewPick={avatar instanceof File}
            error={errors.avatar?.message}
            disabled={isSubmitting}
            onPick={pickAvatar}
            onCancel={cancelAvatar}
          />
        </div>
      </div>

      <AdminFormActions
        isEdit
        isSubmitting={isSubmitting}
        // A picked File counts even where react-hook-form's comparison would not.
        isDirty={isDirty || avatar instanceof File}
        onBack={() => router.push('/admin')}
        onDiscard={discardChanges}
      />
    </form>
  );
}
