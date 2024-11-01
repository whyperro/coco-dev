import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await db.route.findMany();
    return NextResponse.json(data, {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching routes:", error);
    return NextResponse.json(
      {
        message: "Error al obtener las rutas.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
  const data = await request.json();
  // Check if the branch name already exists
  const routeFound = await db.route.findFirst({
    where: {
      origin: data.origin,
      destiny: data.destiny,
      scale: data.scale,
    },
  });

  if (routeFound) {
    return NextResponse.json(
      {
        message: "La ruta de vuelo ya existe.",
      },
      {
        status: 400, // Set 400 status code for a validation error
      }
    );
  }

    // Create a new branch if the name is unique
    const newRoute = await db.route.create({
      data: {
        origin: data.origin,
        destiny: data.destiny,
        route_type: data.route_type,
        scale: data.scale ?? null,
      },
    });

    return NextResponse.json(newRoute);
  } catch (error) {
    console.error("Error creating route:", error);
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
