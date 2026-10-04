export type InvitationStatus = "pendiente" | "confirmada" | "presente";
export type GuestType = "principal" | "acompanante";

export interface Guest {
  id: string;
  invitationId: string;
  nombre: string;
  tipo: GuestType;
  presente: boolean;
  horaIngreso: string | null;
}

export interface Invitation {
  id: string;
  codigo: string;
  codigoVerificacion?: string | null;
  nombrePrincipal: string;
  mensaje: string | null;
  estado: InvitationStatus;
  guests: Guest[];
}

export interface InvitationSummary {
  id: string;
  codigo: string;
  codigoVerificacion?: string | null;
  nombrePrincipal: string;
  estado: InvitationStatus;
  totalInvitados: number;
  presentes: number;
  acompanantes: number;
}

export interface VerifyInvitationResponse {
  id: string;
  codigo: string;
  codigoVerificacion?: string | null;
  estado: InvitationStatus;
  guests: Guest[];
  invitadoPrincipal: string;
  acompanantes: string[];
  totalInvitados: number;
  mensaje: string;
}

export interface DashboardStatistics {
  invitaciones: number;
  invitados: number;
  confirmados: number;
  presentes: number;
  pendientes: number;
  pendientesDeLlegada: number;
  solicitudesPendientes: number;
}

export interface AdminProfile {
  id: string;
  email: string;
  nombre: string;
}

export interface AttendanceRecordRow {
  id: string;
  nombre: string;
  codigo: string;
  horaIngreso: string;
  registradoPor: string;
}

export type ConfirmationStatus = "pendiente" | "aceptada" | "rechazada";

export interface ConfirmationRequest {
  id: string;
  nombre: string;
  estado: ConfirmationStatus;
  codigoVerificacion?: string | null;
  acompanantes: string[];
  createdAt: string;
}
