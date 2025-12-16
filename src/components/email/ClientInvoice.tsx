import React from "react";
import { Text, Section, Row, Column, Hr } from "@react-email/components";
import { EmailLayout } from "../../app/layouts/email";
import { Decimal } from "@prisma/client/runtime/client";

interface Piece {
  name: string;
  description: string | null;
  price: number;
}

interface Service {
  name: string;
  description: string | null;
  price: number;
  guarantee: string | null;
}

interface InvoiceEmailProps {
  id: number;
  clientName: string;
  clientSurname: string;
  clientIdentified: string;
  clientEmail: string;
  invoiceDate: Date;
  invoiceTotal: number;
  invoiceSubtotal: number;
  pieces: Piece[];
  purchasedService: Service[];
}

export const InvoiceEmail: React.FC<InvoiceEmailProps> = ({
  id,
  clientName,
  clientSurname,
  clientIdentified,
  clientEmail,
  invoiceDate,
  invoiceTotal,
  invoiceSubtotal,
  pieces,
  purchasedService,
}) => {
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

  return (
    <EmailLayout preview="Tu factura de Talleres del Atlántico">
      {/* Saludo */}
      <Text style={greeting}>
        <span style={fontStyleTitle}>Hola</span>{" "}
        <strong>
          {clientName} {clientSurname}
        </strong>
        ,
      </Text>

      <Text style={paragraph}>
        Gracias por confiar en nosotros. A continuación encontrarás el detalle
        de tu factura:
      </Text>

      <Hr style={divider} />

      {/* Información del Cliente */}
      <Section style={infoBox}>
        <Text style={infoTitle}>Información del Cliente</Text>
        <Text style={infoText}>
          <strong>Nombre:</strong> {clientName} {clientSurname}
        </Text>
        <Text style={infoText}>
          <strong>Identificación:</strong> {clientIdentified}
        </Text>
        <Text style={infoText}>
          <strong>Email:</strong> {clientEmail}
        </Text>
        <Text style={infoText}>
          <strong>Fecha:</strong> {formatDate(invoiceDate)}
        </Text>
      </Section>

      <Hr style={divider} />

      {/* Repuestos */}
      {pieces.length > 0 && (
        <>
          <Text style={sectionTitle}>Repuestos y Piezas</Text>
          <Section style={itemBox}>
            {pieces.map((piece, index) => (
              <div key={index}>
                <Row style={itemHeaderRow}>
                  <Column style={itemNumberColumn}>
                    <Text style={itemNumber}>{index + 1}</Text>
                  </Column>
                  <Column>
                    <Text style={itemTitle}>{piece.name}</Text>
                    {piece.description && (
                      <Text style={itemDescription}>{piece.description}</Text>
                    )}
                  </Column>
                  <Column style={itemColumnRight}>
                    <Text style={itemPrice}>{formatCurrency(piece.price)}</Text>
                  </Column>
                </Row>
                {index < pieces.length - 1 && <Hr style={itemDivider} />}
              </div>
            ))}

            {/* Subtotal de Repuestos */}
            <Hr style={subtotalDivider} />
            <Row style={subtotalRow}>
              <Column style={itemColumn}>
                <Text style={subtotalLabel}>Subtotal Repuestos:</Text>
              </Column>
              <Column style={itemColumnRight}>
                <Text style={subtotalValue}>
                  {formatCurrency(
                    pieces.reduce((sum, piece) => sum + piece.price, 0)
                  )}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />
        </>
      )}

      {/* Servicios */}
      {purchasedService.length > 0 && (
        <>
          <Text style={sectionTitle}>Servicios Realizados</Text>
          <Section style={itemBox}>
            {purchasedService.map((service, index) => (
              <div key={index}>
                <Row style={itemHeaderRow}>
                  <Column style={itemNumberColumn}>
                    <Text style={itemNumber}>{index + 1}</Text>
                  </Column>
                  <Column>
                    <Text style={itemTitle}>{service.name}</Text>
                    {service.description && (
                      <Text style={itemDescription}>{service.description}</Text>
                    )}
                    {service.guarantee && (
                      <Text style={itemGuarantee}>
                        🛡️ Garantía: {service.guarantee}
                      </Text>
                    )}
                  </Column>
                  <Column style={itemColumnRight}>
                    <Text style={itemPrice}>
                      {formatCurrency(service.price)}
                    </Text>
                  </Column>
                </Row>
                {index < purchasedService.length - 1 && (
                  <Hr style={itemDivider} />
                )}
              </div>
            ))}

            {/* Subtotal de Servicios */}
            <Hr style={subtotalDivider} />
            <Row style={subtotalRow}>
              <Column style={itemColumn}>
                <Text style={subtotalLabel}>Subtotal Servicios:</Text>
              </Column>
              <Column style={itemColumnRight}>
                <Text style={subtotalValue}>
                  {formatCurrency(
                    purchasedService.reduce(
                      (sum, service) => sum + service.price,
                      0
                    )
                  )}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />
        </>
      )}

      {/* Resumen de Totales */}
      <Section style={summaryBox}>
        <Row style={summaryRow}>
          <Column style={summaryColumn}>
            <Text style={summaryLabel}>Subtotal General:</Text>
          </Column>
          <Column style={summaryColumnRight}>
            <Text style={summaryValue}>{formatCurrency(invoiceSubtotal)}</Text>
          </Column>
        </Row>
      </Section>

      {/* Total */}
      <Section style={totalBox}>
        <Row>
          <Column style={totalColumn}>
            <Text style={totalLabel}>TOTAL A PAGAR:</Text>
          </Column>
          <Column style={totalColumnRight}>
            <Text style={totalValue}>{formatCurrency(invoiceTotal)}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={downloadSection}>
        <a
          href={`http://localhost:3000/backend/api/requestPdf/invoice/${Number(
            id
          )}`}
          style={downloadButton}
        >
          Descargar Factura PDF
        </a>
      </Section>

      {/* Mensaje de agradecimiento */}
      <Text style={thanksMessage}>
        Agradecemos tu preferencia y esperamos verte pronto. Si tienes alguna
        pregunta sobre esta factura, no dudes en contactarnos.
      </Text>

      <Text style={signature}>
        Atentamente,
        <br />
        <strong>Equipo de Talleres del Atlántico</strong>
      </Text>
    </EmailLayout>
  );
};

// Estilos - Paleta profesional en blanco, negro y grises

const greeting = {
  fontSize: "20px",
  padding: "20px 20px 0px 20px",
  color: "#000000",
  margin: "0 0 16px",
};

const fontStyleTitle = {
  fontWeight: "600",
};

const paragraph = {
  fontSize: "14px",
  padding: "0px 0px 20px 20px",
  lineHeight: "24px",
  color: "#4b5563",
  margin: "0 0 24px",
};

const infoBox = {
  padding: "20px",
};

const infoTitle = {
  fontSize: "12px",
  fontWeight: "700",
  color: "#6b7280",
  letterSpacing: "1.5px",
  textTransform: "uppercase" as const,
  margin: "0 0 16px",
};

const infoText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#374151",
  margin: "6px 0",
};

const divider = {
  borderColor: "#e5e7eb",
  borderWidth: "2px",
  margin: "32px 0",
};

const sectionTitle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#000000",
  letterSpacing: "0.5px",
  padding: "20px",
  textTransform: "uppercase" as const,
  margin: "0 0 20px",
};

const itemBox = {
  backgroundColor: "#fafafa",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  padding: "20px",
  margin: "0 0 16px",
};

const itemHeaderRow = {
  margin: "12px 0",
};

const itemNumberColumn = {
  width: "40px",
  verticalAlign: "top",
};

const itemNumber = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#ffffff",
  backgroundColor: "#6b7280",
  borderRadius: "50%",
  width: "28px",
  height: "28px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0",
  textAlign: "center" as const,
  lineHeight: "28px",
};

const itemTitle = {
  fontSize: "15px",
  fontWeight: "600",
  color: "#000000",
  margin: "0 0 4px",
};

const itemDescription = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#6b7280",
  margin: "4px 0",
  fontStyle: "italic",
};

const itemGuarantee = {
  fontSize: "12px",
  color: "#6b7280",
  margin: "4px 0",
  fontStyle: "italic",
};

const itemPrice = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#000000",
  margin: "0",
  textAlign: "right" as const,
};

const itemRow = {
  margin: "8px 0",
};

const itemColumn = {
  width: "60%",
  verticalAlign: "middle",
  paddingLeft: "4px",
};

const itemColumnRight = {
  width: "40%",
  verticalAlign: "middle",
  textAlign: "right" as const,
  paddingRight: "4px",
};

const itemDivider = {
  borderColor: "#e5e7eb",
  margin: "12px 0",
};

const subtotalDivider = {
  borderColor: "#000000",
  borderWidth: "1px",
  margin: "16px 0 12px",
};

const subtotalRow = {
  margin: "0",
  paddingTop: "8px",
};

const subtotalLabel = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#374151",
  margin: "0",
};

const subtotalValue = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#000000",
  margin: "0",
};

const summaryBox = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "0 0 16px",
};

const summaryRow = {
  margin: "0",
};

const summaryColumn = {
  width: "60%",
  verticalAlign: "middle",
};

const summaryColumnRight = {
  width: "40%",
  verticalAlign: "middle",
  textAlign: "right" as const,
};

const summaryLabel = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#374151",
  margin: "0",
};

const summaryValue = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#000000",
  margin: "0",
};

const totalBox = {
  backgroundColor: "#000000",
  borderRadius: "8px",
  padding: "20px",
  margin: "0 0 32px",
};

const totalColumn = {
  width: "60%",
  verticalAlign: "middle",
};

const totalColumnRight = {
  width: "40%",
  verticalAlign: "middle",
  textAlign: "right" as const,
};

const totalLabel = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#ffffff",
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
  margin: "0",
};

const totalValue = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#ffffff",
  margin: "0",
};

const thanksMessage = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#4b5563",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const signature = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#374151",
  margin: "20px",
  textAlign: "center" as const,
};

const downloadSection = {
  textAlign: "center" as const,
  margin: "32px 0",
  padding: "0 20px",
};

const downloadButton = {
  backgroundColor: "#000000",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
  borderRadius: "8px",
  border: "2px solid #000000",
  letterSpacing: "0.5px",
  textTransform: "uppercase" as const,
  cursor: "pointer",
};