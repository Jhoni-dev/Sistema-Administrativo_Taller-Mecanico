import {
  deleteClient,
  getClientById,
  updateClient,
} from "@/app/backend/services/clientServices";
import { GetClient, UpdateClient } from "@/app/backend/types/models/entity";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse<GetClient | null | { error: string }>> {
  const { id } = await context.params;

  try {
    const client = await getClientById(id);

    return NextResponse.json(client, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Ha ocurrido un error interno" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const deleteSuccess = deleteClient(id);

    return NextResponse.json(deleteSuccess, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Ha ocurrido un error interno" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    // <-- IMPORTANT: await aquí
    const newData: UpdateClient = await req.json();

    // <-- IMPORTANT: await aquí también
    const clientUpdated = await updateClient(id, newData);

    return NextResponse.json(clientUpdated, { status: 200 });
  } catch (error) {
    // log completo para debug
    console.error("PUT /clientPage/:id error:", error);

    return NextResponse.json(
      { error: "Ha ocurrido un error interno" },
      { status: 500 },
    );
  }
}

