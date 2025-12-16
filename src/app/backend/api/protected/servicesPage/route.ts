import { createServices, getServices } from "@/app/backend/services/servicesPageService";
import { GetServices } from "@/app/backend/types/models/entity";
import { Prisma, Services } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(): Promise<NextResponse<GetServices[] | { error: string }>> {
    try {
        const data = await getServices();

        return NextResponse.json(
            data ?? [],
            { status: 200 }
        )
    } catch {
        return NextResponse.json(
            { error: "Ha ocurrido un error interno" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest): Promise<NextResponse<Services | { error: string }>> {
    try {
        const body: Prisma.ServicesCreateInput = await request.json();

        const data = await createServices(body);

        return NextResponse.json(
            data,
            { status: 201 }
        )
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: "Ha ocurrido un error interno" },
            { status: 500 }
        )
    }
}