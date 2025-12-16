import { createClient, getAllClient } from "@/app/backend/services/clientServices";
import { CreateClient, GetClient } from "@/app/backend/types/models/entity";
import { NextRequest, NextResponse } from "next/server";

export async function GET(): Promise<NextResponse<GetClient[] | [] | { error: string }>> {
    try {
        const clients = await getAllClient();

        return NextResponse.json(
            clients,
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
        const data: CreateClient = await req.json();

        const successCreate = await createClient(data);

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