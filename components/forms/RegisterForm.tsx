'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Branch, User } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { CreateBranchDialog } from "../dialogs/CreateBranchDialog";
import { useGetBranches } from "@/actions/branches/actions";
import { useQueryClient } from "@tanstack/react-query";
import { useGetUser, useGetUsers, useUpdateUser } from "@/actions/users/actions";
import { useSession } from "next-auth/react";


const formSchema = z.object({
  first_name: z.string({
    message: "Debe ingresar su primer nombre"
  }),
  last_name: z.string({
    message: "Debe ingresar su apellido"
  }),
  username: z.string().min(2).max(50),
  password: z.string().min(5, {
    message: "La contraseña debe tener al menos 5 carácteres."
  }),
  user_role: z.string({
    message: "Debe seleccionar un tipo de usuario"
  }),
  branchId: z.string(
    {
      message: "Poner sucursal"
    }
  ).optional()
})

interface FormProps {
  onClose?: () => void;
  isEditing?: boolean;
  initialValues?:User
}

const RegisterForm  = ({ onClose, initialValues,isEditing = false }: FormProps) => {

  const [isLoading, setIsLoading] = useState(false)

  const queryClient = useQueryClient()
  
  const router = useRouter();
  const {data: session} = useSession();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: initialValues?.first_name ?? "",
      last_name: initialValues?.last_name ?? "",
      username: initialValues?.username ?? "",
      user_role: initialValues?.user_role ??"",
      branchId: initialValues?.branchId ?? undefined,
      password: "",
    },
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const togglePasswordChange = () => {
    setIsChangingPassword(!isChangingPassword);  // Alternar entre cambiar y no cambiar la contraseña
  };
  const { data: branches, loading: branchesLoading } = useGetBranches();

  const { updateUser } = useUpdateUser();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true)
      if (isEditing && initialValues) {
        await updateUser.mutateAsync({
          id: initialValues.id,
          first_name: values.first_name,
          last_name: values.last_name,
          password: values.password,
          username: values.username,
          user_role: values.user_role,
          isChangingPassword:isChangingPassword,
          updated_by:session?.user.username ?? "",
          branchId: values.branchId ?? undefined, 
        });
      }
      else{
        const res = await axios.post('/api/auth/register', {
          ...values,
          branchId:values.branchId ?? null,
        });
        if (res.status == 200) {
          toast.success("¡Creado!", {
            description: `El usuario ${values.username} ha sido creado correctamente.`
          })
          router.push('/login')
          queryClient.invalidateQueries({ queryKey: ["users"] })
        }
      }
    
    } catch (error: any) {
      toast.error("Oops!", {
        description: `No se ha podido crear el usuario: ${error.response.data.message}`
      })
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">Registro</h1>
          <p className="text-balance text-muted-foreground  italic">
            Ingrese los datos para el registro de un usuario
          </p>
        </div>
        <div className="grid gap-4">
          <div className="flex items-center gap-2">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Maria" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Lopez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
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
          {isEditing ? (
        // Si está en modo de edición, mostramos el campo de contraseña editable con la opción de cambiarla
            <div>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      {isChangingPassword ? (
                        // Si estamos en el modo de edición de la contraseña, mostrar el campo de input
                        <Input type="password" placeholder="Nueva contraseña" {...field} />
                      )
                      : <Input type="password" placeholder="Ingrese contraseña" {...field} />
                      }
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Enlace para alternar entre cambiar la contraseña */}
              <div className="mt-4 text-center text-sm">
                {isChangingPassword ? (
                  <Link href="#" className="underline" onClick={togglePasswordChange}>
                    Cancelar
                  </Link>
                ) : (
                  <span>
                    ¿Se le olvido la contraseña?{" "}
                    <Link href="#" className="underline" onClick={togglePasswordChange}>
                      Cambiar contraseña
                    </Link>
                  </span>
                )}
              </div>
            </div>
          ) :  
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
        }
          <FormField
            control={form.control}
            name="user_role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol del Usuario</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un rol para el usuario..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SELLER">Vendedor</SelectItem>
                    <SelectItem value="AUDITOR">Auditor</SelectItem>
                    <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                    <SelectItem value="SUPERADMIN">Superadmin</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {
            form.watch('user_role') != "AUDITOR" && form.watch('user_role') != "SUPERADMIN" && (
              <FormField
            control={form.control}
            name="branchId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sucursal del Usuario</FormLabel>
                <Select disabled={branchesLoading} onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una sucursal para el usuario..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <CreateBranchDialog />
                    {
                      branches?.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {
                            branch.location_name
                          }
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
            )
          }

          <Button disabled={isLoading} type="submit" className="w-full">
            {
              isLoading ? <Loader2 className='size-4 animate-spin' /> : isEditing === false ? <p>Registrar</p> : <p>Actualizar</p>
            }
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          ¿Ya tiene una cuenta?{" "}
          <Link href="#" className="underline">
            Iniciar sesión
          </Link>
        </div>
      </form>
    </Form>
  )
}

export default RegisterForm
