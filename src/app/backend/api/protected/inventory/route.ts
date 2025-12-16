import { NextResponse, NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { GetPieces } from '../../../types/models/entity';
import { getPieces, createPiece } from "@/app/backend/services/piecesServices";

export async function GET(): Promise<NextResponse<GetPieces[] | { error: string }>> {
  try {
    const data = await getPieces();

    return NextResponse.json(
      data ?? [],
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Ha ocurrido un error interno' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: Prisma.PiecesCreateInput = await req.json();

    const data = await createPiece(body);

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