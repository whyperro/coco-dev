'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { signIn, useSession } from 'next-auth/react'
import { toast } from "sonner";

const formSchema = z.object({

  username: z.string({
    message: "Debe ingresar un nombre de usuario."
  }),
  password: z.string().min(5, {
    message: "Debe ingresar una contraseña."
  }),
})

const LoginForm
  = () => {

    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        username: "",
        password: "",
      },
    })

    const { data: session } = useSession();

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
      setIsLoading(true);
      const res = await signIn("credentials", {
        username: values.username,
        password: values.password,
        redirect: false,
      })
      if (res?.error) {
        setIsLoading(false)
        toast.error("Ooops!", {
          description: `${res.error}`,
          position: "bottom-left"
        }
        )
      } else {
        setIsLoading(false)
        if (session?.user.user_role === 'ADMIN' || session?.user.user_role === "AUDITOR") {
          router.push('/dashboard')
        } else {
          router.push("/estadisticas")
        }
      }
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto grid w-[350px] gap-6 shadow-lg border-black border p-12 rounded-md">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Inicio de Sesión</h1>
            <p className="text-balance text-muted-foreground  italic">
              ¡Inicie sesión en su cuenta personal!
            </p>
          </div>
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder="*******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isLoading} type="submit" className="w-full">
              {
                isLoading ? <Loader2 className='size-4 animate-spin' /> : <p>Iniciar Sesión</p>
              }
            </Button>
          </div>
        </form>
      </Form>
    )
  }

export default LoginForm
