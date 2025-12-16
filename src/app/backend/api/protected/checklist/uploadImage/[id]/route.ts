import { NextRequest, NextResponse } from "next/server";
import { getImageById } from "@/app/backend/services/uploadImageVehicleServices";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        
        const item = await getImageById(id);
        return NextResponse.json(
            item,
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { error: 'Ha ocurrido un error interno' },
            { status: 500 }
        )
    }
}