import { createAppointment, getAllAppointment } from "@/app/backend/services/appointmentsServices";
import { CreateAppointment, GetAppointment } from "@/app/backend/types/models/entity";
import { NextRequest, NextResponse } from "next/server";

export async function GET(): Promise<NextResponse<GetAppointment[] | [] | { error: string }>> {
    try {
        const appointment = await getAllAppointment();

        return NextResponse.json(
            appointment,
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { error: 'Ha ocurrido un error interno' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest): Promise<NextResponse<boolean | { error: string }>> {
    try {
        const data: CreateAppointment = await req.json();

        const successCreate = await createAppointment(data);

        return NextResponse.json(
            successCreate,
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { error: 'Ha ocurrido un error interno' },
            { status: 500 }
        );
    }
}