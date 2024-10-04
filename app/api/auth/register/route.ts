import db from "@/lib/db";
import bcrypt from 'bcrypt';
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const data = await request.json();

    const userFound = await db.user.findUnique({
      where: {
        username: data.username,
      },
    });

    if (userFound) {
      return NextResponse.json(
        {
          message: "El usuario que intenta registrar ya existe.",
        },
        {
          status: 400,
        }
      );
    }

    const hashedPwd = await bcrypt.hash(data.password, 10);

    const newUser = await db.user.create({
      data: {
        username: data.username,
        password: hashedPwd,
        user_role: data.user_role,
        branchId: data.branchId,
      },
    });

    // Exclude the password from the response
    const { password: _, ...user } = newUser;

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
