import { NextResponse } from "next/server";
import { vehicleChecklistService } from "../../../../services/vehicleChecklistServices";
import { CreateChecklist } from "@/app/backend/types/models/entity";

export async function GET() {
  try {
    const list = await vehicleChecklistService.list();
    return NextResponse.json(
      list,
      { status: 200 }
    );
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Ha ocurrido un error interno' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body: CreateChecklist = await req.json();
    const result = await vehicleChecklistService.create(body);
    return NextResponse.json(
      result,
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Ha ocurrido un error interno' },
      { status: 500 }
    )
  }
}
