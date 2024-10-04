'use client'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import LoadingPage from '../misc/LoadingPage';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { data: session, status } = useSession();

  const router = useRouter();

  if (status === 'loading') {
    return <LoadingPage />
  }

  const userRole = session?.user.user_role

  if (roles && !roles.some(role => userRole!.includes(role))) {
    router.push('/not-authorized');
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
