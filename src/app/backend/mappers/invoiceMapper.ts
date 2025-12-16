import { Prisma } from '@prisma/client';
import { InvoiceDetailInput } from '../types/models/entity';

export function toInvoiceCreateInput(data: Record<string, unknown>, allDetails: InvoiceDetailInput[]): Prisma.InvoiceCreateInput {
    const total = allDetails.reduce(
        (sum, d) => {
            let lineTotal = sum.add(d.subtotal);

            if (d.pieceExtra) {
                lineTotal = lineTotal.add(d.pieceExtra);
            }

            if (d.serviceExtra) {
                lineTotal = lineTotal.add(d.serviceExtra);
            }

            return lineTotal;
        },
        new Prisma.Decimal(0)
    );

    const prismaData: Prisma.InvoiceCreateInput = {
        author: {
            connect: { id: data.clientId as number }
        },
        total,
        invoiceDetail: {
            create: allDetails.map(detail => ({
                ...detail,
                // Asegurar que todos los campos requeridos estén presentes
                amount: detail.amount || 1,
                pieceExtra: detail.pieceExtra || new Prisma.Decimal(0),
                serviceExtra: detail.serviceExtra || new Prisma.Decimal(0),
                subtotal: detail.subtotal,
                description: detail.description,
                // Solo incluir connects si existen
                ...(detail.piece && { pieces: detail.piece }),
                ...(detail.service && { purchasedService: detail.service }),
            }))
        },
    }

    return prismaData;
}