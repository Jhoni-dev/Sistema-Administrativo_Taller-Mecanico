"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  MoreVertical,
  Clock,
  GripVertical,
  Search,
  Download,
  Tag,
  Pencil,
  Trash2,
  Loader2,
  RefreshCw,
  DollarSign,
  Wrench,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// HoverCard inline component
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { createPortal } from "react-dom";
import { exportToExcel } from "./documentsExport/excel";

const HoverCard = HoverCardPrimitive.Root;
const HoverCardTrigger = HoverCardPrimitive.Trigger;
const HoverCardContent = React.forwardRef(
  (
    props: React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>,
    ref: React.ForwardedRef<React.ElementRef<typeof HoverCardPrimitive.Content>>
  ) => {
    const { className, align = "center", sideOffset = 4, ...rest } = props;

    if (typeof document === "undefined") return null;

    return createPortal(
      <HoverCardPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={`z-50 rounded-lg border bg-card text-card-foreground shadow-xl outline-none animate-in fade-in-0 zoom-in-95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 ${className || ""}`}
        {...rest}
      />,
      document.body
    );
  }
);
HoverCardContent.displayName = "HoverCardContent";

interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  createAt: string;
}

interface ServiceImage {
  id: string;
  image: string;
  description?: string;
  file?: File;
  isNew?: boolean;
}

interface ServiceItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId: number;
  guarantee: string;
  createAt?: string;
  images?: ServiceImage[];
}

const API_BASE_URL = "/backend/api/protected";

interface TableRowProps {
  item: ServiceItem;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  className?: string;
}

const TableRow: React.FC<TableRowProps> = ({
  item,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
  className = "",
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
  };

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const hasImages = item.images && item.images.length > 0;

  return (
    <HoverCard openDelay={300}>
      <HoverCardTrigger asChild>
        <tr
          className={`border-b transition-colors hover:bg-muted/50 ${isSelected ? "bg-muted" : ""} ${className} cursor-pointer`}
        >
          <td className="px-4 py-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(item.id)}
              aria-label={`Select ${item.name}`}
            />
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.name}</span>
                  {hasImages && (
                    <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
                  )}
                </div>
                {item.description && (
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {item.description}
                  </span>
                )}
              </div>
            </div>
          </td>
          <td className="px-4 py-3">
            <Badge variant="outline" className="text-xs">
              {item.category}
            </Badge>
          </td>
          <td className="px-4 py-3">
            <span className="text-sm font-semibold">
              {formatCurrency(item.price)}
            </span>
          </td>
          <td className="px-4 py-3">
            <Badge variant="secondary" className="gap-1.5">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              {item.guarantee || "Sin garantía"}
            </Badge>
          </td>
          <td className="px-4 py-3">
            <span className="text-sm text-muted-foreground">
              {formatDate(item.createAt)}
            </span>
          </td>
          <td className="px-4 py-3 text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(item.id)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(item.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        </tr>
      </HoverCardTrigger>
      {hasImages && (
        <HoverCardContent
          className="w-80 p-0 overflow-hidden shadow-xl"
          side="left"
          align="start"
          sideOffset={10}
        >
          <div className="bg-card">
            <div className="border-b bg-muted/50 px-4 py-3">
              <h4 className="font-semibold text-sm leading-tight line-clamp-1">
                {item.name}
              </h4>
              <div className="flex items-center gap-1.5 mt-1">
                <ImageIcon className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {item.images?.length ?? 0}{" "}
                  {(item.images?.length ?? 0) === 1 ? "imagen" : "imágenes"}
                </span>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              <div className="p-3 space-y-3">
                {item.images?.map((image, index) => (
                  <div key={image.id} className="space-y-2">
                    <div className="relative rounded-md overflow-hidden bg-muted border aspect-video group">
                      <img
                        src={image.image}
                        alt={image.description || `Imagen ${index + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaW4gaW1hZ2VuPC90ZXh0Pjwvc3ZnPg==";
                        }}
                      />
                      <div className="absolute top-2 right-2 bg-background/95 backdrop-blur-sm text-foreground text-xs font-medium px-2 py-0.5 rounded shadow-sm border">
                        {index + 1}/{item.images?.length ?? 0}
                      </div>
                    </div>

                    {image.description && (
                      <div className="bg-muted/50 rounded-md px-2.5 py-1.5 border">
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {image.description}
                        </p>
                      </div>
                    )}

                    {index < (item.images?.length ?? 0) - 1 && (
                      <div className="border-t" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t bg-muted/50 px-4 py-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Galería</span>
                <span className="line-clamp-1">{item.category}</span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      )}
    </HoverCard>
  );
};

interface ServiceFormValues {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  category: string;
  guarantee: string;
  images: ServiceImage[];
}

interface ServiceModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: ServiceFormValues) => void;
  item?: ServiceItem | null;
  categories: ServiceCategory[];
  loading: boolean;
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  open,
  onClose,
  onSave,
  item,
  categories,
  loading,
}) => {
  const [form, setForm] = useState<ServiceFormValues>({
    name: "",
    description: "",
    price: 0,
    categoryId: 0,
    category: "",
    guarantee: "",
    images: [],
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (item) {
      setForm({
        name: item.name,
        description: item.description || "",
        price: item.price,
        categoryId: item.categoryId || 0,
        category: item.category,
        guarantee: item.guarantee || "",
        images: item.images || [],
      });
    } else {
      setForm({
        name: "",
        description: "",
        price: 0,
        categoryId: 0,
        category: "",
        guarantee: "",
        images: [],
      });
    }
  }, [item]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "price") {
      const numericValue = value.replace(/\D/g, "");
      setForm((prev) => ({
        ...prev,
        price: numericValue ? Number(numericValue) : 0,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: String(value),
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0]; // Solo tomar el primer archivo
    const newImage: ServiceImage = {
      id: `temp-${Date.now()}-${Math.random()}`,
      image: URL.createObjectURL(file),
      file,
      isNew: true,
      description: "",
    };

    setForm((prev) => ({
      ...prev,
      images: [newImage], // <-- Esto REEMPLAZA cualquier imagen existente
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageDescriptionChange = (id: string, description: string) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((img) =>
        img.id === id ? { ...img, description } : img
      ),
    }));
  };

  const handleRemoveImage = (id: string) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
    }));
  };

  const formatPrice = (price: number) => {
    if (!price) return "";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? "Editar Servicio" : "Agregar Servicio"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label>Nombre del Servicio*</Label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ej: Cambio de aceite"
            />
          </div>
          <div>
            <Label>Descripción</Label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe el servicio..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div>
            <Label>Categoría*</Label>
            <Select
              value={
                form.categoryId && form.categoryId > 0
                  ? form.categoryId.toString()
                  : ""
              }
              onValueChange={(value) => {
                const selectedCat = categories.find(
                  (c) => c.id === Number(value)
                );
                setForm((prev) => ({
                  ...prev,
                  categoryId: Number(value),
                  category: selectedCat?.name || "",
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.length === 0 ? (
                  <SelectItem value="0" disabled>
                    No hay categorías disponibles
                  </SelectItem>
                ) : (
                  categories
                    .map((cat) => {
                      const categoryId = cat?.id;
                      if (!categoryId || typeof categoryId !== "number") {
                        return null;
                      }
                      return (
                        <SelectItem
                          key={categoryId}
                          value={categoryId.toString()}
                        >
                          {cat.name}
                        </SelectItem>
                      );
                    })
                    .filter(Boolean)
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Precio*</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  name="price"
                  type="text"
                  value={form.price ? formatPrice(form.price) : ""}
                  onChange={handleChange}
                  placeholder="0"
                  className="pl-7"
                />
              </div>
            </div>
            <div>
              <Label>Garantía</Label>
              <Input
                name="guarantee"
                value={form.guarantee}
                onChange={handleChange}
                placeholder="Ej: 3 meses"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Imágenes del Servicio</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {form.images.length > 0 ? "Cambiar Imagen" : "Subir Imagen"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {form.images.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Solo se permite una imagen por servicio. Al subir una nueva
                imagen, se reemplazará la actual.
              </p>
            )}

            {form.images.length > 0 && (
              <div className="space-y-3 max-h-[300px] overflow-y-auto border rounded-lg p-3">
                {form.images.map((image) => (
                  <div
                    key={image.id}
                    className="flex gap-3 p-3 border rounded-lg bg-muted/50"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        {image.image ? (
                          <img
                            src={image.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Descripción de la imagen (opcional)"
                        value={image.description || ""}
                        onChange={(e) =>
                          handleImageDescriptionChange(image.id, e.target.value)
                        }
                        className="text-sm"
                      />
                      {image.isNew && (
                        <span className="text-xs text-muted-foreground">
                          Nueva imagen
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveImage(image.id)}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {form.images.length === 0 && (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No hay imágenes agregadas
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Haz clic en "Subir Imagen" para agregar fotos
                </p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={() => onSave(form)}
            disabled={
              loading ||
              !form.name.trim() ||
              !form.categoryId ||
              form.categoryId === 0
            }
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  category?: ServiceCategory | null;
  loading: boolean;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  open,
  onClose,
  onSave,
  category,
  loading,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description);
    } else {
      setName("");
      setDescription("");
    }
  }, [category]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name, description);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar Categoría" : "Nueva Categoría"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label>Nombre*</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Mantenimiento"
            />
          </div>
          <div>
            <Label>Descripción</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la categoría..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              `${category ? "Actualizar" : "Crear"} Categoría`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface CategoryManagerProps {
  open: boolean;
  onClose: () => void;
  categories: ServiceCategory[];
  onEdit: (category: ServiceCategory) => void;
  onDelete: (id: number) => void;
  loading: boolean;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  open,
  onClose,
  categories,
  onEdit,
  onDelete,
  loading,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Gestionar Categorías</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay categorías creadas
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {category.description || "Sin descripción"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(category.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ServicesTable: React.FC = () => {
  const [data, setData] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<ServiceCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedItemImages, setSelectedItemImages] =
    useState<ServiceItem | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/servicesPage`);
      if (!response.ok) throw new Error("Error al cargar servicios");
      const services = await response.json();

      const transformedServices = services.map((service: any) => {
        let images: ServiceImage[] = [];
        if (service.serviceImage) {
          if (Array.isArray(service.serviceImage)) {
            images = service.serviceImage.map((img: any) => ({
              id: img.id?.toString() || "",
              image: img.imageUrl || img.image || "",
              description: img.description || "",
            }));
          } else if (typeof service.serviceImage === "object") {
            images = [
              {
                id: service.serviceImage.id?.toString() || "",
                image:
                  service.serviceImage.imageUrl ||
                  service.serviceImage.image ||
                  "",
                description: service.serviceImage.description || "",
              },
            ];
          }
        }

        return {
          id: service.id,
          name: service.name,
          description: service.description || "",
          price: Number(service.price) || 0,
          category: service.author?.name || "Sin categoría",
          categoryId: service.author?.id || service.serviceCategory_id || 0,
          guarantee: service.guarantee || "",
          createAt: service.createAt,
          images: images,
        };
      });

      setData(transformedServices);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/servicesCategory`);
      if (!response.ok) throw new Error("Error al cargar categorías");
      const cats = await response.json();
      setCategories(cats);
    } catch (err) {
      console.error("Error cargando categorías:", err);
    }
  };

  const uploadImage = async (serviceId: number, image: ServiceImage) => {
    if (!image.file) {
      throw new Error("No hay archivo para subir");
    }
    if (!serviceId || typeof serviceId !== "number") {
      throw new Error("ID de servicio inválido");
    }

    const formData = new FormData();
    formData.append("id", serviceId.toString()); // Backend espera "id"
    formData.append("image", image.file);
    if (image.description) {
      formData.append("description", image.description);
    }

    console.log("Subiendo imagen para servicio ID:", serviceId);
    console.log("FormData contents:", {
      id: serviceId.toString(),
      hasFile: !!image.file,
      fileName: image.file.name,
      fileType: image.file.type,
      fileSize: image.file.size,
      description: image.description || "sin descripción"
    });

    const response = await fetch(`${API_BASE_URL}/servicesPage/uploadImage`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al subir imagen'}`);
    }

    const result = await response.json();
    console.log("Upload successful:", result);
    return result;
  };

  const updateImageDescription = async (
    imageId: string,
    description: string
  ) => {
    const formData = new FormData();
    formData.append("description", description);

    const response = await fetch(
      `${API_BASE_URL}/servicesPage/uploadImage/${imageId}`,
      {
        method: "PUT",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Error al actualizar descripción de imagen");
    }

    return response.json();
  };

  const deleteImage = async (imageId: string) => {
    console.log("Eliminando imagen ID:", imageId);
    
    const response = await fetch(
      `${API_BASE_URL}/servicesPage/uploadImage/${imageId}`,
      {
        method: "DELETE",
      }
    );

    console.log("Delete response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error al eliminar:", errorText);
      throw new Error(`Error ${response.status} al eliminar imagen: ${errorText}`);
    }

    const result = await response.json();
    console.log("Imagen eliminada:", result);
    return result;
  };

  const createService = async (item: ServiceFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: item.name,
        description: item.description || "",
        price: item.price,
        guarantee: item.guarantee || "",
        serviceCategory_id: item.categoryId,
      };

      console.log("Creando servicio con payload:", payload);

      const response = await fetch(`${API_BASE_URL}/servicesPage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al crear servicio");
      }

      const newService = await response.json();
      console.log("Respuesta del backend:", newService);

      // 🔧 CORRECCIÓN: Refrescar servicios primero para obtener el ID más reciente
      await fetchServices();

      let serviceId = null;

      // Si el backend devuelve el objeto con ID, usarlo directamente
      if (newService && typeof newService === 'object' && newService.id) {
        serviceId = newService.id;
        console.log("ID obtenido directamente de la respuesta:", serviceId);
      } 
      // Si no, buscar el servicio más reciente con el mismo nombre y categoría
      else {
        // Esperar un momento para asegurar que la BD se actualizó
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Refrescar nuevamente para asegurar datos actualizados
        await fetchServices();
        
        // Buscar el servicio más reciente (último creado) que coincida
        const recentServices = [...data].sort((a, b) => {
          const dateA = a.createAt ? new Date(a.createAt).getTime() : 0;
          const dateB = b.createAt ? new Date(b.createAt).getTime() : 0;
          return dateB - dateA; // Más reciente primero
        });

        const foundService = recentServices.find(
          (s) => s.name === item.name && s.categoryId === item.categoryId
        );

        serviceId = foundService?.id;
        console.log("ID encontrado buscando en servicios:", serviceId);
      }

      console.log("Service ID final:", serviceId);
      console.log("Imágenes a subir:", item.images);

      // Subir imágenes con mejor manejo de errores
      if (item.images.length > 0) {
        if (!serviceId) {
          setError(
            "El servicio se creó pero no se pudo obtener su ID para subir imágenes. " +
              "Por favor, edita el servicio para agregar las imágenes."
          );
          setModalOpen(false);
          setEditingItem(null);
          setLoading(false);
          return;
        }

        const uploadErrors: string[] = [];

        for (const image of item.images) {
          if (image.isNew && image.file) {
            try {
              console.log("Subiendo imagen para servicio ID:", serviceId);
              await uploadImage(serviceId, image);
              console.log("Imagen subida exitosamente");
            } catch (imgErr) {
              console.error("Error uploading image:", imgErr);
              uploadErrors.push(
                `Error al subir imagen: ${imgErr instanceof Error ? imgErr.message : "Error desconocido"}`
              );
            }
          }
        }

        if (uploadErrors.length > 0) {
          setError(
            `El servicio se creó correctamente, pero hubo problemas al subir ${uploadErrors.length} imagen(es). ` +
              `Puedes editarlo para intentar nuevamente.`
          );
        }
      }

      await fetchServices();
      setModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (item: ServiceFormValues) => {
    if (!editingItem) return;

    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: item.name,
        description: item.description || "",
        price: item.price,
        guarantee: item.guarantee || "",
        serviceCategory_id: item.categoryId,
      };

      const response = await fetch(
        `${API_BASE_URL}/servicesPage/${editingItem.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al actualizar servicio");
      }

      // 🔧 CORRECCIÓN: Manejar imágenes correctamente
      if (item.images && item.images.length > 0) {
        const newImage = item.images[0]; // Solo hay una imagen

        // Si es una imagen nueva (archivo subido)
        if (newImage.isNew && newImage.file) {
          try {
            // Si el servicio ya tenía una imagen, primero eliminarla
            if (editingItem.images && editingItem.images.length > 0) {
              console.log("Eliminando imagen anterior del servicio ID:", editingItem.id);
              
              // 🔧 CORRECCIÓN: Pasar el SERVICE ID, no el IMAGE ID
              await deleteImage(editingItem.id.toString());
            }

            // Ahora subir la nueva imagen
            console.log("Subiendo nueva imagen para servicio ID:", editingItem.id);
            await uploadImage(editingItem.id, newImage);
          } catch (imgErr) {
            console.error("Error uploading new image:", imgErr);
            setError(
              "El servicio se actualizó, pero hubo un error al actualizar la imagen. " +
                "Intenta editarlo nuevamente para cambiar la imagen."
            );
          }
        }
        // Si solo se actualizó la descripción de la imagen existente
        else if (
          !newImage.isNew &&
          newImage.description !==
            editingItem.images?.find((i) => i.id === newImage.id)?.description
        ) {
          try {
            await updateImageDescription(
              newImage.id, // 🔧 Usar el ID de la imagen, no del servicio
              newImage.description || ""
            );
          } catch (imgErr) {
            console.error("Error updating image description:", imgErr);
          }
        }
      }
      // Si no hay imágenes en el formulario pero el servicio tenía una, eliminarla
      else if (
        (!item.images || item.images.length === 0) &&
        editingItem.images &&
        editingItem.images.length > 0
      ) {
        try {
          console.log("Eliminando imagen (sin reemplazo) del servicio ID:", editingItem.id);
          // 🔧 CORRECCIÓN: Pasar el SERVICE ID, no el IMAGE ID
          await deleteImage(editingItem.id.toString());
        } catch (imgErr) {
          console.error("Error deleting image:", imgErr);
        }
      }

      await fetchServices();
      setModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/servicesPage/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar servicio");

      await fetchServices();
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name: string, description: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/servicesCategory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) throw new Error("Error al crear categoría");

      await fetchCategories();
      setCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (name: string, description: string) => {
    if (!editingCategory) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/servicesCategory/${editingCategory.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, description }),
        }
      );

      if (!response.ok) throw new Error("Error al actualizar categoría");

      await fetchCategories();
      setCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/servicesCategory/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar categoría");

      await fetchCategories();
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveService = (item: ServiceFormValues) => {
    if (editingItem) {
      updateService(item);
    } else {
      createService(item);
    }
  };

  const handleSaveCategory = (name: string, description: string) => {
    if (editingCategory) {
      updateCategory(name, description);
    } else {
      createCategory(name, description);
    }
  };

  const handleEditCategory = (category: ServiceCategory) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
    setCategoryManagerOpen(false);
  };

  const handleDeleteCategory = (id: number) => {
    setCategoryToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [data, searchTerm, filterCategory]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handleEdit = (id: number) => {
    const item = data.find((item) => item.id === id);
    if (item) {
      setEditingItem(item);
      setModalOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleCloseCategoryModal = () => {
    setCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleToggleSelectAll = () => {
    if (selected.size === paginatedData.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginatedData.map((item) => item.id)));
    }
  };

  const handleToggleSelect = (id: number) => {
    const newSet = new Set(selected);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelected(newSet);
  };

  const handlePageChange = (page: number) =>
    setCurrentPage(Math.max(0, Math.min(totalPages - 1, page)));

  const handleExportExcel = async () => {
    const promedio = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(avgPrice);

    await exportToExcel({
      data: filteredData,
      fileName: "servicios_{date}.xlsx",
      sheetName: "Servicios",

      title: "REPORTE DE SERVICIOS",
      subtitle: `Generado el ${new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`,

      autoFilter: true,
      freezeHeader: true,
      includeStatistics: true,

      statistics: [
        {
          title: "Servicios",
          value: data.length,
          description: "Total de servicios en disponibilidad",
          bgColor: "FFF9FAFB",
        },
        {
          title: "Promedio",
          value: promedio,
          description: "Precio promedio de los servicios disponibles",
          bgColor: "FFDBEAFE",
          textColor: "FF2563EB",
        },
        {
          title: "Categorias",
          value: categories.length,
          description: "Total de categorias en disponibilidad",
          bgColor: "FFFEF3C7",
          textColor: "FFF59E0B",
        },
      ],

      columns: [
        { header: "Servicio", key: "name", width: 30 },
        { header: "Descripción", key: "description", width: 40 },
        { header: "Categoría", key: "category", width: 20 },
        {
          header: "Precio",
          key: "price",
          width: 12,
          numFmt: "$#,##0",
          alignment: "right",
        },
        { header: "Garantía", key: "guarantee", width: 15 },
        {
          header: "Fecha",
          key: "createAt",
          width: 15,
          isDate: true,
          dateFormat: "short",
        },
      ],
    });
  };

  const totalRevenue = data.reduce((sum, item) => sum + item.price, 0);
  const avgPrice = data.length > 0 ? totalRevenue / data.length : 0;

  return (
    <div className="w-full min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Header - Responsive */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold">Servicios</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Gestiona tu catálogo - {data.length} servicios
              </p>
            </div>

            {/* Botones principales - Desktop */}
            <div className="hidden lg:flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchServices();
                  fetchCategories();
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setCategoryManagerOpen(true)}
                variant="outline"
                size="sm"
              >
                <Tag className="h-4 w-4 mr-2" />
                Categorías
              </Button>
              <Button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryModalOpen(true);
                }}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Categoría
              </Button>
              <Button onClick={() => setModalOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Servicio
              </Button>
              <Button variant="outline" onClick={handleExportExcel} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
            </div>

            {/* Botones principales - Mobile/Tablet */}
            <div className="flex lg:hidden gap-2">
              <Button
                onClick={() => setModalOpen(true)}
                size="sm"
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Servicio
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px]">
                  <SheetHeader>
                    <SheetTitle>Menú</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-2">
                    <Button
                      onClick={() => {
                        fetchServices();
                        fetchCategories();
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualizar
                    </Button>
                    <Button
                      onClick={() => setCategoryManagerOpen(true)}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      Gestionar Categorías
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryModalOpen(true);
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Categoría
                    </Button>
                    <Button
                      onClick={handleExportExcel}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Excel
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs md:text-sm font-medium">
                Total Servicios
              </CardTitle>
              <Wrench className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{data.length}</div>
              <p className="text-xs text-muted-foreground">
                Servicios registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs md:text-sm font-medium">
                Precio Promedio
              </CardTitle>
              <DollarSign className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                  minimumFractionDigits: 0,
                }).format(avgPrice)}
              </div>
              <p className="text-xs text-muted-foreground">
                Precio medio por servicio
              </p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs md:text-sm font-medium">
                Categorías
              </CardTitle>
              <Tag className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {categories.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Categorías activas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Búsqueda y filtros */}
        <Card className="mb-4 md:mb-6">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar servicio..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(0);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="w-full md:w-48">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Categoría
                </label>
                <Select
                  value={filterCategory}
                  onValueChange={(value) => {
                    setFilterCategory(value);
                    setCurrentPage(0);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories
                      .map((category) => {
                        if (!category?.id || !category?.name) {
                          return null;
                        }
                        return (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        );
                      })
                      .filter(Boolean)}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-auto">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 md:opacity-0">
                  Limpiar
                </label>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterCategory("all");
                    setCurrentPage(0);
                  }}
                  className="w-full md:w-auto"
                  size="default"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading && !modalOpen && !categoryModalOpen ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Vista de tabla para desktop */}
            <div className="hidden md:block overflow-hidden rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="w-12 px-4 py-3">
                      <Checkbox
                        checked={
                          selected.size === paginatedData.length &&
                          paginatedData.length > 0
                        }
                        onCheckedChange={handleToggleSelectAll}
                        aria-label="Select all items"
                      />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Servicio
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Categoría
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Precio
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Garantía
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Fecha
                      </span>
                    </th>
                    <th className="px-4 py-3 text-right">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Acciones
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-muted-foreground"
                      >
                        No hay servicios registrados
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item) => (
                      <TableRow
                        key={item.id}
                        item={item}
                        isSelected={selected.has(item.id)}
                        onToggleSelect={handleToggleSelect}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Vista de tarjetas para móvil */}
            <div className="md:hidden space-y-3">
              {paginatedData.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No hay servicios registrados
                  </CardContent>
                </Card>
              ) : (
                paginatedData.map((item) => (
                  <Card
                    key={item.id}
                    className={
                      selected.has(item.id) ? "border-primary bg-muted" : ""
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <Checkbox
                            checked={selected.has(item.id)}
                            onCheckedChange={() => handleToggleSelect(item.id)}
                            aria-label={`Select ${item.name}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-sm line-clamp-1">
                                {item.name}
                              </h3>
                              {item.images && item.images.length > 0 && (
                                <button
                                  onClick={() => {
                                    setSelectedItemImages(item);
                                    setImageModalOpen(true);
                                  }}
                                  className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
                                >
                                  <ImageIcon className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span className="text-xs font-medium">
                                    {item.images.length}
                                  </span>
                                </button>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {item.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs">
                                {item.category}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="text-xs gap-1"
                              >
                                <Clock className="h-3 w-3" />
                                {item.guarantee || "Sin garantía"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(item.id)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-lg font-bold">
                          {new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                          }).format(item.price)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.createAt
                            ? new Date(item.createAt).toLocaleDateString(
                                "es-ES",
                                { day: "2-digit", month: "short" }
                              )
                            : "N/A"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div className="mt-4 md:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs md:text-sm text-muted-foreground">
                {selected.size} de {data.length} seleccionados
              </span>
              <div className="flex items-center gap-1 md:gap-2">
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
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-2 md:px-3 text-xs md:text-sm font-medium whitespace-nowrap">
                  {currentPage + 1} de {totalPages || 1}
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
            </div>
          </>
        )}
      </div>

      <ServiceModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveService}
        item={editingItem}
        categories={categories}
        loading={loading}
      />

      <CategoryModal
        open={categoryModalOpen}
        onClose={handleCloseCategoryModal}
        onSave={handleSaveCategory}
        category={editingCategory}
        loading={loading}
      />

      <CategoryManager
        open={categoryManagerOpen}
        onClose={() => setCategoryManagerOpen(false)}
        categories={categories}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        loading={loading}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToDelete
                ? "Esta acción eliminará la categoría permanentemente. Los servicios con esta categoría podrían quedar sin asignar."
                : "Esta acción eliminará el servicio permanentemente."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (categoryToDelete) {
                  deleteCategory(categoryToDelete);
                } else if (itemToDelete) {
                  deleteService(itemToDelete);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de imágenes para móviles */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              {selectedItemImages?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4">
            {selectedItemImages?.images &&
            selectedItemImages.images.length > 0 ? (
              selectedItemImages.images.map((image, index) => (
                <div key={image.id} className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden bg-muted border aspect-video">
                    <img
                      src={image.image}
                      alt={image.description || `Imagen ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaW4gaW1hZ2VuPC90ZXh0Pjwvc3ZnPg==";
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-background/95 backdrop-blur-sm text-foreground text-xs font-medium px-2 py-1 rounded shadow-sm border">
                      {index + 1}/{selectedItemImages.images?.length ?? 0}
                    </div>
                  </div>
                  {image.description && (
                    <div className="bg-muted/50 rounded-lg px-3 py-2 border">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {image.description}
                      </p>
                    </div>
                  )}
                  {index < (selectedItemImages.images?.length ?? 0) - 1 && (
                    <div className="border-t" />
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">No hay imágenes disponibles</p>
              </div>
            )}
          </div>
          <DialogFooter className="p-4 pt-0">
            <Button onClick={() => setImageModalOpen(false)} className="w-full">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesTable;