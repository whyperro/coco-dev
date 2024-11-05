'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import LoadingPage from '../misc/LoadingPage';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirige al usuario si el rol no coincide y se ha cargado la sesión
    if (status === 'authenticated') {
      const userRole = session?.user.user_role;
      if (roles && !roles.some(role => userRole?.includes(role))) {
        router.push('/not-authorized');
      }
    }
  }, [status, session, roles, router]);

  if (status === 'loading') {
    return <LoadingPage />;
  }

  if (status === 'authenticated' && roles && !roles.some(role => session?.user.user_role?.includes(role))) {
    // Mientras se redirige, evita renderizar el contenido
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
