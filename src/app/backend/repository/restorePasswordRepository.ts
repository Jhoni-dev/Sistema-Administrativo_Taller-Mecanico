import { prisma } from "@/lib/prisma";

export const passwordToken = {
    async generatePasswordResetToken(token: string, id: number, expiresAt: Date) {
        try {
            const generateToken = await prisma.passwordResetToken.create({
                data: {
                    token,
                    userId: id,
                    expiresAt
                },
                select: {
                    token: true,
                    user: {
                        select: {
                            email: true
                        }
                    }
                }
            });

            return generateToken;
        } catch {
            throw new Error("Ha ocurrido un error en el almacenamiento del token");
        }
    },

    async getToken(token: string) {
        try {
            return await prisma.passwordResetToken.findUnique({
                where: { token }
            });
        } catch {
            throw new Error("Ha ocurrido un error inesperado en la consulta del token");
        }
    },

    async usedToken(id: number) {
        try {
            return await prisma.passwordResetToken.update({
                where: { id },
                data: { used: true }
            });
        } catch {
            throw new Error("Ha ocurrido un error inesperado en la actualizacion de campo");
        }
    }
}