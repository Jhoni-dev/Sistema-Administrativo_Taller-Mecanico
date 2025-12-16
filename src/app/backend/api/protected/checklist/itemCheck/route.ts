import { NextResponse } from "next/server";
import { checklistItemService } from "../../../../services/checklistItemServices";
import { CreateChecklistItem } from "@/app/backend/types/models/entity";

export async function POST(req: Request) {
    try {
        const body: CreateChecklistItem = await req.json();
        const result = await checklistItemService.create(body);
        return NextResponse.json(
            result,
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
