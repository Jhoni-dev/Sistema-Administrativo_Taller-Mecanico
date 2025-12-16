import { deleteAppointment, getAppointmentById, updateAppointment } from "@/app/backend/services/appointmentsServices";
import { GetAppointment, UpdateAppointment } from "@/app/backend/types/models/entity";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse<GetAppointment | null | { error: string }>> {
    const { id } = await context.params;
    
    try {
        const appointment = await getAppointmentById(id);

        return NextResponse.json(
            appointment,
            { status: 200 }
        )
    } catch {
        return NextResponse.json(
            { error: "Ha ocurrido un error interno" },
            { status: 500 }
        )
    }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;

    try {
        const deleteSuccess = await deleteAppointment(id);

        return NextResponse.json(
            deleteSuccess,
            { status: 200 }
        )
    } catch {
        return NextResponse.json(
            { error: "Ha ocurrido un error interno" },
            { status: 500 }
        )
    }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const newData: UpdateAppointment = await req.json();

    try {
        const appointmentUpdated = await updateAppointment(id, newData);

        return NextResponse.json(
            appointmentUpdated,
            { status: 200 }
        );
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: "Ha ocurrido un error interno" },
            { status: 500 }
        )
    }
}