'use client';

import { Button } from '@/components/ui/button';
import { Chrome, Facebook } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SocialLoginButtonProps {
  provider: 'google' | 'facebook';
  variant?: 'default' | 'outline';
  className?: string;
}

export function SocialLoginButton({ 
  provider, 
  variant = 'outline',
  className 
}: SocialLoginButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/api/auth/${provider}`);
  };

  const providerConfig = {
    google: {
      label: 'Continue with Google',
      icon: Chrome,
      color: 'hover:bg-red-50 dark:hover:bg-red-950/20',
    },
    facebook: {
      label: 'Continue with Facebook',
      icon: Facebook,
      color: 'hover:bg-blue-50 dark:hover:bg-blue-950/20',
    },
  };

  const config = providerConfig[provider];
  const Icon = config.icon;

  return (
    <Button
      type="button"
      variant={variant}
      className={`w-full ${config.color} ${className || ''}`}
      onClick={handleClick}
    >
      <Icon className="mr-2 h-4 w-4" />
      {config.label}
    </Button>
  );
}
