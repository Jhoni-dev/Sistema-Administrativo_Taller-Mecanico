"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Car,
  User,
  Phone,
  Mail,
  MapPin,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToExcel } from "./documentsExport/excel";

// Interfaces
interface ClientContact {
  phoneNumber: string;
  email: string;
  address?: string;
}

interface ClientVehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  engineDisplacement: number;
  plates?: string;
  description?: string;
}

interface Client {
  id?: number;
  fullName: string;
  fullSurname: string;
  identified: string;
  clientState: boolean;
  clientContact: ClientContact[];
  clientVehicle: ClientVehicle[];
}

interface CreateClientPayload {
  fullName: string;
  fullSurname: string;
  identified: string;
  clientContact: {
    phoneNumber: string;
    email: string;
    address?: string;
  };
}

interface CreateVehiclePayload {
  brand: string;
  model: string;
  year: number;
  engineDisplacement: number;
  plates: string;
  description?: string;
  clientId: number;
}

interface UpdateVehiclePayload {
  brand: string;
  model: string;
  year: number;
  engineDisplacement: number;
  plates: string;
  description?: string;
}

export default function ClientVehicleManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<ClientVehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicleNotExist, setVehicleNotExist] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<ClientVehicle | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const API_CLIENT_URL = "/backend/api/protected/clientPage";
  const API_VEHICLE_URL = "/backend/api/protected/clientVehicle";

  // Estados para formularios
  const [clientForm, setClientForm] = useState({
    fullName: "",
    fullSurname: "",
    identified: "",
    phoneNumber: "",
    email: "",
    address: "",
  });

  const [contactForm, setContactForm] = useState({
    phoneNumber: "",
    email: "",
    address: "",
  });

  const [vehicleForm, setVehicleForm] = useState({
    brand: "",
    model: "",
    year: "",
    engineDisplacement: "",
    plates: "",
    description: "",
    clientId: null as number | null,
  });

  // Fetch de datos
  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_CLIENT_URL);
      if (!response.ok) throw new Error("Error fetching clients");
      const data: Client[] = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch(API_VEHICLE_URL);
      if (!response.ok) throw new Error("Error fetching vehicles");
      const data: ClientVehicle[] = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchVehicles();
  }, []);

  // ✅ OPTIMIZADO: Usar useMemo para cachear los vehículos con IDs
  const getClientVehiclesWithIds = React.useMemo(() => {
    return (clientId: number): ClientVehicle[] => {
      const client = clients.find((c) => c.id === clientId);
      if (!client) return [];

      return client.clientVehicle.map((clientVehicle, index) => {
        const vehicleWithId = vehicles.find(
          (v) =>
            v.brand === clientVehicle.brand &&
            v.model === clientVehicle.model &&
            v.year === clientVehicle.year &&
            v.engineDisplacement === clientVehicle.engineDisplacement
        );

        return vehicleWithId
          ? vehicleWithId
          : {
              ...clientVehicle,
              id: -(clientId * 1000 + index + 1),
            };
      });
    };
  }, [clients, vehicles]);

  // CRUD para Clientes - SOLO CREACIÓN
  const handleClientSubmit = async () => {
    try {
      if (selectedClient && selectedClient.id) {
        console.warn(
          "⚠️ La edición de clientes se hace desde el modal de contacto"
        );
        setClientModalOpen(false);
        return;
      } else {
        const payload: CreateClientPayload = {
          fullName: clientForm.fullName,
          fullSurname: clientForm.fullSurname,
          identified: clientForm.identified,
          clientContact: {
            phoneNumber: clientForm.phoneNumber,
            email: clientForm.email,
            ...(clientForm.address && { address: clientForm.address }),
          },
        };

        const response = await fetch(API_CLIENT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`Error creating client: ${response.status}`);
        }
      }

      await fetchClients();
      resetClientForm();
      setClientModalOpen(false);
    } catch (error) {
      console.error("❌ Error en handleClientSubmit:", error);
      alert(
        "Error al guardar el cliente. Revisa la consola para más detalles."
      );
    }
  };

  // CRUD para Contacto - ACTUALIZACIÓN
  const handleContactSubmit = async () => {
    try {
      if (selectedClient && selectedClient.id) {
        const updatePayload = {
          phoneNumber: contactForm.phoneNumber,
          email: contactForm.email,
          address: contactForm.address || null,
          clientState: true,
        };

        const response = await fetch(`${API_CLIENT_URL}/${selectedClient.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`Error updating contact: ${response.status}`);
        }

        await fetchClients();
        setContactModalOpen(false);
      }
    } catch (error) {
      console.error("❌ Error en handleContactSubmit:", error);
      alert(
        "Error al actualizar el contacto. Revisa la consola para más detalles."
      );
    }
  };

  // CRUD para Vehículos
  const handleVehicleSubmit = async () => {
    try {
      if (selectedVehicle && selectedVehicle.id && selectedVehicle.id > 0) {
        const updatePayload: UpdateVehiclePayload = {
          brand: vehicleForm.brand,
          model: vehicleForm.model,
          year: parseInt(vehicleForm.year),
          engineDisplacement: parseInt(vehicleForm.engineDisplacement),
          plates: vehicleForm.plates,
          ...(vehicleForm.description && {
            description: vehicleForm.description,
          }),
        };

        const response = await fetch(
          `${API_VEHICLE_URL}/${selectedVehicle.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatePayload),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(
            `Error updating vehicle: ${response.status} ${errorText}`
          );
        }
      } else {
        const payload: CreateVehiclePayload = {
          brand: vehicleForm.brand,
          model: vehicleForm.model,
          year: parseInt(vehicleForm.year),
          engineDisplacement: parseInt(vehicleForm.engineDisplacement),
          plates: vehicleForm.plates,
          ...(vehicleForm.description && {
            description: vehicleForm.description,
          }),
          clientId: vehicleForm.clientId!,
        };

        const response = await fetch(API_VEHICLE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(
            `Error creating vehicle: ${response.status} ${errorText}`
          );
        }
      }

      await fetchVehicles();
      await fetchClients();
      resetVehicleForm();
      setVehicleModalOpen(false);
    } catch (error) {
      console.error("❌ Error en handleVehicleSubmit:", error);
      alert(
        "Error al guardar el vehículo. Revisa la consola para más detalles."
      );
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteTarget.type === "client") {
        const response = await fetch(`${API_CLIENT_URL}/${deleteTarget.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(
            `Error deleting client: ${response.status} - ${errorText}`
          );
        }

        await fetchClients();
        await fetchVehicles();
      } else if (
        deleteTarget.type === "vehicle" &&
        deleteTarget.id &&
        deleteTarget.id > 0
      ) {
        const response = await fetch(`${API_VEHICLE_URL}/${deleteTarget.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(
            `Error deleting vehicle: ${response.status} - ${errorText}`
          );
        }

        await fetchVehicles();
        await fetchClients();
      } else {
        console.error("❌ ID no válido para eliminar:", deleteTarget);
        alert("No se puede eliminar: ID no válido");
        return;
      }

      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error("❌ Error en handleDelete:", error);
      alert(
        `Error al eliminar: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    }
  };

  const handleExportVehiclesExcel = async () => {
    // Aplanar los datos correctamente
    const exportClients = clients.flatMap((c) => {
      // Si el cliente tiene contactos, crear una fila por cada contacto
      if (c.clientVehicle && c.clientVehicle.length > 0) {
        return c.clientVehicle.map((vehicle) => ({
          id: c.id,
          fullName: c.fullName,
          fullSurname: c.fullSurname,
          identified: c.identified,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          plates: vehicle.plates,
          engineDisplacement: vehicle.engineDisplacement,
          description: vehicle.description || "",
        }));
      } else {
        <Dialog
          open={vehicleNotExist}
          onOpenChange={() => setVehicleNotExist(true)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vehiculo no encontrado</DialogTitle>
            </DialogHeader>

            <p className="">No se encontro ningun vehiculo almacenado</p>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setVehicleNotExist(false)}
              >
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>;

        return {};
      }
    });

    if (!exportClients) return;

    await exportToExcel({
      data: exportClients,
      fileName: "clientesVehiculos_{date}.xlsx",
      sheetName: "Vehiculos de Clientes",

      title: "REPORTE DE VEHICULOS",
      subtitle: `Generado el ${new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`,

      autoFilter: true,
      freezeHeader: true,
      includeStatistics: true,

      pagination: {
        enabled: true,
        rowsPerPage: 100,
        createIndex: true,
      },

      statistics: [
        {
          title: "Total Clientes",
          value: clients.length,
          description: "Registrados",
          bgColor: "FFF3F4F6",
          textColor: "FF1F2937",
        },
        {
          title: "Total Vehiculos",
          value: vehicles.length,
          description: "Registrados",
          bgColor: "FFDBEAFE",
          textColor: "FF2563EB",
        },
      ],

      columns: [
        { header: "ID", key: "id", width: 8, alignment: "center" },
        { header: "Nombres", key: "fullName", width: 20, alignment: "center" },
        {
          header: "Apellidos",
          key: "fullSurname",
          width: 20,
          alignment: "center",
        },
        {
          header: "Identificación",
          key: "identified",
          width: 15,
          alignment: "center",
        },
        {
          header: "Marca",
          key: "brand",
          width: 15,
          alignment: "center",
        },
        { header: "Modelo", key: "model", width: 15, alignment: "center" },
        { header: "Año", key: "year", width: 10, alignment: "center" },
        { header: "Placas", key: "plates", width: 15, alignment: "center" },
        {
          header: "Cilindrada",
          key: "engineDisplacement",
          width: 15,
          alignment: "center",
        },
        {
          header: "Descripcion",
          key: "description",
          width: 50,
          alignment: "center",
        },
      ],

      headerStyle: {
        bgColor: "FF374151",
        textColor: "FFFFFFFF",
        fontSize: 10,
      },
    });
  };

  const handleExportClientExcel = async () => {
    // Aplanar los datos correctamente
    const exportClients = clients.flatMap((c) => {
      // Si el cliente tiene contactos, crear una fila por cada contacto
      if (c.clientContact && c.clientContact.length > 0) {
        return c.clientContact.map((contact) => ({
          id: c.id,
          fullName: c.fullName,
          fullSurname: c.fullSurname,
          identified: c.identified,
          clientState: c.clientState ? "ACTIVO" : "INACTIVO", // Convertir booleano a texto
          phoneNumber: contact.phoneNumber || "",
          email: contact.email || "",
          address: contact.address || "",
        }));
      } else {
        // Si no tiene contactos, crear una fila con datos vacíos
        return [
          {
            id: c.id,
            fullName: c.fullName,
            fullSurname: c.fullSurname,
            identified: c.identified,
            clientState: c.clientState ? "ACTIVO" : "INACTIVO",
            phoneNumber: "",
            email: "",
            address: "",
          },
        ];
      }
    });

    await exportToExcel({
      data: exportClients,
      fileName: "clientes_{date}.xlsx",
      sheetName: "Clientes",

      title: "REPORTE DE CLIENTES",
      subtitle: `Generado el ${new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`,

      autoFilter: true,
      freezeHeader: true,
      includeStatistics: true,

      pagination: {
        enabled: true,
        rowsPerPage: 100,
        createIndex: true,
      },

      statistics: [
        {
          title: "Total Clientes",
          value: clients.length,
          description: "Registrados",
          bgColor: "FFF3F4F6",
          textColor: "FF1F2937",
        },
        {
          title: "Activos",
          value: clients.filter((c) => c.clientState).length,
          description: "Habilitados",
          bgColor: "FFD1FAE5",
          textColor: "FF10B981",
        },
        {
          title: "Inactivos",
          value: clients.filter((c) => !c.clientState).length,
          description: "Deshabilitados",
          bgColor: "FFFEE2E2",
          textColor: "FFEF4444",
        },
        {
          title: "Con Vehículos",
          value: clients.filter(
            (c) => c.clientVehicle && c.clientVehicle.length > 0
          ).length,
          description: "Registrados",
          bgColor: "FFDBEAFE",
          textColor: "FF2563EB",
        },
      ],

      columns: [
        { header: "ID", key: "id", width: 8, alignment: "center" },
        { header: "Nombres", key: "fullName", width: 20 },
        { header: "Apellidos", key: "fullSurname", width: 20 },
        {
          header: "Identificación",
          key: "identified",
          width: 15,
          alignment: "center",
        },
        {
          header: "Estado",
          key: "clientState",
          width: 12,
          alignment: "center",
        },
        {
          header: "Teléfono",
          key: "phoneNumber",
          width: 15,
          alignment: "center",
        },
        { header: "Correo", key: "email", width: 30 },
        { header: "Dirección", key: "address", width: 35 },
      ],

      headerStyle: {
        bgColor: "FF374151",
        textColor: "FFFFFFFF",
        fontSize: 10,
      },
    });
  };

  // Funciones auxiliares
  const resetClientForm = () => {
    setClientForm({
      fullName: "",
      fullSurname: "",
      identified: "",
      phoneNumber: "",
      email: "",
      address: "",
    });
    setSelectedClient(null);
  };

  const resetContactForm = () => {
    setContactForm({
      phoneNumber: "",
      email: "",
      address: "",
    });
  };

  const resetVehicleForm = () => {
    setVehicleForm({
      brand: "",
      model: "",
      year: "",
      engineDisplacement: "",
      plates: "",
      description: "",
      clientId: null,
    });
    setSelectedVehicle(null);
  };

  const editClient = (client: Client) => {
    setSelectedClient(client);
    const contact = client.clientContact[0] || {};
    setClientForm({
      fullName: client.fullName,
      fullSurname: client.fullSurname,
      identified: client.identified,
      phoneNumber: contact.phoneNumber || "",
      email: contact.email || "",
      address: contact.address || "",
    });
    setClientModalOpen(true);
  };

  const editContact = (client: Client) => {
    setSelectedClient(client);
    const contact = client.clientContact[0] || {};
    setContactForm({
      phoneNumber: contact.phoneNumber || "",
      email: contact.email || "",
      address: contact.address || "",
    });
    setContactModalOpen(true);
  };

  const editVehicle = (vehicle: ClientVehicle, clientId: number) => {
    setSelectedVehicle(vehicle);
    setVehicleForm({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year.toString(),
      engineDisplacement: vehicle.engineDisplacement.toString(),
      plates: vehicle.plates || "",
      description: vehicle.description || "",
      clientId: clientId,
    });
    setVehicleModalOpen(true);
  };

  const openDeleteDialog = (target: any, type: string) => {
    if (!target.id || (type === "vehicle" && target.id <= 0)) {
      console.error("❌ No se puede eliminar: ID inválido o pendiente");
      alert("No se puede eliminar este elemento porque no tiene un ID válido.");
      return;
    }

    setDeleteTarget({ ...target, type });
    setDeleteDialogOpen(true);
  };

  // Filtrado de clientes
  const filteredClients = clients.filter(
    (client) =>
      client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.fullSurname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.identified.includes(searchTerm) ||
      client.clientContact.some((c) =>
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      client.clientVehicle.some((v) =>
        v.plates?.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Cálculos de paginación
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

  // Resetear a página 1 cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Navegación de paginación
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Validación del formulario de vehículos
  const isVehicleFormValid =
    vehicleForm.brand.trim() !== "" &&
    vehicleForm.model.trim() !== "" &&
    vehicleForm.year.trim() !== "" &&
    vehicleForm.engineDisplacement.trim() !== "" &&
    vehicleForm.plates.trim() !== "";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full p-2 sm:p-4 md:p-6">
      {/* Header - Responsive */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">
          Gestión de Clientes y Vehículos
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Administra clientes y vehículos del taller
        </p>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex-1">
              <CardTitle className="text-lg sm:text-xl">Clientes</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Gestiona la información de tus clientes
              </CardDescription>
            </div>
            <Dialog open={clientModalOpen} onOpenChange={setClientModalOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={resetClientForm}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Nuevo Cliente</span>
                  <span className="sm:hidden">Nuevo</span>
                </Button>
              </DialogTrigger>
              <Button
                variant="outline"
                onClick={handleExportClientExcel}
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Clientes
              </Button>
              <Button
                variant="outline"
                onClick={handleExportVehiclesExcel}
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Vehiculos
              </Button>
              <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-base sm:text-lg">
                    {selectedClient
                      ? "Información del Cliente"
                      : "Nuevo Cliente"}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm">
                    {selectedClient
                      ? "Solo lectura - Para editar contacto use el botón 'Editar Contacto'"
                      : "Ingresa los datos del nuevo cliente"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 sm:gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-xs sm:text-sm">
                        Nombres *
                      </Label>
                      <Input
                        id="fullName"
                        value={clientForm.fullName}
                        onChange={(e) =>
                          setClientForm({
                            ...clientForm,
                            fullName: e.target.value,
                          })
                        }
                        placeholder="Juan Carlos"
                        required
                        disabled={!!selectedClient}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="fullSurname"
                        className="text-xs sm:text-sm"
                      >
                        Apellidos *
                      </Label>
                      <Input
                        id="fullSurname"
                        value={clientForm.fullSurname}
                        onChange={(e) =>
                          setClientForm({
                            ...clientForm,
                            fullSurname: e.target.value,
                          })
                        }
                        placeholder="Rodríguez Pérez"
                        required
                        disabled={!!selectedClient}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="identified" className="text-xs sm:text-sm">
                      Identificación *
                    </Label>
                    <Input
                      id="identified"
                      value={clientForm.identified}
                      onChange={(e) =>
                        setClientForm({
                          ...clientForm,
                          identified: e.target.value,
                        })
                      }
                      placeholder="1234567890"
                      disabled={!!selectedClient}
                      required
                      className="text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="phoneNumber"
                        className="text-xs sm:text-sm"
                      >
                        Teléfono *
                      </Label>
                      <Input
                        id="phoneNumber"
                        value={clientForm.phoneNumber}
                        onChange={(e) =>
                          setClientForm({
                            ...clientForm,
                            phoneNumber: e.target.value,
                          })
                        }
                        placeholder="3001234567"
                        required
                        disabled={!!selectedClient}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs sm:text-sm">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={clientForm.email}
                        onChange={(e) =>
                          setClientForm({
                            ...clientForm,
                            email: e.target.value,
                          })
                        }
                        placeholder="cliente@email.com"
                        required
                        disabled={!!selectedClient}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-xs sm:text-sm">
                      Dirección
                    </Label>
                    <Input
                      id="address"
                      value={clientForm.address}
                      onChange={(e) =>
                        setClientForm({
                          ...clientForm,
                          address: e.target.value,
                        })
                      }
                      placeholder="Calle 45 #23-12"
                      disabled={!!selectedClient}
                      className="text-sm"
                    />
                  </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setClientModalOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    {selectedClient ? "Cerrar" : "Cancelar"}
                  </Button>
                  {!selectedClient && (
                    <Button
                      type="button"
                      onClick={handleClientSubmit}
                      className="w-full sm:w-auto"
                    >
                      Crear Cliente
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {/* Búsqueda y filtros - Responsive */}
          <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="pl-10 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="items-per-page"
                className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap"
              >
                Mostrar:
              </Label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger
                  id="items-per-page"
                  className="w-[80px] sm:w-[100px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {clients.length === 0 && !searchTerm ? (
            <div className="text-center py-12">
              <User className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm sm:text-base text-muted-foreground font-medium mb-2">
                No hay clientes registrados
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Comienza agregando tu primer cliente
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 sm:space-y-4">
                {currentClients.map((client) => {
                  const contact = client.clientContact[0] || {};
                  const clientVehicles = getClientVehiclesWithIds(client.id!);

                  return (
                    <Card
                      key={client.id}
                      className="overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="bg-muted/50 border-b p-3 sm:p-4">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <User className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                              <CardTitle className="text-sm sm:text-base md:text-lg truncate">
                                {client.fullName} {client.fullSurname}
                              </CardTitle>
                              <Badge
                                variant={
                                  client.clientState ? "default" : "secondary"
                                }
                                className="text-xs"
                              >
                                {client.clientState ? "Activo" : "Inactivo"}
                              </Badge>
                            </div>
                            {/* Info en móvil - Stack vertical */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs sm:text-sm text-muted-foreground">
                              <div className="flex items-center gap-1 truncate">
                                <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="truncate">
                                  {client.identified}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 truncate">
                                <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="truncate">
                                  {contact.phoneNumber}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 truncate">
                                <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="truncate">
                                  {contact.email}
                                </span>
                              </div>
                              {contact.address && (
                                <div className="flex items-center gap-1 truncate">
                                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span className="truncate">
                                    {contact.address}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Botones de acción - Desktop */}
                          <div className="hidden sm:flex gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editClient(client)}
                            >
                              <User className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editContact(client)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteDialog(client, "client")}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          {/* Menú móvil */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild className="sm:hidden">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 flex-shrink-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => editClient(client)}
                              >
                                <User className="mr-2 h-4 w-4" />
                                Ver Cliente
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => editContact(client)}
                              >
                                <Edit2 className="mr-2 h-4 w-4" />
                                Editar Contacto
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  openDeleteDialog(client, "client")
                                }
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                          <h4 className="text-sm sm:text-base font-semibold flex items-center gap-2">
                            <Car className="w-4 h-4" />
                            Vehículos ({clientVehicles.length})
                          </h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              resetVehicleForm();
                              setVehicleForm({
                                brand: "",
                                model: "",
                                year: "",
                                engineDisplacement: "",
                                plates: "",
                                description: "",
                                clientId: client.id!,
                              });
                              setVehicleModalOpen(true);
                            }}
                            className="w-full sm:w-auto"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="text-xs sm:text-sm">
                              Agregar Vehículo
                            </span>
                          </Button>
                        </div>

                        {clientVehicles.length > 0 ? (
                          <div className="grid gap-2">
                            {clientVehicles.map((vehicle, index) => (
                              <div
                                key={
                                  vehicle.id > 0
                                    ? vehicle.id
                                    : `vehicle-${client.id}-${vehicle.brand}-${vehicle.model}-${vehicle.year}-${index}`
                                }
                                className="flex justify-between items-start gap-2 p-2 sm:p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs sm:text-sm font-medium truncate">
                                    {vehicle.brand} {vehicle.model} -{" "}
                                    {vehicle.year}
                                    {vehicle.plates && ` • ${vehicle.plates}`}
                                    {vehicle.id <= 0 && " (ID pendiente)"}
                                  </div>
                                  <div className="text-[10px] sm:text-xs text-muted-foreground">
                                    {vehicle.engineDisplacement}cc
                                    {vehicle.description &&
                                      ` • ${vehicle.description}`}
                                    {vehicle.id > 0 && ` • ID: ${vehicle.id}`}
                                  </div>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      editVehicle(vehicle, client.id!)
                                    }
                                    disabled={vehicle.id <= 0}
                                    className="h-7 w-7 p-0 sm:h-8 sm:w-8"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      openDeleteDialog(vehicle, "vehicle")
                                    }
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-7 w-7 p-0 sm:h-8 sm:w-8"
                                    disabled={vehicle.id <= 0}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-xs sm:text-sm text-muted-foreground py-4">
                            No hay vehículos registrados
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredClients.length === 0 && searchTerm && (
                <div className="text-center py-12">
                  <User className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm sm:text-base text-muted-foreground">
                    No se encontraron clientes con "{searchTerm}"
                  </p>
                </div>
              )}

              {/* Controles de paginación - Responsive */}
              {filteredClients.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 sm:mt-6 pt-4 border-t">
                  <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
                    Mostrando {startIndex + 1} a{" "}
                    {Math.min(endIndex, filteredClients.length)} de{" "}
                    {filteredClients.length} clientes
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
                    {/* Desktop pagination */}
                    <div className="hidden sm:flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Anterior
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNumber;
                            if (totalPages <= 5) {
                              pageNumber = i + 1;
                            } else if (currentPage <= 3) {
                              pageNumber = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNumber = totalPages - 4 + i;
                            } else {
                              pageNumber = currentPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNumber}
                                variant={
                                  currentPage === pageNumber
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => goToPage(pageNumber)}
                                className="w-10"
                              >
                                {pageNumber}
                              </Button>
                            );
                          }
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Mobile pagination */}
                    <div className="flex sm:hidden items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="px-3 text-sm font-medium">
                        {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de vehículos */}
      <Dialog open={vehicleModalOpen} onOpenChange={setVehicleModalOpen}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {selectedVehicle
                ? `Editar Vehículo (ID: ${selectedVehicle.id})`
                : "Nuevo Vehículo"}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {selectedVehicle
                ? "Actualiza los datos del vehículo"
                : "Registra un nuevo vehículo para este cliente"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand" className="text-xs sm:text-sm">
                  Marca *
                </Label>
                <Input
                  id="brand"
                  value={vehicleForm.brand}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      brand: e.target.value,
                    })
                  }
                  placeholder="Toyota"
                  required
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model" className="text-xs sm:text-sm">
                  Modelo *
                </Label>
                <Input
                  id="model"
                  value={vehicleForm.model}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      model: e.target.value,
                    })
                  }
                  placeholder="Corolla"
                  required
                  className="text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="year" className="text-xs sm:text-sm">
                  Año *
                </Label>
                <Input
                  id="year"
                  type="number"
                  value={vehicleForm.year}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      year: e.target.value,
                    })
                  }
                  placeholder="2020"
                  required
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="engineDisplacement"
                  className="text-xs sm:text-sm"
                >
                  Cilindraje (cc) *
                </Label>
                <Input
                  id="engineDisplacement"
                  type="number"
                  value={vehicleForm.engineDisplacement}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      engineDisplacement: e.target.value,
                    })
                  }
                  placeholder="1800"
                  required
                  className="text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plates" className="text-xs sm:text-sm">
                Placas *
              </Label>
              <Input
                id="plates"
                value={vehicleForm.plates}
                onChange={(e) =>
                  setVehicleForm({
                    ...vehicleForm,
                    plates: e.target.value.toUpperCase(),
                  })
                }
                placeholder="ABC123"
                maxLength={6}
                required
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs sm:text-sm">
                Descripción
              </Label>
              <textarea
                id="description"
                value={vehicleForm.description}
                onChange={(e) =>
                  setVehicleForm({
                    ...vehicleForm,
                    description: e.target.value,
                  })
                }
                placeholder="Sedán gris, buen estado general..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setVehicleModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleVehicleSubmit}
              disabled={!isVehicleFormValid}
              className="w-full sm:w-auto"
            >
              {selectedVehicle ? "Actualizar" : "Agregar Vehículo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar contacto */}
      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Editar Contacto
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Actualiza la información de contacto del cliente
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contact-phone" className="text-xs sm:text-sm">
                Teléfono *
              </Label>
              <Input
                id="contact-phone"
                value={contactForm.phoneNumber}
                onChange={(e) =>
                  setContactForm({
                    ...contactForm,
                    phoneNumber: e.target.value,
                  })
                }
                placeholder="3001234567"
                required
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email" className="text-xs sm:text-sm">
                Email *
              </Label>
              <Input
                id="contact-email"
                type="email"
                value={contactForm.email}
                onChange={(e) =>
                  setContactForm({
                    ...contactForm,
                    email: e.target.value,
                  })
                }
                placeholder="cliente@email.com"
                required
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-address" className="text-xs sm:text-sm">
                Dirección
              </Label>
              <Input
                id="contact-address"
                value={contactForm.address}
                onChange={(e) =>
                  setContactForm({
                    ...contactForm,
                    address: e.target.value,
                  })
                }
                placeholder="Calle 45 #23-12"
                className="text-sm"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setContactModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleContactSubmit}
              className="w-full sm:w-auto"
            >
              Actualizar Contacto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[95vw] max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">
              ¿Estás seguro?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Esta acción no se puede deshacer.{" "}
              {deleteTarget?.type === "client"
                ? "Se eliminará el cliente y todos sus vehículos asociados."
                : "Se eliminará este vehículo permanentemente."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800 w-full sm:w-auto"
              disabled={
                deleteTarget?.type === "vehicle" &&
                (!deleteTarget?.id || deleteTarget?.id <= 0)
              }
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
