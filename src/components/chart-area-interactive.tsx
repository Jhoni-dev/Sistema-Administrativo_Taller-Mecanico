"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Calendar, Receipt, Activity } from "lucide-react";
import { Prisma } from "@prisma/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

interface ChartDataPoint {
  date: string;
  citas: number;
  facturas: number;
}

const chartConfig = {
  actividad: {
    label: "Actividad",
  },
  citas: {
    label: "Citas",
    color: "hsl(var(--chart-1))",
  },
  facturas: {
    label: "Facturas",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function ChartCitasFacturas() {
  const [timeRange, setTimeRange] = React.useState("90d");
  const [chartData, setChartData] = React.useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchData() {
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

        // Procesar los datos y agrupar por fecha
        const dataByDate = new Map<string, { citas: number; facturas: number }>();

        // Procesar citas
        appointments.forEach((appointment) => {
          const date = new Date(appointment.appointmentDate);
          if (isNaN(date.getTime())) return; // Skip invalid dates
          
          const dateKey = date.toISOString().split("T")[0];

          if (!dataByDate.has(dateKey)) {
            dataByDate.set(dateKey, { citas: 0, facturas: 0 });
          }

          const current = dataByDate.get(dateKey)!;
          current.citas += 1;
        });

        // Procesar facturas - usar createAt
        invoices.forEach((invoice) => {
          const date = new Date(invoice.createAt);
          if (isNaN(date.getTime())) {
            console.warn('Invoice with invalid date:', invoice.id);
            return;
          }

          const dateKey = date.toISOString().split("T")[0];

          if (!dataByDate.has(dateKey)) {
            dataByDate.set(dateKey, { citas: 0, facturas: 0 });
          }

          const current = dataByDate.get(dateKey)!;
          current.facturas += 1;
        });

        // Convertir a array y ordenar por fecha
        const processedData: ChartDataPoint[] = Array.from(dataByDate.entries())
          .map(([date, counts]) => ({
            date,
            citas: counts.citas,
            facturas: counts.facturas,
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Rellenar fechas faltantes con ceros
        const filledData = fillMissingDates(processedData);

        setChartData(filledData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  function fillMissingDates(data: ChartDataPoint[]): ChartDataPoint[] {
    if (data.length === 0) return [];

    const filled: ChartDataPoint[] = [];
    const startDate = new Date(data[0].date);
    const endDate = new Date(data[data.length - 1].date);

    const dataMap = new Map(data.map((d) => [d.date, d]));

    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const dateKey = date.toISOString().split("T")[0];
      filled.push(
        dataMap.get(dateKey) || {
          date: dateKey,
          citas: 0,
          facturas: 0,
        }
      );
    }

    return filled;
  }

  const filteredData = React.useMemo(() => {
    if (chartData.length === 0) return [];

    const now = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return chartData.filter((item) => {
      const date = new Date(item.date);
      return date >= startDate && date <= now;
    });
  }, [chartData, timeRange]);

  // Calcular totales y tendencias
  const stats = React.useMemo(() => {
    const totals = filteredData.reduce(
      (acc, item) => ({
        citas: acc.citas + item.citas,
        facturas: acc.facturas + item.facturas,
        total: acc.total + item.citas + item.facturas,
      }),
      { citas: 0, facturas: 0, total: 0 }
    );

    // Calcular promedios
    const avgCitas = filteredData.length > 0 ? totals.citas / filteredData.length : 0;
    const avgFacturas = filteredData.length > 0 ? totals.facturas / filteredData.length : 0;

    // Calcular tendencia (comparar primera y segunda mitad del período)
    const midPoint = Math.floor(filteredData.length / 2);
    const firstHalf = filteredData.slice(0, midPoint);
    const secondHalf = filteredData.slice(midPoint);

    const firstHalfTotal = firstHalf.reduce((sum, item) => sum + item.citas + item.facturas, 0);
    const secondHalfTotal = secondHalf.reduce((sum, item) => sum + item.citas + item.facturas, 0);

    const trend = secondHalfTotal > firstHalfTotal ? "up" : secondHalfTotal < firstHalfTotal ? "down" : "stable";
    const trendPercentage = firstHalfTotal > 0 
      ? Math.abs(((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100)
      : 0;

    // Encontrar día con más actividad
    const maxActivityDay = filteredData.reduce((max, item) => {
      const total = item.citas + item.facturas;
      return total > (max.citas + max.facturas) ? item : max;
    }, filteredData[0] || { date: "", citas: 0, facturas: 0 });

    return {
      totals,
      avgCitas: Math.round(avgCitas * 10) / 10,
      avgFacturas: Math.round(avgFacturas * 10) / 10,
      trend,
      trendPercentage: Math.round(trendPercentage * 10) / 10,
      maxActivityDay,
    };
  }, [filteredData]);

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Activity className="h-5 w-5" />
            Error al Cargar Datos
          </CardTitle>
          <CardDescription>No se pudieron obtener las métricas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="text-sm text-primary hover:underline"
              >
                Reintentar
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-pulse" />
            Actividad General
          </CardTitle>
          <CardDescription>Cargando datos...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] items-center justify-center">
            <div className="space-y-4 text-center">
              <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Obteniendo métricas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad General
          </CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] items-center justify-center">
            <div className="text-center space-y-2">
              <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No hay datos para el período seleccionado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Activity className="h-6 w-6 text-primary" />
              Actividad General
            </CardTitle>
            <CardDescription className="text-base">
              Seguimiento de citas y facturación
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {stats.trend === "up" && (
              <Badge variant="default" className="gap-1 bg-green-500 hover:bg-green-600">
                <TrendingUp className="h-3 w-3" />
                +{stats.trendPercentage}%
              </Badge>
            )}
            {stats.trend === "down" && (
              <Badge variant="destructive" className="gap-1">
                <TrendingDown className="h-3 w-3" />
                -{stats.trendPercentage}%
              </Badge>
            )}
            {stats.trend === "stable" && (
              <Badge variant="secondary" className="gap-1">
                <Activity className="h-3 w-3" />
                Estable
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden sm:flex"
          >
            <ToggleGroupItem value="7d" className="px-4">
              7 días
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="px-4">
              30 días
            </ToggleGroupItem>
            <ToggleGroupItem value="90d" className="px-4">
              90 días
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36 sm:hidden" aria-label="Seleccionar período">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4 text-blue-500" />
              Total Citas
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">{stats.totals.citas}</p>
              <p className="text-xs text-muted-foreground">
                ~{stats.avgCitas}/día
              </p>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Receipt className="h-4 w-4 text-green-500" />
              Total Facturas
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">{stats.totals.facturas}</p>
              <p className="text-xs text-muted-foreground">
                ~{stats.avgFacturas}/día
              </p>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Activity className="h-4 w-4 text-purple-500" />
              Actividad Total
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">{stats.totals.total}</p>
              <p className="text-xs text-muted-foreground">
                eventos
              </p>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              Día Pico
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">
                {stats.maxActivityDay.citas + stats.maxActivityDay.facturas}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(stats.maxActivityDay.date).toLocaleDateString("es-ES", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:px-6 pb-6">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillCitas" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-citas)"
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-citas)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillFacturas" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-facturas)"
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-facturas)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                minTickGap={32}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("es-ES", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                width={30}
              />
              <ChartTooltip
                cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                content={
                  <ChartTooltipContent
                    className="w-48"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("es-ES", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                    indicator="line"
                  />
                }
              />
              <Area
                dataKey="citas"
                type="monotone"
                fill="url(#fillCitas)"
                stroke="var(--color-citas)"
                strokeWidth={2}
                stackId="a"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
              <Area
                dataKey="facturas"
                type="monotone"
                fill="url(#fillFacturas)"
                stroke="var(--color-facturas)"
                strokeWidth={2}
                stackId="a"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}