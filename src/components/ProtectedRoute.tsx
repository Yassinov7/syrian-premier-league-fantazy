import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useEffect, useState, ReactNode } from 'react';

interface ProtectedRouteProps {
  roleRequired?: string;
  children: ReactNode;
}

export default function ProtectedRoute({ roleRequired, children }: ProtectedRouteProps) {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Set loading to false after component mounts
    setIsLoading(false);
  }, []);

  // Show loading state during SSR/static generation
  if (typeof window === 'undefined' || isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    router.push('/login');
    return null;
  }

  const userRole = user?.user_metadata?.role || 'user';
  
  if (roleRequired && userRole !== roleRequired) {
    router.push('/unauthorized');
    return null;
  }

  return <>{children}</>;
}
