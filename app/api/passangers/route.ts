import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
    const data = await request.json();
    // Check if the branch name already exists
    const dniFound = await db.passanger.findFirst({
      where: {
        dni_number: data.dni_number,
      },
    });

    if (dniFound) {
      return NextResponse.json(
        {
          message: "La identificacion del pasajero ya existe.",
        },
        {
          status: 400, // Set 400 status code for a validation error
        }
      );
    }

      // Create a new branch if the name is unique
      const newPassenger = await db.passanger.create({
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          dni_type: data.dni_type,
          dni_number: data.dni_number,
          phone_number: data.phone_number ?? null,
          email: data.email ?? null,         
          clientId: data.clientId
        },
      });

      return NextResponse.json(newPassenger);
    } catch (error) {
      console.error("Error creating client:", error);
      return NextResponse.json(
        {
          message: "Error en el servidor.",
        },
        {
          status: 500,
        }
      );
    }
  }
