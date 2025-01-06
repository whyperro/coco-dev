'use client';
import { useGetClient, useGetClients } from "@/actions/clients/actions";
import { useCreatePassenger, useGetPassangerByDni } from "@/actions/passangers/actions";
import { useGetProviders, useUpdateCreditProvider } from "@/actions/providers/actions";
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
import { cn, convertAmountToMiliunits } from "@/lib/utils";
import { Passanger } from "@/types";
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
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

import { useGetBranches } from "@/actions/branches/actions";
import { CreateBranchDialog } from "../dialogs/CreateBranchDialog";
import { AmountInput } from "../misc/AmountInput";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  first_name: z.string({
    message: "Debe ingresar un nombre."
  }),
  last_name: z.string({
    message: "Debe ingresar un apellido."
  }),
  dni_type: z.enum(["V", "J", "E", "PARTIDA_NACIMIENTO", "PASAPORTE"]),
  dni_number: z.string({
    message: "Debe ingresar un número de identificación."
  }),
  phone_number: z.string().optional(),
  email: z.string().optional(),
  isClient: z.boolean().default(false),
  clientId: z.string({
    message: "Debe seleccionar un cliente."
  }),
  routes: z.array(z.string()).min(1, {
    message: "Debe ingresar una ruta."
  }),
  providerId: z.string({
    message: "Debe seleccionar un proveedor."
  }),
  branchId: z.string().optional(),

  ticket_number: z.string({
    message: "Debe ingresar un número de ticket."
  }),
  purchase_date: z.date({
    message: "Debe ingresar una fecha de compra."
  }),
  flight_date: z.date({
    message: "Debe ingresar la fecha de vuelo."
  }),
  booking_ref: z.string({
    message: "Debe ingresar el localizador."
  }),

  doc_order: z.boolean(),
  issued_by: z.string().optional(),
  served_by: z.string({
    message: "Debe seleccionar mínimo una ruta."
  }),
  ticket_type: z.string({
    message: "Debe ingresar el tipo de ticket."
  }),
  description: z.string().optional(),

  ticket_price: z.string({
    message: "Debe ingresar el precio del boleto."
  }),
  fee: z.string({
    message: "Debe ingresar el fee del boleto."
  }),
  total: z.string(),
  rate: z.string({
    message: "Debe ingresar la tasa."
  }),
  total_bs: z.string(),
});

const VENDEDORAS = [
  { name: "COKO" },
  { name: "RAUL R." },
  { name: "DUBRASKA" },
  { name: "STEFANY" },
  { name: "DORA" },
  { name: "DIOSENNYS" },
  { name: "GLYSMAR" },
  { name: "KAREN" },
  { name: "SARAY" },
]

const TicketForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone_number: "",
      dni_type: "V",
      doc_order: false,
      isClient: false,
      description: ""
    },
  });

  const { data: session } = useSession()

  const debouncedPassangerDni = useDebounce(form.watch("dni_number"), 500);

  const queryClient = useQueryClient()
  const [openClient, setOpenClient] = useState(false)
  const [openSellers, setOpenSellers] = useState(false)
  const [openRoute, setOpenRoute] = useState(false)
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([])
  const [openProvider, setOpenProvider] = useState(false)
  const [openBranch, setOpenBranch] = useState(false)
  const [openPurchaseDate, setOpenPurchaseDate] = useState(false)
  const [openFlightDate, setOpenFlightDate] = useState(false)
  const { data: routes, loading: routesLoading, error: routesError } = useGetRoutes()
  const { data: clients, loading: clientsLoading, error: clientsError } = useGetClients()
  const { data: branches, loading: branchLoading, error: branchError } = useGetBranches()
  const { data: providers, loading: providersLoading, error: providersError } = useGetProviders()
  const { createPassenger } = useCreatePassenger()
  const { createTicket } = useCreateTicket();
  const { updateCreditProvider } = useUpdateCreditProvider()
  const { data: passanger, loading } = useGetPassangerByDni(debouncedPassangerDni)
  const [fetchedPassanger, setFetchedPassanger] = useState<Passanger | null>(null)
  const { data: dataClient } = useGetClient(form.watch("clientId") ?? null);

  const { watch, setValue } = form
  const ticket_price = watch('ticket_price')
  const fee = watch('fee')
  const rate = watch('rate')
  const isClient = watch('isClient')
  const clientId = watch("clientId")

  useEffect(() => {
    queryClient.setQueryData(["client"], null)
    queryClient.refetchQueries({ queryKey: ["client"] })
  }, [clientId])

  useEffect(() => {
    if (isClient) {
      form.setValue("first_name", dataClient?.first_name ?? "");
      form.setValue("last_name", dataClient?.last_name ?? "");
      form.setValue("email", dataClient?.email ?? "");
      form.setValue("dni_number", dataClient?.dni ?? "");
      form.setValue("phone_number", dataClient?.phone_number ?? "");
    }
  }, [dataClient, isClient, form, queryClient]);

  /** Llena los datos del pasajero si este ya se encuentra registrado en la base de datos  */
  useEffect(() => {
    if (debouncedPassangerDni && passanger) {
      // Autocomplete form fields when DNI matches a passenger
      setFetchedPassanger(passanger);
      form.setValue("first_name", passanger.first_name || "");
      form.setValue("last_name", passanger.last_name || "");
      form.setValue("email", passanger.email || "");
      form.setValue("dni_type", passanger.dni_type || "V");
      form.setValue("phone_number", passanger.phone_number || "");
    }
  }, [debouncedPassangerDni, passanger, form, queryClient]);

  useEffect(() => {
    if (fetchedPassanger) {
      form.setValue("first_name", fetchedPassanger.first_name);
      form.setValue("last_name", fetchedPassanger.last_name);
      form.setValue("email", fetchedPassanger.email ?? "");
      form.setValue("dni_type", fetchedPassanger.dni_type);
      form.setValue("phone_number", fetchedPassanger.phone_number ?? "");
    }
  }, [fetchedPassanger, form]);


  const onResetPassengerForm = () => {
    form.setValue("isClient", false)
    queryClient.setQueryData(["passanger"], null)
    queryClient.setQueryData(["client"], null)
    queryClient.refetchQueries({ queryKey: ["client"] })
    form.setValue("dni_number", "")
    setFetchedPassanger(null);
    form.setValue("first_name", "")
    form.setValue("last_name", "")
    form.setValue("email", "")
    form.setValue("phone_number", "")
  };

  const onTicketFormReset = () => {
    form.setValue("ticket_number", "")
    form.setValue("booking_ref", "")
    form.setValue("routes", [])
    form.setValue("isClient", false)
    form.setValue("rate", "")
    form.setValue("ticket_price", "")
    form.setValue("fee", "")
    queryClient.setQueryData(["passanger"], null)
    setSelectedRoutes([]); // Limpiar rutas seleccionadas
  }

  useEffect(() => {
    if (selectedRoutes) {
      form.setValue('routes', selectedRoutes)
    };
  }, [selectedRoutes, form]);

  /** Transaccion */
  useEffect(() => {
    const total = (parseFloat(ticket_price || "0") + parseFloat(fee || "0")).toFixed(2);
    setValue('total', total);
    const total_bs = (parseFloat(total || "0") * parseFloat(rate || "0")).toFixed(2);
    setValue('total_bs', total_bs)
  }, [ticket_price, fee, rate, setValue]);

  const isRouteSelected = (value: string) => selectedRoutes.includes(value);

  const handleRoutesSelect = (currentValue: string) => {
    setSelectedRoutes((prevSelected) =>
      prevSelected.includes(currentValue)
        ? prevSelected.filter((value) => value !== currentValue)
        : [...prevSelected, currentValue]
    );
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {

    const ticketPriceInMiliunits = convertAmountToMiliunits(parseFloat(values.ticket_price))
    const feeInMiliunits = convertAmountToMiliunits(parseFloat(values.fee))
    const totalInMiliunits = convertAmountToMiliunits(parseFloat(values.total))
    const totalBsMiliunits = convertAmountToMiliunits(parseFloat(values.total_bs))
    const rateMiliunits = convertAmountToMiliunits(parseFloat(values.rate))
    try {
      if (fetchedPassanger) {
        const ticketCreated = await createTicket.mutateAsync({
          ticket_number: values.ticket_number.toUpperCase(),
          booking_ref: values.booking_ref.toUpperCase(),
          purchase_date: format(values.purchase_date, 'yyyy-MM-dd'),
          doc_order: values.doc_order,
          issued_by: session?.user.username || "",
          served_by: values.served_by,
          ticket_type: values.ticket_type,
          flight_date: format(values.flight_date, 'yyyy-MM-dd'),
          status: "PENDIENTE",
          description: values.description ?? "",
          passangerId: fetchedPassanger.id,
          routes: values.routes,
          branchId: (session?.user.user_role === 'SUPERADMIN' || session?.user.user_role === 'AUDITOR') ? values.branchId || "" : session?.user.branchId || "",
          providerId: values.providerId,
          registered_by: session?.user.username || "",
          ticket_price: ticketPriceInMiliunits,
          fee: feeInMiliunits,
          total: totalInMiliunits,
          rate: rateMiliunits,
          total_bs: totalBsMiliunits,
        })
        if (ticketCreated.status === 200) {
          console.log(ticketCreated.data.provider.credit)
          await updateCreditProvider.mutateAsync({
            id: ticketCreated.data.providerId,
            credit: ticketCreated.data.provider.credit + (ticketCreated.data.ticket_price * -1),
          });
        }
      } else {
        const res = await createPassenger.mutateAsync({
          first_name: values.first_name.toUpperCase(),
          last_name: values.last_name.toUpperCase(),
          dni_type: values.dni_type,
          dni_number: values.dni_number,
          phone_number: values.phone_number ?? null,
          email: values.email ?? null,
          clientId: values.clientId
        })
        if (res.status === 200) {
          setFetchedPassanger(res.data)
          const ticketCreated = await createTicket.mutateAsync({
            ticket_number: values.ticket_number.toUpperCase(),
            booking_ref: values.booking_ref.toUpperCase(),
            purchase_date: format(values.purchase_date, 'yyyy-MM-dd'),
            description: values.description ?? "",
            doc_order: values.doc_order,
            issued_by: session?.user.username || "",
            served_by: values.served_by,
            ticket_type: values.ticket_type,
            flight_date: format(values.flight_date, 'yyyy-MM-dd'),
            status: "PENDIENTE",

            passangerId: res.data.id,
            routes: values.routes,
            branchId: (session?.user.user_role === 'SUPERADMIN' || session?.user.user_role === 'AUDITOR') ? values.branchId || "" : session?.user.branchId || "",
            providerId: values.providerId,
            registered_by: session?.user.username || "",
            ticket_price: ticketPriceInMiliunits,
            fee: feeInMiliunits,
            total: totalInMiliunits,
            rate: rateMiliunits,
            total_bs: totalBsMiliunits,
          })
          if (ticketCreated.status === 200) {
            console.log(ticketCreated.data.provider.credit)
            await updateCreditProvider.mutateAsync({
              id: ticketCreated.data.providerId,
              credit: ticketCreated.data.provider.credit - ticketCreated.data.ticket_price,
            });
          }
        }
      }
      onTicketFormReset()
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
          description: 'Luego, ingrese la información correspondiente al boleto a registrar.',
          align: "center",
          side: "left"
        }
      },
    ]
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className='flex flex-col max-w-7xl mx-auto mt-4 space-y-6'>

          {/* CLIENTE / PROVEEDOR */}
          <div id="client-provider" className="flex flex-col lg:flex-row gap-8">
             
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
                          {providersLoading && <Loader2 className="size-4 animate-spin mr-2" />}
                          {field.value
                            ? <p>{providers?.find(provider => provider.id === field.value)?.name}</p>
                            : "Elige un proveedor..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <RegisterProviderDialog />
                        <CommandInput placeholder="Busque un proveedor..." />
                        <CommandList>
                          <CommandEmpty>No se ha encontrado el proveedor.</CommandEmpty>
                          <CommandGroup>
                            {providers?.map(provider => (
                              <CommandItem
                                value={`${provider.name}`}
                                key={provider.id}
                                onSelect={() => {
                                  form.setValue("providerId", provider.id);
                                  setOpenProvider(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    provider.id === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <p>{provider.name}</p>
                              </CommandItem>
                            ))}
                            {providersError && (
                              <p className="text-muted-foreground text-sm">
                                Ha ocurrido un error al cargar los proveedores...
                              </p>
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Seleccione el proveedor.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {
              (session?.user.user_role === 'SUPERADMIN' || session?.user.user_role === 'AUDITOR') && (
                <FormField
                  control={form.control}
                  name="branchId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-bold">Sucursales</FormLabel>
                      <Popover open={openBranch} onOpenChange={setOpenBranch}>
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
                              {branchLoading && <Loader2 className="size-4 animate-spin mr-2" />}
                              {field.value
                                ? <p>{branches?.find(branch => branch.id === field.value)?.location_name}</p>
                                : "Elige una sucursal..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput placeholder="Busque una sucursal..." />
                            <CreateBranchDialog />
                            <CommandList>
                              <CommandEmpty>No se ha encontrado una sucursal.</CommandEmpty>
                              <CommandGroup>
                                {branches?.map(branch => (
                                  <CommandItem
                                    value={`${branch.location_name}`}
                                    key={branch.id}
                                    onSelect={() => {
                                      form.setValue("branchId", branch.id);
                                      setOpenBranch(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        branch.id === field.value ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <p>{branch.location_name}</p>
                                  </CommandItem>
                                ))}
                                {branchError && (
                                  <p className="text-muted-foreground text-sm">
                                    Ha ocurrido un error al cargar los datos...
                                  </p>
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Seleccione la sucursal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            }
            <Button className="w-[20px] h-[20px] mt-4" type="button" onClick={() => driverObj.drive()} size={"icon"}>?</Button>

          </div>
          <FormField
            control={form.control}
            name="isClient"
            render={({ field }) => (
              <FormItem className=" w-[300px] flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    ¿El cliente será el pasajero?
                  </FormLabel>

                </div>
              </FormItem>
            )}
          />
          {/* FORMULARIO DEL PASAJERO */}
          <div className='flex flex-col'>
            <h1 className='text-3xl font-bold italic flex items-center gap-2'>Info. del Pasajero <RotateCw onClick={() => onResetPassengerForm()} className="size-4 cursor-pointer hover:animate-spin" /></h1>
            <Separator className='w-56' />
            <div id="passanger-info-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-content-center w-full mx-auto mt-4">
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
              <div id="dni-number">
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
            <h1 className='text-3xl font-bold italic flex items-center gap-2'>Info. de Boleto <RotateCw onClick={() => onTicketFormReset()} className="size-4 cursor-pointer hover:animate-spin" /></h1>
            <Separator className='w-56 mb-4' />
            <div id="ticket-info-container" className="grid grid-cols-1 md:grid-cols-2 place-content-center md:flex md:flex-row gap-12 md:items-center md:justify-start flex-wrap">
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
                          selected={field.value}
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
                name="routes"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ruta(s)</FormLabel>
                    <Popover open={openRoute} onOpenChange={setOpenRoute}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-[200px] justify-between"
                        >
                          {selectedRoutes?.length > 0 && (
                            <>
                              <Separator orientation="vertical" className="mx-2 h-4" />
                              <Badge
                                variant="secondary"
                                className="rounded-sm px-1 font-normal lg:hidden"
                              >
                                {selectedRoutes.length}
                              </Badge>
                              <div className="hidden space-x-1 lg:flex">
                                {selectedRoutes.length > 2 ? (
                                  <Badge
                                    variant="secondary"
                                    className="rounded-sm px-1 font-normal"
                                  >
                                    {selectedRoutes.length} seleccionados
                                  </Badge>
                                ) : (
                                  routes?.filter((option) => selectedRoutes.includes(option.id))
                                    .map((option) => (
                                      <Badge
                                        variant="secondary"
                                        key={option.id}
                                        className="rounded-sm px-1 font-medium"
                                      >
                                        {option.origin}{option.scale ? `/${option.scale}/` : "/"}{option.destiny}
                                      </Badge>
                                    ))
                                )}
                              </div>
                            </>
                          )}
                          {
                            selectedRoutes.length <= 0 && <p className="text-sm text-muted-foreground">Seleccione rutas...</p>
                          }
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <RegisterRouteDialog />
                          <CommandInput placeholder="Buscar Ruta..." />
                          <CommandList>
                            <CommandEmpty>No se encontraron rutas...</CommandEmpty>
                            <CommandGroup>
                              {
                                routesLoading && <Loader2 className="animate-spin size-4" />
                              }
                              {routes?.map((route) => (
                                <CommandItem
                                  key={route.id}
                                  value={`${route.origin} ${route.scale ?? ""} ${route.destiny}`}
                                  onSelect={() => handleRoutesSelect(route.id)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      isRouteSelected(route.id) ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {route.origin} {route.scale ? `- ${route.scale} -` : "-"} {route.destiny}
                                </CommandItem>
                              ))}
                              {
                                routesError && <p className="text-center text-muted-foreground text-sm">Ha ocurrido un error al cargar las rutas...</p>
                              }
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Seleccione la o las rutas
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
                  <FormItem className="flex flex-col mt-2">
                    <FormLabel className="font-bold">Atendido por:</FormLabel>
                    <Popover open={openSellers} onOpenChange={setOpenSellers}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            disabled={loading}
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-[200px] shadow-none border-b-1 border-r-0 border-t-0 border-l-0 justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? <p>{VENDEDORAS?.find(
                                (vendedora) => vendedora.name === field.value
                              )?.name}</p>
                              : "Seleccione..."
                            }
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Busqueda..." />
                          <CommandList>
                            <CommandEmpty>No se ha encontrado un(a) vendedor(a).</CommandEmpty>
                            <CommandGroup>
                              {VENDEDORAS?.map((vendedora) => (
                                <CommandItem
                                  value={`${vendedora.name}`}
                                  key={vendedora.name}
                                  onSelect={() => {
                                    form.setValue("served_by", vendedora.name)
                                    setOpenSellers(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      vendedora.name === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {
                                    <p>{vendedora.name}</p>
                                  }
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Seleccione al vendedor(a)
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
                    <FormLabel className="font-bold">Emitido por:</FormLabel>
                    <FormControl>
                      <Input type="text" className="w-[200px] shadow-none border-b border-r-0 border-t-0 border-l-0" disabled placeholder="1234567" {...field} value={`${session?.user.first_name} ${session?.user.last_name}`} />
                    </FormControl>
                    <FormDescription>
                      Agente que emitio el Boleto
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

          </div>

          {/* FORMULARIO DE  TRANSACTION*/}

          <div className="flex flex-col ">
            <h1 className='text-3xl font-bold italic flex items-center gap-3'>Info. del Transaccion <RotateCw onClick={() => onResetPassengerForm()} className="size-4 cursor-pointer hover:animate-spin" /></h1>
            <Separator className='w-57' />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-content-center w-full mx-auto mt-4">
              <FormField
                control={form.control}
                name="ticket_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Precio del Boleto</FormLabel>
                    <FormControl>
                      <AmountInput  {...field} placeholder="0.00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold"><span className="italic">Fee</span> de Emisión</FormLabel>
                    <FormControl>
                      <AmountInput {...field} placeholder="0.00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Tasa</FormLabel>
                    <FormControl>
                      <AmountInput {...field} prefix="Bs " placeholder="0.00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Total a Cobrar</FormLabel>
                    <FormControl>
                      <AmountInput disabled {...field} placeholder="0.00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="total_bs"
                render={({ field }) => (
                  <FormItem >
                    <FormLabel className="font-bold">Total en Bolivares</FormLabel>
                    <FormControl>
                      <AmountInput disabled {...field} prefix="Bs " placeholder="0.00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

          </div>

          <div className="flex flex-col items-center">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Observaciones</FormLabel>
                  <FormControl>
                    <Textarea className="w-[850px] shadow-none" placeholder="..." {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={createPassenger.isPending || createTicket.isPending} type="submit">Crear ticket</Button>
        </div>
      </form>
    </Form >
  );
}

export default TicketForm;
