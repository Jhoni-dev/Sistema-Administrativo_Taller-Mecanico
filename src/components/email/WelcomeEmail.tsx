import * as React from "react";
import {
  Section,
  Text,
  Button,
  Heading,
} from "@react-email/components";
import { EmailLayout } from "../../app/layouts/email";

interface WelcomeEmailProps {
  userName: string;
  rol: string;
  loginUrl?: string;
}

export function WelcomeEmail({
  userName,
  rol,
  loginUrl = "http://localhost:3000/auth/login",
}: WelcomeEmailProps) {
  return (
    <EmailLayout preview={`¡Bienvenido a Talleres del Atlántico, ${userName}!`}>
      <Section style={contentStyle}>
        {/* Header - estilo similar al login */}
        <div style={headerStyle}>
          <Heading style={titleStyle}>Bienvenido</Heading>
          <Text style={subtitleStyle}>Talleres del Atlántico</Text>
        </div>

        {/* Saludo */}
        <Text style={textStyle}>Hola <strong>{userName}</strong>,</Text>

        <Text style={textStyle}>
          Nos complace darte la bienvenida a nuestro sistema de gestión. Tu
          cuenta ha sido creada exitosamente y ya puedes acceder a todas
          aquellas funcionalidades correspondientes a tu rol. Has ingresado con
          el rol <strong>{rol}</strong>
        </Text>

        {/* Características destacadas */}
        {rol == "MECANICO" ? (
          <Section style={featuresBoxStyle}>
            <Text style={featuresTitleStyle}>¿Qué puedes hacer?</Text>
            <Text style={featuresTextStyle}>
              • Gestionar metricas en tiempo real{"\n"}
              • Gestionar citas disponibles{"\n"}
              • Gestionar clientes{"\n"}
            </Text>
          </Section>
        ) : (
          <Section style={featuresBoxStyle}>
            <Text style={featuresTitleStyle}>¿Qué puedes hacer?</Text>
            <Text style={featuresTextStyle}>
              • Gestionar metricas en tiempo real{"\n"}
              • Gestionar tus talleres, servicios e inventario{"\n"}
              • Gestion total de citas{"\n"}
              • Administrar clientes y vehículos{"\n"}
              • Generar reportes y estadísticas{"\n"}
              • Gestion de documentos{"\n"}
              • Y mucho más...
            </Text>
          </Section>
        )}

        {/* Botón de acción */}
        <Section style={buttonContainerStyle}>
          <Button href={loginUrl} style={buttonStyle}>
            Acceder al Sistema
          </Button>
        </Section>

        {/* Consejo */}
        <Section style={tipBoxStyle}>
          <Text style={tipTitleStyle}>Atencion:</Text>
          <Text style={tipTextStyle}>
            Cambio de contraseña <strong>obligatorio</strong>. Esto se hace para
            una mayor seguridad.
          </Text>
        </Section>

        <Text style={textStyle}>
          Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
        </Text>

        {/* Footer - igual que en el login */}
        <Text style={footerStyle}>Talleres del Atlántico</Text>
      </Section>
    </EmailLayout>
  );
}

// Estilos del componente ajustados al login
const contentStyle = {
  padding: "48px 32px",
};

const headerStyle = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const titleStyle = {
  margin: "0 0 8px 0",
  color: "#09090b",
  fontSize: "24px",
  fontWeight: "700",
  textAlign: "center" as const,
};

const subtitleStyle = {
  margin: "0",
  color: "#71717a",
  fontSize: "14px",
  fontWeight: "400",
  textAlign: "center" as const,
  lineHeight: "1.5",
};

const textStyle = {
  margin: "0 0 16px 0",
  color: "#09090b",
  fontSize: "14px",
  lineHeight: "1.6",
};

const featuresBoxStyle = {
  margin: "24px 0",
  padding: "16px",
  backgroundColor: "#f4f4f5",
  borderRadius: "6px",
  border: "1px solid #e4e4e7",
};

const featuresTitleStyle = {
  margin: "0 0 12px 0",
  color: "#09090b",
  fontSize: "14px",
  fontWeight: "600",
};

const featuresTextStyle = {
  margin: "0",
  color: "#52525b",
  fontSize: "14px",
  lineHeight: "1.8",
  whiteSpace: "pre-line" as const,
};

const buttonContainerStyle = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const buttonStyle = {
  display: "inline-block",
  padding: "10px 16px",
  backgroundColor: "#09090b",
  color: "#fafafa",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: "500",
  borderRadius: "6px",
};

const tipBoxStyle = {
  margin: "24px 0",
  padding: "16px",
  backgroundColor: "rgba(255, 255, 153, .4)",
  borderRadius: "6px",
};

const tipTitleStyle = {
  margin: "0 0 8px 0",
  color: "#EDD440",
  fontSize: "14px",
  fontWeight: "600",
};

const tipTextStyle = {
  margin: "0",
  color: "#EDD440",
  fontSize: "14px",
  lineHeight: "1.6",
};

const footerStyle = {
  margin: "32px 0 0 0",
  color: "#71717a",
  fontSize: "12px",
  textAlign: "center" as const,
};