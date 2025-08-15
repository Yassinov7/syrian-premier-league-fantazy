import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';

export default function ProtectedRoute({ roleRequired, children }) {
  const { user } = useUser();
  const router = useRouter();
  
  if (!user) {
    router.push('/login');
    return null;
  }

  const userRole = user?.user_metadata?.role || 'user';
  
  if (roleRequired && userRole !== roleRequired) {
    router.push('/unauthorized');
    return null;
  }

  return children;
}