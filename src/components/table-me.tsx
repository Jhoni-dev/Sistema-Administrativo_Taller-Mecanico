"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  MoreVertical,
  AlertCircle,
  CheckCircle2,
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
  Package,
  Grid3x3,
  Filter,
  X,
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
import { useExcelExport, exportToExcel } from "./documentsExport/excel";

interface Category {
  id: number;
  name: string;
  description: string;
  createAt: string;
}

interface InventoryItem {
  id: number;
  name: string;
  stock: number;
  category: string;
  price: number;
  brand_piece: string;
  description?: string;
  createAt?: string;
}

const API_BASE_URL = "/backend/api/protected";

interface StockIndicatorProps {
  stock: number;
}

const StockIndicator: React.FC<StockIndicatorProps> = ({ stock }) => {
  if (stock < 10) {
    return (
      <Badge
        variant="destructive"
        className="gap-1.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      >
        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
        {stock} unid.
      </Badge>
    );
  }

  if (stock < 20) {
    return (
      <Badge
        variant="secondary"
        className="gap-1.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      >
        <Clock className="h-3.5 w-3.5 flex-shrink-0" />
        {stock} unid.
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="gap-1.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    >
      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
      {stock} unid.
    </Badge>
  );
};

interface TableRowProps {
  item: InventoryItem;
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

  return (
    <tr
      className={`border-b transition-colors hover:bg-muted/50 ${
        isSelected ? "bg-muted" : ""
      } ${className}`}
    >
      <td className="px-2 sm:px-4 py-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(item.id)}
          aria-label={`Select ${item.name}`}
        />
      </td>
      <td className="px-2 sm:px-4 py-3">
        <div className="flex items-center gap-2">
          <GripVertical className="hidden sm:block h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">{item.name}</span>
            {item.description && (
              <span className="text-xs text-muted-foreground truncate">
                {item.description}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="hidden md:table-cell px-4 py-3">
        <Badge variant="outline" className="text-xs">
          {item.category}
        </Badge>
      </td>
      <td className="px-2 sm:px-4 py-3">
        <StockIndicator stock={item.stock} />
      </td>
      <td className="hidden sm:table-cell px-4 py-3">
        <span className="text-sm font-semibold">
          ${item.price.toLocaleString()}
        </span>
      </td>
      <td className="hidden lg:table-cell px-4 py-3">
        <span className="text-sm">{item.brand_piece}</span>
      </td>
      <td className="hidden lg:table-cell px-4 py-3">
        <span className="text-sm text-muted-foreground">
          {formatDate(item.createAt)}
        </span>
      </td>
      <td className="px-2 sm:px-4 py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(item.id)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(item.id)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};

// Card móvil para productos
interface MobileProductCardProps {
  item: InventoryItem;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const MobileProductCard: React.FC<MobileProductCardProps> = ({
  item,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
  };

  return (
    <Card className={`mb-3 ${isSelected ? "border-primary bg-muted" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(item.id)}
              aria-label={`Select ${item.name}`}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base mb-1 break-words">
                {item.name}
              </h3>
              {item.description && (
                <p className="text-sm text-muted-foreground mb-2 break-words">
                  {item.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
                <StockIndicator stock={item.stock} />
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 -mr-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(item.id)}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(item.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground block mb-1">Precio</span>
            <span className="font-semibold">
              ${item.price.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block mb-1">Marca</span>
            <span>{item.brand_piece}</span>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground block mb-1">Fecha</span>
            <span>{formatDate(item.createAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ProductFormValues {
  name: string;
  stock: number;
  category: string;
  categoryId: number;
  price: number;
  brand_piece: string;
  description?: string;
}

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: ProductFormValues) => void;
  item?: InventoryItem | null;
  categories: Category[];
  loading: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({
  open,
  onClose,
  onSave,
  item,
  categories,
  loading,
}) => {
  const [form, setForm] = useState<ProductFormValues>({
    name: "",
    stock: 0,
    category: "",
    categoryId: 0,
    price: 0,
    brand_piece: "",
    description: "",
  });

  React.useEffect(() => {
    if (item) {
      const cat = categories.find((c) => c.name === item.category);
      setForm({
        name: item.name,
        stock: item.stock,
        category: item.category,
        categoryId: cat?.id || 0,
        price: item.price,
        brand_piece: item.brand_piece || "",
        description: item.description || "",
      });
    } else {
      setForm({
        name: "",
        stock: 0,
        category: "",
        categoryId: 0,
        price: 0,
        brand_piece: "",
        description: "",
      });
    }
  }, [item, categories]);

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
    } else if (name === "stock") {
      setForm((prev) => ({
        ...prev,
        stock: Number(value),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: String(value),
      }));
    }
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? "Editar Producto" : "Agregar Producto"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label>Nombre*</Label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ej: Filtro de aire"
            />
          </div>
          <div>
            <Label>Descripción</Label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descripción del producto..."
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div>
            <Label>Categoría*</Label>
            <Select
              value={form.categoryId.toString()}
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
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Stock*</Label>
              <Input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                min="0"
              />
            </div>
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
          </div>
          <div>
            <Label>Marca*</Label>
            <Input
              name="brand_piece"
              value={form.brand_piece}
              onChange={handleChange}
              placeholder="Ej: Bosch"
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => onSave(form)}
            disabled={
              loading || !form.name || !form.categoryId || !form.brand_piece
            }
            className="w-full sm:w-auto"
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
  category?: Category | null;
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
              placeholder="Ej: Frenos"
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
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || loading}
            className="w-full sm:w-auto"
          >
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
  categories: Category[];
  onEdit: (category: Category) => void;
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
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="font-medium break-words">{category.name}</h4>
                    <p className="text-sm text-muted-foreground break-words">
                      {category.description || "Sin descripción"}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
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
          <Button onClick={onClose} className="w-full sm:w-auto">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const InventoryTable: React.FC = () => {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Detectar tamaño de pantalla para cambiar vista automáticamente
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode("cards");
      } else {
        setViewMode("table");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/inventory`);
      if (!response.ok) throw new Error("Error al cargar inventario");
      const items = await response.json();

      const transformedItems = items.map((item: any) => ({
        id: item.id,
        name: item.name,
        stock: item.stock,
        category: item.pieceCategory?.name || "Sin categoría",
        price: Number(item.price) || 0,
        brand_piece: item.brand_piece,
        description: item.description,
        createAt: item.createAt,
      }));

      setData(transformedItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/category`);
      if (!response.ok) throw new Error("Error al cargar categorías");
      const cats = await response.json();
      setCategories(cats);
    } catch (err) {
      console.error("Error cargando categorías:", err);
    }
  };

  const createInventoryItem = async (item: ProductFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: item.name,
        stock: item.stock,
        price: item.price,
        brand_piece: item.brand_piece,
        description: item.description || "",
        categoryId: item.categoryId,
      };

      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al crear producto");
      }

      await fetchInventory();
      setModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const updateInventoryItem = async (item: ProductFormValues) => {
    if (!editingItem) return;

    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: item.name,
        stock: item.stock,
        price: item.price,
        brand_piece: item.brand_piece,
        description: item.description || "",
        categoryId: item.categoryId,
      };

      const response = await fetch(
        `${API_BASE_URL}/inventory/${editingItem.id}`,
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
        throw new Error(errorData.message || "Error al actualizar producto");
      }

      await fetchInventory();
      setModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const deleteInventoryItem = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar producto");

      await fetchInventory();
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
      const response = await fetch(`${API_BASE_URL}/category`, {
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
        `${API_BASE_URL}/category/${editingCategory.id}`,
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
      const response = await fetch(`${API_BASE_URL}/category/${id}`, {
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

  const handleSaveProduct = (item: ProductFormValues) => {
    if (editingItem) {
      updateInventoryItem(item);
    } else {
      createInventoryItem(item);
    }
  };

  const handleSaveCategory = (name: string, description: string) => {
    if (editingCategory) {
      updateCategory(name, description);
    } else {
      createCategory(name, description);
    }
  };

  const handleEditCategory = (category: Category) => {
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
        item.brand_piece.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [data, searchTerm, filterCategory]);

  const statistics = useMemo(() => {
    const totalInventoryValue = data.reduce(
      (sum, item) => sum + item.price * item.stock,
      0
    );
    const averagePrice =
      data.length > 0
        ? data.reduce((sum, item) => sum + item.price, 0) / data.length
        : 0;
    const totalCategories = categories.length;

    return {
      totalInventoryValue,
      averagePrice,
      totalCategories,
    };
  }, [data, categories]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
    console.warn(filteredData);
    await exportToExcel({
      data: filteredData,
      fileName: "inventario_{date}.xlsx",
      sheetName: "Inventario",

      title: "REPORTE DE INVENTARIO",
      subtitle: `Generado el ${new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`,

      autoFilter: true,
      freezeHeader: true,
      includeStatistics: true,
      includeCharts: true,

      pagination: {
        enabled: true,
        rowsPerPage: 100,
        createIndex: true,
      },

      statistics: [
        {
          title: "Total",
          value: statistics.totalInventoryValue,
          description: "Inventario total",
          bgColor: "FFF9FAFB",
        },
        {
          title: "Promedio",
          value: statistics.averagePrice,
          description: "Promedio en inventario",
          bgColor: "FFDBEAFE",
          textColor: "FF2563EB",
        },
        {
          title: "Categorias",
          value: statistics.totalCategories,
          description: "Total de categorias en disponibilidad",
          bgColor: "FFFEF3C7",
          textColor: "FFF59E0B",
        },
      ],

      charts: [
        {
          title: "Distribución de Citas",
          type: "column",
          categories: ["Total", "Promedio", "Categorias"],
          values: [statistics.totalInventoryValue, statistics.averagePrice, statistics.totalCategories],
        },
      ],

      columns: [
        { header: "Repuesto", key: "name", width: 30 },
        { header: "Descripción", key: "description", width: 40 },
        { header: "Categoría", key: "category", width: 20 },
        { header: "Marca", key: "brand_piece", width: 20 },
        {
          header: "Precio",
          key: "price",
          width: 12,
          numFmt: "$#,##0",
          alignment: "right",
        },
        {
          header: "Fecha",
          key: "createAt",
          width: 15,
          isDate: true, // ← Marca como fecha
          dateFormat: "short", // ← Formato: 27/11/2025
        },
      ],
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterCategory("all");
    setCurrentPage(0);
    setFiltersOpen(false);
  };

  return (
    <div className="w-full min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Header - Responsive */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold">Inventario</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {data.length} productos
              </p>
            </div>

            {/* Botones principales - Desktop */}
            <div className="hidden lg:flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchInventory();
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
                Agregar Producto
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
                Producto
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
                        fetchInventory();
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

        {/* Estadísticas - Responsive */}
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-4 md:mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">
                Total Inventario
              </CardTitle>
              <DollarSign className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {formatCurrency(statistics.totalInventoryValue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor total del stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">
                Precio Promedio
              </CardTitle>
              <Package className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {formatCurrency(statistics.averagePrice)}
              </div>
              <p className="text-xs text-muted-foreground">Por producto</p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">
                Categorías
              </CardTitle>
              <Grid3x3 className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {statistics.totalCategories}
              </div>
              <p className="text-xs text-muted-foreground">
                Categorías activas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros - Mobile con Sheet, Desktop inline */}
        <Card className="mb-4 md:mb-6">
          <CardContent className="p-3 md:p-4">
            {/* Mobile - Sheet para filtros */}
            <div className="md:hidden">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(0);
                    }}
                    className="pl-10"
                  />
                </div>
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[400px]">
                    <SheetHeader>
                      <SheetTitle>Filtros</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      <div>
                        <Label className="block text-sm font-medium mb-2">
                          Categoría
                        </Label>
                        <Select
                          value={filterCategory}
                          onValueChange={(value) => {
                            setFilterCategory(value);
                            setCurrentPage(0);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Todas las categorías" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              Todas las categorías
                            </SelectItem>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={category.name}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={clearFilters}
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Limpiar
                        </Button>
                        <Button
                          onClick={() => setFiltersOpen(false)}
                          className="flex-1"
                        >
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              {(searchTerm || filterCategory !== "all") && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs">
                      Búsqueda: {searchTerm}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => setSearchTerm("")}
                      />
                    </Badge>
                  )}
                  {filterCategory !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Categoría: {filterCategory}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => setFilterCategory("all")}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Desktop - Filtros inline */}
            <div className="hidden md:flex flex-col gap-3 md:gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar producto o proveedor..."
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
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-auto">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 md:opacity-0">
                  Limpiar
                </label>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full md:w-auto"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contenido principal */}
        {loading && !modalOpen && !categoryModalOpen ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Vista de tarjetas para móviles */}
            {viewMode === "cards" && (
              <div className="space-y-3">
                {paginatedData.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No hay productos en el inventario
                    </CardContent>
                  </Card>
                ) : (
                  paginatedData.map((item) => (
                    <MobileProductCard
                      key={item.id}
                      item={item}
                      isSelected={selected.has(item.id)}
                      onToggleSelect={handleToggleSelect}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            )}

            {/* Vista de tabla para desktop */}
            {viewMode === "table" && (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="w-12 px-2 sm:px-4 py-3">
                        <Checkbox
                          checked={
                            selected.size === paginatedData.length &&
                            paginatedData.length > 0
                          }
                          onCheckedChange={handleToggleSelectAll}
                          aria-label="Select all items"
                        />
                      </th>
                      <th className="px-2 sm:px-4 py-3 text-left">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Producto
                        </span>
                      </th>
                      <th className="hidden md:table-cell px-4 py-3 text-left">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Categoría
                        </span>
                      </th>
                      <th className="px-2 sm:px-4 py-3 text-left">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Stock
                        </span>
                      </th>
                      <th className="hidden sm:table-cell px-4 py-3 text-left">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Precio
                        </span>
                      </th>
                      <th className="hidden lg:table-cell px-4 py-3 text-left">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Marca
                        </span>
                      </th>
                      <th className="hidden lg:table-cell px-4 py-3 text-left">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">
                          Fecha
                        </span>
                      </th>
                      <th className="px-2 sm:px-4 py-3 text-right">
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
                          colSpan={8}
                          className="px-4 py-12 text-center text-muted-foreground"
                        >
                          No hay productos en el inventario
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
            )}

            {/* Paginación - Responsive */}
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
                  className="hidden sm:flex h-8 w-8 p-0"
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
                  className="hidden sm:flex h-8 w-8 p-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <ProductModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
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
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToDelete
                ? "Esta acción eliminará la categoría permanentemente. Los productos con esta categoría podrían quedar sin asignar."
                : "Esta acción eliminará el producto permanentemente del inventario."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (categoryToDelete) {
                  deleteCategory(categoryToDelete);
                } else if (itemToDelete) {
                  deleteInventoryItem(itemToDelete);
                }
              }}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InventoryTable;
