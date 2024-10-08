'use client';
import { useGetClients } from "@/actions/clients/actions";
import { useCreatePassenger, useGetPassangerByDni } from "@/actions/passangers/actions";
import { useGetProviders } from "@/actions/providers/actions";
import { useGetRoutes } from "@/actions/routes/actions";
import { useCreateTicket } from "@/actions/tickets/actions";
import { Calendar } from "@/components/ui/calendar";
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
import { Passanger } from "@/types";
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Check, ChevronsUpDown, Loader2, RotateCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from 'react-hook-form';
import { toast } from "sonner";
import { z } from 'zod';
import { CreateClientDialog } from "../dialogs/CreateClientDialog";
import { RegisterProviderDialog } from "../dialogs/RegisterProviderDialog";
import { RegisterRouteDialog } from "../dialogs/RegisterRouteDialog";
import { Button } from '../ui/button';
import { Checkbox } from "../ui/checkbox";
import { Input } from '../ui/input';
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

import { Separator } from "../ui/separator";
import { QuestionMarkIcon } from "@radix-ui/react-icons";

const formSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  dni_type: z.enum(["V", "J", "E", "PARTIDA_NACIMIENTO"]),
  dni_number: z.string(),
  phone_number: z.string().optional(),
  email: z.string().email().optional(),
  clientId: z.string(),
  routeId: z.string(),
  providerId: z.string(),
  ticket_number: z.string(),
  purchase_date: z.date(),
  flight_date: z.date(),
  booking_ref: z.string(),
  quantity: z.coerce.number().nonnegative(),
  doc_order: z.boolean(),
  issued_by: z.string(),
  served_by: z.string(),
  ticket_type: z.string(),
});


const TicketForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dni_type: "V"
    },
  });
  const { data: session } = useSession()
  const today = new Date()
  const debouncedPassangerDni = useDebounce(form.watch("dni_number"), 500);
  const queryClient = useQueryClient()
  const [openClient, setOpenClient] = useState(false)
  const [openRoute, setOpenRoute] = useState(false)
  const [openProvider, setOpenProvider] = useState(false)
  const [openPurchaseDate, setOpenPurchaseDate] = useState(false)
  const [openFlightDate, setOpenFlightDate] = useState(false)
  const { data: routes, loading: routesLoading, error: routesError } = useGetRoutes()
  const { data: clients, loading: clientsLoading, error: clientsError } = useGetClients()
  const { data: providers, loading: providersLoading, error: providersError } = useGetProviders()
  const { createPassenger } = useCreatePassenger()
  const { createTicket } = useCreateTicket();
  const { data: passanger, loading } = useGetPassangerByDni(debouncedPassangerDni)
  const [fetchedPassanger, setFetchedPassanger] = useState<Passanger | null>(null)

  useEffect(() => {
    if (debouncedPassangerDni && passanger) {
      // Autocomplete form fields when DNI matches a passenger
      setFetchedPassanger(passanger);
      form.setValue("first_name", passanger.first_name || "");
      form.setValue("last_name", passanger.last_name || "");
      form.setValue("email", passanger.email || "");
      form.setValue("dni_type", passanger.dni_type || "V");
      form.setValue("phone_number", passanger.phone_number || "");
    } else {
      // Clear form fields and reset passenger when DNI is removed or doesn't match
      setFetchedPassanger(null);
      form.setValue("first_name", "");
      form.setValue("last_name", "");
      form.setValue("email", "");
      form.setValue("dni_type", "V");
      form.setValue("phone_number", "");

      // Explicitly set query data to null to clear any cached passenger data
      queryClient.setQueryData(['passanger'], null);
    }
  }, [debouncedPassangerDni, passanger, form, queryClient]);


  useEffect(() => {
    if (fetchedPassanger) {
      form.setValue("first_name", fetchedPassanger.first_name);
      form.setValue("last_name", fetchedPassanger.last_name);
      form.setValue("email", fetchedPassanger.email ?? "");
      form.setValue("dni_type", fetchedPassanger.dni_type);
      form.setValue("phone_number", fetchedPassanger.phone_number ?? "");
      form.setValue("clientId", fetchedPassanger.client.id)
    }
  }, [fetchedPassanger, form]);


  const onResetPassengerForm = () => {
    // Clear fetched passenger and form values
    setFetchedPassanger(null);
    form.reset({
      dni_number: "",
      first_name: "",
      last_name: "",
      email: "",
      dni_type: "V",
      phone_number: "",
    });
  };

  const onResetTicketForm = () => {
    form.reset()
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (fetchedPassanger) {
        await createTicket.mutateAsync({
          ticket_number: values.ticket_number.toUpperCase(),
          booking_ref: values.booking_ref.toUpperCase(),
          purchase_date: format(values.purchase_date, 'yyyy-MM-dd'),
          quantity: values.quantity,
          doc_order: values.doc_order,
          issued_by: values.issued_by,
          served_by: values.served_by,
          ticket_type: values.ticket_type,
          flight_date: format(values.flight_date, 'yyyy-MM-dd'),
          status: "PENDIENTE",
          passangerId: fetchedPassanger.id,
          routeId: values.routeId,
          branchId: session?.user.branchId || "",
          providerId: values.providerId,
          registered_by: session?.user.username || ""
        })
      } else {
        const res = await createPassenger.mutateAsync({
          first_name: values.first_name.charAt(0).toUpperCase() + values.first_name.slice(1),
          last_name: values.last_name.charAt(0).toUpperCase() + values.last_name.slice(1),
          dni_type: values.dni_type,
          dni_number: values.dni_number,
          phone_number: values.phone_number ?? null,
          email: values.email ?? null,
          clientId: values.clientId
        })
        if (res.status === 200) {
          setFetchedPassanger(res.data)
          await createTicket.mutateAsync({
            ticket_number: values.ticket_number.toUpperCase(), ////values.first_name.charAt(0).toUpperCase() + values.first_name.slice(1)
            booking_ref: values.booking_ref.toUpperCase(),
            purchase_date: format(values.purchase_date, 'yyyy-MM-dd'),
            quantity: values.quantity,
            doc_order: values.doc_order,
            issued_by: values.issued_by,
            served_by: values.served_by,
            ticket_type: values.ticket_type,
            flight_date: format(values.flight_date, 'yyyy-MM-dd'),
            status: "PENDIENTE",
            passangerId: res.data.id,
            routeId: values.routeId,
            branchId: session?.user.branchId || "",
            providerId: values.providerId,
            registered_by: session?.user.username || ""
          })
        }
      }
    } catch (error) {
      console.error(error); // Log the error for debugging
      toast.error("Error al guardar el boleto", {
        description: "Ocurrió un error, por favor intenta nuevamente.",
      });
    }
  };


  const driverObj = driver({
    showProgress: true,
    steps: [
      {
        element: '#client-provider', // The id or className of the div which you want to focous of highlight
        popover: {
          title: 'Clientes y Proveedores',
          description: 'Aquí ingresará el cliente que estaría comprando los boletos y el proveedor del cual se estan obteniendo dichos boletos.'
        }
      },
      {
        element: '#passanger-info-container', // The id or className of the div which you want to focous of highlight
        popover: {
          title: 'Información del Pasajero',
          description: 'En este apartado ingresará toda la información correspondiente al pasajero del boleto a registrar.'
        }
      },
      {
        element: '#dni-number', // The id or className of the div which you want to focous of highlight
        popover: {
          title: 'Nro. de Identificación',
          description: 'Al ingresar el número de identifiación, si este ya ha sido registrado anteriormente, los campos del pasajero se rellenaran automáticamente. Caso contrario, deberá llenar el resto de la información para que sea guardado.'
        }
      },
      {
        element: '#ticket-info-container', // The id or className of the div which you want to focous of highlight
        popover: {
          title: 'Información del Boleto',
          description: 'Luego, ingrese la información correspondiente al boleto a registrar.'
        }
      },
    ]
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className='flex flex-col max-w-7xl mx-auto mt-4 space-y-6'>
          <div id="client-provider" className="flex flex-col lg:flex-row gap-8">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="font-bold">Cliente</FormLabel>
                  <Popover open={openClient} onOpenChange={setOpenClient}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={loading}
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

            <FormField
              control={form.control}
              name="providerId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="font-bold">Proveedor</FormLabel>
                  <Popover open={openProvider} onOpenChange={setOpenProvider}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={loading}
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-[200px] justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {
                            providersLoading && <Loader2 className="size-4 animate-spin mr-2" />
                          }
                          {field.value
                            ? <p>{providers?.find(
                              (provider) => provider.id === field.value
                            )?.name} </p>
                            : "Elige un proveedor..."
                          }

                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>

                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Busque su proveedor..." />
                        <RegisterProviderDialog />
                        <CommandList>
                          <CommandEmpty>No se ha encontrado un proveedor.</CommandEmpty>
                          <CommandGroup>
                            {providers?.map((provider) => (
                              <CommandItem
                                value={`${provider.name}`}
                                key={provider.id}
                                onSelect={() => {
                                  form.setValue("providerId", provider.id)
                                  setOpenProvider(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    provider.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {
                                  <p>{provider.name}</p>
                                }
                              </CommandItem>
                            ))}
                            {
                              providersError && <p className="text-muted-foreground text-sm">Ha ocurrido un error al cargar los datos...</p>
                            }
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Seleccione al proveedor
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-[20px] h-[20px] mt-4" type="button" onClick={() => driverObj.drive()} size={"icon"}>?</Button>
          </div>


          {/* FORMULARIO DEL PASAJERO */}

          <div className='flex flex-col'>
            <h1 className='text-3xl font-bold italic flex items-center gap-2'>Info. del Pasajero <RotateCw onClick={() => onResetPassengerForm()} className="size-4 cursor-pointer hover:animate-spin" /></h1>
            <Separator className='w-56' />
            <div id="passanger-info-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-content-center w-full mx-auto mt-4">
              <div id="dni-number">
                <FormField
                  control={form.control}
                  name="dni_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Nro. de Identificación</FormLabel>
                      <FormControl>
                        <Input type="number" className="w-[200px] shadow-none border-b border-r-0 border-t-0 border-l-0" placeholder="1234567" {...field} />
                      </FormControl>
                      <FormDescription>
                        El número identificador del pasajero
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
              <FormField
                control={form.control}
                name="doc_order"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        ¿Documento Vigente?
                      </FormLabel>

                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* FORMULARIO DEL BOLETO */}

          <div className='flex flex-col'>
            <h1 className='text-3xl font-bold italic flex items-center gap-2'>Info. de Boleto <RotateCw onClick={() => onResetTicketForm()} className="size-4 cursor-pointer hover:animate-spin" /></h1>
            <Separator className='w-56 mb-4' />
            <div id="ticket-info-container" className="grid grid-cols-1 md:grid-cols-2 place-content-center md:flex md:flex-row gap-12 md:items-center md:justify-start flex-wrap">
              <FormField
                control={form.control}
                name="ticket_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Nro. de Boleto</FormLabel>
                    <FormControl>
                      <Input className="w-[200px] shadow-none border-b-1 border-r-0 border-t-0 border-l-0" placeholder="123456789" {...field} />
                    </FormControl>
                    <FormDescription>
                      Número identificador del boleto
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="booking_ref"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Localizador</FormLabel>
                    <FormControl>
                      <Input className="w-[200px] shadow-none border-b-1 border-r-0 border-t-0 border-l-0" placeholder="SCS7126" {...field} />
                    </FormControl>
                    <FormDescription>
                      Localizador del o los boleto(s)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Cantidad</FormLabel>
                    <FormControl>
                      <Input type="number" className="w-[200px] shadow-none border-b-1 border-r-0 border-t-0 border-l-0" placeholder="0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Cantidad del boleto
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purchase_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col mt-2">
                    <FormLabel className="font-bold">Fecha de Compra</FormLabel>
                    <Popover open={openPurchaseDate} onOpenChange={setOpenPurchaseDate}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-auto pl-3 text-left font-normal shadow-none border-b-1 border-r-0 border-t-0 border-l-0 bg-transparent",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", {
                                locale: es
                              })
                            ) : (
                              <span>Seleccione una fecha</span>
                            )}
                            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ?? today}
                          onSelect={(e) => {
                            field.onChange(e)
                            setOpenPurchaseDate(false)
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Fecha de compra del boleto
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="flight_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col mt-2">
                    <FormLabel className="font-bold">Fecha del Vuelo</FormLabel>
                    <Popover open={openFlightDate} onOpenChange={setOpenFlightDate}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-auto pl-3 text-left font-normal shadow-none border-b-1 border-r-0 border-t-0 border-l-0 bg-transparent",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", {
                                locale: es
                              })
                            ) : (
                              <span>Seleccione una fecha</span>
                            )}
                            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(e) => {
                            field.onChange(e)
                            setOpenFlightDate(false)
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Fecha de compra del boleto
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="routeId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="font-bold">Ruta del Vuelo</FormLabel>
                    <Popover open={openRoute} onOpenChange={setOpenRoute}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            disabled={loading}
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-[200px] justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {
                              routesLoading && <Loader2 className="size-4 animate-spin mr-2" />
                            }
                            {field.value
                              ? <p>{routes?.find(
                                (route) => route.id === field.value
                              )?.origin} - {routes?.find(
                                (route) => route.id === field.value
                              )?.destiny}</p>
                              : "Seleccione su ruta..."
                            }
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Busque su ruta..." />
                          <RegisterRouteDialog />
                          <CommandList>
                            <CommandEmpty>No se ha encontrado su ruta.</CommandEmpty>
                            <CommandGroup>
                              {routes?.map((route) => (
                                <CommandItem
                                  value={`${route.origin} ${route.scale} ${route.destiny}`}
                                  key={route.id}
                                  onSelect={() => {
                                    form.setValue("routeId", route.id)
                                    setOpenRoute(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      route.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {
                                    !!route.scale ?
                                      <p>{route.origin} - {route.scale} - {route.destiny}</p> :
                                      <p>{route.origin} - {route.destiny}</p>
                                  }
                                </CommandItem>
                              ))}
                              {
                                routesError && <p className="text-muted-foreground text-sm">Ha ocurrido un error al cargar los datos...</p>
                              }
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Seleccione la ruta de vuelo del boleto
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ticket_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Tipo de Boleto</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={""}>
                      <FormControl>
                        <SelectTrigger className={cn("w-[200px] shadow-none border-b-1 border-r-0 border-t-0 border-l-0", field.value ? "font-bold" : "")}>
                          <SelectValue placeholder="Elige el tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="B">BOLETO</SelectItem>
                        <SelectItem value="X">EXCHANGE</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Seleccione el tipo del boleto
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="served_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Atendido por</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className={cn("w-[200px] shadow-none border-b-1 border-r-0 border-t-0 border-l-0", field.value ? "font-bold" : "")}>
                          <SelectValue placeholder="Seleccione el agente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DUBRASKA">DUBRASKA</SelectItem>
                        <SelectItem value="STEFANY">STEFANY</SelectItem>
                        <SelectItem value="DORA">DORA</SelectItem>
                        <SelectItem value="DIOSENNYS">DIOSENNYS</SelectItem>
                        <SelectItem value="GLYSMAR">GLYSMAR</SelectItem>
                        <SelectItem value="KAREN">KAREN</SelectItem>
                        <SelectItem value="SARAY">SARAY</SelectItem>
                        <SelectItem value="ALINA">ALINA</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Agente de atencion
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issued_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Emitido por</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className={cn("w-[200px] shadow-none border-b-1 border-r-0 border-t-0 border-l-0", field.value ? "font-bold" : "")}>
                          <SelectValue placeholder="Seleccione el agente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DUBRASKA">DUBRASKA</SelectItem>
                        <SelectItem value="STEFANY">STEFANY</SelectItem>
                        <SelectItem value="DORA">DORA</SelectItem>
                        <SelectItem value="DIOSENNYS">DIOSENNYS</SelectItem>
                        <SelectItem value="GLYSMAR">GLYSMAR</SelectItem>
                        <SelectItem value="KAREN">KAREN</SelectItem>
                        <SelectItem value="SARAY">SARAY</SelectItem>
                        <SelectItem value="ALINA">ALINA</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Agente que emitio el Boleto
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />


            </div>
          </div>
          <Button disabled={createPassenger.isPending || createTicket.isPending} type="submit">Crear ticket</Button>
        </div>
      </form>
    </Form >
  );
}

export default TicketForm;
