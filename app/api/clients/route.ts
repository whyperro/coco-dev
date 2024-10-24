import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await db.client.findMany()
    return NextResponse.json(data,{
      status:200
    })
  } catch (error) {
    return NextResponse.json({
      error: error
    }, {
      status: 500
    })
  }
}

export async function POST(request: Request) {
  try {
  const data = await request.json();
  // Check if the branch name already exists
  const dniFound = await db.client.findFirst({
    where: {
      dni: data.dni,
    },
  });

  if (dniFound) {
    return NextResponse.json(
      {
        message: "La ientificacion del cliente ya existe.",
      },
      {
        status: 400, // Set 400 status code for a validation error
      }
    );
  }

    // Create a new branch if the name is unique
    const newClient = await db.client.create({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        dni: data.dni,
        email: data.email ?? null,
        phone_number: data.phone_number ?? null,
      },
    });

    return NextResponse.json(newClient);
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
