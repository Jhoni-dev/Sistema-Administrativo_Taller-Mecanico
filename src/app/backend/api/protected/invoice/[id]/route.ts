import { NextResponse, NextRequest } from "next/server";
import { delelteInvoice, getClientInvoiceById, updateInvoiceDetail } from "@/app/backend/services/invoiceService";
import { GetClientInvoiceById } from "@/app/backend/types/models/entity";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse<GetClientInvoiceById | { error: string } | null>> {
    try {
        const { id } = await context.params;
        const piece = await getClientInvoiceById(id);

        return NextResponse.json(
            piece,
            { status: 200 }
        )
    } catch {
        return NextResponse.json(
            { error: 'Ha ocurrido un error interno' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse<boolean | { error: string }>> {
    try {
        const { id } = await context.params;
        const deleteInvoice_success = await delelteInvoice(id)

        return NextResponse.json(
            deleteInvoice_success,
            { status: 200 }
        )
    } catch {
        return NextResponse.json(
            { error: 'Ha ocurrido un error interno' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const newPieces = await request.json();
        const { id } = await context.params;
        const piece = await updateInvoiceDetail(id, newPieces);

        return NextResponse.json(
            piece,
            { status: 200 }
        )
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Ha ocurrido un error interno' },
            { status: 500 }
        )
    }
}