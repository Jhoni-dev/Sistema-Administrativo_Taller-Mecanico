import { NextResponse, NextRequest } from "next/server";
import { GetVehicleClient, UpdateVehicle } from "@/app/backend/types/models/entity";
import { deleteVehicle, getVehicleById, updateVehicle } from "@/app/backend/services/clientVehicleService";

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const vehicle = await deleteVehicle(id);

        return NextResponse.json(vehicle, { status: 200 })
    } catch {
        return NextResponse.json(
            { error: 'Ha ocurrido un error interno' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const newVehicle: UpdateVehicle = await request.json();
        const { id } = await context.params;
        const vehicle = await updateVehicle(id, newVehicle);

        return NextResponse.json(
            vehicle,
            { status: 200 }
        )
    } catch {
        return NextResponse.json(
            { error: 'Ha ocurrido un error interno' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse<GetVehicleClient | { error: string } | null>> {
    try {
        const { id } = await context.params;
        const vehicle = await getVehicleById(id);

        return NextResponse.json(
            vehicle,
            { status: 200 }
        )
    } catch {
        return NextResponse.json(
            { error: 'Ha ocurrido un error interno' },
            { status: 500 }
        )
    }
}