import { appointmentRepository } from "../repository/appointmentsRepository";
import {
  GetAppointment,
  CreateAppointment,
  UpdateAppointment,
} from "../types/models/entity";

export async function getAppointmentById(
  id: string,
): Promise<GetAppointment | null> {
  const appointmentId = parseInt(id, 10);

  const data = await appointmentRepository.findById(appointmentId);

  return data;
}

export async function getAllAppointment(): Promise<GetAppointment[] | []> {
  const data = await appointmentRepository.findMany();

  return data;
}

export async function createAppointment(data: CreateAppointment) {
  const exists = await appointmentRepository.existsInSameHour(
    data.appointmentDate,
  );

  if (exists) {
    throw new Error("Ya existe una cita agendada para esta fecha y hora");
  }

  // Crear usando tus mismos nombres
  const appointmentCreate = await appointmentRepository.create(data);

  return appointmentCreate;
}

export async function deleteAppointment(id: string): Promise<boolean> {
  const appointmentId = parseInt(id, 10);

  const appointmentDelete = await appointmentRepository.delete(appointmentId);

  return appointmentDelete;
}

export async function updateAppointment(id: string, input: UpdateAppointment) {
  const appointmentId = parseInt(id, 10);

  // Si están cambiando la fecha o la hora
  if (input.time?.appointmentDate || input.time?.appointmentTime) {
    const current = await appointmentRepository.findById(appointmentId);

    if (!current) throw new Error("La cita no existe");

    // Mantener valores actuales si no los cambian
    const currentDate = current.appointmentDate.toISOString().split("T")[0];
    const currentTime = current.appointmentDate
      .toISOString()
      .split("T")[1]
      .slice(0, 5);

    const newDate = input.time?.appointmentDate ?? currentDate;
    const newTime = input.time?.appointmentTime ?? currentTime;

    const appointmentDate = new Date(`${newDate}T${newTime}`);

    // 🚀 VALIDACIÓN CORREGIDA
    const exists = await appointmentRepository.existsInSameHour(
      appointmentDate,
      appointmentId, // <--- EXCLUYE LA MISMA CITA
    );

    if (exists) {
      throw new Error("Ya existe una cita agendada para esta fecha y hora");
    }
  }

  return await appointmentRepository.update(appointmentId, input);
}
