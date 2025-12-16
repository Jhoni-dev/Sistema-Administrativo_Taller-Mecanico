import { serviceCategoryRepository } from "../repository/servicesCategoryRepository";
import { GetServiceCategory } from "../types/models/entity";
import { cleanData } from "../utils/cleanData";
import { toLowerCaseDeepRecord } from "../utils/filtersRepository";

export async function getServiceCategory(): Promise<GetServiceCategory[] | null> {
    const data = await serviceCategoryRepository.findMany();

    if (!data) {
        throw new Error("No se encontraron servicios disponibles");
    }

    return data;
}

export async function getServiceCategory_ById(id: string): Promise<GetServiceCategory | null> {
    if (!id) {
        throw new Error("No se ha suministrado un parametron valido");
    }

    if (isNaN(Number(id))) {
        throw new Error("Identificador no valido para la eliminacion de campos");
    }

    const categoryId = parseInt(id, 10);

    const data = await serviceCategoryRepository.findById(categoryId);

    if (!data) {
        throw new Error("No se econtro la categoria especificada");
    }

    return data;
}

export async function createServiceCategory(newPiece: Record<string, unknown>): Promise<boolean> {
    return await serviceCategoryRepository.create(toLowerCaseDeepRecord(newPiece));
}

export async function deleteServiceCategory(id: string): Promise<boolean> {
    if (!id) {
        throw new Error("No se ha suministrado un parametro valido");
    }

    if (isNaN(Number(id))) {
        throw new Error("Identificador no valido para la eliminacion de campos");
    }

    const categoryId = parseInt(id, 10);

    if (!serviceCategoryRepository.findById(categoryId)) {
        throw new Error('Servicio inexistente');
    }

    return serviceCategoryRepository.delete(categoryId);
}

export async function updateById<T extends Record<string, unknown>>(id: string, input: T) {
    if (!id) {
        throw new Error("No se ha suministrado un parametro valido");
    }

    if (isNaN(Number(id))) {
        throw new Error("Identificador no valido para la eliminacion de campos");
    }

    const categoryId = parseInt(id, 10);
    const data = cleanData.arrays(input);

    if (Object.keys(data).length === 0) {
        throw new Error("No se proporcionaron campos para actualizar");
    }

    return await serviceCategoryRepository.update(categoryId, toLowerCaseDeepRecord(data));
}