import { NextResponse } from "next/server";
import { passwordRestore } from "@/app/backend/services/restorePasswordServices";

export async function POST(req: Request) {
  const { token, newPassword } = await req.json();

  try {
    const passwordSuccess = await passwordRestore(newPassword, token);

    return NextResponse.json({ passwordSuccess, message: "Contraseña actualizada con éxito" }, { status: 200 });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Ha ocurrido un error interno" }, { status: 500 });
  }
}