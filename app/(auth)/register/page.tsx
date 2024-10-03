import RegisterForm from '@/components/forms/RegisterForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import db from '@/lib/db'

const Register = async () => {

  const branches = await db.branch.findMany()
  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="hidden bg-muted lg:block h-screen">
        <Image
          src="/beach-home.avif"
          alt="Image"
          width="1920"
          height="1080"
          className="h-screen w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <div className="flex items-center justify-center py-12">
        <RegisterForm branches={branches} />
      </div>
    </div>
  )
}

export default Register
