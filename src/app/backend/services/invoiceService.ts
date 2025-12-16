import { sendInvoiceEmail } from "@/lib/email";
import { invoiceRepository } from "../repository/invoiceRepository";
import { GetClientInvoiceById, GetInvoice, GetInvoiceById, InvoiceCreate, UpdateInvoiceDetails } from "../types/models/entity";

export async function getClientInvoiceById(id: string): Promise<GetClientInvoiceById | null> {
    const clientId = parseInt(id, 10);

    const data = await invoiceRepository.findById(clientId);

    return data;
}

export async function getInvoiceById(id: string): Promise<GetInvoiceById | null> {
    const invoiceId = parseInt(id, 10);

    const data = await invoiceRepository.findInvoiceById(invoiceId);

    if (!data) throw new Error("No se encontraron facturas");

    return data;
}

export async function getAllInvoices(): Promise<GetInvoice[] | []> {
    const data = await invoiceRepository.findMany();

    return data;
}

export async function createInvoice(data: InvoiceCreate) {
    const invoiceCreate = await invoiceRepository.create(data);

    if (!invoiceCreate) throw new Error("Ha ocurrido un error en la creacion de la factura");

    const emailSend = await sendInvoiceEmail(invoiceCreate);

    if (!emailSend) throw new Error("Ha ocurrido un error inesperado al enviar la factura digital al cliente");

    return invoiceCreate;
}

export async function delelteInvoice(id: string): Promise<boolean> {
    const invoiceId = parseInt(id, 10);

    const invoiceDelete = await invoiceRepository.delete(invoiceId);

    return invoiceDelete;
}

export async function updateInvoiceDetail(id: string, input: UpdateInvoiceDetails): Promise<GetInvoice | null> {
    const invoiceId = parseInt(id, 10);

    return await invoiceRepository.updateInvoice(invoiceId, input);
}