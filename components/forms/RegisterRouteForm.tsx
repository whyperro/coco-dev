'use client';

import { useCreateRoute, useGetRoute, useUpdateRoute } from "@/actions/routes/actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Route } from "@/types";
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from "react";
import { useForm } from 'react-hook-form';
import { toast } from "sonner";
import { z } from 'zod';
import { Button } from '../ui/button';
import { Checkbox } from "../ui/checkbox";
import { Input } from '../ui/input';

const formSchema = z.object({
  origin: z.string({
    message: "Debe seleccionar un origen."
  }),
  destiny: z.string({
    message: "Debe seleccionar un destino."
  }),
  scale: z.string().optional(),
  route_type: z.string({
    message: "Debe seleccionar un tipo de ruta."
  }),
});

interface FormProps {
  onClose: () => void;
  isEditing?: boolean;
  id?: string,
}

const RegisterRouteForm = ({ id, onClose, isEditing = false }: FormProps) => {
  const [initialValues, setInitialValues] = useState<Route | null>(null);
  const [checked, setChecked] = useState(false)
  const { updateRoute } = useUpdateRoute();
  const { createRoute } = useCreateRoute();
  const { data } = useGetRoute(id ?? null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      origin: initialValues?.origin ?? "",
      destiny: initialValues?.destiny ?? "",
      route_type: initialValues?.route_type ?? "",
      scale: initialValues?.scale ?? undefined,
    },
  });

  console.log(form.getValues())
  useEffect(() => {
    if (data) {
      setInitialValues(data)
      form.setValue("origin", data.origin)
      form.setValue("destiny", data.destiny)
      form.setValue("scale", data.scale ?? undefined)
      form.setValue("route_type", data.route_type)
    }
  }, [data, form])



  const onSubmitRoute = async (values: z.infer<typeof formSchema>) => {
    console.log("clck")
    try {
      if (isEditing && initialValues) {
        await updateRoute.mutateAsync({
          id: initialValues.id,
          origin: values.origin,
          destiny: values.destiny,
          route_type: values.route_type,
          scale: values.scale ?? undefined,
        });
      } else {
        await createRoute.mutateAsync(values);
      }
      form.reset(); // Reset form after successful submission
      onClose();
    } catch (error) {
      console.error(error); // Log the error for debugging
      toast.error("Error al guardar le vuelo", {
        description: "Ocurrió un error, por favor intenta nuevamente.",
      });
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitRoute)} className="mx-auto grid gap-6">
        <div className="grid gap-4">
          <div className="flex flex-col gap-4 w-full justify-center">
            <FormField
              control={form.control}
              name="route_type"
              render={({ field }) => (
                <FormItem className="w-auto">
                  <FormLabel>Tipo de Ruta</FormLabel>
                  <Select disabled={isEditing} onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un tipo de ruta..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NACIONAL">Nacional</SelectItem>
                      <SelectItem value="INTERNACIONAL">Internacional</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center space-x-2">
              <Checkbox onCheckedChange={() => setChecked(!checked)} id="terms1" />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms1"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  ¿Tiene escalas?
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem className="w-auto">
                  <FormLabel>Origen</FormLabel>
                  <FormControl>
                    <Input placeholder="LCH" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {
              checked && <FormField
                control={form.control}
                name="scale"
                render={({ field }) => (
                  <FormItem className="w-auto">
                    <FormLabel>Escala(s)</FormLabel>
                    <FormControl>
                      <Input placeholder="CCS" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            }
            <FormField
              control={form.control}
              name="destiny"
              render={({ field }) => (
                <FormItem className="w-auto">
                  <FormLabel>Destino</FormLabel>
                  <FormControl>
                    <Input placeholder="MCBO" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={createRoute.isPending || updateRoute.isPending} type="submit" className="w-full">
            {createRoute.isPending || updateRoute.isPending ? <Loader2 className='size-4 animate-spin' /> : <p>{isEditing ? "Actualizar" : "Registrar"}</p>}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default RegisterRouteForm;
