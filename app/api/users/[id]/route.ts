import db from "@/lib/db";
import bcrypt from 'bcrypt';
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params; // Get ID from URL parameters
  if (!id) {
    return NextResponse.json(
      {
        message: "ID de usuario es requerido",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const user = await db.user.findUnique({
      where: {
        id: id, // Ensure the ID is a number
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "No se encontró al usuario.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(user, {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      {
        message: "Error al obtener al usuario.",
      },
      {
        status: 500,
      }
    );
  }
}


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
     const user = await db.user.findUnique({
      where: {
        id: id, // Ensure the ID is a number
      },
    });

    const isPasswordMatch = await bcrypt.compare(data.password, user?.password ?? "");

   
    if(data.isChangingPassword)
    {
      const hashedPwd = await bcrypt.hash(data.password, 10);
      if (user) {
        user.password = hashedPwd;
      }

    }else{

      if (!isPasswordMatch) {
        return NextResponse.json(
          {
            message: "Password incorrecto.",
          },
          {
            status: 400,
          }
        );
      }
    }

    if (isPasswordMatch || data.isChangingPassword) {
      const updatedUser = await db.user.update({
        where: { id },
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          username: data.username,
          password: user?.password,
          user_role: data.user_role,
          branchId: data.branchId ?? null,
          updated_by: data.updated_by,
        },
      });
   
      return NextResponse.json(updatedUser);
    } 
    
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
