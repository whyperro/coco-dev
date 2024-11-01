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
import { CirclePlus, Loader2, MinusCircle, PlusCircle } from 'lucide-react';
import { useEffect, useState } from "react";
import { useForm } from 'react-hook-form';
import { toast } from "sonner";
import { z } from 'zod';
import { Button } from '../ui/button';
import { Checkbox } from "../ui/checkbox";
import { Input } from '../ui/input';
import { useDebounce } from "@uidotdev/usehooks";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";

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
  quantity: z.number().optional()
});

interface FormProps {
  onClose: () => void;
  isEditing?: boolean;
  id?: string,
}

type ScaleField = {
  id: number;
  value: string;
};

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
      route_type: initialValues?.route_type ?? undefined,
      scale: initialValues?.scale ?? undefined,

    },
  });
  const { control } = useForm();


  // Estado para almacenar los campos de escala
  const [scaleFields, setScaleFields] = useState<ScaleField[]>([{
    id: Date.now(), value: ""
  }]);

  const [debouncedScale, setDebouncedScale] = useState('');

  useEffect(() => {
    if (data) {
      setInitialValues(data)
      form.setValue("origin", data.origin)
      form.setValue("destiny", data.destiny)
      form.setValue("scale", data.scale ?? undefined)
      form.setValue("route_type", data.route_type)

    }
  }, [data, form])

  const onAddInput = () => {
    setScaleFields([...scaleFields, { id: Date.now(), value: '' }]);
  };

  const onRemoveInput = (index: number) => {
    if (scaleFields.length > 1) { // Prevent removing the last field
      setScaleFields((prevFields) => prevFields.filter((_, i) => i !== index));
    }
  };

  const handleInputChange = (id: number, value: string) => {
    setScaleFields((prevFields) => {
      const updatedFields = prevFields.map((field) =>
        field.id === id ? { ...field, value } : field
      );
      // Update input value for debouncing
      setDebouncedScale(value);

      // Update form value immediately if needed
      const scaleValues = updatedFields.map(field => field.value).filter(Boolean);
      form.setValue("scale", scaleValues.join(', '));

      return updatedFields; // Return updated fields
    });
  };

  useEffect(() => {
    if (debouncedScale) {
      console.log('Debounced scale value:', debouncedScale);
      // Perform any actions based on the debounced value here
    }
  }, [debouncedScale]);


  const onSubmitRoute = async (values: z.infer<typeof formSchema>) => {
    console.log(values)
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

          <div className={cn("flex gap-2 items-center", checked ? "flex-col" : "")}>
            <div className="flex gap-2">
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
            {checked &&
              <>
                <div className="flex gap-2 items-center p-2">
                  <MinusCircle
                    className="size-4 cursor-pointer hover:scale-125 transition-all ease-in duration-100"
                    onClick={() => onRemoveInput(scaleFields.length - 1)} // Get the last field's index
                  />
                  <Label>Escala(s)</Label>
                  <PlusCircle className="size-4 cursor-pointer hover:scale-125 transition-all ease-in duration-100" onClick={() => onAddInput()} />
                </div>
                <div className={cn("grid grid-cols-1 gap-2", scaleFields.length > 1 ? "grid-cols-2" : "")}>
                  {
                    scaleFields.map((field) => (
                      <FormField
                        key={field.id}
                        control={control}
                        name={`scale-${field.id}`} // Nombre único para cada campo
                        render={({ field: inputField }) => (
                          <FormItem className="w-auto">
                            <FormControl>
                              <Input
                                placeholder="CCS"
                                {...inputField}
                                onChange={(e) => {
                                  inputField.onChange(e); // Mantiene la funcionalidad de react-hook-form
                                  handleInputChange(field.id, e.target.value); // Maneja el cambio del input
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))
                  }
                </div>
              </>
            }
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
