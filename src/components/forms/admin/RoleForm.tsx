'use client';

import { AdminFormActions } from '@/components/ui/AdminFormActions';
import { Button } from '@/components/ui/Button';
import { Checkbox, CheckboxField } from '@/components/ui/Checkbox';
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
import { Textarea } from '@/components/ui/Textarea';
import { toast } from '@/components/ui/Toast';
import { applyApiFieldErrors, isNotFoundError } from '@/lib/api-errors';
import { getApiErrorMessage } from '@/lib/utils';
import { roleService } from '@/services/roleService';
import { zodResolver } from '@hookform/resolvers/zod';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import type { PermissionModule } from '@/types/role';

const schema = z.object({
  title: z.string().min(1, 'Role name is required'),
  userType: z.string().min(1, 'User type is required'),
  description: z.string().min(1, 'Description is required'),
  access: z.array(z.string()),
});

type RoleFormValues = z.infer<typeof schema>;

const EMPTY: RoleFormValues = {
  title: '',
  userType: '',
  description: '',
  access: [],
};

/**
 * Role create/edit form: name, user type (from GET /roles/user-types), description and the
 * permission matrix. Every access change, bulk actions included, marks the form dirty; Discard
 * changes restores the loaded role (or the empty form) locally, without a request.
 */
export default function RoleForm({ isEdit = false }: { isEdit?: boolean }) {
  // Opted out of React Compiler: it memoizes register() calls, but every reset() empties
  // react-hook-form's mounted-field set that those calls refill, so a later Discard would not
  // write the restored values back into the inputs.
  'use no memo';

  const { slug } = useParams<{ slug?: string }>();
  const roleSlug = isEdit ? (slug ?? null) : null;
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'failed'>(
    'loading',
  );
  const [attempt, setAttempt] = useState(0);
  const [accessList, setAccessList] = useState<PermissionModule[]>([]);
  const [userTypes, setUserTypes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    setError,
    reset,
    formState: { errors, isDirty, defaultValues },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  const watchedAccess = useWatch({ control, name: 'access' });

  const allAccessValues = useMemo(
    () =>
      accessList.flatMap((m) =>
        m.sub_module.flatMap((s) => s.activities.map((a) => a.value)),
      ),
    [accessList],
  );

  const allSelected =
    allAccessValues.length > 0 &&
    allAccessValues.every((v) => (watchedAccess ?? []).includes(v));

  // The catalogues and (on edit) the role load together: the form is useless without them.
  useEffect(() => {
    let active = true;

    Promise.all([
      roleService.getAccessList(),
      roleService.getUserTypes(),
      roleSlug ? roleService.getRole(roleSlug) : null,
    ])
      .then(([access, types, detail]) => {
        if (!active) return;
        setAccessList(access.data ?? []);
        setUserTypes(types.data ?? []);
        if (detail) {
          const role = detail.data;
          reset({
            title: role.title ?? '',
            userType: role.userType ?? '',
            description: role.description ?? '',
            access: role.access ?? [],
          });
        }
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (active) setStatus(isNotFoundError(err) ? 'missing' : 'failed');
      });

    return () => {
      active = false;
    };
  }, [roleSlug, reset, attempt]);

  if (status === 'missing') notFound();

  if (status === 'failed') {
    return (
      <LoadFailed
        message={isEdit ? 'Failed to load the role.' : 'Failed to load the role options.'}
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

  const onSubmit: SubmitHandler<RoleFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      if (roleSlug) {
        await roleService.updateRole(roleSlug, data);
      } else {
        await roleService.createRole(data);
      }

      toast.success('Success', {
        description: isEdit
          ? 'Role updated successfully!'
          : 'Role created successfully!',
      });

      // The toaster lives in the root layout, so the notice stays visible on the list.
      router.push('/admin/roles');
    } catch (err: unknown) {
      setIsSubmitting(false);
      const { applied, description } = applyApiFieldErrors(err, {
        setError,
        getValues,
      });

      toast.error(`Failed to ${isEdit ? 'update' : 'create'} role.`, {
        description: applied.length ? description : getApiErrorMessage(err),
        position: 'top-right',
      });
    }
  };

  // Back to the loaded role (edit) or the empty form (create). Passing the baseline skips the
  // native form reset that the Radix checkboxes listen to; keepFieldsRef keeps the inputs
  // registered.
  const discardChanges = () =>
    reset(defaultValues as RoleFormValues, { keepFieldsRef: true });

  // shouldDirty: the bulk access actions are user changes, like ticking a checkbox.
  const handleToggleAll = () =>
    setValue('access', allSelected ? [] : allAccessValues, { shouldDirty: true });

  const handleResetAccess = () => setValue('access', [], { shouldDirty: true });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className='bg-white dark:bg-zinc-800 p-4 rounded-lg'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          <div className='space-y-1.5'>
            <Label htmlFor='title'>
              Role Name
              <span className='text-red-500 ml-0.5'>*</span>
            </Label>
            <Input
              id='title'
              type='text'
              placeholder='Enter Role Name'
              aria-invalid={!!errors.title}
              {...register('title')}
            />
            <p className='text-xs text-red-500 min-h-2'>
              {errors.title?.message}
            </p>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='userType'>
              User Type
              <span className='text-red-500 ml-0.5'>*</span>
            </Label>
            <Controller
              name='userType'
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id='userType'
                    aria-invalid={!!errors.userType}
                    className='w-full'
                  >
                    <SelectValue placeholder='Select a user type' />
                  </SelectTrigger>
                  <SelectContent position='popper'>
                    {userTypes.map((type) => (
                      <SelectItem key={type} value={type} className='cursor-pointer'>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className='text-xs text-red-500 min-h-2'>
              {errors.userType?.message}
            </p>
          </div>

          <div className='space-y-1.5 md:col-span-2'>
            <Label htmlFor='description'>
              Description
              <span className='text-red-500 ml-0.5'>*</span>
            </Label>
            <Textarea
              id='description'
              placeholder='Enter Description'
              aria-invalid={!!errors.description}
              {...register('description')}
            />
            <p className='text-xs text-red-500 min-h-2'>
              {errors.description?.message}
            </p>
          </div>

          <div className='space-y-1.5 md:col-span-2'>
            <h2 className='text-sm font-medium'>Access Rights</h2>

            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='mb-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700'
                onClick={handleToggleAll}
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </Button>
              <Button
                type='button'
                size='sm'
                className='mb-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white'
                onClick={handleResetAccess}
              >
                Reset Access
              </Button>
            </div>

            <Controller
              name='access'
              control={control}
              render={({ field }) => (
                <div className='space-y-3'>
                  {accessList.map((module, index) => {
                    const moduleValues = module.sub_module.flatMap((s) =>
                      s.activities.map((a) => a.value),
                    );
                    const checkedCount = moduleValues.filter((v) =>
                      field.value.includes(v),
                    ).length;
                    const isModuleAll =
                      checkedCount === moduleValues.length &&
                      moduleValues.length > 0;
                    const isModuleIndeterminate =
                      checkedCount > 0 && checkedCount < moduleValues.length;

                    return (
                      <div
                        key={module.module}
                        className={`border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden ${index !== 0 ? 'mt-5' : ''}`}
                      >
                        {/* Module header */}
                        <div className='flex items-center gap-2.5 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-700'>
                          <Checkbox
                            id={`module-${module.module}`}
                            checked={isModuleAll}
                            indeterminate={isModuleIndeterminate}
                            onCheckedChange={(checked) => {
                              field.onChange(
                                checked
                                  ? [...new Set([...field.value, ...moduleValues])]
                                  : field.value.filter((v) => !moduleValues.includes(v)),
                              );
                            }}
                          />
                          <label
                            htmlFor={`module-${module.module}`}
                            className='text-sm font-semibold cursor-pointer select-none'
                          >
                            {module.module}
                          </label>
                        </div>

                        {/* Sub-modules */}
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px'>
                          {module.sub_module.map((sub) => {
                            const subValues = sub.activities.map((a) => a.value);
                            const subCheckedCount = subValues.filter((v) =>
                              field.value.includes(v),
                            ).length;
                            const isSubAll =
                              subCheckedCount === subValues.length &&
                              subValues.length > 0;
                            const isSubIndeterminate =
                              subCheckedCount > 0 &&
                              subCheckedCount < subValues.length;

                            return (
                              <div
                                key={sub.module}
                                className='bg-white dark:bg-zinc-800 p-3 space-y-2'
                              >
                                {/* Sub-module header */}
                                <div className='flex items-center gap-2'>
                                  <Checkbox
                                    id={`sub-${module.module}-${sub.module}`}
                                    checked={isSubAll}
                                    indeterminate={isSubIndeterminate}
                                    onCheckedChange={(checked) => {
                                      field.onChange(
                                        checked
                                          ? [...new Set([...field.value, ...subValues])]
                                          : field.value.filter(
                                              (v) => !subValues.includes(v),
                                            ),
                                      );
                                    }}
                                  />
                                  <Label
                                    htmlFor={`sub-${module.module}-${sub.module}`}
                                    className='text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 cursor-pointer select-none'
                                  >
                                    {sub.module}
                                  </Label>
                                </div>

                                {/* Activities */}
                                <div className='ml-6 space-y-1.5'>
                                  {sub.activities.map((activity) => (
                                    <CheckboxField
                                      key={activity.value}
                                      id={activity.value}
                                      label={activity.label}
                                      checked={field.value.includes(activity.value)}
                                      onCheckedChange={(checked) => {
                                        field.onChange(
                                          checked
                                            ? [...field.value, activity.value]
                                            : field.value.filter(
                                                (v) => v !== activity.value,
                                              ),
                                        );
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            />
          </div>
        </div>
      </div>

      <AdminFormActions
        isEdit={isEdit}
        createLabel='Create Role'
        isSubmitting={isSubmitting}
        isDirty={isDirty}
        onBack={() => router.push('/admin/roles')}
        onDiscard={discardChanges}
      />
    </form>
  );
}
