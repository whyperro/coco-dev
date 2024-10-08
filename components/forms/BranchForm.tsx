'use client';

import { useCreateBranch, useGetBranch, useUpdateBranch } from "@/actions/branches/actions"; // Import create action
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from "sonner";
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useEffect, useState } from "react";
import { Branch } from "@/types";

const formSchema = z.object({
  location_name: z.string({
    required_error: "Nombre requerido",
  }),
  fiscal_address: z.string().optional(),
});

interface FormProps {
  onClose: () => void;
  isEditing?: boolean;
  id?: string,
}

const CreateBranchForm = ({ id, onClose, isEditing = false }: FormProps) => {
  const [initialValues, setInitialValues] = useState<Branch | null>(null);
  const { updateBranch } = useUpdateBranch();
  const { createBranch } = useCreateBranch();
  const { data } = useGetBranch(id ?? null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location_name: initialValues?.location_name ?? "", // Use empty string if undefined
      fiscal_address: initialValues?.fiscal_address ?? undefined, // Convert null to undefined
    },
  });

  useEffect(() => {
    if (data) {
      setInitialValues(data);
      form.setValue("location_name", data.location_name);
      form.setValue("fiscal_address", data.fiscal_address ?? undefined); // Convert null to undefined
    }
  }, [data, form]);





  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload = {
        location_name: values.location_name,
        fiscal_address: values.fiscal_address ? values.fiscal_address : null, // Convert empty string to null
      };

      if (isEditing && initialValues) {
        await updateBranch.mutateAsync({
          id: initialValues.id,
          ...payload,
        });
      } else {
        await createBranch.mutateAsync(payload);
      }
      form.reset(); // Reset form after successful submission
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
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">{isEditing ? "Actualizar Sucursal" : "Crear Sucursal"}</h1>
          <p className="text-muted-foreground italic">
            Ingrese los datos para {isEditing ? "actualizar" : "el registro de"} una sucursal
          </p>
        </div>
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="location_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de Sucursal</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fiscal_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación Fiscal</FormLabel>
                <FormControl>
                  <Input placeholder="Ubicación" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={createBranch.isPending || updateBranch.isPending} type="submit" className="w-full">
            {createBranch.isPending || updateBranch.isPending ? <Loader2 className='size-4 animate-spin' /> : <p>{isEditing ? "Actualizar" : "Registrar"}</p>}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default CreateBranchForm;
