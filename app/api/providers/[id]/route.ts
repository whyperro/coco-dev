import db from "@/lib/db";
import { Provider } from "@/types";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop(); // Extract ID from the URL
    if (!id) {
      return NextResponse.json(
        {
          message: "ID de proveedor es requerido",
        },
        {
          status: 400,
        }
      );
    }

    try {
      const provider: Provider | null = await db.provider.findUnique({
        where: {
          id: id, // Ensure the ID is a number
        },
      });

      if (!provider) {
        return NextResponse.json(
          {
            message: "No se encontró el proveedor.",
          },
          {
            status: 404,
          }
        );
      }

      return NextResponse.json(provider, {
        status: 200,
      });
    } catch (error) {
      console.error("Error fetching client:", error);
      return NextResponse.json(
        {
          message: "Error al obtener el proveedor.",
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

      const updatedProvider = await db.provider.update({
        where: { id },
        data: {
          ...data
        },
      });

      return NextResponse.json(updatedProvider);
    } catch (error) {
      console.error("Error al actualizar el proveedor:", error);
      return NextResponse.json(
        {
          message: "Error al actualizar el proveedor.",
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
            message: 'ID de proveedor es requerido',
          },
          {
            status: 400,
          }
        );
      }

      // Delete the branch by its ID
      const deletedProvider = await db.provider.delete({
        where: { id },
      });

      return NextResponse.json({
        message: 'Proveedor eliminada exitosamente',
        deletedProvider,
      });
    } catch (error) {
      console.error('Error al eliminar la proveedor:', error);

      return NextResponse.json(
        {
          message: 'Ha ocurrido un error al eliminar la proveedor.',
        },
        {
          status: 500,
        }
      );
    }
  }
