import db from "@/lib/db";
import { Passanger } from "@/types";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop(); // Extract ID from the URL

    if (!id) {
      return NextResponse.json(
        {
          message: "ID de sucursal es requerido",
        },
        {
          status: 400,
        }
      );
    }

    try {
      const passanger: Passanger | null = await db.passanger.findUnique({
        where: {
          id: id, // Ensure the ID is a number
        },
        include: {
          client: true,
        }
      });

      if (!passanger) {
        return NextResponse.json(
          {
            message: "No se encontró la sucursal.",
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
