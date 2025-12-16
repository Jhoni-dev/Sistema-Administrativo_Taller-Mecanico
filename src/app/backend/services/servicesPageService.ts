import { servicesPageRepository } from "../repository/servicesPageRepository";
import { GetServices } from "../types/models/entity";
import { cleanData } from "../utils/cleanData";
import { toLowerCaseDeepRecord } from "../utils/filtersRepository";

export async function getServices(): Promise<GetServices[] | null> {
    const data = await servicesPageRepository.findMany();

    if (!data) {
        throw new Error("No se encontraron servicios disponibles");
    }

    return data;
}

export async function getServicesById(id: string): Promise<GetServices | null> {
    if (!id) {
        throw new Error("No se ha suministrado un parametron valido");
    }

    if (isNaN(Number(id))) {
        throw new Error("Identificador no valido para la eliminacion de campos");
    }

    const pieceId = parseInt(id, 10);

    const data = await servicesPageRepository.findById(pieceId);

    if (!data) {
        throw new Error("No se econtro el servicio especificada");
    }

    return data;
}

// Quitar : Promise<boolean>
export async function createServices(newPiece: Record<string, unknown>) {
    return await servicesPageRepository.create(toLowerCaseDeepRecord(newPiece));
}

export async function deleteServices(id: string): Promise<boolean> {
    if (!id) {
        throw new Error("No se ha suministrado un parametro valido");
    }

    if (isNaN(Number(id))) {
        throw new Error("Identificador no valido para la eliminacion de campos");
    }

    const pieceId = parseInt(id, 10);

    if (!servicesPageRepository.findById(pieceId)) {
        throw new Error('Servicio inexistente');
    }

    return servicesPageRepository.delete(pieceId);
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

    return await servicesPageRepository.update(pieceId, toLowerCaseDeepRecord(data));
}