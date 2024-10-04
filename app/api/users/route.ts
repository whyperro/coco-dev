import db from "@/lib/db";
import { User } from "@/types";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data: User[] | null = await db.user.findMany();
    return NextResponse.json(data, {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching branches:", error);
    return NextResponse.json(
      {
        message: "Error al obtener las sucursales.",
      },
      {
        status: 500,
      }
    );
  }
}
