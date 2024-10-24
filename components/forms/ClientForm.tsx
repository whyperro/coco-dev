'use client';

import { useCreateClient, useGetClient, useUpdateClient } from "@/actions/clients/actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Client } from "@/types";
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from "react";
import { useForm } from 'react-hook-form';
import { toast } from "sonner";
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useSession } from "next-auth/react";

const formSchema = z.object({
  first_name: z.string({
    required_error: "Nombre requerido",
    
  }),
  last_name: z.string({
    required_error: "Apellido requerido",
  }),
  dni: z.string({
    required_error: "Identificacion requerido (V, E, J)",
  }),
  email: z.string().optional(),
  phone_number: z.string().optional(),
  
});

interface FormProps {
  onClose: () => void;
  isEditing?: boolean;
  id?: string,
}

const CreateClientForm = ({id, onClose, isEditing = false }: FormProps) => {
  const [initialValues, setInitialValues] = useState<Client | null>(null);
  const {data: session} = useSession()
  const { updateClient } = useUpdateClient();
  const {createClient} = useCreateClient();
  const {data} = useGetClient(id ?? null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      first_name: initialValues?.first_name ?? "",
      last_name: initialValues?.last_name ?? "",
      dni: initialValues?.dni ?? "", 
      email: initialValues?.email ?? undefined,
      phone_number: initialValues?.phone_number ?? undefined,
    },
  });

  useEffect(() => {
    if(data) {
      setInitialValues(data)
      form.setValue("first_name", data.first_name)
      form.setValue("last_name", data.last_name )
      form.setValue("dni", data.dni )
      form.setValue("email", data.email ?? "" )
      form.setValue("phone_number", data.phone_number ?? "" )
    }
  }, [data, form])



  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditing && initialValues) {
        await updateClient.mutateAsync({
          id: initialValues.id,
          first_name: values.first_name.charAt(0).toUpperCase() + values.first_name.slice(1),
          last_name: values.last_name.charAt(0).toUpperCase() + values.last_name.slice(1),
          dni: values.dni,
          email: values?.email ? values.email : null,
          phone_number: values?.phone_number ? values.phone_number : null,
          updated_by: session!.user.username,
        });
      } else {
        await createClient.mutateAsync({
          first_name: values.first_name.charAt(0).toUpperCase() + values.first_name.slice(1),
          last_name: values.last_name.charAt(0).toUpperCase() + values.last_name.slice(1),
          dni: values.dni,
          email: values?.email ? values.email : null,
          phone_number: values?.phone_number ? values.phone_number : null,
        });
      }
        
      form.reset(); 
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar la sucursal", {
        description: "Ocurrió un error, por favor intenta nuevamente.",
      });
    }
  };
  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre" {...field} />
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
                  <Input placeholder="Apellido" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            <FormField
            control={form.control}
            name="dni"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identificacion</FormLabel>
                <FormControl>
                  <Input placeholder="Identificacion (V, E, J)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center gap-2">
          
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Correo electronico" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        
          <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numero de Telefono</FormLabel>
              <FormControl>
                <Input placeholder="424123456" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          />
          </div>
          <Button disabled={createClient.isPending || updateClient.isPending} type="submit" className="w-full">
            {createClient.isPending || updateClient.isPending ? <Loader2 className='size-4 animate-spin' /> : <p>{isEditing ? "Actualizar" : "Registrar"}</p>}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default CreateClientForm;
