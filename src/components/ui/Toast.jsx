'use client';

import { useEffect } from 'react';
import { toast as sonnerToast } from 'sonner';

// Pre-defined style per type — override via classNames option if needed
const VARIANTS = {
  success: {
    classNames: {
      toast: '!bg-green-500 !border-green-600 !text-white',
      title: '!text-white',
      description: '!text-green-100',
      icon: '!text-white',
      closeButton: '!bg-green-600 !border-green-400 !text-white',
      actionButton: '!bg-white !text-green-600',
    },
  },
  error: {
    classNames: {
      toast: '!bg-red-500 !border-red-600 !text-white',
      title: '!text-white',
      description: '!text-red-100',
      icon: '!text-white',
      closeButton: '!bg-red-600 !border-red-400 !text-white',
      actionButton: '!bg-white !text-red-600',
    },
  },
  warning: {
    classNames: {
      toast: '!bg-yellow-500 !border-yellow-600 !text-white',
      title: '!text-white',
      description: '!text-yellow-100',
      icon: '!text-white',
      closeButton: '!bg-yellow-600 !border-yellow-400 !text-white',
      actionButton: '!bg-white !text-yellow-600',
    },
  },
  info: {
    classNames: {
      toast: '!bg-blue-500 !border-blue-600 !text-white',
      title: '!text-white',
      description: '!text-blue-100',
      icon: '!text-white',
      closeButton: '!bg-blue-600 !border-blue-400 !text-white',
      actionButton: '!bg-white !text-blue-600',
    },
  },
  loading: {
    classNames: {
      toast: '!bg-zinc-800 !border-zinc-700 !text-white',
      title: '!text-white',
      description: '!text-zinc-300',
      icon: '!text-white',
    },
  },
};

function buildOptions(type, options = {}) {
  const variant = VARIANTS[type];
  if (!variant) return options;

  const { classNames: userClassNames, ...rest } = options;
  return {
    ...variant,
    classNames: { ...variant.classNames, ...userClassNames },
    ...rest,
  };
}

/**
 * Styled toast utility — each type ships with its own color scheme.
 * Options are merged with the variant defaults; pass `classNames` to override specific parts.
 *
 * @example
 * toast.success("Saved!")
 * toast.error("Something went wrong", { description: "Please retry." })
 * toast.promise(fetchData(), { loading: "Fetching...", success: "Done!", error: "Failed" })
 */
const toast = Object.assign(
  (message, options) => sonnerToast(message, options),
  {
    success: (message, options) =>
      sonnerToast.success(
        message,
        buildOptions('success', {
          ...options,
          position: options.position || 'top-right',
          duration: options.duration || 5000,
        }),
      ),
    error: (message, options) =>
      sonnerToast.error(
        message,
        buildOptions('error', {
          ...options,
          position: options.position || 'top-right',
          duration: options.duration || 5000,
        }),
      ),
    warning: (message, options) =>
      sonnerToast.warning(
        message,
        buildOptions('warning', {
          ...options,
          position: options.position || 'top-right',
          duration: options.duration || 5000,
        }),
      ),
    info: (message, options) =>
      sonnerToast.info(
        message,
        buildOptions('info', {
          ...options,
          position: options.position || 'top-right',
          duration: options.duration || 5000,
        }),
      ),
    loading: (message, options) =>
      sonnerToast.loading(
        message,
        buildOptions('loading', {
          ...options,
          position: options.position || 'top-right',
          duration: options.duration || 5000,
        }),
      ),
    promise: (promise, options) =>
      sonnerToast.promise(promise, {
        ...options,
        position: options.position || 'top-right',
        duration: options.duration || 5000,
      }),
    dismiss: (id) => sonnerToast.dismiss(id),
  },
);

/**
 * Declarative Toast — fires a styled toast on mount (and re-fires on prop change).
 *
 * @example
 * <Toast type="success" message="User saved!" position="top-right" />
 * <Toast type="error"   message="Failed!"     description="Try again." />
 */
const Toast = ({
  type = 'default',
  message,
  description,
  position,
  duration,
  action,
}) => {
  useEffect(() => {
    if (!message) return;

    const options = buildOptions(type, {
      ...(description && { description }),
      ...(position && { position }),
      ...(duration && { duration }),
      ...(action && { action }),
    });

    const fn = VARIANTS[type] ? sonnerToast[type] : sonnerToast;
    fn(message, options);
  }, [type, message, description, position, duration]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

export { Toast, toast };
