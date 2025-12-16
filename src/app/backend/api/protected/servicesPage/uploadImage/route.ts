import { NextRequest, NextResponse } from "next/server";
import { createImage } from "@/app/backend/services/uploadServiceImageServices";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const id = formData.get("id") as string;
        const file = formData.get("image") as File;
        const description = formData.get("description") as string | undefined;

        const createSuccess = await createImage(id, file, description);

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