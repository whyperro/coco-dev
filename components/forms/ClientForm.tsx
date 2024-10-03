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
});

interface FormProps {
  onClose: () => void;
  isEditing?: boolean;
  id?: string,
}

const CreateClientForm = ({id, onClose, isEditing = false }: FormProps) => {
  const [initialValues, setInitialValues] = useState<Client | null>(null);
  const { updateClient } = useUpdateClient();
  const {createClient} = useCreateClient();
  const {data} = useGetClient(id ?? null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || { // Set default values for editing
      first_name: "",
      last_name: "",
      dni: "", // Ensure this is an empty string instead of null
    },
  });

  useEffect(() => {
    if(data) {
      setInitialValues(data)
      form.setValue("first_name", data.first_name)
      form.setValue("last_name", data.last_name )
      form.setValue("dni", data.dni )
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
        });
      } else {
        await createClient.mutateAsync({
          first_name: values.first_name.charAt(0).toUpperCase() + values.first_name.slice(1),
          last_name: values.last_name.charAt(0).toUpperCase() + values.last_name.slice(1),
          dni: values.dni,
        });
      }
// Reset form after successful submission
      form.reset(); 
      onClose();
    } catch (error) {
      console.error(error); // Log the error for debugging
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
          <Button disabled={createClient.isPending || updateClient.isPending} type="submit" className="w-full">
            {createClient.isPending || updateClient.isPending ? <Loader2 className='size-4 animate-spin' /> : <p>{isEditing ? "Actualizar" : "Registrar"}</p>}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default CreateClientForm;
