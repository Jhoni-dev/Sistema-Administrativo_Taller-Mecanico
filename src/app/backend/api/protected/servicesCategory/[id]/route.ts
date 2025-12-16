import { NextResponse, NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { GetServiceCategory } from "@/app/backend/types/models/entity";
import { updateById, getServiceCategory_ById, deleteServiceCategory } from "@/app/backend/services/servicesCategoryServices";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse<GetServiceCategory | null | { error: string }>> {
    try {
        const { id } = await context.params;
        const category = await getServiceCategory_ById(id);

        return NextResponse.json(
            category,
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { error: "Ha ocurrido un error interno" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const data: Prisma.ServiceCategoryUpdateInput = await request.json();
        const categoryUpdate = await updateById(id, data);

        return NextResponse.json(
            categoryUpdate,
            { status: 200 }
        );
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: "Ha ocurrido un error interno" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse<boolean | { error: string }>> {
    try {
        const { id } = await context.params;
        const categoryDelete = await deleteServiceCategory(id);

        return NextResponse.json(
            categoryDelete,
            { status: 200 }
        )
    } catch {
        return NextResponse.json(
            { error: "Ha ocurrido un error interno" },
            { status: 500 }
        )
    }
}