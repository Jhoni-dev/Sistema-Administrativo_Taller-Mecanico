import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { PasswordResetEmail } from "../components/email/PasswordResetEmail";
import { PasswordChangedEmail } from "../components/email/PasswordChangedEmail";
import { WelcomeEmail } from "../components/email/WelcomeEmail";
import React from "react";
import { InvoiceEmail } from "@/components/email/ClientInvoice";
import { GetInvoiceClient } from "@/app/backend/types/models/entity";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * Convierte recursivamente todos los objetos Decimal (Prisma/decimal.js) a números
 * y las fechas a strings ISO
 */
export function convertDecimals(obj: any): any {
  // Detectar TODOS los decimals (Prisma o decimal.js)
  if (
    obj instanceof Decimal ||
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
    return obj.map((item) => convertDecimals(item));
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


// Función auxiliar para crear el transporter
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });
}

/**
 * Envía un email de recuperación de contraseña
 * @param email - Email del destinatario
 * @param token - Token de recuperación
 * @param userName - Nombre del usuario (opcional)
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  userName?: string
) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/confirmar?token=${token}`;

  // Renderizar el componente de React a HTML con await
  const emailHtml = await render(
    React.createElement(PasswordResetEmail, { resetLink, userName })
  );

  // Generar versión de texto plano
  const emailText = `
Recuperación de Contraseña

Hola${userName ? ` ${userName}` : ""},

Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.

Para restablecer tu contraseña, visita el siguiente enlace:
${resetLink}

Este enlace expirará en 1 hora por razones de seguridad.

Si no realizaste esta solicitud, puedes ignorar este correo de forma segura.

---
Talleres del Atlántico
© ${new Date().getFullYear()} Todos los derechos reservados
  `.trim();

  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: '"Talleres del Atlántico" <no-reply@talleresatlantico.com>',
      to: email,
      subject: "🔐 Recuperación de Contraseña - Talleres del Atlántico",
      html: emailHtml,
      text: emailText,
    });

    console.log(`Email de recuperación enviado a: ${email}`);
  } catch (error) {
    console.error("Error al enviar email de recuperación:", error);
    throw new Error("Error al enviar el email de recuperación");
  }
}

/**
 * Envía un email de confirmación de cambio de contraseña
 * @param email - Email del destinatario
 * @param userName - Nombre del usuario
 */
export async function sendPasswordChangedEmail(
  email: string,
  userName: string
) {
  // Renderizar el componente de React a HTML con await
  const emailHtml = await render(
    React.createElement(PasswordChangedEmail, { userName, changeDate: new Date() })
  );

  // Generar versión de texto plano
  const emailText = `
Contraseña Actualizada

Hola ${userName},

Te confirmamos que la contraseña de tu cuenta ha sido actualizada exitosamente.

Fecha y hora: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}

Si no realizaste este cambio, contacta inmediatamente a nuestro equipo de soporte.

---
Talleres del Atlántico
© ${new Date().getFullYear()} Todos los derechos reservados
  `.trim();

  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: '"Talleres del Atlántico" <no-reply@talleresatlantico.com>',
      to: email,
      subject: "✅ Contraseña Actualizada - Talleres del Atlántico",
      html: emailHtml,
      text: emailText,
    });

    console.log(`Email de confirmación enviado a: ${email}`);
  } catch (error) {
    console.error("Error al enviar email de confirmación:", error);
    throw new Error("Error al enviar el email de confirmación");
  }
}

/**
 * Envía un email de bienvenida
 * @param email - Email del destinatario
 * @param userName - Nombre del usuario
 */
export async function sendWelcomeEmail(
  email: string,
  rol: string,
  userName: string
) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}auth/login`;

  // Renderizar el componente de React a HTML con await
  const emailHtml = await render(
    React.createElement(WelcomeEmail, { userName, rol, loginUrl })
  );

  // Generar versión de texto plano
  const emailText = `
¡Bienvenido a Talleres del Atlántico!

Hola ${userName},

Nos complace darte la bienvenida a nuestro sistema de gestión. Tu cuenta ha sido creada exitosamente.

Accede al sistema en: ${loginUrl}

Consejo: Te recomendamos cambiar tu contraseña después del primer inicio de sesión para mayor seguridad.

---
Talleres del Atlántico
© ${new Date().getFullYear()} Todos los derechos reservados
  `.trim();

  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: '"Talleres del Atlántico" <no-reply@talleresatlantico.com>',
      to: email,
      subject: "Bienvenido a Talleres del Atlántico",
      html: emailHtml,
      text: emailText,
    });

    console.log(`Email de bienvenida enviado a: ${email}`);
  } catch (error) {
    console.error("Error al enviar email de bienvenida:", error);
    throw new Error("Error al enviar el email de bienvenida");
  }
}

export async function sendInvoiceEmail(invoiceData: GetInvoiceClient) {
  // Validar que el cliente tenga al menos un email
  if (
    !invoiceData.author.clientContact ||
    invoiceData.author.clientContact.length === 0
  ) {
    throw new Error("El cliente no tiene un email registrado");
  }

  const clientEmail = invoiceData.author.clientContact[0].email;

  // Convertir todos los Decimals a números
  const converter = convertDecimals(invoiceData);

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
  const piecesSubtotal = allPieces.reduce(
    (sum, piece) => sum + (piece.price || 0),
    0
  );
  const servicesSubtotal = allServices.reduce(
    (sum, service) => sum + (service.price || 0),
    0
  );
  const subtotalGeneral = piecesSubtotal + servicesSubtotal;

  // Renderizar el componente de React a HTML con await
  const emailHtml = await render(
    React.createElement(InvoiceEmail, {
      id: converter.id,
      clientName: converter.author.fullName,
      clientSurname: converter.author.fullSurname,
      clientIdentified: converter.author.identified,
      clientEmail: clientEmail,
      invoiceDate: new Date(converter.createAt),
      invoiceTotal: converter.total,
      invoiceSubtotal: subtotalGeneral,
      pieces: allPieces,
      purchasedService: allServices,
    })
  );

  // Generar versión de texto plano
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Bogota",
    }).format(new Date(date));
  };

  let emailText = `
FACTURA - TALLERES DEL ATLÁNTICO

Cliente: ${converter.author.fullName} ${converter.author.fullSurname}
Identificación: ${converter.author.identified}
Email: ${clientEmail}
Fecha: ${formatDate(new Date(converter.createAt))}

---

DETALLE DE SERVICIOS Y REPUESTOS:

`;

  // Agregar repuestos
  if (allPieces.length > 0) {
    emailText += "\nREPUESTOS Y PIEZAS:\n";
    allPieces.forEach((piece, index) => {
      emailText += `\n[${index + 1}] ${piece.name}\n`;
      if (piece.description) {
        emailText += `   Descripción: ${piece.description}\n`;
      }
      emailText += `   Precio: ${formatCurrency(piece.price)}\n`;
    });
    emailText += `\n   SUBTOTAL REPUESTOS: ${formatCurrency(piecesSubtotal)}\n`;
  }

  // Agregar servicios
  if (allServices.length > 0) {
    emailText += "\nSERVICIOS REALIZADOS:\n";
    allServices.forEach((service, index) => {
      emailText += `\n[${index + 1}] ${service.name}\n`;
      if (service.description) {
        emailText += `   Descripción: ${service.description}\n`;
      }
      emailText += `   Precio: ${formatCurrency(service.price)}\n`;
      if (service.guarantee) {
        emailText += `   Garantía: ${service.guarantee}\n`;
      }
    });
    emailText += `\n   SUBTOTAL SERVICIOS: ${formatCurrency(
      servicesSubtotal
    )}\n`;
  }

  emailText += `
---

SUBTOTAL GENERAL: ${formatCurrency(subtotalGeneral)}
TOTAL A PAGAR: ${formatCurrency(converter.total)}

---

Descargar factura: http://localhost:3000/backend/api/requestPdf/invoice/${converter.id}

Agradecemos tu preferencia y esperamos verte pronto.

Talleres del Atlántico
© ${new Date().getFullYear()} Todos los derechos reservados
  `.trim();

  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: '"Talleres del Atlántico" <no-reply@talleresatlantico.com>',
      to: clientEmail,
      subject: `Tu Factura #${converter.id} - Talleres del Atlántico`,
      html: emailHtml,
      text: emailText,
    });

    console.log(`Factura enviada por email a: ${clientEmail}`);
    return { success: true, email: clientEmail };
  } catch (error) {
    console.error("Error al enviar factura por email:", error);
    throw new Error("Error al enviar la factura por email");
  }
}
