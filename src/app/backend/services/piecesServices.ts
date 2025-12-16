import { piecesRepository } from "../repository/piecesRepository";
import { GetPieces } from "../types/models/entity";
import { cleanData } from "../utils/cleanData";
import { toLowerCaseDeepRecord } from "../utils/filtersRepository";

export async function getPieces(): Promise<GetPieces[] | null> {
    const data = await piecesRepository.findMany();

    if (!data) {
        throw new Error("No se encontraron piezas disponibles");
    }

    return data;
}

export async function getPieceById(id: string): Promise<GetPieces | null> {
    if (!id) {
        throw new Error("No se ha suministrado un parametron valido");
    }

    if (isNaN(Number(id))) {
        throw new Error("Identificador no valido para la eliminacion de campos");
    }

    const pieceId = parseInt(id, 10);

    const data = await piecesRepository.findById(pieceId);

    if (!data) {
        throw new Error("No se econtro la pieza especificada");
    }

    return data;
}

export async function createPiece(newPiece: Record<string, unknown>) {
    return await piecesRepository.create(toLowerCaseDeepRecord(newPiece));
}

export async function deletePiece(id: string) {
    if (!id) {
        throw new Error("No se ha suministrado un parametro valido");
    }

    if (isNaN(Number(id))) {
        throw new Error("Identificador no valido para la eliminacion de campos");
    }

    const pieceId = parseInt(id, 10);

    if (!piecesRepository.findById(pieceId)) {
        throw new Error('Pieza inexistente');
    }

    return piecesRepository.delete(pieceId);
}

export async function updateById<T extends Record<string, unknown>>(id: string, input: T) {
    if (!id) {
        throw new Error("No se ha suministrado un parametro valido");
    }

    if (isNaN(Number(id))) {
        throw new Error("Identificador no valido para la eliminacion de campos");
    }

    const pieceId = parseInt(id, 10);
    const data = cleanData.arrays(input);

    if (Object.keys(data).length === 0) {
        throw new Error("No se proporcionaron campos para actualizar");
    }

    return await piecesRepository.update(pieceId, toLowerCaseDeepRecord(data));
}