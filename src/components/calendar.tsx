"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Calendar,
  Filter,
  X,
} from "lucide-react";
import { json } from "zod";

type AppointmentStatus = "ASIGNADA" | "COMPLETADA" | "PENDIENTE" | "CANCELADA";

type Appointment = {
  id: number;
  appointmentDate: Date | string; // Changed from just Date
  ubicacion: string;
  appointmentState: AppointmentStatus;
  details: string | null;
  author: {
    id: number;
    fullName: string;
    fullSurname: string;
    identified: string;
  };
  employedAuthor: {
    id: number;
    name: string;
    identificacion: string;
    role: string;
  } | null;
};

const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
  const config = {
    ASIGNADA: {
      icon: CheckCircle2,
      className:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      label: "Asignada",
    },
    COMPLETADA: {
      icon: CheckCircle2,
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      label: "Completada",
    },
    PENDIENTE: {
      icon: Clock,
      className:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      label: "Pendiente",
    },
    CANCELADA: {
      icon: AlertCircle,
      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      label: "Cancelada",
    },
  };
  const { icon: Icon, className, label } = config[status];
  return (
    <Badge variant="secondary" className={`gap-1 text-xs ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

export default function AppointmentsCalendar() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<{
    year: number;
    month: number;
    day: number;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState<AppointmentStatus[]>([]);

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const dayNamesShort = ["D", "L", "M", "X", "J", "V", "S"]; // Para móviles

  // Cargar citas desde la API
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/backend/api/protected/appointment");

      if (!response.ok) {
        throw new Error("Error al cargar las citas");
      }

      const data = await response.json();

      console.log(data);
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      alert("Error al cargar las citas");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar citas por estado (múltiples filtros)
  const filteredAppointments = useMemo(() => {
    if (statusFilters.length === 0) {
      return appointments;
    }
    return appointments.filter((apt) =>
      statusFilters.includes(apt.appointmentState)
    );
  }, [appointments, statusFilters]);

  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};

    filteredAppointments.forEach((apt) => {
      const date = new Date(apt.appointmentDate);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(apt);
    });

    // Ordenar por hora
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => {
        const timeA = new Date(a.appointmentDate).getTime();
        const timeB = new Date(b.appointmentDate).getTime();
        return timeA - timeB;
      });
    });

    return grouped;
  }, [filteredAppointments]);

  // Estadísticas de citas
  const appointmentStats = useMemo(() => {
    return {
      asignadas: appointments.filter(
        (apt) => apt.appointmentState === "ASIGNADA"
      ).length,
      completadas: appointments.filter(
        (apt) => apt.appointmentState === "COMPLETADA"
      ).length,
      pendientes: appointments.filter(
        (apt) => apt.appointmentState === "PENDIENTE"
      ).length,
      canceladas: appointments.filter(
        (apt) => apt.appointmentState === "CANCELADA"
      ).length,
    };
  }, [appointments]);

  // Toggle filtro de estado
  const toggleStatusFilter = (status: AppointmentStatus) => {
    setStatusFilters((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setStatusFilters([]);
  };

  // Verificar si un filtro está activo
  const isFilterActive = (status: AppointmentStatus) => {
    return statusFilters.includes(status);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      daysInMonth: lastDay.getDate(),
      startingDayOfWeek: firstDay.getDay(),
    };
  };

  const formatDateKey = (year: number, month: number, day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const handleDayClick = (day: number) => {
    setSelectedDate({
      year: currentDate.getFullYear(),
      month: currentDate.getMonth(),
      day,
    });
    setIsDialogOpen(true);
  };

  const handleToggleComplete = async (appointmentId: number) => {
    const appointment = appointments.find((apt) => apt.id === appointmentId);
    if (!appointment) return;

    const newStatus: AppointmentStatus =
      appointment.appointmentState === "COMPLETADA" ? "ASIGNADA" : "COMPLETADA";

    try {
      const response = await fetch(
        `/backend/api/protected/appointment/${appointmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointmentState: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar la cita");
      }

      // Actualizar el estado local
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId
            ? { ...apt, appointmentState: newStatus }
            : apt
        )
      );
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Error al actualizar la cita");
    }
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  const isCurrentMonth = () => {
    const today = new Date();
    return (
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const formatTime = (dateInput: Date | string) => {
    let date: Date;

    if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      // Remover la 'Z' para interpretar como hora local colombiana
      const localDateString = dateInput.replace("Z", "");
      date = new Date(localDateString);
    }

    return date.toLocaleTimeString("es-CO", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderCalendarDays = () => {
    const days: React.ReactNode[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-16 sm:h-24 border border-border bg-muted/30"
        />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dayAppointments = appointmentsByDate[dateKey] || [];
      const isToday =
        new Date().toDateString() ===
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          day
        ).toDateString();

      days.push(
        <div
          key={day}
          onClick={() => handleDayClick(day)}
          className={`h-16 sm:h-24 border border-border p-1 sm:p-2 cursor-pointer hover:bg-muted/50 transition-colors ${
            isToday
              ? "bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700"
              : "bg-background"
          }`}
        >
          <div
            className={`font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 ${
              isToday ? "text-blue-600 dark:text-blue-400" : "text-foreground"
            }`}
          >
            {day}
          </div>
          <div className="space-y-0.5 sm:space-y-1 overflow-hidden">
            {dayAppointments.slice(0, 1).map((apt) => (
              <div
                key={apt.id}
                className={`text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded truncate ${
                  apt.appointmentState === "COMPLETADA"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : apt.appointmentState === "ASIGNADA"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      : apt.appointmentState === "PENDIENTE"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                <span className="hidden sm:inline">
                  {formatTime(apt.appointmentDate)} - {apt.author.fullName}
                </span>
                <span className="sm:hidden">
                  {formatTime(apt.appointmentDate)}
                </span>
              </div>
            ))}
            {dayAppointments.length > 1 && (
              <div className="text-[10px] sm:text-xs text-muted-foreground">
                +{dayAppointments.length - 1} más
              </div>
            )}
          </div>
        </div>
      );
    }
    return days;
  };

  const selectedDateKey = selectedDate
    ? formatDateKey(selectedDate.year, selectedDate.month, selectedDate.day)
    : null;
  const selectedDateAppointments = selectedDateKey
    ? appointmentsByDate[selectedDateKey] || []
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Cargando citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
            Calendario de Citas
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Visualiza y gestiona las citas programadas
          </p>
        </div>

        {/* Estadísticas y Filtros - Grid responsivo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Card
            className={`cursor-pointer transition-all ${
              isFilterActive("ASIGNADA")
                ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30"
                : "hover:bg-blue-50 dark:hover:bg-blue-950/20"
            }`}
            onClick={() => toggleStatusFilter("ASIGNADA")}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    Asignadas
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {appointmentStats.asignadas}
                  </p>
                </div>
                <CheckCircle2
                  className={`h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 ml-2 ${
                    isFilterActive("ASIGNADA")
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-blue-400 dark:text-blue-500"
                  }`}
                />
              </div>
              {isFilterActive("ASIGNADA") && (
                <div className="mt-2 text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 font-medium">
                  ✓ Activo
                </div>
              )}
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              isFilterActive("COMPLETADA")
                ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-950/30"
                : "hover:bg-green-50 dark:hover:bg-green-950/20"
            }`}
            onClick={() => toggleStatusFilter("COMPLETADA")}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    Completadas
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                    {appointmentStats.completadas}
                  </p>
                </div>
                <CheckCircle2
                  className={`h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 ml-2 ${
                    isFilterActive("COMPLETADA")
                      ? "text-green-600 dark:text-green-400"
                      : "text-green-400 dark:text-green-500"
                  }`}
                />
              </div>
              {isFilterActive("COMPLETADA") && (
                <div className="mt-2 text-[10px] sm:text-xs text-green-600 dark:text-green-400 font-medium">
                  ✓ Activo
                </div>
              )}
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              isFilterActive("PENDIENTE")
                ? "ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/30"
                : "hover:bg-amber-50 dark:hover:bg-amber-950/20"
            }`}
            onClick={() => toggleStatusFilter("PENDIENTE")}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    Pendientes
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {appointmentStats.pendientes}
                  </p>
                </div>
                <Clock
                  className={`h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 ml-2 ${
                    isFilterActive("PENDIENTE")
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-amber-400 dark:text-amber-500"
                  }`}
                />
              </div>
              {isFilterActive("PENDIENTE") && (
                <div className="mt-2 text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 font-medium">
                  ✓ Activo
                </div>
              )}
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              isFilterActive("CANCELADA")
                ? "ring-2 ring-red-500 bg-red-50 dark:bg-red-950/30"
                : "hover:bg-red-50 dark:hover:bg-red-950/20"
            }`}
            onClick={() => toggleStatusFilter("CANCELADA")}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    Canceladas
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
                    {appointmentStats.canceladas}
                  </p>
                </div>
                <AlertCircle
                  className={`h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 ml-2 ${
                    isFilterActive("CANCELADA")
                      ? "text-red-600 dark:text-red-400"
                      : "text-red-400 dark:text-red-500"
                  }`}
                />
              </div>
              {isFilterActive("CANCELADA") && (
                <div className="mt-2 text-[10px] sm:text-xs text-red-600 dark:text-red-400 font-medium">
                  ✓ Activo
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendario */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            {/* Controles del calendario */}
            <div className="flex flex-col gap-3">
              {/* Navegación de mes */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentDate(
                      (prev) =>
                        new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                    )
                  }
                  className="h-8 w-8 sm:h-10 sm:w-10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <CardTitle className="text-base sm:text-xl md:text-2xl text-center">
                  <span className="hidden sm:inline">
                    {monthNames[currentDate.getMonth()]}{" "}
                    {currentDate.getFullYear()}
                  </span>
                  <span className="sm:hidden">
                    {monthNames[currentDate.getMonth()].substring(0, 3)}{" "}
                    {currentDate.getFullYear()}
                  </span>
                </CardTitle>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentDate(
                      (prev) =>
                        new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                    )
                  }
                  className="h-8 w-8 sm:h-10 sm:w-10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  {statusFilters.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFilters}
                      className="gap-1 text-xs h-8 w-full sm:w-auto"
                    >
                      <Filter className="h-3 w-3" />
                      <span className="hidden sm:inline">Limpiar filtros</span>
                      <span className="sm:hidden">Limpiar</span>
                      <span className="ml-1">({statusFilters.length})</span>
                    </Button>
                  )}
                </div>

                {!isCurrentMonth() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGoToToday}
                    className="gap-1 text-xs h-8"
                  >
                    <Calendar className="h-3 w-3" />
                    <span className="hidden sm:inline">Hoy</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Badges de filtros activos */}
            {statusFilters.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                {statusFilters.map((filter) => (
                  <Badge
                    key={filter}
                    variant="secondary"
                    className={`gap-1 text-[10px] sm:text-xs ${
                      filter === "ASIGNADA"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        : filter === "COMPLETADA"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : filter === "PENDIENTE"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    <Filter className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span className="hidden sm:inline">{filter}</span>
                    <span className="sm:hidden">
                      {filter === "ASIGNADA"
                        ? "Asig"
                        : filter === "COMPLETADA"
                          ? "Comp"
                          : filter === "PENDIENTE"
                            ? "Pend"
                            : "Canc"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStatusFilter(filter);
                      }}
                      className="ml-0.5 sm:ml-1 hover:bg-muted rounded-full px-0.5 sm:px-1 transition-colors"
                    >
                      <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>

          <CardContent className="p-2 sm:p-6">
            {/* Nombres de los días */}
            <div className="grid grid-cols-7 gap-0 mb-1 sm:mb-2">
              {/* Versión móvil (letras) */}
              <div className="sm:hidden contents">
                {dayNamesShort.map((day) => (
                  <div
                    key={day}
                    className="text-center font-semibold text-xs py-1.5 bg-muted border border-border"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Versión desktop (nombres completos) */}
              <div className="hidden sm:contents">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center font-semibold py-2 bg-muted border border-border text-sm"
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-0">{renderCalendarDays()}</div>
          </CardContent>
        </Card>

        {/* Dialog de detalles del día */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                {selectedDate
                  ? `${selectedDate.day} de ${monthNames[selectedDate.month]} ${selectedDate.year}`
                  : "Selecciona una fecha"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 sm:space-y-4">
              {selectedDateAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    {statusFilters.length === 0
                      ? "No hay citas programadas para este día"
                      : statusFilters.length === 1
                        ? `No hay citas ${statusFilters[0].toLowerCase()} para este día`
                        : `No hay citas con los filtros seleccionados para este día`}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {selectedDateAppointments.map((apt) => (
                    <Card
                      key={apt.id}
                      className={
                        apt.appointmentState === "COMPLETADA"
                          ? "opacity-75"
                          : ""
                      }
                    >
                      <CardContent className="p-3 sm:p-4">
                        {/* Header con hora y badge */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="text-base sm:text-lg font-semibold text-blue-600 dark:text-blue-400">
                              {formatTime(apt.appointmentDate)}
                            </div>
                            <StatusBadge status={apt.appointmentState} />
                          </div>
                          <Button
                            variant={
                              apt.appointmentState === "COMPLETADA"
                                ? "outline"
                                : "default"
                            }
                            size="sm"
                            onClick={() => handleToggleComplete(apt.id)}
                            disabled={apt.appointmentState === "CANCELADA"}
                            className="w-full sm:w-auto text-xs h-8"
                          >
                            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden sm:inline">
                              {apt.appointmentState === "COMPLETADA"
                                ? "Completada"
                                : "Marcar Completa"}
                            </span>
                            <span className="sm:hidden">
                              {apt.appointmentState === "COMPLETADA"
                                ? "Completada"
                                : "Completar"}
                            </span>
                          </Button>
                        </div>

                        {/* Información */}
                        <div className="grid grid-cols-1 gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-foreground truncate">
                                {apt.author.fullName} {apt.author.fullSurname}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                ID: {apt.author.identified}
                              </div>
                            </div>
                          </div>

                          {apt.employedAuthor && (
                            <div className="flex items-start gap-2">
                              <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="text-foreground truncate">
                                  {apt.employedAuthor.name}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  {apt.employedAuthor.role}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="text-foreground break-words">
                              {apt.ubicacion}
                            </div>
                          </div>
                        </div>

                        {/* Detalles adicionales */}
                        {apt.details && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">
                                Detalles:
                              </span>{" "}
                              {apt.details}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
