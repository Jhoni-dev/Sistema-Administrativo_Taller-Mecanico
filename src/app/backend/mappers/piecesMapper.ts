import { Prisma } from "@prisma/client";

export function toPiecesCreateInput(
  data: Record<string, unknown>,
): Prisma.PiecesCreateInput {
  const prismaData: Prisma.PiecesCreateInput = {
    name: data.name as string,
    price: new Prisma.Decimal(data.price as number),
    stock: data.stock as number,
    brand_piece: data.brand_piece as string,
    pieceCategory: {
      connect: { id: data.categoryId as number },
    },
    informationPieces: {
      create: {
        pieceName: data.name as string,
        stockEntry: data.stock as number,
      },
    },
    ...("brand" in data || "model" in data
      ? {
          availablePieces_vehicle: {
            create: {
              brand: data.brand as string,
              model: data.model as string,
            },
          },
        }
      : {}),
  };

  if (
    data.description &&
    typeof data.description === "string" &&
    data.description.trim() !== ""
  ) {
    prismaData.description = data.description;
  }

  return prismaData;
}
