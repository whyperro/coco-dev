import LoginForm from '@/components/forms/LoginForm'
import RegisterForm from '@/components/forms/RegisterForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Login = () => {
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
