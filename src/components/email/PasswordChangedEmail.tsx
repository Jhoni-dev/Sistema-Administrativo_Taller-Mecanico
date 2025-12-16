import * as React from "react";
import {
  Section,
  Text,
  Button,
  Heading,
} from "@react-email/components";
import { EmailLayout } from "../../app/layouts/email";

interface PasswordChangedEmailProps {
  userName: string;
  changeDate?: Date;
}

export function PasswordChangedEmail({ 
  userName, 
  changeDate = new Date() 
}: PasswordChangedEmailProps) {
  const formattedDate = changeDate.toLocaleString('es-CO', { 
    timeZone: 'America/Bogota',
    dateStyle: 'long',
    timeStyle: 'short'
  });

  return (
    <EmailLayout preview="Tu contraseña ha sido actualizada exitosamente">
      <Section style={contentStyle}>
        {/* Header - estilo similar al login */}
        <div style={headerStyle}>
          <Heading style={titleStyle}>Bienvenido</Heading>
          <Text style={subtitleStyle}>
            Contraseña Actualizada
          </Text>
        </div>

        {/* Saludo */}
        <Text style={textStyle}>
          Hola <strong>{userName}</strong>,
        </Text>

        <Text style={textStyle}>
          Te confirmamos que la contraseña de tu cuenta ha sido actualizada exitosamente.
        </Text>

        {/* Info box */}
        <Section style={infoBoxStyle}>
          <Text style={infoTextStyle}>
            <strong>Fecha y hora:</strong> {formattedDate}
          </Text>
        </Section>

        <Text style={textStyle}>
          Si no realizaste este cambio, contacta inmediatamente a nuestro equipo de soporte.
        </Text>

        {/* Botón de acción */}
        <Section style={buttonContainerStyle}>
          <Button href="http://localhost:3000/auth/login" style={buttonStyle}>
            Iniciar Sesión
          </Button>
        </Section>

        {/* Consejo de seguridad */}
        <Section style={tipBoxStyle}>
          <Text style={tipTitleStyle}>
            Consejo de seguridad:
          </Text>
          <Text style={tipTextStyle}>
            Asegúrate de utilizar una contraseña única y segura para proteger tu cuenta.
          </Text>
        </Section>

        {/* Footer - igual que en el login */}
        <Text style={footerStyle}>
          Talleres del Atlántico
        </Text>
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

const infoBoxStyle = {
  margin: "24px 0",
  padding: "16px",
  backgroundColor: "#dcfce7",
  borderRadius: "6px",
};

const infoTextStyle = {
  margin: "0",
  color: "#166534",
  fontSize: "14px",
  lineHeight: "1.6",
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
  margin: "24px 0 0 0",
  padding: "16px",
  backgroundColor: "#dbeafe",
  borderRadius: "6px",
};

const tipTitleStyle = {
  margin: "0 0 8px 0",
  color: "#1e3a8a",
  fontSize: "14px",
  fontWeight: "600",
};

const tipTextStyle = {
  margin: "0",
  color: "#1e3a8a",
  fontSize: "14px",
  lineHeight: "1.6",
};

const footerStyle = {
  margin: "32px 0 0 0",
  color: "#71717a",
  fontSize: "12px",
  textAlign: "center" as const,
};