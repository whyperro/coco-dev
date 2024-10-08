import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params; // Get ID from URL parameters
  if (!id) {
    return NextResponse.json(
      {
        message: "ID del pasajero es requerido",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const passanger = await db.passanger.findUnique({
      where: {
        id: id, // Ensure the ID is a number
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
        message: "Error al obtener el pasajero.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params; // Get ID from URL parameters

    if (!id) {
      return NextResponse.json(
        {
          message: 'ID del pasajero es requerido',
        },
        {
          status: 400,
        }
      );
    }

    // Delete the branch by its ID
    const deletedPassanger = await db.passanger.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Pasajero eliminada exitosamente',
      deletedPassanger,
    });
  } catch (error) {
    console.error('Error al eliminar el pasajero:', error);

    return NextResponse.json(
      {
        message: 'Ha ocurrido un error al eliminar el pasajero.',
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {

    const data = await request.json()

    const { id } = params

    const updatedPassanger = await db.passanger.update({
      where: { id },
      data: {
        ...data,
        phone_number: data.phone_number ?? null,
        email: data.email ?? null
      },
    });

    return NextResponse.json(updatedPassanger);
  } catch (error) {
    console.error("Error al actualizar el pasajero:", error);
    return NextResponse.json(
      {
        message: "Error al actualizar el pasajero.",
      },
      {
        status: 500,
      }
    );
  }
}
