"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  User,
  Clock,
  Loader2,
  ChevronsUpDown,
  Check,
  FileText,
  Settings,
  DollarSign,
  Filter,
  Camera,
  Upload,
  X,
  Image as ImageIcon,
  Car,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  ZoomIn,
} from "lucide-react";

// Tipos

interface ChecklistItem {
  id?: number;
  label: string;
  category: string;
  checked: boolean;
  condition?: string;
  notes?: string;
  checklistId?: number;
}

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  color?: string;
  vin?: string;
}

interface Appointment {
  id: number;
  appointmentDate: Date;
  ubicacion: string;
  appointmentState: string;
  details: string | null;
  author: {
    id: number;
    fullName: string;
    fullSurname: string;
    identified: string;
    email?: string;
    phone?: string;
  };
  employedAuthor: {
    id: number;
    name: string;
    identificacion: string;
    role: string;
  } | null;
  vehicle?: Vehicle;
}

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  guarantee: string;
  createAt: Date;
  author: {
    id: number;
    name: string;
  };
  categoryId?: number;
  serviceCategory?: {
    id: number;
    name: string;
  };
}

interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  createAt: Date;
}

interface VehicleChecklist {
  id?: number;
  checkType: string;
  fuelLevel: number;
  mileage: string;
  generalNotes: string;
  technicianName: string;
  appointmentId: number;
  completedAt?: Date;
  items?: ChecklistItem[];
  appointment?: Appointment;
  vehicleImage?: VehicleImageFromBackend[];
}

interface VehicleImageData {
  file: File;
  previewUrl: string;
  description: string;
}

interface VehicleImageFromBackend {
  id: number;
  checkList_id: number;
  imageUrl: string;
  description: string | null;
  createAt: string;
}

// Constantes
const ITEM_CATEGORIES = [
  "Exterior",
  "Interior",
  "Motor",
  "Frenos",
  "Suspensión",
  "Eléctrico",
  "Neumáticos",
  "Fluidos",
  "Seguridad",
];

const CONDITIONS = [
  "Excelente",
  "Bueno",
  "Regular",
  "Malo",
  "Requiere Atención",
];

// Utility function
function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

const VehicleChecklistManager: React.FC = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState("create");
  const [checklists, setChecklists] = useState<VehicleChecklist[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(
    []
  );
  const [selectedChecklist, setSelectedChecklist] =
    useState<VehicleChecklist | null>(null);

  // Estados de carga
  const [loading, setLoading] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state para nuevo checklist
  const [formData, setFormData] = useState<VehicleChecklist>({
    checkType: "",
    fuelLevel: 50,
    mileage: "",
    generalNotes: "",
    technicianName: "",
    appointmentId: 0,
  });

  // Estados para items del checklist
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItem, setNewItem] = useState<ChecklistItem>({
    label: "",
    category: "",
    checked: false,
    condition: "",
    notes: "",
  });

  // Estados para Combobox de citas
  const [openAppointmentCombobox, setOpenAppointmentCombobox] = useState(false);
  const [appointmentSearchTerm, setAppointmentSearchTerm] = useState("");

  // Estados para Combobox de servicios
  const [openServiceCombobox, setOpenServiceCombobox] = useState(false);
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<
    number | null
  >(null);

  // Estados para diálogo de eliminación
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [vehicleImages, setVehicleImages] = useState<VehicleImageData[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Estados para filtrado/búsqueda en lista
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para visualización de imágenes
  const [imageDialog, setImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  // Funciones para obtener colores de combustible
  const getFuelColor = (level: number): string => {
    if (level <= 25) return "bg-red-500 dark:bg-red-600";
    if (level <= 50) return "bg-amber-500 dark:bg-amber-600";
    return "bg-green-500 dark:bg-green-600";
  };

  const getFuelTextColor = (level: number): string => {
    if (level <= 25) return "text-red-600 dark:text-red-400";
    if (level <= 50) return "text-amber-600 dark:text-amber-400";
    return "text-green-600 dark:text-green-400";
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadChecklists();
  }, []);

  // Cargar citas y servicios cuando se abre el tab de creación
  useEffect(() => {
    if (activeTab === "create") {
      if (appointments.length === 0) {
        fetchAppointments();
      }
      if (services.length === 0) {
        fetchServices();
      }
      if (serviceCategories.length === 0) {
        fetchServiceCategories();
      }
    }
  }, [activeTab]);

  useEffect(() => {
    return () => {
      vehicleImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [vehicleImages]);

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const response = await fetch("/backend/api/protected/appointment");

      if (!response.ok) {
        throw new Error("Error al cargar las citas");
      }

      const data = await response.json();
      const availableAppointments = data.filter(
        (apt: Appointment) =>
          apt.appointmentState === "ASIGNADA" ||
          apt.appointmentState === "PENDIENTE"
      );
      setAppointments(availableAppointments);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Error al cargar las citas disponibles");
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const response = await fetch("/backend/api/protected/servicesPage");

      if (!response.ok) {
        throw new Error("Error al cargar los servicios");
      }

      const data = await response.json();
      setServices(data);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Error al cargar los servicios disponibles");
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchServiceCategories = async () => {
    try {
      const response = await fetch("/backend/api/protected/servicesCategory");

      if (!response.ok) {
        throw new Error("Error al cargar las categorías");
      }

      const data = await response.json();
      setServiceCategories(data);
    } catch (err) {
      console.error("Error fetching service categories:", err);
    }
  };

  const loadChecklists = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "/backend/api/protected/checklist/vehicleCheck",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Error al cargar checklists");

      let data = await response.json();

      if (data.length > 0 && !data[0].appointment && data[0].appointmentId) {
        try {
          const appointmentsResponse = await fetch(
            "/backend/api/protected/appointment"
          );
          if (appointmentsResponse.ok) {
            const allAppointments = await appointmentsResponse.json();

            data = data.map((checklist: VehicleChecklist) => {
              if (checklist.appointmentId) {
                const appointment = allAppointments.find(
                  (apt: Appointment) => apt.id === checklist.appointmentId
                );
                return { ...checklist, appointment };
              }
              return checklist;
            });
          }
        } catch (err) {
          console.error("Error al cargar appointments manualmente:", err);
        }
      }

      setChecklists(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error al cargar checklists:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar citas para el combobox
  const filteredAppointments = useMemo(() => {
    if (!appointmentSearchTerm) return appointments;

    return appointments.filter((apt) => {
      const searchLower = appointmentSearchTerm.toLowerCase();
      return (
        apt.id.toString().includes(searchLower) ||
        apt.author.fullName.toLowerCase().includes(searchLower) ||
        apt.author.fullSurname.toLowerCase().includes(searchLower) ||
        apt.author.identified.includes(searchLower) ||
        apt.ubicacion.toLowerCase().includes(searchLower)
      );
    });
  }, [appointments, appointmentSearchTerm]);

  const filteredServices = useMemo(() => {
    let filtered = services;

    if (selectedCategoryFilter !== null) {
      filtered = filtered.filter((service) => {
        const serviceCategoryId =
          service.author?.id ||
          service.categoryId ||
          service.serviceCategory?.id;
        return serviceCategoryId === selectedCategoryFilter;
      });
    }

    if (serviceSearchTerm) {
      const searchLower = serviceSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchLower) ||
          service.description.toLowerCase().includes(searchLower) ||
          service.id.toString().includes(searchLower)
      );
    }

    return filtered;
  }, [services, serviceSearchTerm, selectedCategoryFilter]);

  const handleCreateChecklist = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!formData.checkType || !formData.mileage || !formData.appointmentId) {
        setError("Por favor complete todos los campos obligatorios");
        return;
      }

      const technicianName =
        selectedAppointment?.employedAuthor?.name || "Sin asignar";

      const checklistPayload = {
        ...formData,
        technicianName,
      };

      const checklistResponse = await fetch(
        "/backend/api/protected/checklist/vehicleCheck",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(checklistPayload),
        }
      );

      if (!checklistResponse.ok) {
        throw new Error("Error al crear checklist");
      }

      const createdChecklist = await checklistResponse.json();

      if (vehicleImages.length > 0) {
        try {
          await uploadVehicleImages(createdChecklist.id);
        } catch (imgError) {
          console.error("Error al subir imágenes:", imgError);
          setError(
            "Checklist creado, pero hubo un error al subir algunas imágenes"
          );
        }
      }

      if (items.length > 0) {
        for (const item of items) {
          try {
            const itemPayload = {
              label: item.label,
              category: item.category,
              checked: item.checked,
              condition: item.condition || "",
              notes: item.notes || "",
              checklistId: createdChecklist.id,
            };

            await fetch("/backend/api/protected/checklist/itemCheck", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(itemPayload),
            });
          } catch (itemError) {
            console.error("Error al guardar item:", itemError);
          }
        }
      }

      setSuccess("Checklist creado exitosamente");
      resetForm();
      loadChecklists();
      setActiveTab("list");

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error completo:", err);
      setError(err instanceof Error ? err.message : "Error al crear checklist");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItem.label || !newItem.category) {
      setError("El item debe tener un nombre y categoría");
      return;
    }

    setItems([...items, { ...newItem, id: Date.now() }]);
    setNewItem({
      label: "",
      category: "",
      checked: false,
      condition: "",
      notes: "",
    });
    setError(null);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleViewChecklist = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/backend/api/protected/checklist/vehicleCheck/${id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Error al cargar checklist");

      const data = await response.json();
      console.log("Checklist cargado con imágenes:", data);

      setSelectedChecklist(data);
      setActiveTab("view");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar checklist"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      setDeleting(true);
      const response = await fetch(
        `/backend/api/protected/checklist/vehicleCheck/${deletingId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Error al eliminar checklist");

      setSuccess("Checklist eliminado exitosamente");
      loadChecklists();
      setDeleteDialog(false);
      setDeletingId(null);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar checklist"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: VehicleImageData[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const previewUrl = URL.createObjectURL(file);
        newImages.push({
          file,
          previewUrl,
          description: "",
        });
      }
    });

    setVehicleImages((prev) => [...prev, ...newImages]);

    if (event.target) {
      event.target.value = "";
    }
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event);
  };

  const handleRemoveImage = (index: number) => {
    setVehicleImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleImageDescriptionChange = (index: number, description: string) => {
    setVehicleImages((prev) => {
      const updated = [...prev];
      updated[index].description = description;
      return updated;
    });
  };

  const uploadVehicleImages = async (checklistId: number) => {
    if (vehicleImages.length === 0) return true;

    try {
      setUploadingImages(true);

      for (const imageData of vehicleImages) {
        const formData = new FormData();
        formData.append("id", checklistId.toString());
        formData.append("image", imageData.file);
        if (imageData.description) {
          formData.append("description", imageData.description);
        }

        const response = await fetch(
          "/backend/api/protected/checklist/uploadImage",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`Error al subir imagen: ${imageData.file.name}`);
        }
      }

      return true;
    } catch (err) {
      console.error("Error uploading images:", err);
      throw err;
    } finally {
      setUploadingImages(false);
    }
  };

  // Funciones para manejo de galería de imágenes
  const handleOpenImage = (imageUrl: string, index: number) => {
    setSelectedImage(imageUrl);
    setImageIndex(index);
    setImageDialog(true);
  };

  const handleNextImage = () => {
    if (selectedChecklist?.vehicleImage) {
      const images = selectedChecklist.vehicleImage;
      if (images.length > 0) {
        const nextIndex = (imageIndex + 1) % images.length;
        setImageIndex(nextIndex);
        setSelectedImage(images[nextIndex].imageUrl);
      }
    }
  };

  const handlePreviousImage = () => {
    if (selectedChecklist?.vehicleImage) {
      const images = selectedChecklist.vehicleImage;
      if (images.length > 0) {
        const prevIndex = imageIndex === 0 ? images.length - 1 : imageIndex - 1;
        setImageIndex(prevIndex);
        setSelectedImage(images[prevIndex].imageUrl);
      }
    }
  };

  const handleDownloadImage = () => {
    if (selectedImage) {
      window.open(selectedImage, "_blank");
    }
  };

  const getChecklistImageUrls = (checklist: VehicleChecklist): string[] => {
    if (checklist.vehicleImage && Array.isArray(checklist.vehicleImage)) {
      return checklist.vehicleImage.map((img) => img.imageUrl);
    }

    return [];
  };

  const resetForm = () => {
    setFormData({
      checkType: "",
      fuelLevel: 50,
      mileage: "",
      generalNotes: "",
      technicianName: "",
      appointmentId: 0,
    });
    setItems([]);
    setNewItem({
      label: "",
      category: "",
      checked: false,
      condition: "",
      notes: "",
    });
    setAppointmentSearchTerm("");
    setServiceSearchTerm("");
    setSelectedCategoryFilter(null);

    vehicleImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setVehicleImages([]);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const selectedAppointment = appointments.find(
    (apt) => apt.id === formData.appointmentId
  );

  const selectedService = services.find(
    (service) => service.name === formData.checkType
  );

  // Filtrado de checklists por búsqueda
  const filteredChecklists = useMemo(() => {
    if (!searchTerm.trim()) return checklists;

    const searchLower = searchTerm.toLowerCase();

    return checklists.filter((checklist) => {
      if (checklist.checkType.toLowerCase().includes(searchLower)) return true;
      if (checklist.id?.toString().includes(searchLower)) return true;
      if (checklist.technicianName.toLowerCase().includes(searchLower))
        return true;
      if (checklist.mileage.toLowerCase().includes(searchLower)) return true;

      if (checklist.appointment) {
        const { author, vehicle } = checklist.appointment;

        if (author.fullName.toLowerCase().includes(searchLower)) return true;
        if (author.fullSurname.toLowerCase().includes(searchLower)) return true;
        if (author.identified.toLowerCase().includes(searchLower)) return true;

        if (vehicle) {
          if (vehicle.brand.toLowerCase().includes(searchLower)) return true;
          if (vehicle.model.toLowerCase().includes(searchLower)) return true;
          if (vehicle.licensePlate.toLowerCase().includes(searchLower))
            return true;
          if (vehicle.color?.toLowerCase().includes(searchLower)) return true;
        }
      }

      return false;
    });
  }, [checklists, searchTerm]);

  // Lógica de paginación
  const { paginatedChecklists, totalPages, startIndex, endIndex } =
    useMemo(() => {
      const indexOfLastItem = currentPage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      const paginated = filteredChecklists.slice(
        indexOfFirstItem,
        indexOfLastItem
      );
      const total = Math.ceil(filteredChecklists.length / itemsPerPage);

      return {
        paginatedChecklists: paginated,
        totalPages: total,
        startIndex: indexOfFirstItem + 1,
        endIndex: Math.min(indexOfLastItem, filteredChecklists.length),
      };
    }, [filteredChecklists, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const evaluateVehicleCondition = (items: ChecklistItem[]) => {
    if (!items || items.length === 0) {
      return {
        status: "Sin evaluar",
        color: "gray",
        percentage: 0,
        details: {
          excelente: 0,
          bueno: 0,
          regular: 0,
          malo: 0,
          requiereAtencion: 0,
          sinCondicion: 0,
        },
        recommendation: "No hay items para evaluar",
      };
    }

    const details = {
      excelente: items.filter((i) => i.condition === "Excelente").length,
      bueno: items.filter((i) => i.condition === "Bueno").length,
      regular: items.filter((i) => i.condition === "Regular").length,
      malo: items.filter((i) => i.condition === "Malo").length,
      requiereAtencion: items.filter((i) => i.condition === "Requiere Atención")
        .length,
      sinCondicion: items.filter((i) => !i.condition || i.condition === "")
        .length,
    };

    const totalEvaluated = items.length - details.sinCondicion;

    const score =
      (details.excelente * 100 +
        details.bueno * 75 +
        details.regular * 50 +
        details.malo * 25 +
        details.requiereAtencion * 0) /
        totalEvaluated || 0;

    let status = "";
    let color = "";
    let recommendation = "";

    if (score >= 90) {
      status = "Excelente";
      color = "green";
      recommendation =
        "El vehículo está en excelentes condiciones. Continúe con el mantenimiento preventivo.";
    } else if (score >= 75) {
      status = "Muy Bueno";
      color = "lime";
      recommendation =
        "El vehículo está en muy buenas condiciones. Monitoree los puntos señalados.";
    } else if (score >= 60) {
      status = "Bueno";
      color = "blue";
      recommendation =
        "El vehículo está en buenas condiciones. Considere atender algunos puntos menores.";
    } else if (score >= 40) {
      status = "Regular";
      color = "amber";
      recommendation =
        "El vehículo requiere atención. Priorice las reparaciones necesarias.";
    } else if (score >= 20) {
      status = "Malo";
      color = "orange";
      recommendation =
        "El vehículo necesita reparaciones importantes. Atienda los problemas urgentemente.";
    } else {
      status = "Crítico";
      color = "red";
      recommendation =
        "El vehículo está en estado crítico. Se requiere intervención inmediata.";
    }

    if (details.requiereAtencion > 0) {
      recommendation += ` Hay ${details.requiereAtencion} ${details.requiereAtencion === 1 ? "item que requiere" : "items que requieren"} atención urgente.`;
    }

    return {
      status,
      color,
      percentage: Math.round(score),
      details,
      recommendation,
    };
  };

  return (
    <div className="w-full min-h-screen bg-background dark:bg-gray-950 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl sm:text-3xl font-semibold text-foreground">
            Gestión de Checklists
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Inspecciones de vehículos
          </p>
        </div>

        {/* Alertas */}
        {error && (
          <Alert variant="destructive" className="mb-4 dark:border-red-900">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-sm text-green-800 dark:text-green-200">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4 h-auto dark:bg-gray-900 dark:border-gray-800">
            <TabsTrigger
              value="create"
              className="flex flex-col sm:flex-row gap-1 sm:gap-2 py-2 dark:data-[state=active]:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Crear</span>
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="flex flex-col sm:flex-row gap-1 sm:gap-2 py-2 dark:data-[state=active]:bg-gray-800"
            >
              <FileText className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Lista</span>
            </TabsTrigger>
            <TabsTrigger
              value="view"
              className="flex flex-col sm:flex-row gap-1 sm:gap-2 py-2 dark:data-[state=active]:bg-gray-800"
            >
              <Eye className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Detalle</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Settings className="h-5 w-5" />
                  Nuevo Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Información de la Cita */}
                <div className="space-y-3">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                    Información de la Cita
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="appointment" className="text-sm">
                      Seleccionar Cita *
                    </Label>
                    <Popover
                      open={openAppointmentCombobox}
                      onOpenChange={setOpenAppointmentCombobox}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openAppointmentCombobox}
                          className="w-full justify-between text-sm h-auto py-2 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                        >
                          {formData.appointmentId ? (
                            <span className="flex items-center gap-2 text-left">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">
                                #{formData.appointmentId} -{" "}
                                {selectedAppointment?.author.fullName}
                              </span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              Seleccionar cita...
                            </span>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[calc(100vw-2rem)] sm:w-full p-0 dark:bg-gray-800 dark:border-gray-700">
                        <Command className="dark:bg-gray-800">
                          <CommandInput
                            placeholder="Buscar cita..."
                            value={appointmentSearchTerm}
                            onValueChange={setAppointmentSearchTerm}
                            className="text-sm"
                          />
                          <CommandEmpty className="text-sm p-3">
                            {loadingAppointments
                              ? "Cargando citas..."
                              : "No se encontraron citas"}
                          </CommandEmpty>
                          <CommandList>
                            <CommandGroup className="max-h-60 overflow-auto">
                              {filteredAppointments.map((apt) => (
                                <CommandItem
                                  key={apt.id}
                                  value={apt.id.toString()}
                                  onSelect={() => {
                                    setFormData({
                                      ...formData,
                                      appointmentId: apt.id,
                                    });
                                    setOpenAppointmentCombobox(false);
                                  }}
                                  className="text-sm dark:hover:bg-gray-700"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4 flex-shrink-0",
                                      formData.appointmentId === apt.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-medium">
                                        #{apt.id}
                                      </span>
                                      <span className="truncate">
                                        {apt.author.fullName}{" "}
                                        {apt.author.fullSurname}
                                      </span>
                                      <Badge
                                        variant="secondary"
                                        className="text-xs dark:bg-gray-700"
                                      >
                                        {apt.appointmentState}
                                      </Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(apt.appointmentDate)}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {apt.ubicacion}
                                      </span>
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Info de cita seleccionada */}
                  {selectedAppointment && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2 text-sm">
                        Detalles de la Cita
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-blue-700 dark:text-blue-400 font-medium">
                            Cliente:
                          </span>
                          <p className="text-blue-900 dark:text-blue-200">
                            {selectedAppointment.author.fullName}{" "}
                            {selectedAppointment.author.fullSurname}
                          </p>
                          {selectedAppointment.author.identified && (
                            <p className="text-blue-600 dark:text-blue-400 text-xs mt-0.5">
                              ID: {selectedAppointment.author.identified}
                            </p>
                          )}
                        </div>
                        <div>
                          <span className="text-blue-700 dark:text-blue-400 font-medium">
                            Ubicación:
                          </span>
                          <p className="text-blue-900 dark:text-blue-200">
                            {selectedAppointment.ubicacion}
                          </p>
                        </div>
                        {selectedAppointment.employedAuthor && (
                          <div>
                            <span className="text-blue-700 dark:text-blue-400 font-medium">
                              Técnico:
                            </span>
                            <p className="text-blue-900 dark:text-blue-200">
                              {selectedAppointment.employedAuthor.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Información del Checklist */}
                <div className="space-y-3">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                    Información del Checklist
                  </h3>

                  <div className="space-y-3">
                    {/* Tipo de Revisión */}
                    <div>
                      <Label htmlFor="checkType" className="text-sm">
                        Tipo de Revisión *
                      </Label>
                      <Popover
                        open={openServiceCombobox}
                        onOpenChange={setOpenServiceCombobox}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openServiceCombobox}
                            className="w-full justify-between mt-2 text-sm h-auto py-2 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                          >
                            {formData.checkType ? (
                              <span className="flex items-center gap-2 truncate">
                                <Settings className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">
                                  {formData.checkType}
                                </span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                Seleccionar servicio...
                              </span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[calc(100vw-2rem)] sm:w-full p-0 dark:bg-gray-800 dark:border-gray-700">
                          <Command className="dark:bg-gray-800">
                            <CommandInput
                              placeholder="Buscar servicio..."
                              value={serviceSearchTerm}
                              onValueChange={setServiceSearchTerm}
                              className="text-sm"
                            />

                            {/* Filtro por categoría */}
                            {serviceCategories.length > 0 && (
                              <div className="p-2 border-b dark:border-gray-700">
                                <div className="flex flex-wrap gap-1">
                                  <Badge
                                    variant={
                                      selectedCategoryFilter === null
                                        ? "default"
                                        : "outline"
                                    }
                                    className="cursor-pointer text-xs dark:bg-gray-700"
                                    onClick={() =>
                                      setSelectedCategoryFilter(null)
                                    }
                                  >
                                    Todas
                                  </Badge>
                                  {serviceCategories.map((category) => (
                                    <Badge
                                      key={category.id}
                                      variant={
                                        selectedCategoryFilter === category.id
                                          ? "default"
                                          : "outline"
                                      }
                                      className="cursor-pointer text-xs dark:bg-gray-700"
                                      onClick={() =>
                                        setSelectedCategoryFilter(category.id)
                                      }
                                    >
                                      {category.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <CommandEmpty className="text-sm p-3">
                              {loadingServices
                                ? "Cargando..."
                                : "No se encontraron servicios"}
                            </CommandEmpty>
                            <CommandList>
                              <CommandGroup className="max-h-60 overflow-auto">
                                {filteredServices.map((service) => (
                                  <CommandItem
                                    key={service.id}
                                    value={service.name}
                                    onSelect={() => {
                                      setFormData({
                                        ...formData,
                                        checkType: service.name,
                                      });
                                      setOpenServiceCombobox(false);
                                    }}
                                    className="text-sm dark:hover:bg-gray-700"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 flex-shrink-0",
                                        formData.checkType === service.name
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col flex-1 min-w-0">
                                      <span className="font-medium truncate">
                                        {service.name}
                                      </span>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {service.description}
                                      </p>
                                      <span className="text-xs text-muted-foreground">
                                        {formatCurrency(service.price)}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {/* Info servicio seleccionado */}
                      {selectedService && (
                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg text-sm">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-green-700 dark:text-green-400 font-medium">
                                Precio:
                              </span>
                              <p className="text-green-900 dark:text-green-200 font-bold">
                                {formatCurrency(selectedService.price)}
                              </p>
                            </div>
                            <div>
                              <span className="text-green-700 dark:text-green-400 font-medium">
                                Garantía:
                              </span>
                              <p className="text-green-900 dark:text-green-200">
                                {selectedService.guarantee}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Técnico y Kilometraje */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="technicianName" className="text-sm">
                          Técnico
                        </Label>
                        <Input
                          id="technicianName"
                          value={
                            selectedAppointment?.employedAuthor?.name ||
                            "Sin asignar"
                          }
                          className="bg-muted dark:bg-gray-800 text-sm"
                          readOnly
                          disabled
                        />
                      </div>
                      <div>
                        <Label htmlFor="mileage" className="text-sm">
                          Kilometraje *
                        </Label>
                        <Input
                          id="mileage"
                          value={formData.mileage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              mileage: e.target.value,
                            })
                          }
                          placeholder="50000 km"
                          className="text-sm dark:bg-gray-800 dark:border-gray-700"
                        />
                      </div>
                    </div>

                    {/* Nivel de Combustible */}
                    <div>
                      <Label htmlFor="fuelLevel" className="text-sm">
                        Nivel de Combustible
                      </Label>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-base font-bold ${getFuelTextColor(formData.fuelLevel)}`}
                          >
                            {formData.fuelLevel}%
                          </span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={formData.fuelLevel}
                            onChange={(e) => {
                              const value = Math.min(
                                Math.max(parseInt(e.target.value) || 0, 0),
                                100
                              );
                              setFormData({ ...formData, fuelLevel: value });
                            }}
                            className={`w-20 px-2 py-1 text-center font-bold border-2 rounded text-sm dark:bg-gray-800 ${
                              formData.fuelLevel <= 25
                                ? "border-red-500 text-red-600 dark:text-red-400"
                                : formData.fuelLevel <= 50
                                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                                  : "border-green-500 text-green-600 dark:text-green-400"
                            }`}
                          />
                        </div>

                        <div className="w-full bg-muted dark:bg-gray-800 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getFuelColor(formData.fuelLevel)}`}
                            style={{ width: `${formData.fuelLevel}%` }}
                          />
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={formData.fuelLevel}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              fuelLevel: parseInt(e.target.value),
                            })
                          }
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Fotografías */}
                    <div className="border-t dark:border-gray-700 pt-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold">
                            Fotografías
                          </Label>
                          {vehicleImages.length > 0 && (
                            <Badge
                              variant="secondary"
                              className="text-xs dark:bg-gray-700"
                            >
                              {vehicleImages.length}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => cameraInputRef.current?.click()}
                            className="gap-2 text-sm h-auto py-2 sm:hidden dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                          >
                            <Camera className="h-4 w-4" />
                            Tomar Foto
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="gap-2 text-sm h-auto py-2 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                          >
                            <Upload className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              Subir Imágenes
                            </span>
                            <span className="sm:hidden">Galería</span>
                          </Button>
                        </div>

                        <input
                          ref={cameraInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleCameraCapture}
                          className="hidden"
                          multiple
                        />
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          multiple
                        />

                        {vehicleImages.length === 0 && (
                          <div className="border-2 border-dashed rounded-lg p-8 text-center">
                            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              No hay imágenes agregadas
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Haz clic en "Subir Imagen" o "Tomar Foto" para agregar fotos
                            </p>
                          </div>
                        )}

                        {/* Preview */}
                        {vehicleImages.length > 0 && (
                          <div className="space-y-2">
                            {vehicleImages.map((imageData, index) => (
                              <div
                                key={index}
                                className="relative border dark:border-gray-700 rounded-lg p-2 bg-card dark:bg-gray-800"
                              >
                                <div className="flex gap-2">
                                  <div className="relative flex-shrink-0">
                                    <img
                                      src={imageData.previewUrl}
                                      alt={`Imagen ${index + 1}`}
                                      className="w-20 h-20 object-cover rounded"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleRemoveImage(index)}
                                      className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <Textarea
                                      placeholder="Descripción (opcional)"
                                      value={imageData.description}
                                      onChange={(e) =>
                                        handleImageDescriptionChange(
                                          index,
                                          e.target.value
                                        )
                                      }
                                      rows={2}
                                      className="text-xs dark:bg-gray-900 dark:border-gray-700"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                      Ej: Daño en puerta trasera, rayón lateral,
                                      etc.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notas */}
                    <div>
                      <Label htmlFor="generalNotes" className="text-sm">
                        Notas Generales
                      </Label>
                      <Textarea
                        id="generalNotes"
                        value={formData.generalNotes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            generalNotes: e.target.value,
                          })
                        }
                        placeholder="Observaciones"
                        rows={3}
                        className="text-sm dark:bg-gray-800 dark:border-gray-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Items del Checklist */}
                <div className="border-t dark:border-gray-700 pt-3 space-y-3">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                    Items del Checklist
                  </h3>

                  <div className="p-3 bg-muted dark:bg-gray-800 border dark:border-gray-700 rounded-lg space-y-3">
                    <div className="space-y-3">
                      <Input
                        placeholder="Nombre del item"
                        value={newItem.label}
                        onChange={(e) =>
                          setNewItem({ ...newItem, label: e.target.value })
                        }
                        className="text-sm dark:bg-gray-900 dark:border-gray-700"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={newItem.category}
                          onValueChange={(value) =>
                            setNewItem({ ...newItem, category: value })
                          }
                        >
                          <SelectTrigger className="text-sm dark:bg-gray-900 dark:border-gray-700">
                            <SelectValue placeholder="Categoría" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            {ITEM_CATEGORIES.map((cat) => (
                              <SelectItem
                                key={cat}
                                value={cat}
                                className="text-sm"
                              >
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={newItem.condition}
                          onValueChange={(value) =>
                            setNewItem({ ...newItem, condition: value })
                          }
                        >
                          <SelectTrigger className="text-sm dark:bg-gray-900 dark:border-gray-700">
                            <SelectValue placeholder="Condición" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            {CONDITIONS.map((cond) => (
                              <SelectItem
                                key={cond}
                                value={cond}
                                className="text-sm"
                              >
                                {cond}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="itemChecked"
                          checked={newItem.checked}
                          onCheckedChange={(checked) =>
                            setNewItem({ ...newItem, checked: !!checked })
                          }
                        />
                        <Label htmlFor="itemChecked" className="text-sm">
                          Verificado
                        </Label>
                      </div>

                      <Input
                        placeholder="Notas"
                        value={newItem.notes}
                        onChange={(e) =>
                          setNewItem({ ...newItem, notes: e.target.value })
                        }
                        className="text-sm dark:bg-gray-900 dark:border-gray-700"
                      />
                    </div>

                    <Button
                      onClick={handleAddItem}
                      className="w-full text-sm"
                      variant="outline"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Item
                    </Button>
                  </div>

                  {/* Lista de items */}
                  {items.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Items agregados</h4>
                        <Badge
                          variant="secondary"
                          className="text-xs dark:bg-gray-700"
                        >
                          {items.length}
                        </Badge>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-start justify-between p-2 bg-card dark:bg-gray-800 border dark:border-gray-700 rounded-lg"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {item.checked ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground flex-shrink-0" />
                                )}
                                <span className="font-medium text-sm truncate">
                                  {item.label}
                                </span>
                              </div>
                              <div className="ml-6 text-xs text-muted-foreground truncate">
                                {item.category}{" "}
                                {item.condition && `- ${item.condition}`}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-600 dark:text-red-400 h-8 w-8 p-0 flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t dark:border-gray-700">
                  <Button
                    onClick={handleCreateChecklist}
                    disabled={loading || uploadingImages}
                    className="flex-1 text-sm"
                  >
                    {loading || uploadingImages ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {uploadingImages ? "Subiendo..." : "Creando..."}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Crear Checklist
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="sm:w-auto text-sm dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                  >
                    Limpiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="pb-3 space-y-3">
                <CardTitle className="text-lg sm:text-xl">
                  Checklists Registrados
                </CardTitle>

                {/* Barra de búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar por cliente, vehículo, placa, técnico, ID..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 pr-10 text-sm dark:bg-gray-800 dark:border-gray-700"
                  />
                  {searchTerm && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Contador de resultados */}
                {searchTerm && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Filter className="h-3 w-3" />
                    <span>
                      {filteredChecklists.length === 0 ? (
                        "No se encontraron resultados"
                      ) : (
                        <>
                          Mostrando{" "}
                          <span className="font-medium">
                            {filteredChecklists.length}
                          </span>{" "}
                          {filteredChecklists.length === 1
                            ? "resultado"
                            : "resultados"}
                          {filteredChecklists.length !== checklists.length && (
                            <>
                              {" "}
                              de{" "}
                              <span className="font-medium">
                                {checklists.length}
                              </span>{" "}
                              total
                            </>
                          )}
                        </>
                      )}
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                    <p className="text-sm text-muted-foreground">Cargando...</p>
                  </div>
                ) : checklists.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No hay checklists registrados
                    </p>
                  </div>
                ) : filteredChecklists.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-2">
                      No se encontraron resultados para "{searchTerm}"
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearSearch}
                      className="text-xs dark:bg-gray-800 dark:border-gray-700"
                    >
                      Limpiar búsqueda
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Información de paginación */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b dark:border-gray-700">
                      <span>
                        Mostrando{" "}
                        <span className="font-medium">{startIndex}</span> a{" "}
                        <span className="font-medium">{endIndex}</span> de{" "}
                        <span className="font-medium">
                          {filteredChecklists.length}
                        </span>{" "}
                        {searchTerm ? "resultados" : "checklists"}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs dark:bg-gray-800 dark:border-gray-700"
                      >
                        Página {currentPage} de {totalPages}
                      </Badge>
                    </div>

                    {/* Lista de checklists */}
                    <div className="space-y-3">
                      {paginatedChecklists.map((checklist) => (
                        <div
                          key={checklist.id}
                          className="border dark:border-gray-700 rounded-lg p-3 bg-card dark:bg-gray-800"
                        >
                          <div className="space-y-2">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm sm:text-base truncate">
                                  {checklist.checkType}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className="text-xs mt-1 dark:bg-gray-700 dark:border-gray-600"
                                >
                                  ID: {checklist.id}
                                </Badge>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleViewChecklist(checklist.id!)
                                  }
                                  className="h-8 w-8 p-0 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteClick(checklist.id!)
                                  }
                                  className="h-8 w-8 p-0 text-red-600 dark:text-red-400 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Info compacta */}
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                <span className="truncate">
                                  {checklist.technicianName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Settings className="h-3 w-3" />
                                <span>{checklist.mileage}</span>
                                <span
                                  className={`font-bold ${getFuelTextColor(checklist.fuelLevel)}`}
                                >
                                  {checklist.fuelLevel}%
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {formatDate(
                                    checklist.completedAt || new Date()
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Cliente y Vehículo */}
                            {checklist.appointment ? (
                              <div className="pt-2 border-t dark:border-gray-700 space-y-1.5">
                                {checklist.appointment.author && (
                                  <div className="text-xs">
                                    <p className="text-muted-foreground truncate">
                                      <span className="font-medium">
                                        Cliente:
                                      </span>{" "}
                                      {checklist.appointment.author.fullName}{" "}
                                      {checklist.appointment.author.fullSurname}
                                    </p>
                                    {checklist.appointment.author
                                      .identified && (
                                      <p className="text-muted-foreground text-[11px]">
                                        ID:{" "}
                                        {
                                          checklist.appointment.author
                                            .identified
                                        }
                                      </p>
                                    )}
                                  </div>
                                )}

                                {checklist.appointment.vehicle && (
                                  <div className="text-xs">
                                    <p className="text-muted-foreground flex items-center gap-1">
                                      <Car className="h-3 w-3" />
                                      <span className="font-medium">
                                        Vehículo:
                                      </span>{" "}
                                      <span className="truncate">
                                        {checklist.appointment.vehicle.brand}{" "}
                                        {checklist.appointment.vehicle.model}
                                      </span>
                                    </p>
                                    <p className="text-muted-foreground text-[11px]">
                                      Placa:{" "}
                                      {
                                        checklist.appointment.vehicle
                                          .licensePlate
                                      }
                                    </p>
                                  </div>
                                )}

                                {!checklist.appointment.author &&
                                  !checklist.appointment.vehicle && (
                                    <div className="text-xs text-muted-foreground italic">
                                      Información de cita incompleta
                                    </div>
                                  )}
                              </div>
                            ) : (
                              <div className="pt-2 border-t dark:border-gray-700 text-xs text-muted-foreground italic">
                                Sin información de cita
                              </div>
                            )}

                            {/* Items badge */}
                            {checklist.items && checklist.items.length > 0 && (
                              <Badge
                                variant="secondary"
                                className="text-xs dark:bg-gray-700"
                              >
                                {
                                  checklist.items.filter((i) => i.checked)
                                    .length
                                }{" "}
                                / {checklist.items.length} items
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Controles de paginación */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="gap-1 text-xs dark:bg-gray-800 dark:border-gray-700"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="hidden sm:inline">Anterior</span>
                        </Button>

                        <div className="flex items-center gap-1">
                          {currentPage > 2 && (
                            <>
                              <Button
                                variant={
                                  currentPage === 1 ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(1)}
                                className="h-8 w-8 p-0 text-xs dark:bg-gray-800 dark:border-gray-700"
                              >
                                1
                              </Button>
                              {currentPage > 3 && (
                                <span className="text-muted-foreground px-1">
                                  ...
                                </span>
                              )}
                            </>
                          )}

                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(
                              (page) =>
                                page === currentPage ||
                                page === currentPage - 1 ||
                                page === currentPage + 1
                            )
                            .map((page) => (
                              <Button
                                key={page}
                                variant={
                                  currentPage === page ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(page)}
                                className="h-8 w-8 p-0 text-xs dark:bg-gray-800 dark:border-gray-700"
                              >
                                {page}
                              </Button>
                            ))}

                          {currentPage < totalPages - 1 && (
                            <>
                              {currentPage < totalPages - 2 && (
                                <span className="text-muted-foreground px-1">
                                  ...
                                </span>
                              )}
                              <Button
                                variant={
                                  currentPage === totalPages
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(totalPages)}
                                className="h-8 w-8 p-0 text-xs dark:bg-gray-800 dark:border-gray-700"
                              >
                                {totalPages}
                              </Button>
                            </>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="gap-1 text-xs dark:bg-gray-800 dark:border-gray-700"
                        >
                          <span className="hidden sm:inline">Siguiente</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="view">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">
                  Detalle del Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedChecklist ? (
                  <div className="text-center py-8">
                    <Eye className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Seleccione un checklist
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="pb-3 border-b dark:border-gray-700">
                      <h2 className="text-lg sm:text-xl font-bold truncate">
                        {selectedChecklist.checkType}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        ID: #{selectedChecklist.id}
                      </p>
                    </div>

                    {/* Preview de Imágenes del Vehículo */}
                    {selectedChecklist.vehicleImage &&
                      selectedChecklist.vehicleImage.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                              <ImageIcon className="h-4 w-4" />
                              Fotografías del Vehículo
                            </h3>
                            <Badge
                              variant="secondary"
                              className="text-xs dark:bg-gray-700"
                            >
                              {selectedChecklist.vehicleImage.length}{" "}
                              {selectedChecklist.vehicleImage.length === 1
                                ? "imagen"
                                : "imágenes"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {selectedChecklist.vehicleImage.map(
                              (image, index) => (
                                <div
                                  key={image.id}
                                  className="relative group cursor-pointer"
                                  onClick={() =>
                                    handleOpenImage(image.imageUrl, index)
                                  }
                                >
                                  <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-border dark:border-gray-700 bg-muted dark:bg-gray-800 shadow-sm hover:shadow-md transition-all hover:border-primary dark:hover:border-primary">
                                    <img
                                      src={image.imageUrl}
                                      alt={
                                        image.description ||
                                        `Imagen ${index + 1}`
                                      }
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />

                                    <div className="absolute inset-0 bg-black/30 dark:bg-black/50 group-hover:bg-black/10 dark:group-hover:bg-black/20 transition-all duration-300 pointer-events-none" />

                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                      <div className="bg-primary dark:bg-primary rounded-full p-3 shadow-lg transform group-hover:scale-110 transition-transform">
                                        <ZoomIn className="h-6 w-6 text-primary-foreground" />
                                      </div>
                                    </div>

                                    <div className="absolute top-3 left-3 bg-background/95 dark:bg-gray-900/95 backdrop-blur-sm text-foreground text-xs px-2.5 py-1 rounded-md font-medium shadow-lg border dark:border-gray-700">
                                      Imagen {index + 1}
                                    </div>
                                  </div>

                                  {image.description && (
                                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded text-xs text-blue-900 dark:text-blue-200">
                                      <p className="line-clamp-2 font-medium">
                                        {image.description}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                            <ZoomIn className="h-3 w-3" />
                            Haz clic en cualquier imagen para verla en tamaño
                            completo
                          </p>
                        </div>
                      )}

                    {/* Info de cita, cliente y vehículo */}
                    {selectedChecklist.appointment && (
                      <div className="space-y-3">
                        {/* Información del Cliente */}
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
                          <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Información del Cliente
                          </h3>
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="text-blue-700 dark:text-blue-400 font-medium">
                                Nombre:
                              </span>
                              <p className="text-blue-900 dark:text-blue-200">
                                {selectedChecklist.appointment.author.fullName}{" "}
                                {
                                  selectedChecklist.appointment.author
                                    .fullSurname
                                }
                              </p>
                            </div>
                            {selectedChecklist.appointment.author
                              .identified && (
                              <div>
                                <span className="text-blue-700 dark:text-blue-400 font-medium">
                                  Identificación:
                                </span>
                                <p className="text-blue-900 dark:text-blue-200">
                                  {
                                    selectedChecklist.appointment.author
                                      .identified
                                  }
                                </p>
                              </div>
                            )}
                            {selectedChecklist.appointment.author.email && (
                              <div className="flex items-start gap-1">
                                <Mail className="h-3 w-3 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="text-blue-700 dark:text-blue-400 font-medium">
                                    Email:
                                  </span>
                                  <p className="text-blue-900 dark:text-blue-200 break-all">
                                    {selectedChecklist.appointment.author.email}
                                  </p>
                                </div>
                              </div>
                            )}
                            {selectedChecklist.appointment.author.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                <div>
                                  <span className="text-blue-700 dark:text-blue-400 font-medium">
                                    Teléfono:
                                  </span>
                                  <p className="text-blue-900 dark:text-blue-200">
                                    {selectedChecklist.appointment.author.phone}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Información del Vehículo */}
                        {selectedChecklist.appointment.vehicle && (
                          <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg">
                            <h3 className="font-semibold text-sm text-green-900 dark:text-green-300 mb-2 flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              Información del Vehículo
                            </h3>
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-green-700 dark:text-green-400 font-medium">
                                  Vehículo:
                                </span>
                                <p className="text-green-900 dark:text-green-200 font-semibold">
                                  {selectedChecklist.appointment.vehicle.brand}{" "}
                                  {selectedChecklist.appointment.vehicle.model}{" "}
                                  {selectedChecklist.appointment.vehicle.year}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="text-green-700 dark:text-green-400 font-medium">
                                    Placa:
                                  </span>
                                  <p className="text-green-900 dark:text-green-200 font-bold">
                                    {
                                      selectedChecklist.appointment.vehicle
                                        .licensePlate
                                    }
                                  </p>
                                </div>
                                {selectedChecklist.appointment.vehicle
                                  .color && (
                                  <div>
                                    <span className="text-green-700 dark:text-green-400 font-medium">
                                      Color:
                                    </span>
                                    <p className="text-green-900 dark:text-green-200">
                                      {
                                        selectedChecklist.appointment.vehicle
                                          .color
                                      }
                                    </p>
                                  </div>
                                )}
                              </div>
                              {selectedChecklist.appointment.vehicle.vin && (
                                <div>
                                  <span className="text-green-700 dark:text-green-400 font-medium">
                                    VIN:
                                  </span>
                                  <p className="text-green-900 dark:text-green-200 text-[10px] break-all">
                                    {selectedChecklist.appointment.vehicle.vin}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Información de la Cita */}
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg">
                          <h3 className="font-semibold text-sm text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Información de la Cita
                          </h3>
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="text-amber-700 dark:text-amber-400 font-medium">
                                Fecha y Hora:
                              </span>
                              <p className="text-amber-900 dark:text-amber-200">
                                {formatDate(
                                  selectedChecklist.appointment.appointmentDate
                                )}{" "}
                                -{" "}
                                {formatTime(
                                  selectedChecklist.appointment.appointmentDate
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="text-amber-700 dark:text-amber-400 font-medium">
                                Ubicación:
                              </span>
                              <p className="text-amber-900 dark:text-amber-200 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {selectedChecklist.appointment.ubicacion}
                              </p>
                            </div>
                            <div>
                              <span className="text-amber-700 dark:text-amber-400 font-medium">
                                Estado:
                              </span>
                              <Badge
                                variant="outline"
                                className="ml-1 text-xs dark:bg-amber-900/50 dark:border-amber-800"
                              >
                                {selectedChecklist.appointment.appointmentState}
                              </Badge>
                            </div>
                            {selectedChecklist.appointment.employedAuthor && (
                              <div>
                                <span className="text-amber-700 dark:text-amber-400 font-medium">
                                  Técnico Asignado:
                                </span>
                                <p className="text-amber-900 dark:text-amber-200">
                                  {
                                    selectedChecklist.appointment.employedAuthor
                                      .name
                                  }
                                </p>
                                <p className="text-amber-600 dark:text-amber-400 text-[11px]">
                                  {
                                    selectedChecklist.appointment.employedAuthor
                                      .role
                                  }
                                </p>
                              </div>
                            )}
                            {selectedChecklist.appointment.details && (
                              <div>
                                <span className="text-amber-700 dark:text-amber-400 font-medium">
                                  Detalles:
                                </span>
                                <p className="text-amber-900 dark:text-amber-200">
                                  {selectedChecklist.appointment.details}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Info del vehículo */}
                    <div className="p-3 bg-muted dark:bg-gray-800 rounded-lg space-y-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Técnico:</span>
                        <p className="font-semibold">
                          {selectedChecklist.technicianName}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Kilometraje:
                        </span>
                        <p className="font-semibold">
                          {selectedChecklist.mileage}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Combustible:
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-background dark:bg-gray-900 rounded-full h-1.5">
                            <div
                              className={`${getFuelColor(selectedChecklist.fuelLevel)} h-1.5 rounded-full`}
                              style={{
                                width: `${selectedChecklist.fuelLevel}%`,
                              }}
                            />
                          </div>
                          <span
                            className={`font-bold ${getFuelTextColor(selectedChecklist.fuelLevel)}`}
                          >
                            {selectedChecklist.fuelLevel}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Evaluación del Estado del Vehículo */}
                    {selectedChecklist.items &&
                      selectedChecklist.items.length > 0 &&
                      (() => {
                        const evaluation = evaluateVehicleCondition(
                          selectedChecklist.items
                        );
                        const colorClasses = {
                          green: {
                            bg: "bg-green-50 dark:bg-green-950/30",
                            border: "border-green-200 dark:border-green-900",
                            text: "text-green-900 dark:text-green-200",
                            badge: "bg-green-500 dark:bg-green-600",
                            label: "text-green-700 dark:text-green-400",
                          },
                          lime: {
                            bg: "bg-lime-50 dark:bg-lime-950/30",
                            border: "border-lime-200 dark:border-lime-900",
                            text: "text-lime-900 dark:text-lime-200",
                            badge: "bg-lime-500 dark:bg-lime-600",
                            label: "text-lime-700 dark:text-lime-400",
                          },
                          blue: {
                            bg: "bg-blue-50 dark:bg-blue-950/30",
                            border: "border-blue-200 dark:border-blue-900",
                            text: "text-blue-900 dark:text-blue-200",
                            badge: "bg-blue-500 dark:bg-blue-600",
                            label: "text-blue-700 dark:text-blue-400",
                          },
                          amber: {
                            bg: "bg-amber-50 dark:bg-amber-950/30",
                            border: "border-amber-200 dark:border-amber-900",
                            text: "text-amber-900 dark:text-amber-200",
                            badge: "bg-amber-500 dark:bg-amber-600",
                            label: "text-amber-700 dark:text-amber-400",
                          },
                          orange: {
                            bg: "bg-orange-50 dark:bg-orange-950/30",
                            border: "border-orange-200 dark:border-orange-900",
                            text: "text-orange-900 dark:text-orange-200",
                            badge: "bg-orange-500 dark:bg-orange-600",
                            label: "text-orange-700 dark:text-orange-400",
                          },
                          red: {
                            bg: "bg-red-50 dark:bg-red-950/30",
                            border: "border-red-200 dark:border-red-900",
                            text: "text-red-900 dark:text-red-200",
                            badge: "bg-red-500 dark:bg-red-600",
                            label: "text-red-700 dark:text-red-400",
                          },
                          gray: {
                            bg: "bg-muted dark:bg-gray-800",
                            border: "border-border dark:border-gray-700",
                            text: "text-foreground",
                            badge: "bg-muted-foreground",
                            label: "text-muted-foreground",
                          },
                        };
                        const colors =
                          colorClasses[
                            evaluation.color as keyof typeof colorClasses
                          ];

                        return (
                          <div
                            className={`p-3 ${colors.bg} ${colors.border} border rounded-lg`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h3
                                className={`font-semibold text-sm ${colors.text} flex items-center gap-2`}
                              >
                                <Settings className="h-4 w-4" />
                                Estado General del Vehículo
                              </h3>
                              <Badge
                                className={`${colors.badge} text-white text-xs`}
                              >
                                {evaluation.status}
                              </Badge>
                            </div>
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className={`text-xs ${colors.label} font-medium`}
                                >
                                  Puntuación General
                                </span>
                                <span
                                  className={`text-sm font-bold ${colors.text}`}
                                >
                                  {evaluation.percentage}%
                                </span>
                              </div>
                              <div className="w-full bg-muted dark:bg-gray-800 rounded-full h-2">
                                <div
                                  className={`${colors.badge} h-2 rounded-full`}
                                  style={{ width: `${evaluation.percentage}%` }}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                              {evaluation.details.excelente > 0 && (
                                <div className="flex items-center gap-1 text-xs">
                                  <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-600" />
                                  <span className="text-foreground">
                                    <span className="font-medium">
                                      {evaluation.details.excelente}
                                    </span>{" "}
                                    Excelente
                                  </span>
                                </div>
                              )}
                              {evaluation.details.bueno > 0 && (
                                <div className="flex items-center gap-1 text-xs">
                                  <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-600" />
                                  <span className="text-foreground">
                                    <span className="font-medium">
                                      {evaluation.details.bueno}
                                    </span>{" "}
                                    Bueno
                                  </span>
                                </div>
                              )}
                              {evaluation.details.regular > 0 && (
                                <div className="flex items-center gap-1 text-xs">
                                  <div className="w-2 h-2 rounded-full bg-yellow-500 dark:bg-yellow-600" />
                                  <span className="text-foreground">
                                    <span className="font-medium">
                                      {evaluation.details.regular}
                                    </span>{" "}
                                    Regular
                                  </span>
                                </div>
                              )}
                              {evaluation.details.malo > 0 && (
                                <div className="flex items-center gap-1 text-xs">
                                  <div className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-600" />
                                  <span className="text-foreground">
                                    <span className="font-medium">
                                      {evaluation.details.malo}
                                    </span>{" "}
                                    Malo
                                  </span>
                                </div>
                              )}
                              {evaluation.details.requiereAtencion > 0 && (
                                <div className="flex items-center gap-1 text-xs">
                                  <div className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-600" />
                                  <span className="text-foreground">
                                    <span className="font-medium">
                                      {evaluation.details.requiereAtencion}
                                    </span>{" "}
                                    Urgente
                                  </span>
                                </div>
                              )}
                              {evaluation.details.sinCondicion > 0 && (
                                <div className="flex items-center gap-1 text-xs">
                                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                                  <span className="text-foreground">
                                    <span className="font-medium">
                                      {evaluation.details.sinCondicion}
                                    </span>{" "}
                                    Sin evaluar
                                  </span>
                                </div>
                              )}
                            </div>

                            <div
                              className={`p-2 ${colors.bg} border ${colors.border} rounded text-xs ${colors.text}`}
                            >
                              <p className="font-medium mb-1">
                                💡 Recomendación:
                              </p>
                              <p>{evaluation.recommendation}</p>
                            </div>

                            {evaluation.details.requiereAtencion > 0 && (
                              <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded">
                                <p className="text-xs font-medium text-red-900 dark:text-red-200 mb-1">
                                  ⚠️ Items que Requieren Atención Urgente:
                                </p>
                                <ul className="text-xs text-red-800 dark:text-red-300 space-y-0.5 list-disc list-inside">
                                  {selectedChecklist.items
                                    .filter(
                                      (item) =>
                                        item.condition === "Requiere Atención"
                                    )
                                    .map((item) => (
                                      <li key={item.id}>
                                        <span className="font-medium">
                                          {item.label}
                                        </span>
                                        {item.notes && (
                                          <span className="text-red-700 dark:text-red-400">
                                            {" "}
                                            - {item.notes}
                                          </span>
                                        )}
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                    {/* Notas */}
                    {selectedChecklist.generalNotes && (
                      <div>
                        <Label className="text-sm font-semibold">Notas</Label>
                        <div className="p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg mt-1">
                          <p className="text-xs text-foreground">
                            {selectedChecklist.generalNotes}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    {selectedChecklist.items &&
                      selectedChecklist.items.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-sm">Items</h3>
                            <Badge
                              variant="secondary"
                              className="text-xs dark:bg-gray-700"
                            >
                              {
                                selectedChecklist.items.filter((i) => i.checked)
                                  .length
                              }{" "}
                              / {selectedChecklist.items.length}
                            </Badge>
                          </div>

                          {ITEM_CATEGORIES.map((category) => {
                            const categoryItems =
                              selectedChecklist.items?.filter(
                                (item) => item.category === category
                              );
                            if (!categoryItems || categoryItems.length === 0)
                              return null;

                            return (
                              <div key={category} className="mb-3">
                                <h4 className="font-semibold text-xs bg-muted dark:bg-gray-800 px-2 py-1 rounded mb-2">
                                  {category}
                                </h4>
                                <div className="space-y-1">
                                  {categoryItems.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-start gap-2 p-2 bg-card dark:bg-gray-800 border dark:border-gray-700 rounded text-xs"
                                    >
                                      {item.checked ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                      ) : (
                                        <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">
                                          {item.label}
                                        </p>
                                        {item.condition && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs mt-1 dark:bg-gray-700 dark:border-gray-600"
                                          >
                                            {item.condition}
                                          </Badge>
                                        )}
                                        {item.notes && (
                                          <p className="text-muted-foreground mt-1">
                                            {item.notes}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                    {/* Botón volver */}
                    <div className="pt-3 border-t dark:border-gray-700">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("list")}
                        className="w-full sm:w-auto text-sm dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                      >
                        ← Volver
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Diálogo de visualización de imagen */}
        <Dialog open={imageDialog} onOpenChange={setImageDialog}>
          <DialogContent className="max-w-4xl w-[95vw] p-0 dark:bg-gray-900 dark:border-gray-800">
            <DialogTitle className="sr-only">
              Visualizador de Imágenes del Vehículo
            </DialogTitle>
            <DialogDescription className="sr-only">
              Galería de imágenes del checklist. Imagen {imageIndex + 1} de{" "}
              {selectedChecklist?.vehicleImage?.length || 0}
            </DialogDescription>

            <div className="relative bg-black dark:bg-gray-950">
              {/* Header del diálogo */}
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 dark:from-black/80 to-transparent z-10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold">
                      Imagen {imageIndex + 1} de{" "}
                      {selectedChecklist?.vehicleImage?.length || 0}
                    </h3>
                    {selectedChecklist?.vehicleImage?.[imageIndex]
                      ?.description && (
                      <p className="text-white/80 text-xs mt-1 line-clamp-2">
                        {selectedChecklist.vehicleImage[imageIndex].description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownloadImage}
                      className="text-white hover:bg-white/20"
                      title="Abrir en nueva pestaña"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setImageDialog(false)}
                      className="text-white hover:bg-white/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Imagen principal */}
              <div className="relative min-h-[60vh] max-h-[80vh] flex items-center justify-center">
                {selectedImage && (
                  <img
                    src={selectedImage}
                    alt={
                      selectedChecklist?.vehicleImage?.[imageIndex]
                        ?.description || `Imagen ${imageIndex + 1}`
                    }
                    className="max-w-full max-h-[80vh] object-contain"
                  />
                )}
              </div>

              {/* Controles de navegación */}
              {selectedChecklist?.vehicleImage &&
                selectedChecklist.vehicleImage.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePreviousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10 p-0"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10 p-0"
                      aria-label="Imagen siguiente"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}

              {/* Miniaturas */}
              {selectedChecklist?.vehicleImage &&
                selectedChecklist.vehicleImage.length > 1 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 dark:from-black/80 to-transparent p-4">
                    <div className="flex gap-2 justify-center overflow-x-auto">
                      {selectedChecklist.vehicleImage.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => {
                            setImageIndex(index);
                            setSelectedImage(image.imageUrl);
                          }}
                          className={`relative flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                            index === imageIndex
                              ? "border-white scale-110"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                          title={image.description || `Imagen ${index + 1}`}
                          aria-label={`Ver imagen ${index + 1}`}
                        >
                          <img
                            src={image.imageUrl}
                            alt={image.description || `Miniatura ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Diálogo de eliminación */}
        <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <DialogContent className="w-[90vw] max-w-md dark:bg-gray-900 dark:border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-base">
                ¿Eliminar checklist?
              </DialogTitle>
              <DialogDescription className="text-sm">
                Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteDialog(false)}
                disabled={deleting}
                className="w-full sm:w-auto text-sm dark:bg-gray-800 dark:border-gray-700"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="w-full sm:w-auto text-sm"
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default VehicleChecklistManager;
