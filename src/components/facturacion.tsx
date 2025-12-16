import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  FileText,
  DollarSign,
  User,
  X,
  ChevronsUpDown,
  Check,
  Receipt,
  Save,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Types
interface Client {
  id: number;
  fullName: string;
  fullSurname: string;
  identified: string;
}

interface Service {
  id: number;
  name: string;
  price: number;
}

interface Piece {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface InvoiceDetail {
  amount: number;
  subtotal: number;
  extra: number;
  description?: string;
  pieces?: Array<{
    name: string;
    price: number;
  }>;
  purchasedService?: Array<{
    name: string;
    price: number;
  }>;
}

interface InvoiceDetailLine {
  id?: number;
  amount: number;
  subtotal: number;
  description?: string;
  pieceExtra: number;
  serviceExtra: number;
  purchasedService?: {
    name: string;
    price: number;
  };
  pieces?: {
    name: string;
    price: number;
  };
}

interface InvoiceFromAPI {
  id: number;
  createAt: string;
  total: number | string;
  clientId: number;
  invoiceDetail: InvoiceDetail;
}

interface Invoice {
  id: number;
  createAt: string;
  total: number;
  client: Client;
  invoiceDetail: InvoiceDetail;
  detailLines?: InvoiceDetailLine[];
}

interface DetailLine {
  serviceId: number;
  pieceId: number;
  amount: number;
  description?: string;
  serviceExtra: number;
  pieceExtra: number;
  subtotal?: number;
  extra?: number;
}

interface ServiceInput {
  id: number;
  serviceExtra: number;
}

interface PieceInput {
  id: number;
  amount: number;
  pieceExtra: number;
}

interface InvoiceCreatePayload {
  clientId: number;
  service: ServiceInput[] | null;
  pieces: PieceInput[] | null;
  description?: string;
}

interface NewInvoice {
  clientId: number;
  details: DetailLine[];
  generalDescription: string;
}

interface ClientSummary {
  client: Client;
  invoices: Invoice[];
  totalSpent: number;
}

export default function InvoiceManagement() {
  // Estados principales
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [openClientCombobox, setOpenClientCombobox] = useState<boolean>(false);

  // Filtros
  const [filterBy, setFilterBy] = useState<"name" | "invoices" | "total">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [itemsPerPage] = useState<number>(10);

  // Estados de modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isClientInvoicesModalOpen, setIsClientInvoicesModalOpen] =
    useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  // Estado de la factura seleccionada
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedClientForInvoices, setSelectedClientForInvoices] =
    useState<ClientSummary | null>(null);

  // Estados de edición
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editInvoice, setEditInvoice] = useState<NewInvoice>({
    clientId: 0,
    generalDescription: "",
    details: [],
  });
  const [showEditInfoMessage, setShowEditInfoMessage] = useState<boolean>(true);

  // Estado del formulario de nueva factura
  const [newInvoice, setNewInvoice] = useState<NewInvoice>({
    clientId: 0,
    generalDescription: "",
    details: [
      {
        serviceId: 0,
        pieceId: 0,
        amount: 1,
        description: "",
        serviceExtra: 0,
        pieceExtra: 0,
      },
    ],
  });

  const API_BASE_URL = "/backend/api/protected";

  // Cargar clientes, servicios y piezas primero
  useEffect(() => {
    void fetchClients();
    void fetchServices();
    void fetchPieces();
  }, []);

  useEffect(() => {
    if (clients.length > 0) {
      void fetchInvoices();
    }
  }, [clients]);

  // Agrupar facturas por cliente
  const clientSummaries = useMemo(() => {
    const summaryMap = new Map<number, ClientSummary>();

    invoices.forEach((invoice) => {
      if (!invoice.client || !invoice.client.id) {
        console.warn("Factura sin cliente asociado:", invoice);
        return;
      }

      const clientId = invoice.client.id;
      if (!summaryMap.has(clientId)) {
        summaryMap.set(clientId, {
          client: invoice.client,
          invoices: [],
          totalSpent: 0,
        });
      }
      const summary = summaryMap.get(clientId)!;
      summary.invoices.push(invoice);
      summary.totalSpent += invoice.total;
    });

    return Array.from(summaryMap.values());
  }, [invoices]);

  const filteredClientSummaries = useMemo(() => {
    let filtered = clientSummaries.filter(
      (summary) =>
        summary.client.fullName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        summary.client.fullSurname
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        summary.client.identified.includes(searchTerm)
    );

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filterBy) {
        case "name":
          const nameA =
            `${a.client.fullName} ${a.client.fullSurname}`.toLowerCase();
          const nameB =
            `${b.client.fullName} ${b.client.fullSurname}`.toLowerCase();
          comparison = nameA.localeCompare(nameB);
          break;

        case "invoices":
          comparison = a.invoices.length - b.invoices.length;
          break;

        case "total":
          comparison = a.totalSpent - b.totalSpent;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [clientSummaries, searchTerm, filterBy, sortOrder]);

  const paginatedClientSummaries = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredClientSummaries.slice(startIndex, endIndex);
  }, [filteredClientSummaries, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredClientSummaries.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  useEffect(() => {
    if (isClientInvoicesModalOpen && selectedClientForInvoices) {
      const clientInvoices = invoices.filter(
        (inv) => inv.client.id === selectedClientForInvoices.client.id
      );

      const totalSpent = clientInvoices.reduce(
        (sum, inv) => sum + inv.total,
        0
      );

      setSelectedClientForInvoices({
        client: selectedClientForInvoices.client,
        invoices: clientInvoices,
        totalSpent: totalSpent,
      });
    }
  }, [invoices]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(0, Math.min(totalPages - 1, page)));
  };

  const loadInvoiceForEdit = (invoice: Invoice): NewInvoice => {
    const details: DetailLine[] = [];

    console.log("📊 Cargando factura para edición:");
    console.log("  - Factura ID:", invoice.id);
    console.log("  - Detalles originales:", invoice.detailLines);

    if (invoice.detailLines && invoice.detailLines.length > 0) {
      invoice.detailLines.forEach((detailLine, idx) => {
        console.log(`  📝 Línea ${idx + 1}:`, detailLine);

        let serviceId = 0;
        let pieceId = 0;
        let shouldAddLine = false;

        if (detailLine.purchasedService) {
          const serviceData = services.find(
            (s) => s.name === detailLine.purchasedService?.name
          );
          if (serviceData) {
            serviceId = serviceData.id;
            shouldAddLine = true;
            console.log(
              `    ✅ Servicio: ${serviceData.name} (ID: ${serviceId})`
            );
          } else {
            console.warn(
              `    ⚠️ Servicio no encontrado: ${detailLine.purchasedService.name}`
            );
          }
        }

        if (detailLine.pieces) {
          const pieceData = pieces.find(
            (p) => p.name === detailLine.pieces?.name
          );
          if (pieceData) {
            pieceId = pieceData.id;
            shouldAddLine = true;
            console.log(`    ✅ Pieza: ${pieceData.name} (ID: ${pieceId})`);
          } else {
            console.warn(
              `    ⚠️ Pieza no encontrada: ${detailLine.pieces.name}`
            );
          }
        }

        if (shouldAddLine) {
          details.push({
            serviceId,
            pieceId,
            amount: detailLine.amount,
            description: detailLine.description || "",
            serviceExtra: detailLine.serviceExtra,
            pieceExtra: detailLine.pieceExtra,
          });

          console.log(
            `    💰 Extras: service=${detailLine.serviceExtra}, piece=${detailLine.pieceExtra}`
          );
        } else {
          console.warn(
            `    ❌ Línea ${
              idx + 1
            } ignorada - no se encontraron servicios ni piezas válidos`
          );
        }
      });
    } else {
      console.warn("⚠️ No hay detalles originales, usando fallback");

      const totalExtra = invoice.invoiceDetail.extra || 0;
      let extraAssigned = false;

      if (
        invoice.invoiceDetail?.purchasedService &&
        invoice.invoiceDetail.purchasedService.length > 0
      ) {
        invoice.invoiceDetail.purchasedService.forEach((service) => {
          const serviceData = services.find((s) => s.name === service.name);
          if (serviceData) {
            details.push({
              serviceId: serviceData.id,
              pieceId: 0,
              amount: 1,
              description: "",
              serviceExtra: !extraAssigned && totalExtra > 0 ? totalExtra : 0,
              pieceExtra: 0,
            });
            if (!extraAssigned && totalExtra > 0) {
              extraAssigned = true;
            }
          }
        });
      }

      if (
        invoice.invoiceDetail?.pieces &&
        invoice.invoiceDetail.pieces.length > 0
      ) {
        invoice.invoiceDetail.pieces.forEach((piece) => {
          const pieceData = pieces.find((p) => p.name === piece.name);
          if (pieceData) {
            details.push({
              serviceId: 0,
              pieceId: pieceData.id,
              amount: invoice.invoiceDetail.amount || 1,
              description: "",
              serviceExtra: 0,
              pieceExtra: !extraAssigned && totalExtra > 0 ? totalExtra : 0,
            });
            if (!extraAssigned && totalExtra > 0) {
              extraAssigned = true;
            }
          }
        });
      }
    }

    if (details.length === 0) {
      console.warn(
        "⚠️ No se encontraron detalles válidos, agregando línea vacía"
      );
      details.push({
        serviceId: 0,
        pieceId: 0,
        amount: 1,
        description: "",
        serviceExtra: 0,
        pieceExtra: invoice.invoiceDetail?.extra || 0,
      });
    }

    console.log("✅ Detalles finales para edición:", details);
    console.log(`📊 Total de líneas: ${details.length}`);

    return {
      clientId: invoice.client.id,
      generalDescription: invoice.invoiceDetail.description || "",
      details: details,
    };
  };

  // Funciones de API (continúa en siguiente parte...)

  const fetchInvoices = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/invoice`);

      if (!response.ok) {
        throw new Error(`Error al obtener facturas: ${response.status}`);
      }

      const data: InvoiceFromAPI[] = await response.json();

      if (!Array.isArray(data)) {
        setInvoices([]);
        return;
      }

      const transformedInvoices: Invoice[] = data
        .map((invoice: InvoiceFromAPI) => {
          const client = clients.find((c) => c.id === invoice.clientId);

          if (!client) {
            console.warn(
              `Cliente no encontrado para factura #${invoice.id}, clientId: ${invoice.clientId}`
            );
            return null;
          }

          let total = 0;
          if (typeof invoice.total === "string") {
            total = parseFloat(invoice.total);
          } else if (typeof invoice.total === "number") {
            total = invoice.total;
          }

          if (isNaN(total)) {
            total = 0;
          }

          let detailsArray: any[] = [];

          if (Array.isArray(invoice.invoiceDetail)) {
            detailsArray = invoice.invoiceDetail;
          } else if (
            invoice.invoiceDetail &&
            typeof invoice.invoiceDetail === "object"
          ) {
            detailsArray = [invoice.invoiceDetail];
          } else {
            detailsArray = [];
          }

          const originalDetailLines: InvoiceDetailLine[] = detailsArray.map(
            (detail) => ({
              id: detail.id,
              amount: detail.amount || 1,
              subtotal: parseFloat(detail.subtotal || 0),
              description: detail.description || "",
              pieceExtra: parseFloat(detail.pieceExtra || 0),
              serviceExtra: parseFloat(detail.serviceExtra || 0),
              purchasedService: detail.purchasedService
                ? {
                    name: detail.purchasedService.name || "",
                    price: parseFloat(detail.purchasedService.price || 0),
                  }
                : undefined,
              pieces: detail.pieces
                ? {
                    name: detail.pieces.name || "",
                    price: parseFloat(detail.pieces.price || 0),
                  }
                : undefined,
            })
          );

          console.log(
            `📦 Factura #${invoice.id} - Detalles guardados:`,
            originalDetailLines.length,
            "líneas"
          );

          const allPurchasedServices: Array<{ name: string; price: number }> =
            [];
          const allPieces: Array<{ name: string; price: number }> = [];
          let totalAmount = 0;
          let totalSubtotal = 0;
          let totalExtra = 0;
          let consolidatedDescription = "";

          const serviceMap = new Map<
            string,
            { name: string; price: number; count: number }
          >();
          const pieceMap = new Map<
            string,
            { name: string; price: number; count: number; amount: number }
          >();

          detailsArray.forEach((detail, idx) => {
            console.log(`\n📦 Procesando detalle ${idx + 1}:`, detail);

            const detailSubtotal = parseFloat(detail.subtotal || 0);
            totalSubtotal += detailSubtotal;

            totalExtra +=
              parseFloat(detail.pieceExtra || 0) +
              parseFloat(detail.serviceExtra || 0);

            if (detail.description) {
              consolidatedDescription +=
                (consolidatedDescription ? " | " : "") + detail.description;
            }

            if (
              detail.purchasedService &&
              typeof detail.purchasedService === "object"
            ) {
              const serviceName = detail.purchasedService.name || "";
              const servicePrice = parseFloat(
                detail.purchasedService.price || 0
              );

              if (serviceMap.has(serviceName)) {
                const existing = serviceMap.get(serviceName)!;
                existing.count++;
              } else {
                serviceMap.set(serviceName, {
                  name: serviceName,
                  price: servicePrice,
                  count: 1,
                });
              }
            }

            if (detail.pieces && typeof detail.pieces === "object") {
              const pieceName = detail.pieces.name || "";
              const piecePrice = parseFloat(detail.pieces.price || 0);
              const pieceAmount = detail.amount || 1;

              if (pieceMap.has(pieceName)) {
                const existing = pieceMap.get(pieceName)!;
                existing.amount += pieceAmount;
              } else {
                pieceMap.set(pieceName, {
                  name: pieceName,
                  price: piecePrice,
                  count: 1,
                  amount: pieceAmount,
                });
              }
            }
          });

          serviceMap.forEach((service) => {
            allPurchasedServices.push({
              name: service.name,
              price: service.price,
            });
          });

          pieceMap.forEach((piece) => {
            allPieces.push({
              name: piece.name,
              price: piece.price,
            });
            totalAmount = piece.amount;
          });

          if (pieceMap.size > 1) {
            totalAmount = Array.from(pieceMap.values()).reduce(
              (sum, p) => sum + p.amount,
              0
            );
          }

          const calculatedTotal = totalSubtotal + totalExtra;

          return {
            id: invoice.id,
            createAt: invoice.createAt,
            total: calculatedTotal,
            client: client,
            invoiceDetail: {
              amount: totalAmount,
              subtotal: totalSubtotal,
              extra: totalExtra,
              description: consolidatedDescription,
              pieces: allPieces,
              purchasedService: allPurchasedServices,
            },
            detailLines: originalDetailLines,
          } as Invoice;
        })
        .filter((invoice): invoice is Invoice => invoice !== null);

      console.log("✅ Facturas transformadas:", transformedInvoices);
      setInvoices(transformedInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/clientPage`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchServices = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/servicesPage`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();

      const servicesWithNumberPrices = data.map((service: any) => ({
        ...service,
        price: Number(service.price) || 0,
      }));

      setServices(servicesWithNumberPrices);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchPieces = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/`);
      if (!response.ok) {
        throw new Error(`Error fetching pieces`);
      }
      const data = await response.json();

      const piecesWithNumberPrices = data.map((piece: any) => ({
        ...piece,
        price: Number(piece.price) || 0,
      }));

      setPieces(piecesWithNumberPrices);
    } catch (error) {
      console.error("Error fetching pieces:", error);
    }
  };

  const createInvoice = async (): Promise<void> => {
    try {
      setLoading(true);

      const services: ServiceInput[] = [];
      const pieces: PieceInput[] = [];

      newInvoice.details.forEach((detail) => {
        if (detail.serviceId && detail.serviceId !== 0) {
          services.push({
            id: detail.serviceId,
            serviceExtra: detail.serviceExtra || 0,
          });
        }

        if (detail.pieceId && detail.pieceId !== 0) {
          pieces.push({
            id: detail.pieceId,
            amount: detail.amount,
            pieceExtra: detail.pieceExtra || 0,
          });
        }
      });

      const invoiceData: InvoiceCreatePayload = {
        clientId: newInvoice.clientId,
        service: services.length > 0 ? services : null,
        pieces: pieces.length > 0 ? pieces : null,
        description: newInvoice.generalDescription || undefined,
      };

      console.warn("📤 Datos de factura a enviar:");
      console.warn("  - clientId:", invoiceData.clientId);
      console.warn("  - description:", invoiceData.description);
      console.warn("  - services:", invoiceData.service);
      console.warn("  - pieces:", invoiceData.pieces);
      console.warn("Payload completo:", JSON.stringify(invoiceData, null, 2));

      const response = await fetch(`${API_BASE_URL}/invoice/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        throw new Error(`Error al crear factura: ${response.status}`);
      }

      await response.json();

      await fetchInvoices();
      setIsCreateModalOpen(false);
      clearInvoice(false);
    } catch (error) {
      console.error("Error creating invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateInvoice = async (): Promise<void> => {
    if (!selectedInvoice) return;

    try {
      setLoading(true);

      console.log(
        "🔄 Iniciando actualización de factura (eliminar + recrear)..."
      );

      console.log("1️⃣ Eliminando factura #" + selectedInvoice.id);
      const deleteResponse = await fetch(
        `${API_BASE_URL}/invoice/${selectedInvoice.id}`,
        {
          method: "DELETE",
        }
      );

      if (!deleteResponse.ok) {
        throw new Error(
          `Error al eliminar factura anterior: ${deleteResponse.status}`
        );
      }

      console.log("2️⃣ Creando nueva factura con datos actualizados");

      const services: ServiceInput[] = [];
      const pieces: PieceInput[] = [];

      editInvoice.details.forEach((detail) => {
        if (detail.serviceId && detail.serviceId !== 0) {
          services.push({
            id: detail.serviceId,
            serviceExtra: detail.serviceExtra || 0,
          });
        }

        if (detail.pieceId && detail.pieceId !== 0) {
          pieces.push({
            id: detail.pieceId,
            amount: detail.amount,
            pieceExtra: detail.pieceExtra || 0,
          });
        }
      });

      const invoiceData: InvoiceCreatePayload = {
        clientId: editInvoice.clientId,
        service: services.length > 0 ? services : null,
        pieces: pieces.length > 0 ? pieces : null,
        description: editInvoice.generalDescription || undefined,
      };

      console.log("📤 Datos de factura a actualizar (recrear):");
      console.log("  - clientId:", invoiceData.clientId);
      console.log("  - description:", invoiceData.description);
      console.log("  - services:", invoiceData.service);
      console.log("  - pieces:", invoiceData.pieces);
      console.log("Payload completo:", JSON.stringify(invoiceData, null, 2));

      const createResponse = await fetch(`${API_BASE_URL}/invoice/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      if (!createResponse.ok) {
        throw new Error(
          `Error al crear nueva factura: ${createResponse.status}`
        );
      }

      await createResponse.json();

      console.log("✅ Factura actualizada exitosamente");

      await fetchInvoices();
      setIsEditMode(false);
      setIsViewModalOpen(false);
      setSelectedInvoice(null);
    } catch (error) {
      console.error("❌ Error updating invoice:", error);
      alert("Error al actualizar la factura. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (): Promise<void> => {
    if (!selectedInvoice) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/invoice/${selectedInvoice.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Error al eliminar factura");

      await fetchInvoices();
      setIsDeleteModalOpen(false);
      setSelectedInvoice(null);
    } catch (error) {
      console.error("Error deleting invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  // Funciones auxiliares
  const clearInvoice = (showConfirm = true) => {
    if (showConfirm) {
      setShowConfirmDialog(true);
    } else {
      setNewInvoice({
        clientId: 0,
        generalDescription: "",
        details: [
          {
            serviceId: 0,
            pieceId: 0,
            amount: 1,
            serviceExtra: 0,
            pieceExtra: 0,
            description: "",
          },
        ],
      });
    }
  };

  const confirmClearInvoice = () => {
    setNewInvoice({
      clientId: 0,
      generalDescription: "",
      details: [
        {
          serviceId: 0,
          pieceId: 0,
          amount: 1,
          serviceExtra: 0,
          pieceExtra: 0,
          description: "",
        },
      ],
    });
    setShowConfirmDialog(false);
  };

  const addDetailLine = (): void => {
    setNewInvoice({
      ...newInvoice,
      details: [
        ...newInvoice.details,
        {
          serviceId: 0,
          pieceId: 0,
          amount: 1,
          description: "",
          serviceExtra: 0,
          pieceExtra: 0,
        },
      ],
    });
  };

  const addEditDetailLine = (): void => {
    setEditInvoice({
      ...editInvoice,
      details: [
        ...editInvoice.details,
        {
          serviceId: 0,
          pieceId: 0,
          amount: 1,
          description: "",
          serviceExtra: 0,
          pieceExtra: 0,
        },
      ],
    });
  };

  const removeDetailLine = (index: number): void => {
    const newDetails = newInvoice.details.filter(
      (_: DetailLine, i: number) => i !== index
    );
    setNewInvoice({ ...newInvoice, details: newDetails });
  };

  const removeEditDetailLine = (index: number): void => {
    const newDetails = editInvoice.details.filter(
      (_: DetailLine, i: number) => i !== index
    );
    setEditInvoice({ ...editInvoice, details: newDetails });
  };

  const updateDetailLine = (
    index: number,
    field: keyof DetailLine,
    value: string | number
  ): void => {
    const newDetails = [...newInvoice.details];
    // @ts-expect-error - Dynamic field assignment
    newDetails[index][field] = value;
    setNewInvoice({ ...newInvoice, details: newDetails });
  };

  const updateEditDetailLine = (
    index: number,
    field: keyof DetailLine,
    value: string | number
  ): void => {
    const newDetails = [...editInvoice.details];
    // @ts-expect-error - Dynamic field assignment
    newDetails[index][field] = value;
    setEditInvoice({ ...editInvoice, details: newDetails });
  };

  const calculateTotal = (): number => {
    return newInvoice.details.reduce((total: number, detail: DetailLine) => {
      const service = services.find((s: Service) => s.id === detail.serviceId);
      const piece = pieces.find((p: Piece) => p.id === detail.pieceId);
      const servicePrice = service ? Number(service.price) : 0;
      const piecePrice = piece ? Number(piece.price) * detail.amount : 0;
      const serviceExtraAmount = detail.serviceExtra
        ? Number(detail.serviceExtra)
        : 0;
      const pieceExtraAmount = detail.pieceExtra
        ? Number(detail.pieceExtra)
        : 0;

      return (
        total +
        servicePrice +
        piecePrice +
        serviceExtraAmount +
        pieceExtraAmount
      );
    }, 0);
  };

  const calculateEditTotal = (): number => {
    return editInvoice.details.reduce((total: number, detail: DetailLine) => {
      const service = services.find((s: Service) => s.id === detail.serviceId);
      const piece = pieces.find((p: Piece) => p.id === detail.pieceId);
      const servicePrice = service ? Number(service.price) : 0;
      const piecePrice = piece ? Number(piece.price) * detail.amount : 0;
      const serviceExtraAmount = detail.serviceExtra
        ? Number(detail.serviceExtra)
        : 0;
      const pieceExtraAmount = detail.pieceExtra
        ? Number(detail.pieceExtra)
        : 0;

      return (
        total +
        servicePrice +
        piecePrice +
        serviceExtraAmount +
        pieceExtraAmount
      );
    }, 0);
  };

  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return "$ 0";
    }

    const formattedNumber = new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

    return `$ ${formattedNumber}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInvoiceType = (invoice: Invoice): string => {
    console.log("\n🔍 === DEBUG getInvoiceType ===");
    console.log("Factura ID:", invoice.id);
    console.log("invoiceDetail completo:", invoice.invoiceDetail);
    console.log("purchasedService:", invoice.invoiceDetail?.purchasedService);
    console.log(
      "purchasedService es array?:",
      Array.isArray(invoice.invoiceDetail?.purchasedService)
    );
    console.log(
      "purchasedService.length:",
      invoice.invoiceDetail?.purchasedService?.length
    );
    console.log("pieces:", invoice.invoiceDetail?.pieces);
    console.log(
      "pieces es array?:",
      Array.isArray(invoice.invoiceDetail?.pieces)
    );
    console.log("pieces.length:", invoice.invoiceDetail?.pieces?.length);

    const hasServices =
      invoice.invoiceDetail?.purchasedService &&
      invoice.invoiceDetail.purchasedService.length > 0;
    const hasPieces =
      invoice.invoiceDetail?.pieces && invoice.invoiceDetail.pieces.length > 0;

    console.log("✅ hasServices:", hasServices);
    console.log("✅ hasPieces:", hasPieces);

    let resultado = "";
    if (hasServices && hasPieces) {
      resultado = "Servicio + Repuestos";
    } else if (hasServices) {
      resultado = "Servicio";
    } else if (hasPieces) {
      resultado = "Repuestos";
    } else {
      resultado = "Sin especificar";
    }

    console.log("🎯 RESULTADO:", resultado);
    console.log("=== FIN DEBUG getInvoiceType ===\n");

    return resultado;
  };

  const hasInvoiceDetails = (invoice: Invoice): boolean => {
    const hasServices = Boolean(
      invoice.invoiceDetail?.purchasedService &&
        invoice.invoiceDetail.purchasedService.length > 0
    );
    const hasPieces = Boolean(
      invoice.invoiceDetail?.pieces && invoice.invoiceDetail.pieces.length > 0
    );

    return hasServices || hasPieces;
  };

  const selectedClient = clients.find(
    (client) => client.id === newInvoice.clientId
  );

  const selectedEditClient = clients.find(
    (client) => client.id === editInvoice.clientId
  );

  const handleViewClientInvoices = (clientSummary: ClientSummary) => {
    setSelectedClientForInvoices(clientSummary);
    setIsClientInvoicesModalOpen(true);
  };

  const handleEditInvoice = () => {
    if (!selectedInvoice) return;

    setShowEditInfoMessage(true);

    const editData = loadInvoiceForEdit(selectedInvoice);
    setEditInvoice(editData);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditInvoice({
      clientId: 0,
      generalDescription: "",
      details: [],
    });
    setShowEditInfoMessage(true);
  };

  useEffect(() => {
    if (isEditMode && showEditInfoMessage) {
      const timer = setTimeout(() => {
        setShowEditInfoMessage(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isEditMode, showEditInfoMessage]);

  const clearEditInvoice = () => {
    setShowConfirmDialog(true);
  };

  const confirmClearEditInvoice = () => {
    if (!selectedInvoice) return;

    const editData = loadInvoiceForEdit(selectedInvoice);
    setEditInvoice(editData);
    setShowConfirmDialog(false);
  };

  const handleOpenEditMode = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowEditInfoMessage(true);

    const editData = loadInvoiceForEdit(invoice);
    setEditInvoice(editData);
    setIsEditMode(true);
    setIsViewModalOpen(true);
  };

  // Ahora viene el JSX responsive (continúa...)

  return (
    <div className="w-full h-full p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Facturación
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Gestiona las facturas de servicios y repuestos
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="default"
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Factura
        </Button>
      </div>

      {/* Stats Cards - Responsive */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Facturado
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {formatCurrency(
                invoices.reduce(
                  (sum: number, inv: Invoice) => sum + inv.total,
                  0
                )
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {invoices.length} facturas emitidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Factura Promedio
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {formatCurrency(
                invoices.length > 0
                  ? invoices.reduce(
                      (sum: number, inv: Invoice) => sum + inv.total,
                      0
                    ) / invoices.length
                  : 0
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Valor promedio por servicio
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Clientes Atendidos
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {clientSummaries.length}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Clientes únicos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search - Responsive */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Búsqueda */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por cliente o identificación..."
                    className="pl-8 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Filtros - Responsive */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2 border-t">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    Ordenar por:
                  </span>
                </div>
                <Select
                  value={filterBy}
                  onValueChange={(value: "name" | "invoices" | "total") =>
                    setFilterBy(value)
                  }
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nombre
                      </div>
                    </SelectItem>
                    <SelectItem value="invoices">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        N° Facturas
                      </div>
                    </SelectItem>
                    <SelectItem value="total">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Total Gastado
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Orden:
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="gap-2"
                >
                  {sortOrder === "asc" ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      <span className="hidden sm:inline">Ascendente</span>
                      <span className="sm:hidden">Asc</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      <span className="hidden sm:inline">Descendente</span>
                      <span className="sm:hidden">Desc</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Indicador de resultados */}
            <div className="text-xs sm:text-sm text-muted-foreground">
              Mostrando {filteredClientSummaries.length} cliente
              {filteredClientSummaries.length !== 1 ? "s" : ""} de{" "}
              {clientSummaries.length} total
              {filteredClientSummaries.length !== clientSummaries.length &&
                " (filtrado)"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table/Cards - Responsive */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          {/* Vista Desktop - Tabla */}
          <div className="hidden md:block">
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Cliente
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Identificación
                      </th>
                      <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                        N° Facturas
                      </th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                        Total Gastado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="h-24 text-center">
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          </div>
                        </td>
                      </tr>
                    ) : filteredClientSummaries.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="h-24 text-center">
                          No se encontraron clientes con facturas
                        </td>
                      </tr>
                    ) : (
                      paginatedClientSummaries.map((summary: ClientSummary) => (
                        <tr
                          key={summary.client.id}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {summary.client.fullName}{" "}
                                {summary.client.fullSurname}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            {summary.client.identified}
                          </td>
                          <td className="p-4 align-middle text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() => handleViewClientInvoices(summary)}
                            >
                              <Receipt className="h-4 w-4" />
                              <Badge variant="secondary">
                                {summary.invoices.length}
                              </Badge>
                            </Button>
                          </td>
                          <td className="p-4 align-middle text-right font-semibold">
                            {formatCurrency(summary.totalSpent)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Vista Mobile - Cards */}
          <div className="md:hidden space-y-3">
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredClientSummaries.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                No se encontraron clientes con facturas
              </div>
            ) : (
              paginatedClientSummaries.map((summary: ClientSummary) => (
                <Card key={summary.client.id} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {summary.client.fullName}{" "}
                              {summary.client.fullSurname}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {summary.client.identified}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 flex-1 mr-2"
                          onClick={() => handleViewClientInvoices(summary)}
                        >
                          <Receipt className="h-3 w-3" />
                          <span className="text-xs">
                            {summary.invoices.length} Facturas
                          </span>
                        </Button>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="font-semibold text-sm">
                            {formatCurrency(summary.totalSpent)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Controles de Paginación - Responsive */}
          {filteredClientSummaries.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 sm:px-4 py-4 border-t mt-4">
              <span className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
                Mostrando {currentPage * itemsPerPage + 1} -{" "}
                {Math.min(
                  (currentPage + 1) * itemsPerPage,
                  filteredClientSummaries.length
                )}{" "}
                de {filteredClientSummaries.length} clientes
              </span>

              {/* Desktop Pagination */}
              <div className="hidden sm:flex items-center gap-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(0)}
                  disabled={currentPage === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <span className="px-2 text-sm font-medium">
                  {currentPage + 1} de {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1 || totalPages === 0}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages - 1)}
                  disabled={currentPage === totalPages - 1 || totalPages === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Pagination */}
              <div className="flex sm:hidden items-center gap-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm font-medium whitespace-nowrap">
                  {currentPage + 1} / {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1 || totalPages === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs - continúa en siguiente archivo debido al tamaño... */}

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Confirmar limpieza
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {isEditMode
                ? "¿Estás seguro de que deseas reestablecer los campos? Esta acción restaurará los valores originales de la factura."
                : "¿Estás seguro de que deseas limpiar todos los campos? Esta acción eliminará toda la información ingresada y no se puede deshacer."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={
                isEditMode ? confirmClearEditInvoice : confirmClearInvoice
              }
              className="bg-red-600 text-white hover:bg-red-700 w-full sm:w-auto"
            >
              {isEditMode ? "Sí, reestablecer" : "Sí, limpiar todo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isClientInvoicesModalOpen}
        onOpenChange={setIsClientInvoicesModalOpen}
      >
        <DialogContent className="w-[95vw] max-w-4xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Facturas de {selectedClientForInvoices?.client.fullName}{" "}
              {selectedClientForInvoices?.client.fullSurname}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              ID: {selectedClientForInvoices?.client.identified}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4">
            {selectedClientForInvoices?.invoices.map((invoice) => (
              <Card
                key={invoice.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm sm:text-base font-semibold">
                          Factura #{invoice.id.toString().padStart(6, "0")}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {formatDate(invoice.createAt)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                        <div>
                          <span className="text-muted-foreground">Tipo:</span>
                          <p className="font-medium">
                            {getInvoiceType(invoice)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total:</span>
                          <p className="font-semibold text-base sm:text-lg">
                            {formatCurrency(invoice.total)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <span className="text-muted-foreground text-xs sm:text-sm">
                          Descripción:
                        </span>
                        <p className="text-xs sm:text-sm">
                          {invoice.invoiceDetail?.description ||
                            "Sin descripción"}
                        </p>
                      </div>

                      {hasInvoiceDetails(invoice) && (
                        <div className="mt-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2 w-full sm:w-auto text-xs"
                                >
                                  <Receipt className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="hidden sm:inline">
                                    Ver detalles completos
                                  </span>
                                  <span className="sm:hidden">Detalles</span>
                                  <Info className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent
                                side="bottom"
                                className="max-w-md max-h-[70vh] overflow-y-auto p-3 sm:p-4"
                              >
                                <div className="space-y-3 sm:space-y-4">
                                  {/* Servicios */}
                                  {invoice.invoiceDetail?.purchasedService &&
                                    invoice.invoiceDetail.purchasedService
                                      .length > 0 && (
                                      <div>
                                        <p className="font-semibold text-xs sm:text-sm mb-2 flex items-center gap-2">
                                          <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                                          Servicios Adquiridos
                                        </p>
                                        <div className="space-y-2 pl-4 sm:pl-6">
                                          {invoice.invoiceDetail.purchasedService.map(
                                            (service, idx) => (
                                              <div
                                                key={idx}
                                                className="text-xs sm:text-sm border-l-2 border-primary pl-2"
                                              >
                                                <p className="font-medium">
                                                  {service.name}
                                                </p>
                                                <p className="text-muted-foreground text-[10px] sm:text-xs">
                                                  Precio:{" "}
                                                  {formatCurrency(
                                                    service.price
                                                  )}
                                                </p>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}

                                  {/* Separador si hay ambos */}
                                  {invoice.invoiceDetail?.purchasedService &&
                                    invoice.invoiceDetail.purchasedService
                                      .length > 0 &&
                                    invoice.invoiceDetail?.pieces &&
                                    invoice.invoiceDetail.pieces.length > 0 && (
                                      <Separator />
                                    )}

                                  {/* Piezas */}
                                  {invoice.invoiceDetail?.pieces &&
                                    invoice.invoiceDetail.pieces.length > 0 && (
                                      <div>
                                        <p className="font-semibold text-xs sm:text-sm mb-2 flex items-center gap-2">
                                          <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                                          Repuestos Adquiridos
                                        </p>
                                        <div className="space-y-2 pl-4 sm:pl-6">
                                          {invoice.invoiceDetail.pieces.map(
                                            (piece, idx) => (
                                              <div
                                                key={idx}
                                                className="text-xs sm:text-sm border-l-2 border-primary pl-2"
                                              >
                                                <p className="font-medium">
                                                  {piece.name}
                                                </p>
                                                <p className="text-muted-foreground text-[10px] sm:text-xs">
                                                  Precio unitario:{" "}
                                                  {formatCurrency(piece.price)}
                                                </p>
                                                <p className="text-muted-foreground text-[10px] sm:text-xs">
                                                  Cantidad:{" "}
                                                  {invoice.invoiceDetail
                                                    .amount || 1}
                                                </p>
                                                <p className="text-muted-foreground text-[10px] sm:text-xs font-semibold">
                                                  Subtotal:{" "}
                                                  {formatCurrency(
                                                    piece.price *
                                                      (invoice.invoiceDetail
                                                        .amount || 1)
                                                  )}
                                                </p>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel className="text-xs">
                          Acciones
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsEditMode(false);
                            setIsViewModalOpen(true);
                          }}
                          className="text-xs"
                        >
                          <Eye className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          Ver detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleOpenEditMode(invoice)}
                          className="text-xs"
                        >
                          <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">
                          <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          Descargar PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive text-xs"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsClientInvoicesModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Nueva Factura
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Crea una nueva factura seleccionando el cliente, servicios y
              repuestos
            </DialogDescription>
          </DialogHeader>

          <div className="px-3 sm:px-6 py-4 space-y-4 sm:space-y-6">
            {/* Selección de Cliente con Combobox */}
            <div className="space-y-2">
              <Label htmlFor="client" className="text-xs sm:text-sm">
                Cliente *
              </Label>
              <Popover
                open={openClientCombobox}
                onOpenChange={setOpenClientCombobox}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openClientCombobox}
                    className="w-full justify-between text-xs sm:text-sm"
                  >
                    {selectedClient ? (
                      <span className="flex items-center gap-2 truncate">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">
                          {selectedClient.fullName} {selectedClient.fullSurname}{" "}
                          - {selectedClient.identified}
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Selecciona un cliente...
                      </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[400px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Buscar cliente..."
                      className="text-xs sm:text-sm"
                    />
                    <CommandEmpty className="text-xs sm:text-sm">
                      No se encontraron clientes.
                    </CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {clients.map((client) => (
                        <CommandItem
                          key={client.id}
                          value={`${client.fullName} ${client.fullSurname} ${client.identified}`}
                          onSelect={() => {
                            setNewInvoice({
                              ...newInvoice,
                              clientId: client.id,
                            });
                            setOpenClientCombobox(false);
                          }}
                          className="text-xs sm:text-sm"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-3 w-3 sm:h-4 sm:w-4",
                              newInvoice.clientId === client.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-medium truncate">
                              {client.fullName} {client.fullSurname}
                            </span>
                            <span className="text-[10px] sm:text-xs text-muted-foreground">
                              ID: {client.identified}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <Separator />

            {/* Detalles de Factura */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Label className="text-sm sm:text-base">
                  Detalles de Factura
                </Label>
                <div className="flex justify-end w-full sm:ml-auto gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => clearInvoice(true)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950 text-xs h-8"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Reestablecer</span>
                    <span className="sm:hidden">Reset</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDetailLine}
                    className="text-xs h-8"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Agregar línea</span>
                    <span className="sm:hidden">Agregar</span>
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Descripción General */}
              <div className="space-y-2">
                <Label
                  htmlFor="generalDescription"
                  className="text-xs sm:text-sm"
                >
                  Descripción General de la Factura
                </Label>
                <Textarea
                  id="generalDescription"
                  placeholder="Describe de manera general los servicios o trabajos realizados..."
                  value={newInvoice.generalDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewInvoice({
                      ...newInvoice,
                      generalDescription: e.target.value,
                    })
                  }
                  rows={3}
                  className="text-xs sm:text-sm"
                />
              </div>

              <div className="overflow-y-auto max-h-[50vh] space-y-3 sm:space-y-4 pr-1 sm:pr-2">
                {newInvoice.details.map((detail: DetailLine, index: number) => (
                  <Card key={index}>
                    <CardContent className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 p-3 sm:p-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium">
                          Línea {index + 1}
                        </span>
                        {newInvoice.details.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDetailLine(index)}
                            className="h-7 w-7 sm:h-8 sm:w-8"
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                      </div>

                      {/* Servicio */}
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm">Servicio</Label>
                        <Select
                          value={
                            detail.serviceId ? detail.serviceId.toString() : ""
                          }
                          onValueChange={(value: string) =>
                            updateDetailLine(
                              index,
                              "serviceId",
                              parseInt(value) || 0
                            )
                          }
                        >
                          <SelectTrigger className="text-xs sm:text-sm">
                            <SelectValue placeholder="Selecciona un servicio" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((service: Service) => (
                              <SelectItem
                                key={service.id}
                                value={service.id.toString()}
                                className="text-xs sm:text-sm"
                              >
                                {service.name} - {formatCurrency(service.price)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Repuesto y Cantidad */}
                      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-[1fr_120px]">
                        <div className="space-y-2">
                          <Label className="text-xs sm:text-sm">Repuesto</Label>
                          <Select
                            value={
                              detail.pieceId ? detail.pieceId.toString() : ""
                            }
                            onValueChange={(value: string) =>
                              updateDetailLine(
                                index,
                                "pieceId",
                                parseInt(value) || 0
                              )
                            }
                          >
                            <SelectTrigger className="text-xs sm:text-sm">
                              <SelectValue placeholder="Selecciona un repuesto" />
                            </SelectTrigger>
                            <SelectContent>
                              {pieces.map((piece: Piece) => (
                                <SelectItem
                                  key={piece.id}
                                  value={piece.id.toString()}
                                  className="text-xs sm:text-sm"
                                >
                                  {piece.name} - {formatCurrency(piece.price)}{" "}
                                  (Stock: {piece.stock})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs sm:text-sm">Cantidad</Label>
                          <Input
                            type="number"
                            min="1"
                            value={detail.amount}
                            disabled={!detail.pieceId || detail.pieceId === 0}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) =>
                              updateDetailLine(
                                index,
                                "amount",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="text-xs sm:text-sm"
                          />
                        </div>
                      </div>

                      {/* Cargos Extra */}
                      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-xs sm:text-sm">
                            Cargo Extra del Servicio
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              detail.serviceExtra === 0
                                ? ""
                                : detail.serviceExtra
                            }
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) =>
                              updateDetailLine(
                                index,
                                "serviceExtra",
                                e.target.value === ""
                                  ? 0
                                  : parseFloat(e.target.value)
                              )
                            }
                            placeholder="0.00"
                            disabled={
                              !detail.serviceId || detail.serviceId === 0
                            }
                            className="text-xs sm:text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs sm:text-sm">
                            Cargo Extra de las Piezas
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              detail.pieceExtra === 0 ? "" : detail.pieceExtra
                            }
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) =>
                              updateDetailLine(
                                index,
                                "pieceExtra",
                                e.target.value === ""
                                  ? 0
                                  : parseFloat(e.target.value)
                              )
                            }
                            placeholder="0.00"
                            disabled={!detail.pieceId || detail.pieceId === 0}
                            className="text-xs sm:text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Total */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                <div className="flex items-center justify-between text-base sm:text-lg font-semibold">
                  <span>Total a Pagar:</span>
                  <span className="text-xl sm:text-2xl">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 px-3 sm:px-6">
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => void createInvoice()}
              disabled={loading || !newInvoice.clientId}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                "Crear Factura"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Ver/Editar Detalle de Factura */}
      <Dialog
        open={isViewModalOpen}
        onOpenChange={(open) => {
          setIsViewModalOpen(open);
          if (!open) {
            setIsEditMode(false);
            setEditInvoice({
              clientId: 0,
              generalDescription: "",
              details: [],
            });
          }
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {isEditMode ? "Editar" : "Detalle de"} Factura #
              {selectedInvoice?.id.toString().padStart(6, "0")}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {isEditMode
                ? "Modifica los detalles de la factura"
                : "Información completa de la factura"}
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && !isEditMode && (
            <div className="space-y-4 sm:space-y-6 py-4">
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground text-sm">
                    Cliente
                  </Label>
                  <p className="font-medium text-sm sm:text-base break-words">
                    {selectedInvoice.client.fullName}{" "}
                    {selectedInvoice.client.fullSurname}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">
                    Identificación
                  </Label>
                  <p className="font-medium text-sm sm:text-base">
                    {selectedInvoice.client.identified}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Fecha</Label>
                  <p className="font-medium text-sm sm:text-base">
                    {formatDate(selectedInvoice.createAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Total</Label>
                  <p className="text-lg sm:text-xl font-bold">
                    {formatCurrency(selectedInvoice.total)}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-muted-foreground text-sm">
                  Descripción General
                </Label>
                <p className="mt-2 text-sm break-words">
                  {selectedInvoice.invoiceDetail?.description ||
                    "Sin descripción"}
                </p>
              </div>

              <Separator />

              {/* Sección de Detalles de Servicios y Piezas */}
              {hasInvoiceDetails(selectedInvoice) && (
                <div>
                  <Label className="text-muted-foreground mb-2 block text-sm">
                    Detalles de Servicios y Repuestos
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 text-xs sm:text-sm w-full sm:w-auto"
                        >
                          <Receipt className="h-4 w-4" />
                          <span className="truncate">Ver listado completo</span>
                          <Info className="h-4 w-4 flex-shrink-0" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="max-w-[90vw] sm:max-w-md max-h-[70vh] overflow-y-auto p-3 sm:p-4"
                      >
                        <div className="space-y-3 sm:space-y-4">
                          {/* Servicios */}
                          {selectedInvoice.invoiceDetail?.purchasedService &&
                            selectedInvoice.invoiceDetail.purchasedService
                              .length > 0 && (
                              <div>
                                <p className="font-semibold text-xs sm:text-sm mb-2 flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  Servicios Adquiridos
                                </p>
                                <div className="space-y-2 pl-4 sm:pl-6">
                                  {selectedInvoice.invoiceDetail.purchasedService.map(
                                    (service, idx) => (
                                      <div
                                        key={idx}
                                        className="text-xs sm:text-sm border-l-2 border-primary pl-2"
                                      >
                                        <p className="font-medium break-words">
                                          {service.name}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                          Precio:{" "}
                                          {formatCurrency(service.price)}
                                        </p>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Separador si hay ambos */}
                          {selectedInvoice.invoiceDetail?.purchasedService &&
                            selectedInvoice.invoiceDetail.purchasedService
                              .length > 0 &&
                            selectedInvoice.invoiceDetail?.pieces &&
                            selectedInvoice.invoiceDetail.pieces.length > 0 && (
                              <Separator />
                            )}

                          {/* Piezas */}
                          {selectedInvoice.invoiceDetail?.pieces &&
                            selectedInvoice.invoiceDetail.pieces.length > 0 && (
                              <div>
                                <p className="font-semibold text-xs sm:text-sm mb-2 flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  Repuestos Adquiridos
                                </p>
                                <div className="space-y-2 pl-4 sm:pl-6">
                                  {selectedInvoice.invoiceDetail.pieces.map(
                                    (piece, idx) => (
                                      <div
                                        key={idx}
                                        className="text-xs sm:text-sm border-l-2 border-primary pl-2"
                                      >
                                        <p className="font-medium break-words">
                                          {piece.name}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                          Precio unitario:{" "}
                                          {formatCurrency(piece.price)}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                          Cantidad:{" "}
                                          {selectedInvoice.invoiceDetail
                                            .amount || 1}
                                        </p>
                                        <p className="text-muted-foreground text-xs font-semibold">
                                          Subtotal:{" "}
                                          {formatCurrency(
                                            piece.price *
                                              (selectedInvoice.invoiceDetail
                                                .amount || 1)
                                          )}
                                        </p>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}

              {selectedInvoice.invoiceDetail && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">
                        {formatCurrency(selectedInvoice.invoiceDetail.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-muted-foreground">Extras:</span>
                      <span className="font-medium">
                        {formatCurrency(selectedInvoice.invoiceDetail.extra)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base sm:text-lg font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedInvoice.total)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {isEditMode && (
            <div className="py-4 space-y-4 sm:space-y-6">
              {/* Mensaje informativo dismissible */}
              {showEditInfoMessage && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 relative animate-in fade-in slide-in-from-top-2 duration-300">
                  <button
                    onClick={() => setShowEditInfoMessage(false)}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                    aria-label="Cerrar mensaje"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="flex gap-2 sm:gap-3 pr-6 sm:pr-8">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-blue-900 dark:text-blue-100">
                      <p className="font-semibold mb-1">Modo de Edición</p>
                      <p>
                        • Para modificar un item existente, cámbialo
                        directamente en su línea
                      </p>
                      <p>
                        • Para agregar nuevos items, usa el botón "Agregar
                        línea"
                      </p>
                      <p>
                        • Al guardar, se recreará la factura con los cambios
                        realizados
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Selección de Cliente (readonly en modo edición) */}
              <div className="space-y-2">
                <Label className="text-sm">Cliente</Label>
                <div className="p-3 bg-muted rounded-md">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span className="font-medium text-sm break-words">
                      {selectedEditClient?.fullName}{" "}
                      {selectedEditClient?.fullSurname} -{" "}
                      {selectedEditClient?.identified}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Descripción General */}
              <div className="space-y-2">
                <Label htmlFor="editGeneralDescription" className="text-sm">
                  Descripción General de la Factura
                </Label>
                <Textarea
                  id="editGeneralDescription"
                  placeholder="Describe de manera general los servicios o trabajos realizados..."
                  value={editInvoice.generalDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setEditInvoice({
                      ...editInvoice,
                      generalDescription: e.target.value,
                    })
                  }
                  rows={3}
                  className="text-sm"
                />
              </div>

              <Separator />

              {/* Detalles de Factura en modo edición */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Label className="text-sm sm:text-base">
                    Detalles de Factura
                  </Label>
                  <div className="flex gap-2 sm:ml-auto w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearEditInvoice}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950 text-xs flex-1 sm:flex-none"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Reestablecer
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addEditDetailLine}
                      className="text-xs flex-1 sm:flex-none"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Agregar línea
                    </Button>
                  </div>
                </div>

                <div className="overflow-y-auto max-h-80 space-y-3 sm:space-y-4 pr-1">
                  {editInvoice.details.map(
                    (detail: DetailLine, index: number) => (
                      <Card key={index}>
                        <CardContent className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 px-3 sm:px-6">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-medium">
                              Línea {index + 1}
                            </span>
                            {editInvoice.details.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeEditDetailLine(index)}
                                className="h-8 w-8"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          {/* Servicio */}
                          <div className="space-y-2">
                            <Label className="text-xs sm:text-sm">
                              Servicio
                            </Label>
                            <Select
                              value={
                                detail.serviceId
                                  ? detail.serviceId.toString()
                                  : ""
                              }
                              onValueChange={(value: string) =>
                                updateEditDetailLine(
                                  index,
                                  "serviceId",
                                  parseInt(value) || 0
                                )
                              }
                            >
                              <SelectTrigger className="text-xs sm:text-sm">
                                <SelectValue placeholder="Selecciona un servicio" />
                              </SelectTrigger>
                              <SelectContent>
                                {services.map((service: Service) => (
                                  <SelectItem
                                    key={service.id}
                                    value={service.id.toString()}
                                    className="text-xs sm:text-sm"
                                  >
                                    {service.name} -{" "}
                                    {formatCurrency(service.price)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Repuesto y Cantidad */}
                          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-[1fr_120px]">
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm">
                                Repuesto
                              </Label>
                              <Select
                                value={
                                  detail.pieceId
                                    ? detail.pieceId.toString()
                                    : ""
                                }
                                onValueChange={(value: string) =>
                                  updateEditDetailLine(
                                    index,
                                    "pieceId",
                                    parseInt(value) || 0
                                  )
                                }
                              >
                                <SelectTrigger className="text-xs sm:text-sm">
                                  <SelectValue placeholder="Selecciona un repuesto" />
                                </SelectTrigger>
                                <SelectContent>
                                  {pieces.map((piece: Piece) => (
                                    <SelectItem
                                      key={piece.id}
                                      value={piece.id.toString()}
                                      className="text-xs sm:text-sm"
                                    >
                                      {piece.name} -{" "}
                                      {formatCurrency(piece.price)} (Stock:{" "}
                                      {piece.stock})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm">
                                Cantidad
                              </Label>
                              <Input
                                type="number"
                                min="1"
                                value={detail.amount}
                                disabled={
                                  !detail.pieceId || detail.pieceId === 0
                                }
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                  updateEditDetailLine(
                                    index,
                                    "amount",
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="text-xs sm:text-sm"
                              />
                            </div>
                          </div>

                          {/* Cargos Extra */}
                          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm">
                                Cargo Extra del Servicio
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  detail.serviceExtra === 0
                                    ? ""
                                    : detail.serviceExtra
                                }
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                  updateEditDetailLine(
                                    index,
                                    "serviceExtra",
                                    e.target.value === ""
                                      ? 0
                                      : parseFloat(e.target.value)
                                  )
                                }
                                placeholder="0.00"
                                disabled={
                                  !detail.serviceId || detail.serviceId === 0
                                }
                                className="text-xs sm:text-sm"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm">
                                Cargo Extra de las Piezas
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  detail.pieceExtra === 0
                                    ? ""
                                    : detail.pieceExtra
                                }
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                  updateEditDetailLine(
                                    index,
                                    "pieceExtra",
                                    e.target.value === ""
                                      ? 0
                                      : parseFloat(e.target.value)
                                  )
                                }
                                placeholder="0.00"
                                disabled={
                                  !detail.pieceId || detail.pieceId === 0
                                }
                                className="text-xs sm:text-sm"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              </div>

              {/* Total en modo edición */}
              <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center justify-between text-base sm:text-lg font-semibold">
                    <span>Total a Pagar:</span>
                    <span className="text-xl sm:text-2xl">
                      {formatCurrency(calculateEditTotal())}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {!isEditMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsViewModalOpen(false)}
                  className="w-full sm:w-auto text-sm"
                >
                  Cerrar
                </Button>
                <Button
                  variant="outline"
                  onClick={handleEditInvoice}
                  className="w-full sm:w-auto text-sm"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button className="w-full sm:w-auto text-sm">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="w-full sm:w-auto text-sm"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => void updateInvoice()}
                  disabled={loading || !editInvoice.clientId}
                  className="w-full sm:w-auto text-sm"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    "Guardar Cambios"
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              ¿Eliminar Factura?
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Esta acción no se puede deshacer. La factura #
              {selectedInvoice?.id.toString().padStart(6, "0")} será eliminada
              permanentemente.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => void deleteInvoice()}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
