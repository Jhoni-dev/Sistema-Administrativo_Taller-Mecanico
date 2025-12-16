import { prisma, Prisma } from "@/lib/prisma";
import {
  CreateAppointment,
  GetAppointment,
  UpdateAppointment,
} from "../types/models/entity";
import { filterCurrent } from "../utils/filtersRepository";
import { toAppointmentCreateInput } from "../mappers/appointmentMapper";

export const appointmentRepository = {
  async findMany(): Promise<GetAppointment[] | []> {
    try {
      return await prisma.appointmentScheduling.findMany({
        orderBy: {
          id: "asc",
        },
        select: {
          id: true,
          appointmentDate: true,
          ubicacion: true,
          appointmentState: true,
          details: true,
          author: {
            select: {
              id: true,
              fullName: true,
              fullSurname: true,
              identified: true,
            },
          },
          employedAuthor: {
            select: {
              id: true,
              name: true,
              identificacion: true,
              role: true,
            },
          },
        },
      });
    } catch {
      throw new Error(
        "Ha ocurrido un error inesperado en la consulta de campos",
      );
    }
  },

  async findById(id: number): Promise<GetAppointment | null> {
    try {
      return await prisma.appointmentScheduling.findUnique({
        where: { id },
        select: {
          id: true,
          appointmentDate: true,
          ubicacion: true,
          appointmentState: true,
          details: true,
          author: {
            select: {
              id: true,
              fullName: true,
              fullSurname: true,
              identified: true,
            },
          },
          employedAuthor: {
            select: {
              id: true,
              name: true,
              identificacion: true,
              role: true,
            },
          },
        },
      });
    } catch {
      throw new Error("Ha ocurrido un error inesperado en la consulta");
    }
  },

  async create(data: CreateAppointment): Promise<boolean> {
    const prismaData = toAppointmentCreateInput(data);

    try {
      const appointmentCreate = await prisma.appointmentScheduling.create({
        data: prismaData,
      });

      return appointmentCreate ? true : false;
    } catch (error) {
      console.log(error);
      throw new Error(
        "Ha ocurrido un error inesperado en la insercion de datos",
      );
    }
  },
  async update(id: number, data: UpdateAppointment) {
    const appointmentData: Record<string, unknown> = {};
    const date: Partial<UpdateAppointment["time"]> = {};

    const allowedAppointmentFields: (keyof UpdateAppointment)[] = [
      "details",
      "employedId",
      "appointmentState",
    ];

    for (const key in data) {
      if (key === "id") continue;

      const k = key as keyof UpdateAppointment;

      if (allowedAppointmentFields.includes(k)) {
        appointmentData[k] = data[k];
      }
    }

    if (data.time) {
      if (data.time.appointmentDate !== undefined) {
        date.appointmentDate = data.time.appointmentDate;
      }
      if (data.time.appointmentTime !== undefined) {
        date.appointmentTime = data.time.appointmentTime;
      }
    }

    const current = await prisma.appointmentScheduling.findUnique({
      where: { id },
      select: {
        appointmentDate: true,
      },
    });

    const prismaData: Prisma.AppointmentSchedulingUpdateInput = {
      ...appointmentData,
      ...(() => {
        const update: Record<string, unknown> = {};

        if (date && current) {
          if ("appointmentDate" in date) {
            update.appointmentDate = filterCurrent(
              current.appointmentDate,
              date.appointmentDate,
            );
          }

          if ("appointmentTime" in date) {
            update.appointmentDate = filterCurrent(
              current.appointmentDate,
              null,
              date.appointmentTime,
            );
          }
        }

        return update;
      })(),
    };

    return prisma.appointmentScheduling.update({
      where: { id },
      data: prismaData,
      select: {
        appointmentDate: true,
        details: true,
        appointmentState: true,
        employedAuthor: {
          select: {
            name: true,
            identificacion: true,
          },
        },
      },
    });
  },

  async delete(id: number): Promise<boolean> {
    try {
      const dropAppointment = await prisma.appointmentScheduling.delete({
        where: { id },
      });

      return dropAppointment ? true : false;
    } catch {
      throw new Error(
        "Ha ocurrido un error inesperado en la eliminacion de campos",
      );
    }
  },

  async existsInSameHour(date: Date, excludeId?: number): Promise<boolean> {
    const found = await prisma.appointmentScheduling.findFirst({
      where: {
        appointmentDate: date,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });

    return found ? true : false;
  },
};
