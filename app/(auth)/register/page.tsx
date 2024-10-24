import RegisterForm from '@/components/forms/RegisterForm'
import Image from 'next/image'

const Register = () => {
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
        <RegisterForm />
      </div>
    </div>
  )
}

export default Register
