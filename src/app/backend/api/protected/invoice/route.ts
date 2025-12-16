import { createInvoice, getAllInvoices } from "@/app/backend/services/invoiceService";
import { GetInvoice, InvoiceCreate } from "@/app/backend/types/models/entity";
import { NextRequest, NextResponse } from "next/server";

export async function GET(): Promise<NextResponse<GetInvoice[] | { error: string } | []>> {
    try {
        const invoices = await getAllInvoices();

        return NextResponse.json(
            invoices,
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { error: "Ha ocurrido un error interno" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const data: InvoiceCreate = await req.json();

    try {
        const invoiceCreate = await createInvoice(data);

        return NextResponse.json(
            invoiceCreate,
            { status: 201 }
        );
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: "Ha ocurrido un error interno" },
            { status: 500 }
        );
    }
}