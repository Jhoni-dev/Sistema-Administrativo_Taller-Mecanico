import { getInvoiceById } from "@/app/backend/services/invoiceService";
import { exportToPDF } from "@/components/documentsExport/pdf";
import { NextRequest, NextResponse } from "next/server";

import { Decimal, Decimal as PrismaDecimal } from "@prisma/client/runtime/library";

type InvoiceDetailItem = {
    amount: number | null;
    subtotal: Decimal;
    pieceExtra: Decimal | null;
    serviceExtra: Decimal | null;
    description: string | null;
    pieces: {
        name: string;
        description: string | null;
        price: Decimal;
    } | null;
    purchasedService: {
        name: string;
        description: string | null;
        price: Decimal;
        guarantee: string | null;
    } | null;
};

/**
 * Convierte recursivamente todos los objetos Decimal (Prisma/decimal.js) a números
 * y las fechas a strings ISO
 */
export function convertDecimals(obj: any): any {
    // Detectar TODOS los decimals (Prisma o decimal.js)
    if (
        obj instanceof PrismaDecimal ||
        (typeof obj === "object" && obj?.constructor?.name === "Decimal") ||
        (Decimal.isDecimal && Decimal.isDecimal(obj))
    ) {
        return Number(obj.toString());
    }

    // Fechas → string ISO
    if (obj instanceof Date) {
        return obj.toISOString();
    }

    // Arrays
    if (Array.isArray(obj)) {
        return obj.map(item => convertDecimals(item));
    }

    // Objetos
    if (obj !== null && typeof obj === "object") {
        const newObj: any = {};
        for (const key in obj) {
            newObj[key] = convertDecimals(obj[key]);
        }
        return newObj;
    }

    // Primitivos
    return obj;
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;

        const invoice = await getInvoiceById(id);

        if (!invoice) {
            return NextResponse.json(
                { error: "Factura no encontrada" },
                { status: 404 }
            );
        }

        // Convertir todos los Decimals a números
        const converter = convertDecimals(invoice);

        // Extraer todas las piezas de todos los invoiceDetails
        const allPieces: any[] = [];
        const allServices: any[] = [];

        converter.invoiceDetail.forEach((detail: any) => {
            if (detail.pieces) {
                allPieces.push(detail.pieces);
            }
            if (detail.purchasedService) {
                allServices.push(detail.purchasedService);
            }
        });

        // Calcular subtotales
        const piecesSubtotal = allPieces.reduce((sum, piece) => sum + (piece.price || 0), 0);
        const servicesSubtotal = allServices.reduce((sum, service) => sum + (service.price || 0), 0);
        const subtotalGeneral = piecesSubtotal + servicesSubtotal;

        const filteredData = {
            fullName: converter.author.fullName,
            fullSurname: converter.author.fullSurname,
            identified: converter.author.identified,
            email: converter.author.clientContact?.email || "No especificado",
            total: converter.total,
            subtotal: subtotalGeneral,
            createAt: converter.createAt,
            // Enviar arrays de piezas y servicios en el nivel superior
            pieces: allPieces,
            purchasedService: allServices,
        };

        const bufferPdf = await exportToPDF(
            {
                title: "Factura de Cliente",
                subtitle: "Taller Mecánico",
                invoiceNumber: `#${converter.id}`,
                data: [],
                columns: [],
                paragraph: filteredData,
                fileName: `factura_${converter.id}_{date}.pdf`,
                companyInfo: {
                    address: "Calle Principal #123, Barranquilla",
                    phone: "+57 300 123 4567",
                    email: "contacto@tallerautofix.com",
                    taxId: "NIT 900.123.456-7",
                },
                sections: [
                    {
                        title: "REPUESTOS Y PIEZAS",
                        dataKey: "pieces",
                        showInDetail: false, // No buscar en cada detalle, sino en el root
                    },
                    {
                        title: "SERVICIOS REALIZADOS",
                        dataKey: "purchasedService",
                        showInDetail: false, // No buscar en cada detalle, sino en el root
                    }
                ],
                footerText: "Gracias por confiar en nuestros servicios",
            },
            true
        );

        const hora = timeZone();

        return new NextResponse(bufferPdf, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=factura_${hora}.pdf`
            },
        });
    } catch (error) {
        console.error("Error al generar PDF:", error);
        return NextResponse.json(
            { error: "Ha ocurrido un error en la generación del archivo PDF" },
            { status: 500 }
        );
    }
}

export function timeZone() {
    return new Date().toLocaleDateString("es-CO", {
        timeZone: "America/Bogota",
    });
}