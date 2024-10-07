import db from "@/lib/db";
import { User } from "@/types";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data: User[] | null = await db.user.findMany();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store", // Ensures no caching on Vercel
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        message: "Error fetching users.",
      },
      {
        status: 500,
      }
    );
  }
}