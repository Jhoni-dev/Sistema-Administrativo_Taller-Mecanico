import crypto from "crypto";
import { authRepository } from "../repository/authRepository";
import { passwordToken } from "../repository/restorePasswordRepository";
import { sendPasswordChangedEmail, sendPasswordResetEmail } from "@/lib/email";
import { hashed } from "@/lib/argon";

export async function generatePasswordResetToken(email: string) {
  const id = await authRepository.getIdByEmail(email);

  if (!id) throw new Error("El email digitado no se encuentra registrado");

  const token = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  const tokenGenerate = passwordToken.generatePasswordResetToken(token, id, expiresAt)

  if (!tokenGenerate) throw new Error("No se ha podido generar el token correctamente");

  const user = await authRepository.findUser(id);

  if (!user) throw new Error("Usuario inexistente");

  await sendPasswordResetEmail((await tokenGenerate).user.email, (await tokenGenerate).token, user.name);

  return tokenGenerate;
}

export async function passwordRestore(password: string, token: string) {
  const resetToken = await passwordToken.getToken(token);

  console.error(resetToken)

  if (!resetToken || resetToken.used) {
    throw new Error("Token invalido o usado");
  }

  if (resetToken.expiresAt < new Date()) {
    throw new Error("Token expirado");
  }

  const passwordHashed = await hashed(password);

  const updateSuccess = authRepository.updatePassword(resetToken.userId, passwordHashed);

  if (!updateSuccess) {
    throw new Error("No se ha podido actualizar correctamente la contraseña");
  }

  const user = await authRepository.findUser(resetToken.userId);

  if (!user) throw new Error("Usuario inexistente");

  await sendPasswordChangedEmail(user?.email, user?.name);

  await passwordToken.usedToken(resetToken.id);

  return updateSuccess;
}


