import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params; // Get ID from URL parameters
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
    const route = await db.route.findUnique({
      where: {
        id: id, // Ensure the ID is a number
      },
    });

    if (!route) {
      return NextResponse.json(
        {
          message: "No se encontró la ruta.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(route, {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      {
        message: "Error al obtener el vuelo.",
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
          message: 'ID del vuelo es requerido',
        },
        {
          status: 400,
        }
      );
    }

    // Delete the branch by its ID
    const deletedRoute = await db.route.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Sucursal eliminada exitosamente',
      deletedRoute,
    });
  } catch (error) {
    console.error('Error al eliminar la ruta:', error);

    return NextResponse.json(
      {
        message: 'Ha ocurrido un error al eliminar la ruta.',
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

    // Check if the branch with the given name already exists (except for the current branch)

    // Update the branch
    const updatedRoute = await db.route.update({
      where: { id },
      data: {
        ...data
      },
    });

    return NextResponse.json(updatedRoute);
  } catch (error) {
    console.error("Error al actualizar la ruta:", error);
    return NextResponse.json(
      {
        message: "Error al actualizar la ruta.",
      },
      {
        status: 500,
      }
    );
  }
}
