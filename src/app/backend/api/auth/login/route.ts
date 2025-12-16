import { NextResponse, NextRequest } from "next/server";
import { getSessionById } from "@/app/backend/services/authServices";

export async function POST(request: NextRequest) {
    try {
        const getSession = await request.json();
        const email = await getSession.email as string;
        const pass = await getSession.password as string;
        const token = await getSessionById(email, pass);

        return NextResponse.json(
            token,
            { status: 200 }
        );
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Ha ocurrido un error interno' },
            { status: 500 }            
        )
    }
}