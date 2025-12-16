import { NextRequest, NextResponse } from "next/server";
import { updateImage } from "@/app/backend/services/uploadServiceImageServices";
import { deleteImage } from "@/app/backend/services/uploadServiceImageServices";

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const formData = await req.formData();
        const { id } = await context.params;

        const createSuccess = await updateImage(id, formData);

        return NextResponse.json(
            createSuccess,
            { status: 200 }
        );
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Ha ocurrido un error interno' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                { error: 'ID es requerido' },
                { status: 400 }
            );
        }

        const deleteSuccess = await deleteImage(id);

        return NextResponse.json(
            { success: deleteSuccess, message: 'Imagen eliminada correctamente' },
            { status: 200 }
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {
                error: 'Ha ocurrido un error interno',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}