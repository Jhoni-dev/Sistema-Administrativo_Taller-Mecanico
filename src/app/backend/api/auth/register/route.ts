import { NextResponse, NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { createSession } from "@/app/backend/services/authServices";

export async function POST(req: NextRequest) {
    try {
        const body: Prisma.SessionCreateInput = await req.json();

        const data = await createSession(body);

        return NextResponse.json(
            data,
            { status: 201 }
        );
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Ha ocurrido un error interno' },
            { status: 500 }
        );
    }
}