import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
      const data = await db.provider.findMany({
        orderBy: {
          name: "desc"
        }
      })
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
    const providerFound = await db.provider.findFirst({
      where: {
        provider_number: data.provider_number,
      },
    });

    if (providerFound) {
      return NextResponse.json(
        {
          message: "El número de proveedor para dicho vuelo ya existe.",
        },
        {
          status: 400, // Set 400 status code for a validation error
        }
      );
    }

      // Create a new branch if the name is unique
      const newProvider = await db.provider.create({
        data: {
          provider_number: data.provider_number,
          name: data.name,
          provider_type: data.provider_type,
        },
      });

      return NextResponse.json(newProvider);
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
