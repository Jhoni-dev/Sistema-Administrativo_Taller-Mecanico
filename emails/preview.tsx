import { InvoiceEmail } from "./ClientInvoice";

export default function Preview() {
  return (
    <InvoiceEmail
      id="2"
      clientName="Carlos"
      clientSurname="García"
      clientIdentified="1234567890"
      invoiceDate={new Date("2025-02-10T14:30:00")} // ← FECHA VÁLIDA
      invoiceTotal={250000} // ← Decimal simulado
      invoiceDetail={[
        {
          amount: 2,
          subtotal: 150000,
          pieceExtra: 20000,
          serviceExtra: null,
          description: "Incluye revisión adicional del sistema eléctrico.",
          pieces: [
            {
              name: "Batería Bosch 12V",
              description: "Batería de larga duración para automóvil",
              price: 60000,
            },
          ],
          purchasedService: null,
        },
      ]}
    />
  );
}
