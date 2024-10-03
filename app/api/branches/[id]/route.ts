import db from "@/lib/db";
import { Branch } from "@/types";
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
    const branch: Branch | null = await db.branch.findUnique({
      where: {
        id: id, // Ensure the ID is a number
      },
    });

    if (!branch) {
      return NextResponse.json(
        {
          message: "No se encontró la sucursal.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(branch, {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching branch:", error);
    return NextResponse.json(
      {
        message: "Error al obtener la sucursal.",
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
          message: 'ID de sucursal es requerido',
        },
        {
          status: 400,
        }
      );
    }

    // Delete the branch by its ID
    const deletedBranch = await db.branch.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Sucursal eliminada exitosamente',
      deletedBranch,
    });
  } catch (error) {
    console.error('Error al eliminar la sucursal:', error);

    return NextResponse.json(
      {
        message: 'Ha ocurrido un error al eliminar la sucursal.',
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
    const updatedBranch = await db.branch.update({
      where: { id },
      data: {
        location_name: data.location_name,
        fiscal_address: data.fiscal_address ?? null,
      },
    });

    return NextResponse.json(updatedBranch);
  } catch (error) {
    console.error("Error al actualizar la sucursal:", error);
    return NextResponse.json(
      {
        message: "Error al actualizar la sucursal.",
      },
      {
        status: 500,
      }
    );
  }
}
