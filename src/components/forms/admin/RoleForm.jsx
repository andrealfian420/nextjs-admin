'use client';

import { Button } from '@/components/ui/Button';
import { Checkbox, CheckboxField } from '@/components/ui/Checkbox';
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
import { Textarea } from '@/components/ui/Textarea';
import { toast } from '@/components/ui/Toast';
import { roleService } from '@/services/roleService';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCwIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

function roleSchema(isEdit = false) {
  return z.object({
    title: z.string().min(1, 'Role name is required'),
    userType: z.string().min(1, 'User type is required'),
    description: z.string().min(1, 'Description is required'),
    accesses: z.array(z.string()).optional(),
  });
}

const USER_TYPES = [{ value: 'Administrator', label: 'Administrator' }];

export default function RoleForm({ isEdit = false }) {
  const params = useParams();
  const slug = isEdit ? params?.slug : null;
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  const [accessList, setAccessList] = useState([]);

  const schema = roleSchema(isEdit);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      userType: '',
      description: '',
      accesses: [],
    },
  });

  const watchedAccesses = useWatch({ control, name: 'accesses' }) ?? [];

  const allAccessValues = useMemo(
    () =>
      accessList.flatMap((m) =>
        m.sub_module.flatMap((s) => s.activities.map((a) => a.value)),
      ),
    [accessList],
  );

  const accessBtnLabel = useMemo(() => {
    if (!allAccessValues.length) {
      return 'Select All';
    }
    return allAccessValues.every((v) => watchedAccesses.includes(v))
      ? 'Deselect All'
      : 'Select All';
  }, [allAccessValues, watchedAccesses]);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        const res = await roleService.getRole(slug);
        const role = res.data;

        reset({
          title: role.title ?? '',
          userType: role.userType ?? '',
          description: role.description ?? '',
          accesses: role.access ?? [],
        });
      } catch (err) {
        toast.error('Error', {
          description: 'Failed to load role data.',
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [slug, reset]);

  useEffect(() => {
    setIsFetching(true);

    const fetchAccessList = async () => {
      try {
        const res = await roleService.getAccessList();
        setAccessList(res.data);
      } catch (err) {
        toast.error('Error', {
          description: 'Failed to load access list.',
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchAccessList();
  }, []);

  if (isFetching) {
    return (
      <div className='flex justify-center items-center py-20'>
        <Spinner />
      </div>
    );
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // json payload to send to API
      const payload = {
        title: data.title,
        userType: data.userType,
        description: data.description,
        access: data.accesses ?? [],
      };

      if (isEdit) {
        await roleService.updateRole(slug, payload);
      } else {
        await roleService.createRole(payload);
      }

      toast.success('Success', {
        description: isEdit
          ? 'Role updated successfully!'
          : 'Role created successfully!',
      });

      setTimeout(() => {
        setIsSubmitting(false);
        router.push('/admin/roles');
      }, 2000);
    } catch (err) {
      setIsSubmitting(false);
      let message = 'An error occurred. Please try again.';

      if (err.response?.data?.message) {
        message = err.response.data.message;
      }

      const toastMessage = `Failed to ${isEdit ? 'update' : 'create'} role.`;

      toast.error(toastMessage, {
        description: message,
        position: 'top-right',
      });
    }
  };

  const resetForm = async () => {
    if (!isEdit) {
      reset({
        title: '',
        userType: '',
        description: '',
        accesses: [],
      });
    } else {
      setIsFetching(true);

      try {
        const res = await roleService.getRole(slug);
        const role = res.data;
        reset({
          title: role.title ?? '',
          userType: role.userType ?? '',
          description: role.description ?? '',
          accesses: role.access ?? [],
        });
      } catch (error) {
        toast.error('Error', {
          description: 'Failed to reset form.',
        });
      } finally {
        setIsFetching(false);
      }
    }
  };

  const handleToggleAll = () => {
    const current = getValues('accesses') ?? [];
    const allSelected = allAccessValues.every((v) => current.includes(v));
    setValue('accesses', allSelected ? [] : allAccessValues);
  };

  const handleResetAccess = () => {
    setValue('accesses', []);
  };

  return (
    <div className='bg-white dark:bg-slate-800 p-4 rounded-lg'>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          <div className='space-y-1.5'>
            <Label htmlFor='title'>
              Role Name
              <span className='text-red-500 ml-0.5'>*</span>
            </Label>
            <Input
              id='name'
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
                    {USER_TYPES.map((type) => (
                      <SelectItem
                        key={type.value}
                        value={String(type.value)}
                        className='cursor-pointer'
                      >
                        {type.label}
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

          <div className='space-y-1.5 col-span-2'>
            <Label htmlFor='description'>
              Description
              <span className='text-red-500 ml-0.5'>*</span>
            </Label>
            <Textarea
              id='description'
              type='text'
              placeholder='Enter Description'
              aria-invalid={!!errors.description}
              {...register('description')}
            />
            <p className='text-xs text-red-500 min-h-2'>
              {errors.description?.message}
            </p>
          </div>

          <div className='space-y-1.5 col-span-2'>
            <h6 className='text-sm font-medium'>Access Rights</h6>

            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='mb-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700'
                onClick={handleToggleAll}
              >
                {accessBtnLabel}
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
              name='accesses'
              control={control}
              render={({ field }) => (
                <div className='space-y-3'>
                  {accessList.map((module, index) => {
                    const moduleValues = module.sub_module.flatMap((s) =>
                      s.activities.map((a) => a.value),
                    );
                    const checkedCount = moduleValues.filter((v) =>
                      (field.value ?? []).includes(v),
                    ).length;
                    const isModuleAll =
                      checkedCount === moduleValues.length &&
                      moduleValues.length > 0;
                    const isModuleIndeterminate =
                      checkedCount > 0 && checkedCount < moduleValues.length;

                    return (
                      <div
                        key={module.module}
                        className={`border border-slate-200 dark:border-slate-700 rounded-lg overflow- ${index !== 0 ? 'mt-5' : ''}`}
                      >
                        {/* Module header */}
                        <div className='flex items-center gap-2.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-700'>
                          <Checkbox
                            id={`module-${module.module}`}
                            checked={isModuleAll}
                            indeterminate={isModuleIndeterminate}
                            onCheckedChange={(checked) => {
                              const current = field.value ?? [];
                              const updated = checked
                                ? [...new Set([...current, ...moduleValues])]
                                : current.filter(
                                    (v) => !moduleValues.includes(v),
                                  );
                              field.onChange(updated);
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
                            const subValues = sub.activities.map(
                              (a) => a.value,
                            );
                            const subCheckedCount = subValues.filter((v) =>
                              (field.value ?? []).includes(v),
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
                                className='bg-white dark:bg-slate-800 p-3 space-y-2 '
                              >
                                {/* Sub-module header */}
                                <div className='flex items-center gap-2'>
                                  <Checkbox
                                    id={`sub-${sub.module}`}
                                    checked={isSubAll}
                                    indeterminate={isSubIndeterminate}
                                    onCheckedChange={(checked) => {
                                      const current = field.value ?? [];
                                      const updated = checked
                                        ? [
                                            ...new Set([
                                              ...current,
                                              ...subValues,
                                            ]),
                                          ]
                                        : current.filter(
                                            (v) => !subValues.includes(v),
                                          );
                                      field.onChange(updated);
                                    }}
                                  />
                                  <Label
                                    htmlFor={`sub-${sub.module}`}
                                    className='text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 cursor-pointer select-none'
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
                                      checked={(field.value ?? []).includes(
                                        activity.value,
                                      )}
                                      onCheckedChange={(checked) => {
                                        const current = field.value ?? [];
                                        const updated = checked
                                          ? [...current, activity.value]
                                          : current.filter(
                                              (v) => v !== activity.value,
                                            );
                                        field.onChange(updated);
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
              'Create Role'
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
            onClick={() => router.push('/admin/roles')}
          >
            Back
          </Button>
        </div>
      </form>
    </div>
  );
}
