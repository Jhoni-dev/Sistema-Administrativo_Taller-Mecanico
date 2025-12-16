"use client";

import { useEffect, useState } from "react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Prisma } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type GetAppointment = Prisma.AppointmentSchedulingGetPayload<{
  select: {
    id: true;
    appointmentDate: true;
    ubicacion: true;
    appointmentState: true;
    details: true;
    author: {
      select: {
        id: true;
        fullName: true;
        fullSurname: true;
        identified: true;
      };
    };
    employedAuthor: {
      select: {
        id: true;
        name: true;
        identificacion: true;
        role: true;
      };
    };
  };
}>;

type GetInvoice = Prisma.InvoiceGetPayload<{
  include: {
    author: {
      select: {
        fullName: true;
        fullSurname: true;
      };
    };
    invoiceDetail: {
      select: {
        amount: true;
        subtotal: true;
        pieceExtra: true;
        serviceExtra: true;
        description: true;
        pieces: {
          select: {
            name: true;
            price: true;
          };
        };
        purchasedService: {
          select: {
            name: true;
            price: true;
          };
        };
      };
    };
  };
}>;

interface DashboardMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  totalAppointments: number;
  appointmentsGrowth: number;
  completedAppointments: number;
  completionRate: number;
  averageInvoiceValue: number;
  invoiceGrowth: number;
}

export function SectionCards() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    revenueGrowth: 0,
    totalAppointments: 0,
    appointmentsGrowth: 0,
    completedAppointments: 0,
    completionRate: 0,
    averageInvoiceValue: 0,
    invoiceGrowth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch ambos endpoints en paralelo
        const [appointmentsRes, invoicesRes] = await Promise.all([
          fetch("backend/api/protected/appointment"),
          fetch("backend/api/protected/invoice"),
        ]);

        if (!appointmentsRes.ok || !invoicesRes.ok) {
          throw new Error("Error al obtener los datos");
        }

        const appointments: GetAppointment[] = await appointmentsRes.json();
        const invoices: GetInvoice[] = await invoicesRes.json();

        // Calcular métricas
        const calculatedMetrics = calculateMetrics(appointments, invoices);
        setMetrics(calculatedMetrics);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        console.error("Error fetching metrics:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  function calculateMetrics(
    appointments: GetAppointment[],
    invoices: GetInvoice[]
  ): DashboardMetrics {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Filtrar datos del mes actual y anterior
    // Usar createAt (no createdAt) según la estructura real
    const currentMonthInvoices = invoices.filter((invoice) => {
      const date = new Date(invoice.createAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const lastMonthInvoices = invoices.filter((invoice) => {
      const date = new Date(invoice.createAt);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    const currentMonthAppointments = appointments.filter((apt) => {
      const date = new Date(apt.appointmentDate);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const lastMonthAppointments = appointments.filter((apt) => {
      const date = new Date(apt.appointmentDate);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    // 1. Total Revenue (mes actual)
    // Usar el campo "total" que es un string en la factura
    const totalRevenue = currentMonthInvoices.reduce((sum, invoice) => {
      const total = Number(invoice.total) || 0;
      return sum + total;
    }, 0);

    const lastMonthRevenue = lastMonthInvoices.reduce((sum, invoice) => {
      const total = Number(invoice.total) || 0;
      return sum + total;
    }, 0);

    const revenueGrowth =
      lastMonthRevenue > 0
        ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : totalRevenue > 0 ? 100 : 0;

    // 2. Total Appointments (mes actual)
    const totalAppointments = currentMonthAppointments.length;
    const lastMonthAppointmentsCount = lastMonthAppointments.length;

    const appointmentsGrowth =
      lastMonthAppointmentsCount > 0
        ? ((totalAppointments - lastMonthAppointmentsCount) /
            lastMonthAppointmentsCount) *
          100
        : totalAppointments > 0 ? 100 : 0;

    // 3. Completed Appointments (tasa de completación)
    // El estado es "COMPLETADA" según tus datos reales
    const completedAppointments = currentMonthAppointments.filter(
      (apt) => apt.appointmentState === "COMPLETADA"
    ).length;

    const completionRate =
      totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;

    const lastMonthCompleted = lastMonthAppointments.filter(
      (apt) => apt.appointmentState === "COMPLETADA"
    ).length;

    const lastMonthCompletionRate =
      lastMonthAppointmentsCount > 0
        ? (lastMonthCompleted / lastMonthAppointmentsCount) * 100
        : 0;

    // 4. Average Invoice Value
    const averageInvoiceValue =
      currentMonthInvoices.length > 0
        ? totalRevenue / currentMonthInvoices.length
        : 0;

    const lastMonthAverage =
      lastMonthInvoices.length > 0
        ? lastMonthRevenue / lastMonthInvoices.length
        : 0;

    const invoiceGrowth =
      lastMonthAverage > 0
        ? ((averageInvoiceValue - lastMonthAverage) / lastMonthAverage) * 100
        : averageInvoiceValue > 0 ? 100 : 0;

    return {
      totalRevenue,
      revenueGrowth,
      totalAppointments,
      appointmentsGrowth,
      completedAppointments,
      completionRate: completionRate - lastMonthCompletionRate,
      averageInvoiceValue,
      invoiceGrowth,
    };
  }

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatPercentage(value: number): string {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  }

  if (error) {
    return (
      <div className="px-4 lg:px-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          Error al cargar las métricas: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Card 1: Total Revenue */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ingresos del Mes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? (
              <span className="inline-block h-9 w-40 animate-pulse rounded bg-muted" />
            ) : (
              formatCurrency(metrics.totalRevenue)
            )}
          </CardTitle>
          <CardAction>
            {isLoading ? (
              <span className="inline-block h-6 w-20 animate-pulse rounded bg-muted" />
            ) : (
              <Badge variant="outline">
                {metrics.revenueGrowth >= 0 ? (
                  <IconTrendingUp className="size-4" />
                ) : (
                  <IconTrendingDown className="size-4" />
                )}
                {formatPercentage(metrics.revenueGrowth)}
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isLoading ? (
              <span className="inline-block h-5 w-32 animate-pulse rounded bg-muted" />
            ) : metrics.revenueGrowth >= 0 ? (
              <>
                Crecimiento este mes <IconTrendingUp className="size-4" />
              </>
            ) : (
              <>
                Disminución este mes <IconTrendingDown className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            Comparado con el mes anterior
          </div>
        </CardFooter>
      </Card>

      {/* Card 2: Total Appointments */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Citas Agendadas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? (
              <span className="inline-block h-9 w-24 animate-pulse rounded bg-muted" />
            ) : (
              metrics.totalAppointments.toLocaleString()
            )}
          </CardTitle>
          <CardAction>
            {isLoading ? (
              <span className="inline-block h-6 w-20 animate-pulse rounded bg-muted" />
            ) : (
              <Badge variant="outline">
                {metrics.appointmentsGrowth >= 0 ? (
                  <IconTrendingUp className="size-4" />
                ) : (
                  <IconTrendingDown className="size-4" />
                )}
                {formatPercentage(metrics.appointmentsGrowth)}
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isLoading ? (
              <span className="inline-block h-5 w-32 animate-pulse rounded bg-muted" />
            ) : metrics.appointmentsGrowth >= 0 ? (
              <>
                Incremento en demanda <IconTrendingUp className="size-4" />
              </>
            ) : (
              <>
                Reducción en citas <IconTrendingDown className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            Citas programadas este mes
          </div>
        </CardFooter>
      </Card>

      {/* Card 3: Completion Rate */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tasa de Completación</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? (
              <span className="inline-block h-9 w-24 animate-pulse rounded bg-muted" />
            ) : (
              `${metrics.completedAppointments}/${metrics.totalAppointments}`
            )}
          </CardTitle>
          <CardAction>
            {isLoading ? (
              <span className="inline-block h-6 w-20 animate-pulse rounded bg-muted" />
            ) : (
              <Badge variant="outline">
                {metrics.completionRate >= 0 ? (
                  <IconTrendingUp className="size-4" />
                ) : (
                  <IconTrendingDown className="size-4" />
                )}
                {formatPercentage(metrics.completionRate)}
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isLoading ? (
              <span className="inline-block h-5 w-32 animate-pulse rounded bg-muted" />
            ) : metrics.completionRate >= 0 ? (
              <>
                Mejora en eficiencia <IconTrendingUp className="size-4" />
              </>
            ) : (
              <>
                Requiere atención <IconTrendingDown className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            Citas completadas vs agendadas
          </div>
        </CardFooter>
      </Card>

      {/* Card 4: Average Invoice Value */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ticket Promedio</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? (
              <span className="inline-block h-9 w-40 animate-pulse rounded bg-muted" />
            ) : (
              formatCurrency(metrics.averageInvoiceValue)
            )}
          </CardTitle>
          <CardAction>
            {isLoading ? (
              <span className="inline-block h-6 w-20 animate-pulse rounded bg-muted" />
            ) : (
              <Badge variant="outline">
                {metrics.invoiceGrowth >= 0 ? (
                  <IconTrendingUp className="size-4" />
                ) : (
                  <IconTrendingDown className="size-4" />
                )}
                {formatPercentage(metrics.invoiceGrowth)}
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isLoading ? (
              <span className="inline-block h-5 w-32 animate-pulse rounded bg-muted" />
            ) : metrics.invoiceGrowth >= 0 ? (
              <>
                Aumento en valor promedio <IconTrendingUp className="size-4" />
              </>
            ) : (
              <>
                Disminución en ticket <IconTrendingDown className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            Valor promedio por factura
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}