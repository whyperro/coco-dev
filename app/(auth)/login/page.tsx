'use client'

import LoginForm from '@/components/forms/LoginForm'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const Login = () => {
 const {data: session} = useSession()
 const router = useRouter();

 if(session){
  session.user.user_role === 'ADMIN' || session.user.user_role === 'AUDITOR'? router.push('/dashboard') : router.push("/estadisticas")
 }

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <LoginForm />
      </div>
      <div className="hidden bg-muted lg:block h-screen">
        <Image
          src="/beach-home.avif"
          alt="Image"
          width="1920"
          height="1080"
          className="h-screen w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}

export default Login
