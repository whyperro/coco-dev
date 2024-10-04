import { Loader2 } from 'lucide-react'
import React from 'react'

const LoadingPage = () => {
  return (
    <div className='grid place-content-center h-dvh w-dvw'>
      <Loader2 className='size-32 animate-spin' />
    </div>
  )
}

export default LoadingPage
