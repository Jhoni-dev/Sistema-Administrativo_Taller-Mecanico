import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { toInvoiceCreateInput } from "../mappers/invoiceMapper";
import { GetInvoice, GetInvoiceById, InvoiceCreate, UpdateInvoiceDetails, InvoiceDetailInput, GetClientInvoiceById } from "../types/models/entity";
import { Decimal } from "@prisma/client/runtime/library";

export const invoiceRepository = {
    async findMany(): Promise<GetInvoice[] | []> {
        try {
            return await prisma.invoice.findMany({
                orderBy: {
                    id: 'asc'
                },
                include: {
                    author: {
                        select: {
                            fullName: true,
                            fullSurname: true,
                        }
                    },
                    invoiceDetail: {
                        select: {
                            id: true,
                            amount: true,
                            subtotal: true,
                            pieceExtra: true,
                            serviceExtra: true,
                            description: true,
                            pieces: {
                                select: {
                                    name: true,
                                    price: true
                                }
                            },
                            purchasedService: {
                                select: {
                                    name: true,
                                    price: true
                                }
                            }
                        }
                    }
                }
            });
        } catch {
            throw new Error("Ha ocurrido un error inesperado en la consulta de datos");
        }
    },

    async findInvoiceById(id: number): Promise<GetInvoiceById | null> {
        try {
            return await prisma.invoice.findUnique({
                where: { id },
                select: {
                    id: true,
                    total: true,
                    createAt: true,
                    author: {
                        select: {
                            fullName: true,
                            fullSurname: true,
                            identified: true,
                            clientContact: {
                                select: {
                                    email: true,
                                }
                            }
                        }
                    },
                    invoiceDetail: {
                        select: {
                            amount: true,
                            subtotal: true,
                            pieceExtra: true,
                            serviceExtra: true,
                            description: true,
                            pieces: {
                                select: {
                                    name: true,
                                    description: true,
                                    price: true,
                                }
                            },
                            purchasedService: {
                                select: {
                                    name: true,
                                    description: true,
                                    price: true,
                                    guarantee: true,
                                }
                            }
                        }
                    }
                }
            })
        } catch {
            throw new Error("Ha ocurrido un error inesperado en la consulta de datos unicos");
        }
    },

    async findById(id: number): Promise<GetClientInvoiceById | null> {
        try {
            return await prisma.client.findUnique({
                where: { id },
                select: {
                    id: true,
                    fullName: true,
                    fullSurname: true,
                    identified: true,
                    clientContact: {
                        select: {
                            phoneNumber: true,
                            email: true
                        }
                    },
                    clientInvoice: {
                        select: {
                            total: true,
                            createAt: true,
                            invoiceDetail: {
                                select: {
                                    id: true,
                                    amount: true,
                                    subtotal: true,
                                    pieceExtra: true,
                                    serviceExtra: true,
                                    description: true,
                                    pieces: {
                                        select: {
                                            id: true,
                                            name: true,
                                            price: true
                                        }
                                    },
                                    purchasedService: {
                                        select: {
                                            id: true,
                                            name: true,
                                            price: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })
        } catch {
            throw new Error("Ha ocurrido un error inesperado en la consulta de datos unicos");
        }
    },

    async updateInvoice(id: number, data: UpdateInvoiceDetails): Promise<GetInvoice | null> {
        return await prisma.$transaction(async (tx) => {
            const { detailId, amount = 1, description, services, pieces } = data;

            // ✅ Verificar que la factura existe
            const invoice = await tx.invoice.findUnique({
                where: { id },
                include: { invoiceDetail: true },
            });

            if (!invoice) throw new Error("Factura no encontrada");

            // ✅ CORRECCIÓN 1: Verificar el detalle con detailId, no con id de invoice
            const oldDetail = await tx.invoiceDetail.findUnique({
                where: { id: detailId },
                select: {
                    id: true,
                    amount: true,
                    pieceId: true,
                    purchasedService: true,
                },
            });

            if (!oldDetail) throw new Error("Detalle de factura no encontrado");

            let price = new Decimal(0);

            // Manejar actualización de piezas
            if (pieces) {
                const piece = await tx.pieces.findUnique({
                    where: { id: pieces.id },
                    select: { price: true, stock: true },
                });
                if (!piece) throw new Error('Pieza no encontrada');
                price = piece.price;

                const diff = amount - (oldDetail.amount ?? 0);

                if (diff !== 0) {
                    const newStock = piece.stock - diff;
                    if (newStock < 0) throw new Error("Stock insuficiente para esta pieza");

                    await tx.pieces.update({
                        where: { id: pieces.id },
                        data: { stock: newStock },
                    });
                }
            }

            // Manejar actualización de servicios
            if (services) {
                const service = await tx.services.findUnique({
                    where: { id: services.id },
                    select: { price: true },
                });
                if (!service) throw new Error('Servicio no encontrado');
                price = service.price;
            }

            const subtotal = price.mul(amount);

            // ✅ CORRECCIÓN 2: Actualizar usando detailId, no id de invoice
            await tx.invoiceDetail.update({
                where: { id: detailId },  // ✅ Corregido
                data: {
                    amount,
                    subtotal,
                    description,
                }
            });

            // ✅ CORRECCIÓN 3: Buscar todos los detalles de la factura usando invoiceId
            const details = await tx.invoiceDetail.findMany({
                where: { id },  // ✅ Corregido
                select: { subtotal: true, pieceExtra: true, serviceExtra: true },
            });

            // ✅ CORRECCIÓN 4: Sumar subtotales + extras
            const total = details.reduce(
                (acc, d) => {
                    const subtotalDecimal = new Decimal(d.subtotal);
                    const extraDecimal = new Decimal(d.pieceExtra || 0).plus(d.serviceExtra || 0);
                    return acc.plus(subtotalDecimal).plus(extraDecimal);
                },
                new Decimal(0)
            );

            // Actualizar el total de la factura
            const updatedInvoice = await tx.invoice.update({
                where: { id },
                data: { total },
                include: {
                    author: { select: { fullName: true, fullSurname: true } },
                    invoiceDetail: {
                        select: {
                            amount: true,
                            subtotal: true,
                            pieceExtra: true,
                            serviceExtra: true,
                            description: true,
                            purchasedService: { select: { name: true, price: true } },
                            pieces: { select: { name: true, price: true } },
                        },
                    },
                },
            });

            return updatedInvoice;
        });
    },


    async create(data: InvoiceCreate) {
        try {
            return await prisma.$transaction(async tx => {
                const pieceDetails: InvoiceDetailInput[] = data.pieces ? await Promise.all(
                    data.pieces.map(async (item) => {
                        const piece = await tx.pieces.findUnique({
                            where: { id: item.id }
                        });

                        if (!piece) throw new Error(`El ID ${item.id} de la pieza solicitada no se encuentra disponible`);

                        if (piece.stock < item.amount) throw new Error("No hay stock disponible para esta pieza");

                        if (item.amount > piece.stock) throw new Error("La cantidad digitada supera a la esperada");

                        const subtotal = piece.price.mul(item.amount);

                        const pieceExtra = new Prisma.Decimal(item.pieceExtra || 0);

                        const pieceUpdate = await tx.pieces.update({
                            where: { id: item.id },
                            data: {
                                stock: {
                                    decrement: item.amount
                                }
                            }
                        });

                        if (pieceUpdate.stock === 0) {
                            await tx.pieces.update({
                                where: { id: item.id },
                                data: {
                                    estado: 'AGOTADO'
                                }
                            })
                        }

                        return {
                            pieces: { connect: { id: piece.id } },
                            amount: item.amount,
                            pieceExtra: pieceExtra,
                            subtotal
                        }
                    })
                ) : [];

                const serviceDetails: InvoiceDetailInput[] = data.service ? await Promise.all(
                    data.service.map(async (item) => {
                        const service = await tx.services.findUnique({
                            where: { id: item.id }
                        })

                        if (!service) throw new Error(`El ID ${item.id} del servicio solicitado no se encuentra disponible`);

                        const subtotal = service.price;

                        const serviceExtra = new Prisma.Decimal(item.serviceExtra || 0);

                        return {
                            purchasedService: { connect: { id: item.id } },
                            subtotal,
                            serviceExtra: serviceExtra
                        }
                    })
                ) : [];

                const descriptionDetail: InvoiceDetailInput = {
                    description: data.description, // Asumiendo que data.description es string
                    subtotal: new Prisma.Decimal(0), // O el valor que corresponda
                    // Agrega otros campos requeridos por InvoiceDetailInput
                };

                const allDetails = [...pieceDetails, ...serviceDetails, descriptionDetail];

                const invoiceData = toInvoiceCreateInput(data, allDetails);

                console.error(invoiceData)

                const invoiceCreate = await tx.invoice.create({
                    data: invoiceData,
                    select: {
                        id: true,
                        total: true,
                        createAt: true,
                        author: {
                            select: {
                                fullName: true,
                                fullSurname: true,
                                identified: true,
                                clientContact: {
                                    select: {
                                        email: true,
                                    }
                                }
                            }
                        },
                        invoiceDetail: {
                            select: {
                                amount: true,
                                subtotal: true,
                                pieceExtra: true,
                                serviceExtra: true,
                                description: true,
                                pieces: {
                                    select: {
                                        name: true,
                                        description: true,
                                        price: true,
                                    }
                                },
                                purchasedService: {
                                    select: {
                                        name: true,
                                        description: true,
                                        price: true,
                                        guarantee: true,
                                    }
                                }
                            }
                        }
                    }
                });

                return invoiceCreate;
            });
        } catch (error) {
            console.log(error);
            throw new Error("Ha ocurrido un error inesperado en la consulta de datos");
        }
    },

    async delete(id: number): Promise<boolean> {
        try {
            const invoiceDelete = await prisma.invoice.delete({
                where: { id }
            });

            return invoiceDelete ? true : false;
        } catch {
            throw new Error("Ha ocurrido un error inesperado en la eliminacion de campos");
        }
    }
}