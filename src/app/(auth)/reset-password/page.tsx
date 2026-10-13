import ResetPasswordForm from '@/components/forms/ResetPasswordForm';

// Opened from the reset email: PASSWORD_RESET_URL?token=… on the backend points here.
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { token } = await searchParams;

  return (
    <main>
      <ResetPasswordForm token={typeof token === 'string' && token ? token : null} />
    </main>
  );
}
