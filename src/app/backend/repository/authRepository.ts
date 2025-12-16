import { prisma, Prisma } from "@/lib/prisma";
import {
  GetCredentials,
  GetSession,
  ReturnSession,
  ReturnUser,
} from "../types/models/entity";
import { toAuthCreateInput } from "../mappers/authMapper";

export const authRepository = {
  async findMany(): Promise<GetSession[] | null> {
    try {
      return await prisma.session.findMany({
        orderBy: {
          id: "asc",
        },
        select: {
          id: true,
          name: true,
          identificacion: true,
          role: true,
          email: true,
        },
      });
    } catch {
      throw new Error(
        "Ha ocurrido un error inesperado en la consulta de campos",
      );
    }
  },

  async findById(email: string): Promise<ReturnSession | null> {
    try {
      return await prisma.session.findFirst({
        where: { email },
        select: {
          id: true,
          name: true,
          identificacion: true,
          email: true,
          role: true,
          credentials: {
            select: {
              password: true,
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Error al consultar usuario");
    }
  },

  async findUser(id: number): Promise<ReturnUser | null> {
    try {
      return await prisma.session.findFirst({
        where: { id },
        select: {
          id: true,
          name: true,
          identificacion: true,
          email: true,
          role: true
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Error al consultar usuario");
    }
  },

  async getPass(email: string): Promise<GetCredentials | null> {
    try {
      return await prisma.session.findUnique({
        where: { email },
        select: {
          id: true,
          credentials: {
            select: {
              password: true,
            },
          },
        },
      });
    } catch {
      throw new Error("Error al consultar usuario");
    }
  },

  async getIdByEmail(email: string): Promise<number | null> {
    try {
      const idUser = await prisma.session.findFirst({
        where: { email: email },
        select: {
          id: true,
        },
      });

      return idUser?.id ?? null;
    } catch {
      throw new Error("Error al consultar usuario");
    }
  },

  async existSessionByEmail(email: string): Promise<boolean> {
    try {
      const count = await prisma.session.count({
        where: { email: email },
      });

      return count > 0;
    } catch {
      throw new Error("Error al consultar usuario");
    }
  },

  async existSessionById(id: number): Promise<boolean> {
    try {
      const count = await prisma.session.count({
        where: { id: id },
      });

      return count > 0;
    } catch {
      throw new Error("Error al consultar usuario");
    }
  },

  async createSession(
    data: Record<string, unknown>,
  ): Promise<Record<string, string> | null> {
    try {
      return await prisma.session.create({
        data: toAuthCreateInput(data),
        select: {
          name: true,
          role: true,
          email: true
        },
      });
    } catch (error) {
      console.log(error)
      throw new Error("Error en la creacion de nuevos campos");
    }
  },

  async update(email: string, data: Record<string, unknown>): Promise<boolean> {
    try {
      const sessionData: Record<string, unknown> = {};

      const allowedSessionFields = ["name", "role"];

      for (const key in data) {
        if (key === "email") continue;

        if (allowedSessionFields.includes(key)) {
          sessionData[key] = data[key];
        }
      }

      const prismaData: Prisma.SessionUpdateInput = {
        ...sessionData,
      };

      const result = await prisma.session.update({
        where: { email },
        data: prismaData,
      });

      return result ? true : false;
    } catch {
      throw new Error("Error en la actualizacion de campos");
    }
  },

  async updatePassword(id: number, hashedPassword: string): Promise<boolean> {
    try {
      console.warn(id);
      const result = await prisma.credentials.update({
        where: { sessionId: id },
        data: {
          password: hashedPassword,
        },
      });

      return result ? true : false;
    } catch (error) {
      console.log(error);
      throw new Error("Error en la actualizacion de campos");
    }
  },

  async delete(id: number): Promise<boolean> {
    try {
      const eliminated = await prisma.session.delete({
        where: { id },
      });

      return eliminated ? true : false;
    } catch (error) {
      console.log(error);
      throw new Error("Error en la eliminacion de campos");
    }
  },
};

