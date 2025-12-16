import * as React from "react";
import {
  Section,
  Text,
  Button,
  Link,
  Heading,
} from "@react-email/components";
import { EmailLayout } from "../../app/layouts/email";

interface PasswordResetEmailProps {
  resetLink: string;
  userName?: string;
}

export function PasswordResetEmail({ resetLink, userName }: PasswordResetEmailProps) {
  return (
    <EmailLayout>
      <Section style={contentStyle}>
        {/* Header - estilo similar al login */}
        <div style={headerStyle}>
          <Heading style={titleStyle}>Bienvenido</Heading>
          <Text style={subtitleStyle}>
            Recuperación de Contraseña
          </Text>
        </div>

        {/* Saludo */}
        <Text style={textStyle}>
          Hola <strong>{userName ? ` ${userName}` : ""}</strong>,
        </Text>

        <Text style={textStyle}>
          Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
          Si no realizaste esta solicitud, puedes ignorar este correo de forma segura.
        </Text>

        <Text style={textStyle}>
          Para restablecer tu contraseña, haz clic en el siguiente botón:
        </Text>

        {/* Botón de acción */}
        <Section style={buttonContainerStyle}>
          <Button href={resetLink} style={buttonStyle}>
            Restablecer Contraseña
          </Button>
        </Section>

        {/* Enlace alternativo */}
        <Text style={smallTextStyle}>
          Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
        </Text>

        <Section style={linkBoxStyle}>
          <Link href={resetLink} style={alternativeLinkStyle}>
            {resetLink}
          </Link>
        </Section>

        {/* Alerta de seguridad */}
        <Section style={alertBoxStyle}>
          <Text style={alertTitleStyle}>
            Información importante:
          </Text>
          <Text style={alertTextStyle}>
            Este enlace expirará en 1 hora por razones de seguridad.
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

const smallTextStyle = {
  margin: "0 0 8px 0",
  color: "#71717a",
  fontSize: "14px",
  lineHeight: "1.6",
};

const linkBoxStyle = {
  margin: "0 0 24px 0",
  padding: "12px",
  backgroundColor: "#f4f4f5",
  borderRadius: "6px",
};

const alternativeLinkStyle = {
  color: "#09090b",
  textDecoration: "underline",
  fontSize: "12px",
  wordBreak: "break-all" as const,
};

const alertBoxStyle = {
  margin: "24px 0 0 0",
  padding: "16px",
  backgroundColor: "#fef3c7",
  borderRadius: "6px",
};

const alertTitleStyle = {
  margin: "0 0 8px 0",
  color: "#78350f",
  fontSize: "14px",
  fontWeight: "600",
};

const alertTextStyle = {
  margin: "0",
  color: "#78350f",
  fontSize: "14px",
  lineHeight: "1.6",
};

const footerStyle = {
  margin: "32px 0 0 0",
  color: "#71717a",
  fontSize: "12px",
  textAlign: "center" as const,
};