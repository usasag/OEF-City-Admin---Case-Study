import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-forest-50 to-surface dark:from-[#0c1c2a] dark:via-[#0f1f17] dark:to-[#0b1410]">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: 'bg-forest-600 hover:bg-forest-700',
            card: 'shadow-md',
          },
          variables: {
            colorPrimary: '#16a34a',
          },
        }}
      />
    </div>
  );
}
