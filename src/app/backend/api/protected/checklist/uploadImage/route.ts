import { createImage } from '../../../../services/uploadImageVehicleServices';
import { NextResponse, NextRequest } from 'next/server';

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
    console.error(error);
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
  }
}