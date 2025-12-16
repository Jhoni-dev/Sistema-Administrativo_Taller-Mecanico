import { NextResponse, NextRequest } from "next/server";
import { generatePasswordResetToken } from "@/app/backend/services/restorePasswordServices";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        const data = await generatePasswordResetToken(email);

        return NextResponse.json(
            data,
            { status: 200 }
        )
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Ha ocurrido un error interno' },
            { status: 500 }
        )
    }
}