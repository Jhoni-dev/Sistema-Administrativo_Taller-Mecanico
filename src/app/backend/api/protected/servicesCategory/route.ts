import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { createServiceCategory, getServiceCategory } from "@/app/backend/services/servicesCategoryServices";
import { GetServiceCategory } from "@/app/backend/types/models/entity";

export async function GET(): Promise<NextResponse<GetServiceCategory[] | { error: string }>> {
    try {
        const serviceCategory = await getServiceCategory();

        return NextResponse.json(
            serviceCategory ?? [],
            { status: 200 }
        )
    } catch {
        return NextResponse.json(
            { error: "Ha ocurrido un error interno" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: Prisma.ServiceCategoryCreateInput = await request.json();

        const data = await createServiceCategory(body);

        return NextResponse.json(
            data,
            { status: 201 }
        );
    } catch {
        return NextResponse.json(
            { error: "Ha ocurrido un error interno" },
            { status: 500 }
        );
    }
}