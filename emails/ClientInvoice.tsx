import React from "react";
import {
  Text,
  Section,
  Row,
  Column,
  Hr,
  Button,
} from "@react-email/components";
import { EmailLayout } from "../src/app/layouts/email";

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

interface InvoiceDetailItem {
  amount: number | null;
  subtotal: number;
  pieceExtra: number | null;
  serviceExtra: number | null;
  description: string | null;
  pieces: Piece[] | null;
  purchasedService: Service[] | null;
}

interface InvoiceEmailProps {
  id: string;
  clientName: string;
  clientSurname: string;
  clientIdentified: string;
  invoiceDate: Date;
  invoiceTotal: number;
  invoiceDetail: InvoiceDetailItem[];
}

export const InvoiceEmail: React.FC<InvoiceEmailProps> = ({
  id,
  clientName,
  clientSurname,
  clientIdentified,
  invoiceDate,
  invoiceTotal,
  invoiceDetail,
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
          <strong>Fecha:</strong> {formatDate(invoiceDate)}
        </Text>
      </Section>

      <Hr style={divider} />

      {/* Detalle de la Factura */}
      <Text style={sectionTitle}>Detalle de Servicios y Repuestos</Text>

      {invoiceDetail.map((detail, index) => (
        <Section key={index} style={itemBox}>
          {detail.description && (
            <Text style={itemNote}>
              <strong>Nota:</strong> {detail.description}
            </Text>
          )}
          <Hr style={divider} />
          {/* Servicios */}
          {detail.purchasedService && (
            <>
              <Text style={sectionTitle}>Servicios</Text>
              <Hr style={divider}></Hr>
              {detail.purchasedService.map((ps) => {
                return (
                  <>
                    <Text style={itemTitle}>{ps.name}</Text>
                    {ps.description && (
                      <Text style={itemDescription}>{ps.description}</Text>
                    )}
                    <Row style={itemRow}>
                      <Column style={itemColumn}>
                        <Text style={itemLabel}>Precio base:</Text>
                      </Column>
                      <Column style={itemColumnRight}>
                        <Text style={itemValue}>
                          {formatCurrency(ps.price)}
                        </Text>
                      </Column>
                    </Row>
                    {detail.serviceExtra && detail.serviceExtra > 0 && (
                      <Row style={itemRow}>
                        <Column style={itemColumn}>
                          <Text style={itemLabel}>Extras del servicio:</Text>
                        </Column>
                        <Column style={itemColumnRight}>
                          <Text style={itemValue}>
                            {formatCurrency(detail.serviceExtra)}
                          </Text>
                        </Column>
                      </Row>
                    )}
                    <Row style={itemRow}>
                      <Column style={itemColumn}>
                        <Text style={itemLabel}>Garantía:</Text>
                      </Column>
                      <Column style={itemColumnRight}>
                        <Text style={itemValue}>{ps.guarantee}</Text>
                      </Column>
                    </Row>
                  </>
                );
              })}
            </>
          )}

          {/* Repuestos */}
          {detail.pieces && (
            <>
              <Text style={sectionTitle}>Repuestos</Text>
              <Hr style={divider}></Hr>
              {detail.pieces.map((r) => {
                return (
                  <>
                    <Text style={itemTitle}>{r.name}</Text>
                    {r.description && (
                      <Text style={itemDescription}>{r.description}</Text>
                    )}
                    <Row style={itemRow}>
                      <Column style={itemColumn}>
                        <Text style={itemLabel}>Precio unitario:</Text>
                      </Column>
                      <Column style={itemColumnRight}>
                        <Text style={itemValue}>{formatCurrency(r.price)}</Text>
                      </Column>
                    </Row>
                    <Row style={itemRow}>
                      <Column style={itemColumn}>
                        <Text style={itemLabel}>Cantidad:</Text>
                      </Column>
                      <Column style={itemColumnRight}>
                        <Text style={itemValue}>{detail.amount}</Text>
                      </Column>
                    </Row>
                    {detail.pieceExtra && detail.pieceExtra > 0 && (
                      <Row style={itemRow}>
                        <Column style={itemColumn}>
                          <Text style={itemLabel}>Extras del repuesto:</Text>
                        </Column>
                        <Column style={itemColumnRight}>
                          <Text style={itemValue}>
                            {formatCurrency(detail.pieceExtra)}
                          </Text>
                        </Column>
                      </Row>
                    )}
                  </>
                );
              })}
            </>
          )}

          {/* Subtotal del item */}
          <Hr style={itemDivider} />
          <Row style={subtotalRow}>
            <Column style={itemColumn}>
              <Text style={subtotalLabel}>Subtotal:</Text>
            </Column>
            <Column style={itemColumnRight}>
              <Text style={subtotalValue}>
                {formatCurrency(detail.subtotal)}
              </Text>
            </Column>
          </Row>
        </Section>
      ))}

      <Hr style={divider} />

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
        <a href={`http://localhost:3000/backend/api/requestPdf/invoice/${Number(id)}`} style={downloadButton}>
          Descargar Factura
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
  borderRadius: "0px",
  padding: "20px",
  margin: "0 0 16px",
};

const itemTitle = {
  fontSize: "15px",
  fontWeight: "600",
  padding: "20px",
  color: "#000000",
  margin: "0 0 8px",
};

const itemDescription = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#6b7280",
  margin: "0 0 12px",
  fontStyle: "italic",
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

const itemLabel = {
  fontSize: "13px",
  color: "#6b7280",
  margin: "0",
};

const itemValue = {
  fontSize: "14px",
  color: "#000000",
  fontWeight: "600",
  margin: "0",
};

const itemNote = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#374151",
  backgroundColor: "#f3f4f6",
  border: "1px solid #d1d5db",
  borderLeft: "3px solid #6b7280",
  borderRadius: "0px",
  padding: "12px",
  margin: "16px 0 0",
};

const itemDivider = {
  borderColor: "#d1d5db",
  margin: "16px 0 12px",
};

const subtotalRow = {
  margin: "0",
};

const subtotalLabel = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#374151",
  margin: "0",
};

const subtotalValue = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#000000",
  margin: "0",
};

const totalBox = {
  backgroundColor: "#000000",
  borderRadius: "0px",
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
  borderRadius: "7px",
  border: "2px solid #000000",
  letterSpacing: "0.5px",
  textTransform: "uppercase" as const,
  cursor: "pointer",
};
