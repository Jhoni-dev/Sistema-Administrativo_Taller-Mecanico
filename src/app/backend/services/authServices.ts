import { authRepository } from "../repository/authRepository";
import { hashed, verifyHash } from "../../../lib/argon";
import { generateToken } from "@/lib/jwt";
import { cleanData } from "../utils/cleanData";
import { GetSession } from "../types/models/entity";
import { toLowerCaseDeepRecord } from "../utils/filtersRepository"
import { sendWelcomeEmail } from "@/lib/email";

export async function getAllSessions(): Promise<GetSession[] | null> {
    const users = await authRepository.findMany();

    if (!users) {
        throw new Error("No hay usuarios disponibles");
    }

    return users;
}

export async function getSessionById(email: string, password: string): Promise<Record<string, unknown>> {
    const user = await authRepository.findById(email);

    if (!user) {
        throw new Error("No se encontro el usuario asociado");
    }

    if (!user.credentials) {
        throw new Error("El usuario no tiene credenciales asociadas");
    }

    const parsePass = await verifyHash(user.credentials.password, password);

    if (!parsePass) {
        throw new Error("Contraseña incorrecta");
    }

    const { credentials, ...userWithoutPassword } = user;

    const token = await generateToken(userWithoutPassword);

    return { token, userWithoutPassword };
}

export async function sessionExist(emailSession: string): Promise<boolean> {
    const success = await authRepository.existSessionByEmail(emailSession);

    if (!success) {
        throw new Error("No se encontro el usuario consultado");
    }

    return success;
}

export async function createSession(newSession: Record<string, unknown>) {
    const dataSession = await newSession;

    if (typeof dataSession.password !== "string") {
        throw new Error("La contraseña digitada no cumple los parametros necesarios");
    }

    const passHashed = await hashed(dataSession.password);
    dataSession.password = passHashed;

    const accountCreate = await authRepository.createSession(toLowerCaseDeepRecord(dataSession));

    if (!accountCreate) throw new Error("No se ha podido crear correctamente el usuario");
    
    await sendWelcomeEmail(accountCreate.email, accountCreate.rol, accountCreate.name);

    return accountCreate;
}

export async function updateById<T extends Record<string, unknown> & { password?: string }>(email: string, input: T): Promise<boolean> {
    const data = cleanData.arrays(input);

    if (Object.keys(data).length === 0) {
        throw new Error("No se proporcionaron campos para actualizar");
    }

    if (data.password && typeof data.password === "string") {
        data.password = await hashed(data.password);
    }

    return await authRepository.update(email, toLowerCaseDeepRecord(data));
}

export async function deleteById(id: string): Promise<boolean> {
    if (!id) {
        throw new Error("No se ha suministrado un parametro valido");
    }

    if (isNaN(Number(id))) {
        throw new Error("Identificador no valido para la eliminacion de campos");
    }

    const parseId = parseInt(id, 10);

    const sessionExists = await authRepository.existSessionById(parseId);

    if (!sessionExists) {
        throw new Error("El perfil seleccionado no se encuentra disponible");
    }

    const eliminated = authRepository.delete(parseId);

    if (!eliminated) {
        throw new Error("No se ha podido eliminar el usuario seleccionado");
    }

    return eliminated;
}