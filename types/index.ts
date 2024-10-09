export type User = {
  id: string,
  username: string,
  user_role: string,
}


export type Client = {
    id: string,
    first_name: string,
    last_name: string,
    dni: string,
  }

  export type Branch = {
    id: string,
    location_name: string,
    fiscal_address: string | null
  }

  export type Route = {
    id: string
    origin: string
    destiny: string
    scale: string | null
    route_type: "NACIONAL" | "INTERNACIONAL"
  }

  export type Provider = {
    id: string
    provider_number: string
    name: string
    provider_type: "AEROLINEA" | "AGENCIA_TERCERO"
  }

  export type Passanger = {
    id:           string
    first_name:   string
    last_name :   string
    dni_type :      "V"  | "J" | "E" | "PARTIDA_NACIMIENTO"
    dni_number :  string
    phone_number: string | null
    email:       string | null
    client:     Client
    ticket: Ticket[]
  }

  export type Ticket = {
    id: string,
    ticket_number: string
    purchase_date: string,
    flight_date: string,
    booking_ref: string,
    quantity: number,
    status: "PENDIENTE" | "PAGADO"
    ticket_type: "B" | "X",
    doc_order : boolean,
    registered_by: string,
    issued_by:string,
    served_by :string,
    route: Route
    passanger: Passanger,
    transaction?: Transaction,
    branchId: string,
    provider: Provider
  }

  export type Transaction = {
    id: string,
    ticket_price: number,
    fee: number,
    total: number,
    rate: number,
    total_bs : number,
    payment_ref:string,
    registered_by: string,
    transaction_date: Date,
    ticket: Ticket,
  }
