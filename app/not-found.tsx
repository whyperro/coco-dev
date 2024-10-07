'use client'

import { Button } from '@/components/ui/button'
import { MapPinned, Plane } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function NotFound() {
  const { data: session } = useSession()
  return (
    <div className='h-dvh w-dvw flex flex-col items-center justify-center'>
      <div className='flex flex-col justify-center items-center max-w-xl gap-y-4'>
        <MapPinned className='size-[110px] text-primary' />
        <h1 className='font-bold text-7xl text-center text-primary'>¡No Encontrado!</h1>
        <p className='text-lg text-muted-foreground text-center'>Lo sentimos, pero la página que estabas buscando no pudo ser localizada. Es posible que se haya movido o ya no exista.</p>
        <Link href={session?.user.user_role === 'ADMIN' || session?.user.user_role === 'AUDITOR' ? "/dashboard" : "/estadisticas"}>
          <Button className='bg-primary text-white hover:bg-transparent hover:text-black hover:border hover:border-black'>Volver</Button>
        </Link>
      </div>
    </div>
  )
}
