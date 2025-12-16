"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreVertical, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

type TypeAccount = "MECANICO" | "ADMINISTRADOR";

type Session = {
  id: number;
  name: string;
  identificacion: string;
  email: string;
  role: TypeAccount;
  createdAt: string;
};

type NewMemberInput = {
  name: string;
  identificacion: string;
  email: string;
  role: TypeAccount;
  password: string;
};

const RoleBadge = ({ role }: { role: TypeAccount }) => {
  const config = {
    ADMINISTRADOR: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/30",
    MECANICO: "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/30",
  };
  const label = role === "ADMINISTRADOR" ? "Administrador" : "Mecánico";
  return (
    <Badge variant="secondary" className={config[role]}>
      {label}
    </Badge>
  );
};

export default function TeamMembers() {
  const [members, setMembers] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editMember, setEditMember] = useState<Session | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [newMember, setNewMember] = useState<NewMemberInput>({
    name: "",
    identificacion: "",
    email: "",
    role: "MECANICO",
    password: "",
  });

  // Cargar miembros del equipo
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/backend/api/protected/user");
      if (!response.ok) throw new Error("Error al cargar miembros");
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar los miembros del equipo");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    try {
      let date: Date;

      if (dateString.includes("T")) {
        date = new Date(dateString);
      } else if (dateString.includes(" ")) {
        const fixed = dateString.replace(" ", "T");
        date = new Date(fixed);
      } else {
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) return "Fecha inválida";

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Justo ahora";
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays === 1) return "1 day ago";
      if (diffDays < 7) return `${diffDays} days ago`;

      return date.toLocaleDateString();
    } catch (error) {
      console.error("Error formateando fecha:", error);
      return "Fecha inválida";
    }
  };

  const handleAddMember = async () => {
    try {
      setIsSubmitting(true);

      const response = await fetch("/backend/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear miembro");
      }

      const createdMember = await response.json();

      // Actualizar la lista agregando el nuevo miembro
      setMembers((prevMembers) => [...prevMembers, createdMember]);
      
      setIsAddDialogOpen(false);
      setNewMember({
        name: "",
        identificacion: "",
        email: "",
        role: "MECANICO",
        password: "",
      });

      toast.success(`${createdMember.name} ha sido agregado exitosamente`);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo agregar el miembro",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este miembro?")) return;

    try {
      const response = await fetch(`/backend/api/protected/user/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar miembro");

      // Actualizar la lista eliminando el miembro
      setMembers((prevMembers) => prevMembers.filter((m) => m.id !== id));

      toast.success("El miembro ha sido eliminado exitosamente");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar el miembro");
    }
  };

  const handleEditMember = (id: number) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;

    setEditMember(member);
    setIsEditDialogOpen(true);
  };

  const handleUpdateMember = async () => {
    if (!editMember) return;

    try {
      setIsEditing(true);

      const response = await fetch(
        `/backend/api/protected/user/${editMember.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editMember.name,
            identificacion: editMember.identificacion,
            email: editMember.email,
            role: editMember.role,
          }),
        },
      );

      if (!response.ok) throw new Error("Error al actualizar");

      const updated = await response.json();

      // Actualizar la lista con el miembro editado
      setMembers((prevMembers) =>
        prevMembers.map((m) => (m.id === updated.id ? updated : m))
      );

      setIsEditDialogOpen(false);
      setEditMember(null);
      toast.success("Miembro actualizado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo actualizar el miembro");
    } finally {
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">
              Team Members
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {members.length} {members.length === 1 ? "miembro" : "miembros"}
            </p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="default"
            className="w-full sm:w-auto"
          >
            Agregar personal
          </Button>
        </div>

        {/* Lista de miembros */}
        <Card>
          <CardContent className="p-0">
            {members.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No hay miembros en el equipo. Agrega el primero.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {members.map((member) => {
                  // Verificar que member.id existe y es válido
                  if (!member.id) {
                    console.warn("Member without valid id:", member);
                    return null;
                  }

                  return (
                    <div
                      key={`member-${member.id}`}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 hover:bg-muted/50 transition-colors gap-4"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                            alt={member.name}
                          />
                          <AvatarFallback className="bg-muted text-foreground">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {member.name}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {member.email}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            ID: {member.identificacion}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0 sm:ml-4">
                        <RoleBadge role={member.role} />

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditMember(member.id)}
                            >
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteMember(member.id)}
                              className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog para editar miembro */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Miembro</DialogTitle>
          </DialogHeader>

          {editMember && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre Completo</Label>
                <Input
                  id="edit-name"
                  value={editMember.name}
                  onChange={(e) =>
                    setEditMember({ ...editMember, name: e.target.value })
                  }
                  disabled={isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-identificacion">Identificación</Label>
                <Input
                  id="edit-identificacion"
                  value={editMember.identificacion}
                  onChange={(e) =>
                    setEditMember({
                      ...editMember,
                      identificacion: e.target.value,
                    })
                  }
                  disabled={isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editMember.email}
                  onChange={(e) =>
                    setEditMember({ ...editMember, email: e.target.value })
                  }
                  disabled={isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role">Rol</Label>
                <Select
                  value={editMember.role}
                  onValueChange={(v: TypeAccount) =>
                    setEditMember({ ...editMember, role: v })
                  }
                  disabled={isEditing}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MECANICO">Mecánico</SelectItem>
                    <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isEditing}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>

            <Button
              onClick={handleUpdateMember}
              disabled={isEditing}
              className="w-full sm:w-auto"
            >
              {isEditing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para agregar miembro */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Miembro</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                value={newMember.name}
                onChange={(e) =>
                  setNewMember({ ...newMember, name: e.target.value })
                }
                placeholder="Juan Pérez"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="identificacion">Identificación</Label>
              <Input
                id="identificacion"
                value={newMember.identificacion}
                onChange={(e) =>
                  setNewMember({ ...newMember, identificacion: e.target.value })
                }
                placeholder="1234567890"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newMember.email}
                onChange={(e) =>
                  setNewMember({ ...newMember, email: e.target.value })
                }
                placeholder="juan@example.com"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={newMember.password}
                onChange={(e) =>
                  setNewMember({ ...newMember, password: e.target.value })
                }
                placeholder="••••••••"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={newMember.role}
                onValueChange={(value: TypeAccount) =>
                  setNewMember({ ...newMember, role: value })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MECANICO">Mecánico</SelectItem>
                  <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddMember}
              disabled={
                !newMember.name ||
                !newMember.email ||
                !newMember.identificacion ||
                !newMember.password ||
                isSubmitting
              }
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agregando...
                </>
              ) : (
                "Agregar Miembro"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}