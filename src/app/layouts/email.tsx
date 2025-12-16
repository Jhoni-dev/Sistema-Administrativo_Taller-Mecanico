import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Heading,
  Preview,
} from "@react-email/components";

interface EmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
}

export function EmailLayout({ children, preview }: EmailLayoutProps) {
  return (
    <Html lang="es">
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header con marca */}
          <Section style={headerStyle}>
            <Heading style={headerTitleStyle}>
              Talleres del Atlántico
            </Heading>
            <Text style={headerSubtitleStyle}>
              Sistema de Gestión
            </Text>
          </Section>

          {/* Contenido dinámico */}
          {children}

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              © {new Date().getFullYear()} Talleres del Atlántico. Todos los derechos reservados.
            </Text>
            <Text style={footerSmallTextStyle}>
              Este es un correo automático, por favor no respondas a este mensaje.
            </Text>
            <Text style={footerSmallTextStyle}>
              ¿Necesitas ayuda? Contáctanos en{" "}
              <Link href="mailto:soporte@talleresatlantico.com" style={linkStyle}>
                soporte@talleresatlantico.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Estilos reutilizables
const bodyStyle = {
  margin: "0",
  padding: "0",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  backgroundColor: "#f4f4f4",
};

const containerStyle = {
  maxWidth: "600px",
  margin: "40px auto",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  overflow: "hidden",
};

const headerStyle = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "40px 30px",
  textAlign: "center" as const,
};

const headerTitleStyle = {
  margin: "0",
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "600",
};

const headerSubtitleStyle = {
  margin: "10px 0 0 0",
  color: "#ffffff",
  fontSize: "14px",
  opacity: "0.9",
};

const footerStyle = {
  padding: "30px",
  backgroundColor: "#f8f9fa",
  textAlign: "center" as const,
};

const footerTextStyle = {
  margin: "0 0 10px 0",
  color: "#666666",
  fontSize: "14px",
};

const footerSmallTextStyle = {
  margin: "0 0 5px 0",
  color: "#999999",
  fontSize: "12px",
};

const linkStyle = {
  color: "#667eea",
  textDecoration: "none",
};