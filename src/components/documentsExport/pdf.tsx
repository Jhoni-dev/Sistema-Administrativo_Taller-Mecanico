import { Decimal } from "@prisma/client/runtime/library";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PDFColumn {
  header: string;
  key: string;
  width?: number;
  align?: "left" | "center" | "right";
  isDate?: boolean;
  dateFormat?: "short" | "long" | "datetime" | "time";
  isCurrency?: boolean;
}

interface Pieces {
  name?: string;
  description?: string | null;
  price?: number;
  [key: string]: any;
}

interface Services {
  name?: string;
  description?: string | null;
  price?: number;
  guarantee?: string | null;
  [key: string]: any;
}

interface InvoiceDetail {
  amount?: number | null;
  subtotal?: number;
  pieceExtra?: number | null;
  serviceExtra?: number | null;
  description?: string | null;
  pieces?: Pieces[] | null;
  purchasedService?: Services[] | null;
  [key: string]: any;
}

interface ParagraphFormat {
  fullName?: string;
  fullSurname?: string;
  identified?: string;
  email?: string;
  createAt?: Date;
  total?: number;
  subtotal?: number;
  pieces?: Pieces[];
  purchasedService?: Services[];
  [key: string]: any;
}

interface InvoiceData {
  id?: number | string;
  total?: number;
  subtotal?: number;
  createAt?: Date | string;
  author?: {
    fullName?: string;
    fullSurname?: string;
    identified?: string;
    clientContact?: {
      email?: string;
    } | null;
  };
  invoiceDetail?: InvoiceDetail[] | any;
  fullName?: string;
  fullSurname?: string;
  identified?: string;
  email?: string;
  pieces?: Pieces[] | any;
  purchasedService?: Services[] | any;
  customer?: any;
  client?: any;
  user?: any;
  details?: any[];
  items?: any[];
  products?: any[];
  services?: any[];
  date?: Date | string;
  createdAt?: Date | string;
  amount?: number;
  totalAmount?: number;
  [key: string]: any;
}

interface CompanyInfo {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  logo?: string;
}

interface SectionConfig {
  title: string;
  dataKey: string;
  showInDetail?: boolean;
}

interface PDFExporterOptions {
  data: any[];
  columns: PDFColumn[];
  fileName: string;
  title?: string;
  subtitle?: string;
  invoiceNumber?: string;
  paragraph?: any;
  companyInfo?: CompanyInfo;
  sections?: SectionConfig[];
  orientation?: "portrait" | "landscape";
  pageSize?: "a4" | "letter" | "legal";
  headerStyle?: {
    fillColor?: [number, number, number];
    textColor?: [number, number, number];
    fontSize?: number;
    fontStyle?: "normal" | "bold" | "italic";
  };
  bodyStyle?: {
    alternateRowColor?: [number, number, number];
    textColor?: [number, number, number];
    fontSize?: number;
  };
  showFooter?: boolean;
  footerText?: string;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  accentColor?: [number, number, number];
  secondaryColor?: [number, number, number];
}

class PDFExporter {
  private doc: jsPDF;
  private options: PDFExporterOptions;
  private readonly accentColor: [number, number, number];
  private readonly secondaryColor: [number, number, number];

  constructor(options: PDFExporterOptions) {
    this.accentColor = options.accentColor || [59, 130, 246];
    this.secondaryColor = options.secondaryColor || [148, 163, 184];

    const defaultSections = options.sections
      ? undefined
      : [
          { title: "REPUESTOS", dataKey: "pieces", showInDetail: true },
          {
            title: "SERVICIOS",
            dataKey: "purchasedService",
            showInDetail: true,
          },
        ];

    this.options = {
      orientation: "portrait",
      pageSize: "a4",
      headerStyle: {
        fillColor: this.accentColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
      },
      bodyStyle: {
        alternateRowColor: [248, 250, 252],
        textColor: [51, 65, 85],
        fontSize: 9,
      },
      showFooter: true,
      margin: {
        top: 20,
        right: 15,
        bottom: 25,
        left: 15,
      },
      sections: defaultSections,
      ...options,
    };

    this.doc = new jsPDF({
      orientation: this.options.orientation,
      unit: "mm",
      format: this.options.pageSize,
    });
  }

  private getBuffer() {
    const arrayBuffer = this.doc.output("arraybuffer");
    return Buffer.from(arrayBuffer);
  }

  private getBase64() {
    return this.doc.output("datauristring").split(",")[1];
  }

  private formatDate(
    value: any,
    format?: "short" | "long" | "datetime" | "time"
  ): string {
    if (!value) return "";

    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return value;

      switch (format) {
        case "short":
          return date.toLocaleDateString("es-ES");

        case "long":
          return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });

        case "datetime":
          return (
            date.toLocaleDateString("es-ES") +
            " " +
            date.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })
          );

        case "time":
          return date.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          });

        default:
          return date.toLocaleDateString("es-ES");
      }
    } catch (error) {
      return value;
    }
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(value);
  }

  private formatValue(value: any, column: PDFColumn): string {
    if (value === null || value === undefined) return "";

    if (column.isDate) {
      return this.formatDate(value, column.dateFormat);
    }

    if (column.isCurrency && typeof value === "number") {
      return this.formatCurrency(value);
    }

    if (typeof value === "number") {
      return value.toLocaleString("es-ES");
    }

    return String(value);
  }

  private addHeader(): number {
    const pageWidth = this.doc.internal.pageSize.getWidth();
    const leftMargin = this.options.margin?.left || 15;
    const rightMargin = pageWidth - (this.options.margin?.right || 15);
    let yPos = this.options.margin?.top || 20;

    // Banda decorativa superior
    this.doc.setFillColor(...this.accentColor);
    this.doc.rect(0, 0, pageWidth, 8, "F");

    this.doc.setFillColor(226, 232, 240);
    this.doc.rect(0, 8, pageWidth, 1, "F");

    yPos = 20;

    // INFORMACIÓN DE LA EMPRESA
    if (this.options.companyInfo) {
      this.doc.setFontSize(14);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(...this.accentColor);

      if (this.options.companyInfo.name) {
        this.doc.text(
          this.options.companyInfo.name.toUpperCase(),
          leftMargin,
          yPos
        );
        yPos += 8;
      }
    }

    // TÍTULO PRINCIPAL
    const titleYStart = 25;
    yPos = titleYStart;

    if (this.options.title) {
      this.doc.setFontSize(20);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(...this.accentColor);
      this.doc.text(this.options.title.toUpperCase(), pageWidth / 2, yPos, {
        align: "center",
      });

      if (this.options.subtitle) {
        this.doc.setFontSize(9);
        this.doc.setFont("helvetica", "italic");
        this.doc.setTextColor(100, 116, 139);
        this.doc.text(this.options.subtitle, pageWidth / 2, yPos + 6, {
          align: "center",
        });
      }

      yPos += 18;
    }

    // NÚMERO DE FACTURA
    if (this.options.invoiceNumber) {
      const invoiceBoxY = 20;
      const invoiceBoxX = rightMargin - 50;

      this.doc.setFillColor(...this.accentColor);
      this.doc.roundedRect(invoiceBoxX, invoiceBoxY, 48, 14, 2, 2, "F");

      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(255, 255, 255);
      this.doc.text("Nº FACTURA", invoiceBoxX + 24, invoiceBoxY + 5, {
        align: "center",
      });

      this.doc.setFontSize(11);
      this.doc.text(
        this.options.invoiceNumber,
        invoiceBoxX + 24,
        invoiceBoxY + 11,
        { align: "center" }
      );
    }

    return yPos;
  }

  private addFooter(): void {
    if (!this.options.showFooter) return;

    const pageCount = this.doc.getNumberOfPages();
    const pageWidth = this.doc.internal.pageSize.getWidth();
    const pageHeight = this.doc.internal.pageSize.getHeight();

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);

      const footerStartY = pageHeight - 20;

      this.doc.setDrawColor(226, 232, 240);
      this.doc.setLineWidth(0.8);
      this.doc.line(
        this.options.margin?.left || 15,
        footerStartY,
        pageWidth - (this.options.margin?.right || 15),
        footerStartY
      );

      this.doc.setDrawColor(...this.accentColor);
      this.doc.setLineWidth(0.3);
      this.doc.line(
        this.options.margin?.left || 15,
        footerStartY + 1,
        pageWidth - (this.options.margin?.right || 15),
        footerStartY + 1
      );

      const footerY = pageHeight - 13;

      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(100, 100, 100);

      if (this.options.footerText) {
        this.doc.text(
          this.options.footerText,
          this.options.margin?.left || 15,
          footerY
        );
      }

      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(...this.accentColor);
      this.doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth - (this.options.margin?.right || 15),
        footerY,
        { align: "right" }
      );

      this.doc.setFont("helvetica", "italic");
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(120, 120, 120);
      const fecha = new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      this.doc.text(`Documento generado el ${fecha}`, pageWidth / 2, footerY, {
        align: "center",
      });

      this.doc.setFontSize(6);
      this.doc.setTextColor(200, 200, 200);
      this.doc.text("DOCUMENTO OFICIAL", pageWidth / 2, pageHeight - 8, {
        align: "center",
      });
    }
  }

  private extractValue(obj: any, possibleKeys: string[]): any {
    if (!obj) return null;

    for (const key of possibleKeys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return obj[key];
      }

      const nestedObjects = [
        "author",
        "customer",
        "client",
        "user",
        "clientContact",
        "contact",
      ];
      for (const nested of nestedObjects) {
        if (
          obj[nested] &&
          obj[nested][key] !== undefined &&
          obj[nested][key] !== null
        ) {
          return obj[nested][key];
        }
      }
    }

    return null;
  }

  private normalizeInvoiceData(data: InvoiceData): ParagraphFormat {
    const fullName = data.fullName || "Cliente";
    const fullSurname = data.fullSurname || "";
    const identified = String(data.identified || "N/A");
    const email = data.email || "No especificado";
    const total = Number(data.total || 0);
    const subtotal = Number(data.subtotal || 0);
    const createAt = data.createAt ? new Date(data.createAt) : new Date();

    // Extraer pieces y purchasedService del nivel root
    let pieces = data.pieces || [];
    let purchasedService = data.purchasedService || [];

    // Normalizar pieces
    if (!Array.isArray(pieces)) {
      pieces = [pieces];
    }
    pieces = pieces.map((piece: any) => this.normalizePieceOrService(piece));

    // Normalizar services
    if (!Array.isArray(purchasedService)) {
      purchasedService = [purchasedService];
    }
    purchasedService = purchasedService.map((service: any) =>
      this.normalizeService(service)
    );

    return {
      fullName,
      fullSurname,
      identified,
      email,
      total,
      subtotal,
      createAt,
      pieces,
      purchasedService,
    };
  }

  private normalizeDetailItem(detail: any): InvoiceDetail {
    if (!detail) {
      return {
        amount: null,
        subtotal: 0,
        pieceExtra: null,
        serviceExtra: null,
        description: null,
        pieces: [],
        purchasedService: [],
      };
    }

    const amount = this.extractValue(detail, [
      "amount",
      "quantity",
      "qty",
      "cantidad",
    ]);
    let subtotal =
      this.extractValue(detail, [
        "subtotal",
        "total",
        "totalAmount",
        "price",
      ]) || 0;
    const pieceExtra = this.extractValue(detail, [
      "pieceExtra",
      "extraPieces",
      "additionalPieces",
    ]);
    const serviceExtra = this.extractValue(detail, [
      "serviceExtra",
      "extraServices",
      "additionalServices",
    ]);
    const description = this.extractValue(detail, [
      "description",
      "desc",
      "note",
      "notes",
      "comment",
    ]);

    if (subtotal && typeof subtotal === "object" && "toNumber" in subtotal) {
      subtotal = subtotal.toNumber();
    }

    let pieces = this.extractValue(detail, [
      "pieces",
      "products",
      "parts",
      "items",
      "piezas",
    ]);
    
    if (pieces) {
      if (!Array.isArray(pieces)) {
        pieces = [pieces];
      }
      pieces = pieces.map((piece: any) => this.normalizePieceOrService(piece));
    } else {
      pieces = [];
    }

    let purchasedService = this.extractValue(detail, [
      "purchasedService",
      "services",
      "servicios",
      "service",
    ]);
    
    if (purchasedService) {
      if (!Array.isArray(purchasedService)) {
        purchasedService = [purchasedService];
      }
      purchasedService = purchasedService.map((service: any) =>
        this.normalizeService(service)
      );
    } else {
      purchasedService = [];
    }

    return {
      amount: amount ? Number(amount) : null,
      subtotal: Number(subtotal),
      pieceExtra: pieceExtra ? Number(pieceExtra) : null,
      serviceExtra: serviceExtra ? Number(serviceExtra) : null,
      description: description ? String(description) : null,
      pieces,
      purchasedService,
    };
  }

  private normalizePieceOrService(item: any): Pieces {
    if (!item) {
      return { name: "", description: null, price: 0 };
    }

    const name =
      this.extractValue(item, [
        "name",
        "title",
        "productName",
        "itemName",
        "nombre",
      ]) || "Sin nombre";
    const description = this.extractValue(item, [
      "description",
      "desc",
      "details",
      "descripcion",
    ]);
    let price =
      this.extractValue(item, [
        "price",
        "cost",
        "amount",
        "unitPrice",
        "precio",
      ]) || 0;

    if (price && typeof price === "object" && "toNumber" in price) {
      price = price.toNumber();
    }

    return {
      name: String(name),
      description: description ? String(description) : null,
      price: Number(price),
    };
  }

  private normalizeService(item: any): Services {
    const basic = this.normalizePieceOrService(item);
    const guarantee = this.extractValue(item, [
      "guarantee",
      "warranty",
      "garantia",
      "warrantyPeriod",
    ]);

    return {
      ...basic,
      guarantee: guarantee ? String(guarantee) : null,
    };
  }

  private addInvoiceInfo(invoiceData: any, startY: number): number {
    const invoice = this.normalizeInvoiceData(invoiceData);
    const pageWidth = this.doc.internal.pageSize.getWidth();
    const leftMargin = this.options.margin?.left || 15;
    const rightMargin = pageWidth - (this.options.margin?.right || 15);
    const boxWidth = (rightMargin - leftMargin - 5) / 2;

    let yPos = startY + 5;

    // CAJA IZQUIERDA - Cliente
    this.doc.setDrawColor(...this.accentColor);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(leftMargin, yPos, boxWidth, 48, 2, 2, "S");

    this.doc.setFillColor(...this.accentColor);
    this.doc.roundedRect(leftMargin, yPos, boxWidth, 8, 2, 2, "F");

    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(255, 255, 255);
    this.doc.text("DATOS DEL CLIENTE", leftMargin + boxWidth / 2, yPos + 5.5, {
      align: "center",
    });

    yPos += 12;
    this.doc.setFontSize(9.5);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...this.accentColor);
    this.doc.text(
      `${invoice.fullName} ${invoice.fullSurname}`,
      leftMargin + 3,
      yPos
    );

    yPos += 5;
    this.doc.setFontSize(8.5);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(80, 80, 80);
    this.doc.text(
      `Identificación: ${invoice.identified}`,
      leftMargin + 3,
      yPos
    );

    yPos += 5;
    if (invoice.email) {
      this.doc.text(`Email: ${invoice.email}`, leftMargin + 3, yPos);
    }

    // CAJA DERECHA - Factura
    const rightBoxX = leftMargin + boxWidth + 5;
    yPos = startY + 5;

    this.doc.setDrawColor(148, 163, 184);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(rightBoxX, yPos, boxWidth, 48, 2, 2, "S");

    this.doc.setFillColor(148, 163, 184);
    this.doc.roundedRect(rightBoxX, yPos, boxWidth, 8, 2, 2, "F");

    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(255, 255, 255);
    this.doc.text("INFORMACIÓN DE PAGO", rightBoxX + boxWidth / 2, yPos + 5.5, {
      align: "center",
    });

    yPos += 12;
    this.doc.setFontSize(8.5);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(80, 80, 80);

    const fechaFormateada = String(this.formatDate(invoice.createAt, "long"));
    this.doc.text(`Fecha de emisión:`, rightBoxX + 3, yPos);
    yPos += 4;
    this.doc.setFont("helvetica", "bold");
    this.doc.text(fechaFormateada, rightBoxX + 3, yPos);

    yPos += 8;

    // Subtotal
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(71, 85, 105);
    this.doc.text("Subtotal:", rightBoxX + 6, yPos);

    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(100, 116, 139);
    this.doc.text(
      this.formatCurrency(invoice.subtotal ?? 0),
      rightBoxX + boxWidth - 6,
      yPos,
      { align: "right" }
    );

    yPos += 6;

    // Línea separadora
    this.doc.setDrawColor(226, 232, 240);
    this.doc.setLineWidth(0.3);
    this.doc.line(rightBoxX + 6, yPos, rightBoxX + boxWidth - 6, yPos);

    yPos += 5;

    // Total destacado
    this.doc.setFillColor(239, 246, 255);
    this.doc.roundedRect(rightBoxX + 3, yPos - 3, boxWidth - 6, 8, 1, 1, "F");

    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(100, 116, 139);
    this.doc.text("TOTAL:", rightBoxX + 6, yPos + 2);

    this.doc.setFontSize(13);
    this.doc.setTextColor(...this.accentColor);
    this.doc.text(
      this.formatCurrency(invoice.total ?? 0),
      rightBoxX + boxWidth - 6,
      yPos + 2,
      { align: "right" }
    );

    return startY + 58;
  }

  private addDetailedItems(invoiceData: any, startY: number): number {
    const invoice = this.normalizeInvoiceData(invoiceData);
    let yPos = startY;
    const leftMargin = this.options.margin?.left || 15;
    const pageWidth = this.doc.internal.pageSize.getWidth();
    const rightMargin = pageWidth - (this.options.margin?.right || 15);
    const contentWidth = rightMargin - leftMargin;

    // Renderizar secciones según configuración desde el nivel superior
    const sections = this.options.sections || [];

    sections.forEach((section) => {
      // Buscar items en el nivel root del invoice
      let items = (invoice as any)[section.dataKey] || [];

      if (!Array.isArray(items)) items = [items];

      if (items.length > 0) {
        // Título de sección
        this.doc.setFillColor(...this.accentColor);
        this.doc.rect(leftMargin, yPos, contentWidth, 7, "F");

        this.doc.setFontSize(11);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(255, 255, 255);
        this.doc.text(
          section.title,
          leftMargin + 3,
          yPos + 4.5
        );
        yPos += 10;

        yPos = this.addItemsSection(
          items,
          yPos,
          leftMargin,
          contentWidth
        );

        yPos += 5;
      }
    });

    return yPos;
  }

  private addItemsSection(
    items: (Pieces | Services)[],
    startY: number,
    leftMargin: number,
    contentWidth: number
  ): number {
    let yPos = startY;

    // Crear tabla para los items
    items.forEach((item, idx) => {
      // Caja para cada item
      const itemHeight = this.calculateItemHeight(item);

      this.doc.setFillColor(idx % 2 === 0 ? 255 : 248, 250, 252);
      this.doc.roundedRect(
        leftMargin,
        yPos,
        contentWidth,
        itemHeight,
        1,
        1,
        "F"
      );

      this.doc.setDrawColor(226, 232, 240);
      this.doc.setLineWidth(0.2);
      this.doc.roundedRect(
        leftMargin,
        yPos,
        contentWidth,
        itemHeight,
        1,
        1,
        "S"
      );

      yPos += 3;

      // Número del item
      this.doc.setFillColor(...this.secondaryColor);
      this.doc.circle(leftMargin + 5, yPos + 1, 2, "F");

      this.doc.setFontSize(7);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(255, 255, 255);
      this.doc.text(`${idx + 1}`, leftMargin + 5, yPos + 2, {
        align: "center",
      });

      // Nombre del item
      this.doc.setFontSize(9.5);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(51, 65, 85);
      this.doc.text(item.name || "Sin nombre", leftMargin + 10, yPos + 2);

      // Precio
      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(...this.accentColor);
      this.doc.text(
        this.formatCurrency(item.price ?? 0),
        leftMargin + contentWidth - 3,
        yPos + 2,
        { align: "right" }
      );

      yPos += 5;

      // Descripción (si existe)
      if (item.description) {
        this.doc.setFontSize(8);
        this.doc.setFont("helvetica", "normal");
        this.doc.setTextColor(100, 116, 139);

        const descLines = this.doc.splitTextToSize(
          item.description,
          contentWidth - 16
        );
        this.doc.text(descLines, leftMargin + 10, yPos);
        yPos += descLines.length * 3.5;
      }

      // Garantía (si es un servicio)
      if ("guarantee" in item && item.guarantee) {
        yPos += 1;
        this.doc.setFontSize(7.5);
        this.doc.setFont("helvetica", "italic");
        this.doc.setTextColor(148, 163, 184);
        this.doc.text(`Garantía: ${item.guarantee}`, leftMargin + 10, yPos);
        yPos += 3;
      }

      yPos += 2;
    });

    // Línea de total
    const totalAmount = items.reduce((sum, item) => sum + (item.price ?? 0), 0);
    
    yPos += 2;
    this.doc.setDrawColor(...this.accentColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(
      leftMargin + contentWidth - 60,
      yPos,
      leftMargin + contentWidth,
      yPos
    );

    yPos += 5;
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(71, 85, 105);
    this.doc.text("SUBTOTAL:", leftMargin + contentWidth - 55, yPos);

    this.doc.setFontSize(12);
    this.doc.setTextColor(...this.accentColor);
    this.doc.text(
      this.formatCurrency(totalAmount),
      leftMargin + contentWidth - 3,
      yPos,
      { align: "right" }
    );

    yPos += 5;

    return yPos;
  }

  private calculateItemHeight(item: Pieces | Services): number {
    let height = 8; // Base height

    if (item.description) {
      const descLines = Math.ceil(item.description.length / 100);
      height += descLines * 3.5;
    }

    if ("guarantee" in item && item.guarantee) {
      height += 4;
    }

    return Math.max(height, 8);
  }

  private addContactSection(startY: number): void {
    const pageWidth = this.doc.internal.pageSize.getWidth();
    const pageHeight = this.doc.internal.pageSize.getHeight();
    const leftMargin = this.options.margin?.left || 15;
    const rightMargin = pageWidth - (this.options.margin?.right || 15);
    const contentWidth = rightMargin - leftMargin;

    // Calcular si necesitamos una nueva página
    const sectionHeight = 35;
    let yPos = this.doc.internal.pageSize.getHeight() - 60; // Posición fija cerca del final

    // Si hay poco espacio, agregar nueva página
    if (yPos < startY + 20) {
      this.doc.addPage();
      yPos = this.options.margin?.top || 20;
    }

    // Línea decorativa superior
    this.doc.setDrawColor(...this.accentColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(leftMargin, yPos, rightMargin, yPos);

    yPos += 8;

    // Título de la sección
    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...this.accentColor);
    this.doc.text("INFORMACIÓN DE CONTACTO", pageWidth / 2, yPos, {
      align: "center",
    });

    yPos += 8;

    // Caja de información de contacto
    this.doc.setDrawColor(226, 232, 240);
    this.doc.setLineWidth(0.3);
    this.doc.setFillColor(248, 250, 252);
    this.doc.roundedRect(leftMargin, yPos, contentWidth, 20, 2, 2, "FD");

    yPos += 5;

    // Información de contacto en columnas
    this.doc.setFontSize(8.5);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(71, 85, 105);

    const columnWidth = contentWidth / 2;
    let leftColumnY = yPos;
    let rightColumnY = yPos;

    // Columna izquierda
    if (this.options.companyInfo?.address) {
      this.doc.setFont("helvetica", "bold");
      this.doc.text("Dirección:", leftMargin + 5, leftColumnY);
      this.doc.setFont("helvetica", "normal");
      leftColumnY += 4;
      this.doc.text(this.options.companyInfo.address, leftMargin + 5, leftColumnY);
      leftColumnY += 5;
    }

    if (this.options.companyInfo?.phone) {
      this.doc.setFont("helvetica", "bold");
      this.doc.text("Teléfono:", leftMargin + 5, leftColumnY);
      this.doc.setFont("helvetica", "normal");
      leftColumnY += 4;
      this.doc.text(this.options.companyInfo.phone, leftMargin + 5, leftColumnY);
    }

    // Columna derecha
    if (this.options.companyInfo?.email) {
      this.doc.setFont("helvetica", "bold");
      this.doc.text("Email:", leftMargin + columnWidth + 5, rightColumnY);
      this.doc.setFont("helvetica", "normal");
      rightColumnY += 4;
      this.doc.text(this.options.companyInfo.email, leftMargin + columnWidth + 5, rightColumnY);
      rightColumnY += 5;
    }

    if (this.options.companyInfo?.taxId) {
      this.doc.setFont("helvetica", "bold");
      this.doc.text("NIT:", leftMargin + columnWidth + 5, rightColumnY);
      this.doc.setFont("helvetica", "normal");
      rightColumnY += 4;
      this.doc.text(this.options.companyInfo.taxId, leftMargin + columnWidth + 5, rightColumnY);
    }
  }

  private addItemTable(
    items: (Pieces | Services)[],
    title: string,
    startY: number,
    leftMargin: number,
    contentWidth: number
  ): number {
    let yPos = startY;

    // Header de la mini tabla
    this.doc.setFillColor(241, 245, 249);
    this.doc.rect(leftMargin + 5, yPos, contentWidth - 10, 6, "F");

    this.doc.setFontSize(8.5);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...this.accentColor);
    this.doc.text(title, leftMargin + 8, yPos + 4);
    this.doc.text("PRECIO", leftMargin + contentWidth - 25, yPos + 4);

    yPos += 8;

    // Items
    items.forEach((item, idx) => {
      const bgColor = idx % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
      this.doc.setFillColor(...(bgColor as [number, number, number]));
      this.doc.rect(leftMargin + 5, yPos - 2, contentWidth - 10, 5, "F");

      this.doc.setFontSize(8.5);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(71, 85, 105);
      this.doc.text(`• ${item.name}`, leftMargin + 8, yPos + 1);

      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(...this.accentColor);
      this.doc.text(
        this.formatCurrency(item.price ?? 0),
        leftMargin + contentWidth - 8,
        yPos + 1,
        { align: "right" }
      );

      yPos += 5;
    });

    yPos += 2;
    return yPos;
  }

  private calculateDetailHeight(detail: InvoiceDetail): number {
    let height = 20;

    if (detail.description) {
      const lines = Math.ceil(detail.description.length / 80);
      height += lines * 4;
    }

    if (detail.pieces && detail.pieces.length > 0) {
      height += detail.pieces.length * 5 + 10;
    }
    if (detail.purchasedService && detail.purchasedService.length > 0) {
      height += detail.purchasedService.length * 5 + 10;
    }

    return Math.max(height, 20);
  }

  private prepareTableData(): any[] {
    return this.options.data.map((item) => {
      const row: any = {};
      this.options.columns.forEach((col) => {
        row[col.key] = this.formatValue(item[col.key], col);
      });
      return row;
    });
  }

  async export(returnBuffer: boolean = false): Promise<any> {
    try {
      let startY = this.addHeader();
      startY += 8;

      if (this.options.paragraph) {
        startY = this.addInvoiceInfo(this.options.paragraph, startY);
        startY = this.addDetailedItems(this.options.paragraph, startY);
        startY += 8;
      }

      if (this.options.data && this.options.data.length > 0) {
        const tableData = this.prepareTableData();
        const columns = this.options.columns.map((col) => ({
          header: col.header,
          dataKey: col.key,
        }));

        autoTable(this.doc, {
          columns: columns,
          body: tableData,
          startY: startY,
          margin: this.options.margin,
          theme: "grid",
          headStyles: {
            fillColor: this.options.headerStyle?.fillColor || this.accentColor,
            textColor: this.options.headerStyle?.textColor || [255, 255, 255],
            fontSize: this.options.headerStyle?.fontSize || 10,
            fontStyle: "bold",
            halign: "center",
            valign: "middle",
            cellPadding: 4,
            lineWidth: 0.1,
            lineColor: [255, 255, 255],
          },
          bodyStyles: {
            textColor: this.options.bodyStyle?.textColor || [33, 37, 41],
            fontSize: this.options.bodyStyle?.fontSize || 9,
            cellPadding: 3.5,
            lineWidth: 0.1,
            lineColor: [220, 220, 220],
          },
          alternateRowStyles: {
            fillColor: this.options.bodyStyle?.alternateRowColor || [
              248, 249, 250,
            ],
          },
          columnStyles: this.options.columns.reduce((styles, col) => {
            styles[col.key] = {
              halign: col.align || "left",
              cellWidth: col.width || "auto",
            };
            return styles;
          }, {} as any),
        });
      }

      // Agregar información de contacto al final
      if (this.options.companyInfo) {
        this.addContactSection(startY);
      }

      this.addFooter();

      if (returnBuffer) return this.getBuffer();

      const fecha = new Date().toISOString().split("T")[0];
      const fileName = this.options.fileName.replace("{date}", fecha);
      this.doc.save(fileName);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      throw error;
    }
  }
}

export const usePDFExport = () => {
  const exportToPDF = async (options: PDFExporterOptions) => {
    const exporter = new PDFExporter(options);
    await exporter.export();
  };

  return { exportToPDF };
};

export const exportToPDF = async (
  options: PDFExporterOptions,
  returnBuffer: boolean = false
) => {
  const exporter = new PDFExporter(options);
  return await exporter.export(returnBuffer);
};

export default PDFExporter;