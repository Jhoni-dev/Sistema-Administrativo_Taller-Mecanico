import { prisma, Prisma } from "@/lib/prisma";
import { selectFields } from "../utils/filtersRepository";
import { toPiecesCreateInput } from "../mappers/piecesMapper";
import { cleanData } from "../utils/cleanData";
import { GetPieces } from "../types/models/entity";

export const piecesRepository = {
  async findMany(): Promise<GetPieces[] | null> {
    try {
      return await prisma.pieces.findMany({
        orderBy: {
          id: "asc",
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          estado: true,
          stock: true,
          brand_piece: true,
          createAt: true,
          pieceCategory: {
            select: {
              name: true,
            },
          },
        },
      });
    } catch {
      throw new Error("Error en la busqueda de campos");
    }
  },

  async findById(id: number): Promise<GetPieces | null> {
    try {
      return await prisma.pieces.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          estado: true,
          brand_piece: true,
          stock: true,
          createAt: true,
          pieceCategory: {
            select: {
              name: true,
            },
          },
        },
      });
    } catch {
      throw new Error("Error en la busqueda del campo solicitado");
    }
  },

  async create(
    pieces: Record<string, unknown>,
  ): Promise<Record<string, unknown> | null> {
    try {
      const newPiece = await prisma.pieces.create({
        data: toPiecesCreateInput(pieces),
        select: {
          name: true,
          description: true,
          brand_piece: true,
          price: true,
          stock: true,
        },
      });

      const cleanDataPieces = cleanData.cleanEmpty(newPiece);

      return cleanDataPieces;
    } catch (error) {
      console.log(error);
      throw new Error("Error en la creacion de nuevos campos");
    }
  },

  async update(id: number, data: Record<string, unknown>) {
    const currentPiece = await prisma.pieces.findUnique({
      where: { id },
      select: { name: true, estado: true, stock: true },
    });

    const stockEntry =
      typeof data.stock === "object" &&
      data.stock !== null &&
      "set" in data.stock
        ? data.stock.set
        : data.stock;

    let stockDifference = 0;

    const oldStock = Number(currentPiece?.stock ?? 0);
    const parsedNewStock =
      typeof stockEntry === "number"
        ? stockEntry
        : Number(stockEntry ?? oldStock);

    if (!isNaN(parsedNewStock)) {
      stockDifference = parsedNewStock - oldStock;
    }

    const allowedPiecesFields = [
      "name",
      "description",
      "price",
      "estado",
      "stock",
      "categoryId",
    ];

    const piecesData: Record<string, unknown> = {};

    for (const key in data) {
      if (key === "id") continue;

      if (allowedPiecesFields.includes(key)) {
        piecesData[key] = data[key];
      }
    }

    const prismaData: Prisma.PiecesUpdateInput = {
      ...piecesData,
      ...("stock" in piecesData && !("estado" in piecesData)
        ? {
            estado: "DISPONIBLE",
            informationPieces: {
              create: {
                pieceName: currentPiece?.name as string,
                stockEntry: stockDifference as number,
              },
            },
          }
        : {}),
    };

    const dataReturn = {
      ...selectFields(piecesData),
      ...("categoryId" in piecesData
        ? {
            pieceCategory: {
              select: {
                name: true,
              },
            },
          }
        : {}),
    };

    try {
      return await prisma.pieces.update({
        where: { id },
        data: prismaData,
        select: dataReturn,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Error en la actualizacion de campos" + error);
    }
  },

  async delete(id: number): Promise<boolean> {
    try {
      const eliminated = await prisma.pieces.delete({
        where: { id },
      });

      return eliminated ? true : false;
    } catch (error) {
      console.log(error);
      throw new Error("Error en la eliminacion de campos");
    }
  },
};
