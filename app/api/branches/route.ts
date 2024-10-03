import db from "@/lib/db";
import { Branch } from "@/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
  const data = await request.json();
  // Check if the branch name already exists
  const nameFound = await db.branch.findFirst({
    where: {
      location_name: data.location_name,
    },
  });

  if (nameFound) {
    return NextResponse.json(
      {
        message: "El nombre de la sucursal ya existe.",
      },
      {
        status: 400, // Set 400 status code for a validation error
      }
    );
  }

    // Create a new branch if the name is unique
    const newBranch = await db.branch.create({
      data: {
        location_name: data.location_name,
        fiscal_address: data.fiscal_address ?? null,
      },
    });

    return NextResponse.json(newBranch);
  } catch (error) {
    console.error("Error creating branch:", error);
    return NextResponse.json(
      {
        message: "Error en el servidor.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  try {
    const data: Branch[] | null = await db.branch.findMany();
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
