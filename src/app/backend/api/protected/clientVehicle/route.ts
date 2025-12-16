import { createVehicle, getAllVehicles } from "@/app/backend/services/clientVehicleService";
import { CreateVehicle, GetVehicleClient } from "@/app/backend/types/models/entity";
import { NextRequest, NextResponse } from "next/server";

export async function GET(): Promise<NextResponse<GetVehicleClient[] | { error: string }>> {
  try {
    const data = await getAllVehicles();

    return NextResponse.json(
      data ?? [],
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Ha ocurrido un error interno' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
    try {
        const data: CreateVehicle = await req.json();

        const createSuccess = await createVehicle(data);
        
        return NextResponse.json(
            createSuccess,
            { status: 201 }
        );
    } catch (error) {
      console.log(error)
        return NextResponse.json(
            { error: 'Ha ocurrido un error inesperado' },
            { status: 500 }
        );
    }
}