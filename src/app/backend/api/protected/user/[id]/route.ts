import { deleteById, updateById } from "@/app/backend/services/authServices";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const userEliminated = deleteById(id);

    return NextResponse.json(userEliminated, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Ha ocurrido un error interno" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const newSession = await request.json();
    const email = await newSession.email;
    const data = await updateById(email, newSession);

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Ha ocurrido un error interno" },
      { status: 500 },
    );
  }
}

