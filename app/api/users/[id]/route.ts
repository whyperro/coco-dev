import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(request: Request,{ params }: { params: { id: string } }) {
  try {
    const { id } = params; // Get ID from URL parameters

    if (!id) {
      return NextResponse.json(
        {
          message: 'ID del usuario es requerido',
        },
        {
          status: 400,
        }
      );
    }

    // Delete the user by its ID
    const deletedUser = await db.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Usuario eliminado exitosamente',
      deletedUser,
    });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);

    return NextResponse.json(
      {
        message: 'Ha ocurrido un error al eliminar el usuario.',
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

    const updatedUser= await db.user.update({
      where: { id },
      data: {
        ...data
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error al actualizar al usuario:", error);
    return NextResponse.json(
      {
        message: "Error al actualizar al usuario.",
      },
      {
        status: 500,
      }
    );
  }
}
