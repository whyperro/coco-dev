'use client';
import { useGetClients } from "@/actions/clients/actions";
import { useCreatePassenger, useGetPassanger, useUpdatePassanger } from "@/actions/passangers/actions";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CreateClientDialog } from "../dialogs/CreateClientDialog";
import { Button } from '../ui/button';
import { Input } from '../ui/input';

import { Passanger } from "@/types";
import { Separator } from "../ui/separator";
import { toast } from "sonner";

const formSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  dni_type: z.enum(["V", "J", "E", "PARTIDA_NACIMIENTO", "PASAPORTE"]),
  dni_number: z.string(),
  phone_number: z.string().optional(),
  email: z.string().optional(),
  clientId: z.string(),
});

interface FormProps {
  onClose: () => void;
  isEditing?: boolean;
  id?: string,
}

const PassangerForm = ({ id, onClose, isEditing = false }: FormProps) => {

  const [initialValues, setInitialValues] = useState<Passanger | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dni_type: "V",
      phone_number: initialValues?.phone_number ?? "",
      email: initialValues?.email ?? ""
    },
  });
  const [openClient, setOpenClient] = useState(false)
  const { data: clients, loading: clientsLoading, error: clientsError } = useGetClients();
  const { data: passanger } = useGetPassanger(id ?? null);
  const { createPassenger } = useCreatePassenger()
  const { updatePassanger } = useUpdatePassanger()

  useEffect(() => {
    if (passanger) {
      setInitialValues(passanger);
      form.setValue("first_name", passanger.first_name);
      form.setValue("last_name", passanger.last_name);
      form.setValue("dni_type", passanger.dni_type);
      form.setValue("dni_number", passanger.dni_number);
      form.setValue("email", passanger.email ?? "");
      form.setValue("phone_number", passanger.phone_number ?? "");
      form.setValue("clientId", passanger.client.id)
    }
  }, [passanger, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditing && initialValues) {
        await updatePassanger.mutateAsync({
          id: initialValues.id,
          ...values,
          phone_number: values.phone_number ?? null,
          email: values.email ?? null
        });
      } else {
        await createPassenger.mutateAsync({
          ...values,
          phone_number: values.phone_number ?? null,
          email: values.email ?? null,
        });
      }
      form.reset(); // Reset form after successful submission
      onClose();
    } catch (error) {
      console.error(error); // Log the error for debugging
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className='flex flex-col max-w-7xl mx-auto mt-4 space-y-6'>
          <div className="flex flex-col lg:flex-row gap-8">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="font-bold">Cliente</FormLabel>
                  <Popover open={openClient} onOpenChange={setOpenClient}>
                    <PopoverTrigger disabled={clientsLoading} asChild>
                      <FormControl>
                        <Button
                          disabled={clientsLoading}
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-[200px] justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {
                            clientsLoading && <Loader2 className="size-4 animate-spin mr-2" />
                          }
                          {field.value
                            ? <p>{clients?.find(
                              (client) => client.id === field.value
                            )?.first_name} - {clients?.find(
                              (client) => client.id === field.value
                            )?.last_name}</p>
                            : "Seleccione el cliente..."
                          }
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>

                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Busque un cliente..." />
                        <CreateClientDialog />
                        <CommandList>
                          <CommandEmpty>No se ha encontrado un cliente.</CommandEmpty>
                          <CommandGroup>
                            {clients?.map((client) => (
                              <CommandItem
                                value={`${client.first_name} ${client.last_name}`}
                                key={client.id}
                                onSelect={() => {
                                  form.setValue("clientId", client.id)
                                  setOpenClient(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    client.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {
                                  <p>{client.first_name} {client.last_name}</p>
                                }
                              </CommandItem>
                            ))}
                            {
                              clientsError && <p className="text-sm text-muted-foreground">Ha ocurrido un error al cargar los datos...</p>
                            }
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Seleccione al cliente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* FORMULARIO DEL PASAJERO */}
          <div className='flex flex-col'>
            <h1 className='text-3xl font-bold italic flex items-center gap-2'>Info. del Pasajero</h1>
            <Separator className='w-56' />
            <div className="grid grid-cols-2 gap-6 place-content-center w-full mx-auto mt-4">
              <FormField
                control={form.control}
                name="dni_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Nro. de Identificación</FormLabel>
                    <FormControl>
                      <Input className="w-[200px] shadow-none border-b border-r-0 border-t-0 border-l-0" placeholder="1234567" {...field} />
                    </FormControl>
                    <FormDescription>
                      El número identificador del pasajero
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dni_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Tipo de Identificación</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className={cn("w-[200px] shadow-none border-b-1 border-r-0 border-t-0 border-l-0", field.value ? "font-bold" : "")}>
                          <SelectValue placeholder="Tipo de documentación" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="V">V</SelectItem>
                        <SelectItem value="J">J</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                        <SelectItem value="PARTIDA_NACIMIENTO">P. de Nacimiento</SelectItem>
                        <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Tipo del documento de identificación
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Nombre</FormLabel>
                    <FormControl>
                      <Input className="w-[200px] shadow-none border-b-1 border-r-0 border-t-0 border-l-0" placeholder="Maria" {...field} />
                    </FormControl>
                    <FormDescription>
                      Primer nombre del pasajero a registrar o registrado
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Apellido</FormLabel>
                    <FormControl>
                      <Input className="w-[200px] shadow-none border-b-1 border-r-0 border-t-0 border-l-0" placeholder="Perez" {...field} />
                    </FormControl>
                    <FormDescription>
                      Apellido el pasajero registrar o registrado
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Correo</FormLabel>
                    <FormControl>
                      <Input type="email" className="w-auto shadow-none border-b-1 border-r-0 border-t-0 border-l-0" placeholder="maria@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Correo del pasajero
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Tlf. de Contacto</FormLabel>
                    <FormControl>
                      <Input type="tel" className="w-auto shadow-none border-b-1 border-r-0 border-t-0 border-l-0 max-w-32" placeholder="01234567889" {...field} />
                    </FormControl>
                    <FormDescription>
                      Número de telefóno del pasajero
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Button disabled={createPassenger.isPending || updatePassanger.isPending} type="submit">
            {
              isEditing ? "Actualizar Pasajero" : "Registrar Pasajero"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default PassangerForm;
