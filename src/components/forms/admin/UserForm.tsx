'use client';

import { AdminFormActions } from '@/components/ui/AdminFormActions';
import { Button } from '@/components/ui/Button';
import { ImagePickerField } from '@/components/ui/ImagePickerField';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { LoadFailed } from '@/components/ui/LoadFailed';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';
import { useObjectUrl } from '@/hooks/useObjectUrl';
import { applyApiFieldErrors, isNotFoundError } from '@/lib/api-errors';
import { getApiErrorMessage } from '@/lib/utils';
import { userService } from '@/services/userService';
import { utilService } from '@/services/utilService';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import type { Option } from '@/types/util';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const isAcceptedImage = (file: File) =>
  ACCEPTED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE;

// min 8, has 1 uppercase, 1 number and special character
const STRONG_PASSWORD = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const PASSWORD_RULE =
  'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character';

function userSchema(isEdit: boolean) {
  return z.object({
    name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    // Blank on edit keeps the current password.
    password: z
      .string()
      .refine((val) => (isEdit && !val) || STRONG_PASSWORD.test(val), PASSWORD_RULE),
    avatar: z
      .custom<File | undefined>()
      .refine(
        (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
        'Only JPG, PNG, and WEBP formats are allowed',
      )
      .refine(
        (file) => !file || file.size <= MAX_FILE_SIZE,
        'Avatar size must not exceed 2MB',
      )
      .refine((file) => isEdit || file instanceof File, 'Avatar is required'),
    roleId: z.string().min(1, 'Role is required'),
  });
}

type UserFormValues = z.infer<ReturnType<typeof userSchema>>;

const EMPTY: UserFormValues = {
  name: '',
  email: '',
  password: '',
  avatar: undefined,
  roleId: '',
};

/**
 * User create/edit form. Edit loads the user by slug; a stored avatar can only be replaced
 * (cancelling a new pick restores it). Discard changes restores the loaded user (or the empty
 * form) locally, without a request. API field errors are shown next to their fields.
 */
export default function UserForm({ isEdit = false }: { isEdit?: boolean }) {
  // Opted out of React Compiler: it memoizes register() calls, but every reset() empties
  // react-hook-form's mounted-field set that those calls refill, so a later Discard would not
  // write the restored values back into the inputs.
  'use no memo';

  const { slug } = useParams<{ slug?: string }>();
  const userSlug = isEdit ? (slug ?? null) : null;
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'failed'>(
    'loading',
  );
  const [attempt, setAttempt] = useState(0);
  const [roles, setRoles] = useState<Option[]>([]);
  /** URL of the stored avatar; shown again when a new pick is cancelled. */
  const [savedAvatarUrl, setSavedAvatarUrl] = useState<string | null>(null);
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
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema(isEdit)),
    defaultValues: EMPTY,
  });

  const avatar = useWatch({ control, name: 'avatar' });
  const avatarUrl = useObjectUrl(
    avatar instanceof File && isAcceptedImage(avatar) ? avatar : null,
  );

  // Role options and (on edit) the user load together: the form is useless without either.
  useEffect(() => {
    let active = true;

    Promise.all([
      utilService.getRoleOptions(),
      userSlug ? userService.getUser(userSlug) : null,
    ])
      .then(([options, detail]) => {
        if (!active) return;
        setRoles(options.data ?? []);
        if (detail) {
          const user = detail.data;
          reset({
            ...EMPTY,
            name: user.name ?? '',
            email: user.email ?? '',
            roleId: user.role ? String(user.role.id) : '',
          });
          setSavedAvatarUrl(user.avatarUrl ?? null);
        }
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (active) setStatus(isNotFoundError(err) ? 'missing' : 'failed');
      });

    return () => {
      active = false;
    };
  }, [userSlug, reset, attempt]);

  if (status === 'missing') notFound();

  if (status === 'failed') {
    return (
      <LoadFailed
        message={isEdit ? 'Failed to load the user.' : 'Failed to load the role options.'}
        onRetry={() => {
          setStatus('loading');
          setAttempt((n) => n + 1);
        }}
      />
    );
  }

  if (status === 'loading') {
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

  const onSubmit: SubmitHandler<UserFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      if (userSlug) {
        await userService.updateUser(userSlug, data);
      } else {
        await userService.createUser(data);
      }

      toast.success('Success', {
        description: isEdit
          ? 'User updated successfully!'
          : 'User created successfully!',
      });

      // The toaster lives in the root layout, so the notice stays visible on the list.
      router.push('/admin/users');
    } catch (err: unknown) {
      setIsSubmitting(false);
      const { applied, description } = applyApiFieldErrors(err, {
        setError,
        getValues,
      });

      toast.error(`Failed to ${isEdit ? 'update' : 'create'} user.`, {
        description: applied.length ? description : getApiErrorMessage(err),
        position: 'top-right',
      });
    }
  };

  // Back to the loaded user (edit) or the empty form (create), new avatar included. Passing
  // the baseline skips the native form reset; keepFieldsRef keeps the inputs registered.
  const discardChanges = () =>
    reset(defaultValues as UserFormValues, { keepFieldsRef: true });

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
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                className='absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-transparent'
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

          <ImagePickerField
            id='avatar'
            label='Avatar'
            hint='JPG, PNG, WEBP — max 2 MB'
            required={!isEdit}
            heightClass='h-64'
            preview={avatarUrl ?? savedAvatarUrl}
            isNewPick={avatar instanceof File}
            error={errors.avatar?.message}
            disabled={isSubmitting}
            onPick={pickAvatar}
            onCancel={cancelAvatar}
          />
        </div>
      </div>

      <AdminFormActions
        isEdit={isEdit}
        createLabel='Create User'
        isSubmitting={isSubmitting}
        // A picked File counts even where react-hook-form's comparison would not.
        isDirty={isDirty || avatar instanceof File}
        onBack={() => router.push('/admin/users')}
        onDiscard={discardChanges}
      />
    </form>
  );
}
