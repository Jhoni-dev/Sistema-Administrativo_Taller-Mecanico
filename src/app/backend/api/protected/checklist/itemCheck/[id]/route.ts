import { NextRequest, NextResponse } from "next/server";
import { checklistItemService } from "../../../../../services/checklistItemServices";

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const data = await req.json();
        const result = await checklistItemService.update(parseInt(id, 10), data);
        return NextResponse.json(
            result,
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { error: 'Ha ocurrido un error interno' },
            { status: 500 }
        )
    }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const result = await checklistItemService.delete(parseInt(id, 10));
        return NextResponse.json(
            result,
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { error: 'Ha ocurrido un error interno' },
            { status: 500 }
        )
    }
}