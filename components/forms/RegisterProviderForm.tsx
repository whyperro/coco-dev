'use client';

import { useCreateProvider, useGetProvider, useUpdateProvider } from "@/actions/providers/actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Provider } from "@/types";
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from "react";
import { useForm } from 'react-hook-form';
import { toast } from "sonner";
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const formSchema = z.object({
  provider_number: z.string(),
  name: z.string(),
  provider_type: z.string(),
});

interface FormProps {
  onClose: () => void;
  isEditing?: boolean;
  id?: string,
}

const RegisterProviderForm = ({ id, onClose, isEditing = false }: FormProps) => {
  const [initialValues, setInitialValues] = useState<Provider | null>(null);
  const { updateProvider } = useUpdateProvider();
  const { createProvider } = useCreateProvider();
  const { data } = useGetProvider(id ?? null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { // Set default values for editing
        provider_number: "",
        name: "",
        provider_type: "",// Ensure this is an empty string instead of null
    },
  });

  useEffect(() => {
    if (data && isEditing) {
      setInitialValues(data)
      form.setValue("provider_number", data.provider_number)
      form.setValue("name", data.name)
      form.setValue("provider_type", data.provider_type)
    } 
  }, [data])



  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditing && initialValues) {
        await updateProvider.mutateAsync({
          id: initialValues.id,
          provider_number: values.provider_number.toUpperCase(),
          name: values.name.charAt(0).toUpperCase() + values.name.slice(1),
          provider_type: values.provider_type,
        });
      } else {
        await createProvider.mutateAsync({
          ...values,
          provider_number: values.provider_number.toUpperCase(),
          name: values.name.charAt(0).toUpperCase() + values.name.slice(1)
        });
      }
      form.reset(); // Reset form after successful submission
      // setInitialValues(null)
      // onClose();
    } catch (error) {
      console.error(error); // Log the error for debugging
      toast.error("Error al guardar la proveedor", {
        description: "Ocurrió un error, por favor intenta nuevamente.",
      });
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto grid gap-6">
        <div className="grid gap-4">
          <div className="flex gap-2 w-full justify-center">
            <FormField
              control={form.control}
              name="provider_type"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Tipo de Proveedor</FormLabel>
                  <Select disabled={isEditing} onValueChange={field.onChange} value={initialValues ? initialValues.provider_type : field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione Tipo Proveedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AEROLINEA">Aerolinea</SelectItem>
                      <SelectItem value="AGENCIA_TERCERO">Agencia Tercero</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="provider_number"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Nro. de Proveedor</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-center items-center">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-auto">
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del proveedor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* {
              form.watch("flight_type") === 'INTERNACIONAL' && <>
                <FormField
                  control={form.control}
                  name="scale"
                  render={({ field }) => (
                    <FormItem className="w-auto">
                      <FormLabel>Escala(s)</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /></>
            } */}
         
          </div>
          <Button disabled={createProvider.isPending || updateProvider.isPending} type="submit" className="w-full">
            {createProvider.isPending || updateProvider.isPending ? <Loader2 className='size-4 animate-spin' /> : <p>{isEditing ? "Actualizar" : "Registrar"}</p>}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default RegisterProviderForm;
