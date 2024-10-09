import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { dni_number: string } }) {
    const {dni_number} = params
    if (!dni_number) {
      return NextResponse.json(
        {
          message: "DNI del pasajero es requerdnio",
        },
        {
          status: 400,
        }
      );
    }

    try {
      const passanger = await db.passanger.findUnique({
        where: {
          dni_number
        },
        include: {
          client: true,
          ticket: true,
        }
      });

      if (!passanger) {
        return NextResponse.json(
          {
            message: "No se encontró el pasajero.",
          },
          {
            status: 404,
          }
        );
      }

      return NextResponse.json(passanger, {
        status: 200,
      });
    } catch (error) {
      console.error("Error fetching passanger:", error);
      return NextResponse.json(
        {
          message: "Error al obtener la cliente.",
        },
        {
          status: 500,
        }
      );
    }
  }
