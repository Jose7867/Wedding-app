import axios from "axios";
import type {
  AdminProfile,
  AttendanceRecordRow,
  ConfirmationRequest,
  DashboardStatistics,
  Invitation,
  InvitationSummary,
  VerifyInvitationResponse,
} from "../types";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const api = axios.create({ baseURL });

// Adjunta el token JWT guardado en sesión a cada request administrativa.
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token expira o es inválido, redirige al login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && window.location.pathname.startsWith("/admin")) {
      sessionStorage.removeItem("admin_token");
      sessionStorage.removeItem("admin_profile");
      if (window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

// ---------- Público ----------
export async function verifyInvitationCode(codigo: string) {
  const { data } = await api.get<VerifyInvitationResponse>(
    `/invitations/${encodeURIComponent(codigo.trim().toUpperCase())}`
  );
  return data;
}

export async function confirmInvitation(
  codigo: string,
  payload: { guests: { id: string; nombre: string }[] }
) {
  const { data } = await api.post<VerifyInvitationResponse>(
    `/invitations/${encodeURIComponent(codigo.trim().toUpperCase())}/confirm`,
    payload
  );
  return data;
}

// ---------- Auth ----------
export async function loginAdmin(email: string, password: string) {
  const { data } = await api.post<{ token: string; admin: AdminProfile }>("/auth/login", {
    email,
    password,
  });
  return data;
}

// ---------- Dashboard ----------
export async function fetchDashboardStatistics() {
  const { data } = await api.get<DashboardStatistics>("/dashboard/statistics");
  return data;
}

// ---------- Invitaciones (admin) ----------
export async function fetchInvitations(params?: { search?: string; estado?: string }) {
  const { data } = await api.get<InvitationSummary[]>("/invitations", { params });
  return data;
}

export async function fetchInvitationById(id: string) {
  const { data } = await api.get<Invitation>(`/invitations/admin/${id}`);
  return data;
}

export async function createInvitation(payload: {
  codigo?: string;
  nombrePrincipal: string;
  mensaje?: string;
  acompanantes: string[];
}) {
  const { data } = await api.post<Invitation>("/invitations", payload);
  return data;
}

export async function deleteInvitation(id: string) {
  await api.delete(`/invitations/${id}`);
}

export async function addGuestToInvitation(invitationId: string, nombre: string) {
  const { data } = await api.post(`/invitations/${invitationId}/guests`, {
    nombre,
    tipo: "acompanante",
  });
  return data;
}

export async function deleteGuest(guestId: string) {
  await api.delete(`/guests/${guestId}`);
}

// ---------- Asistencia ----------
export async function markGuestPresent(guestId: string) {
  const { data } = await api.post(`/attendance/${guestId}`);
  return data;
}

export async function markAllPresent(invitationId: string) {
  const { data } = await api.post(`/attendance/invitation/${invitationId}/all`);
  return data;
}

export async function fetchAttendanceHistory() {
  const { data } = await api.get<AttendanceRecordRow[]>("/attendance");
  return data;
}

// ---------- Solicitudes de Confirmación (Público) ----------
export async function submitConfirmationRequest(
  nombre: string,
  acompanantes: string[]
) {
  const { data } = await api.post<{
    id: string;
    nombre: string;
    estado: string;
    acompanantes: string[];
    message: string;
  }>("/confirmations", { nombre, acompanantes });
  return data;
}

export async function searchConfirmationByName(nombre: string) {
  const { data } = await api.get<ConfirmationRequest[]>("/confirmations/search", {
    params: { nombre },
  });
  return data;
}

// ---------- Solicitudes de Confirmación (Admin) ----------
export async function fetchConfirmationRequests(params?: { estado?: string }) {
  const { data } = await api.get<ConfirmationRequest[]>("/confirmations", { params });
  return data;
}

export async function fetchPendingConfirmationsCount() {
  const { data } = await api.get<{ pendientes: number }>("/confirmations/count-pending");
  return data.pendientes;
}

export async function acceptConfirmationRequest(id: string) {
  const { data } = await api.post<ConfirmationRequest>(`/confirmations/${id}/accept`);
  return data;
}

export async function rejectConfirmationRequest(id: string) {
  const { data } = await api.post<ConfirmationRequest>(`/confirmations/${id}/reject`);
  return data;
}

