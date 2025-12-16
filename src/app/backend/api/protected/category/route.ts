import { NextRequest, NextResponse } from "next/server";
import { createCategory, getCategory } from "../../../services/categoryService";
import { PieceCategory, ModifyCategory } from "@/app/backend/types/models/entity";

export async function GET(): Promise<NextResponse<PieceCategory[] | { error: string }>> {
    try {
        const category = await getCategory();

        return NextResponse.json(
            category,
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { error: "Ha ocurrido un error inesperado en la consulta de parametros" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest): Promise<NextResponse<ModifyCategory | { error: string }>> {
    try {
        const body: ModifyCategory = await request.json();
        const categoryCreate = await createCategory(body);

        return NextResponse.json(
            categoryCreate,
            { status: 201 }
        )
    } catch {
        return NextResponse.json(
            { error: "Ha ocurrido un error inesperado en la insercion de datos" },
            { status: 500 }
        );
    }
}