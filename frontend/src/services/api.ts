const API_URL = "http://localhost:8000/api";

const TOKEN_KEY = "clinic_token";


export type Role = "ADMIN" | "DOCTOR" | "PATIENT";

export type SelfRole = "DOCTOR" | "PATIENT";

export type UserStatus = "ACTIVE" | "PENDING";


export interface AuthUser {
  id: number;
  username: string;
  phone?: string;
  email?: string;
  full_name?: string;
  role: Role;
  status: UserStatus;
  license_number?: string;
  interview?: string;
  created_at: string;
}


export interface LoginResponse {
  access_token: string;
  token_type: string;
  username: string;
  role: Role;
}

export interface AuthProviderConfig {
  google: {
    enabled: boolean;
    client_id: string | null;
  };
}


export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}


function authHeaders(json = false): HeadersInit {
  const headers: Record<string, string> = {};
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (json) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}


async function handleError(
  response: Response,
  fallback: string
): Promise<never> {
  let detail = fallback;

  try {
    const body = await response.json();
    if (body?.detail) {
      detail = typeof body.detail === "string"
        ? body.detail
        : JSON.stringify(body.detail);
    }
  } catch {
    // ignore
  }

  throw new Error(detail);
}


// ----- Auth -----

export async function getAuthProviders(): Promise<AuthProviderConfig> {
  const response = await fetch(`${API_URL}/auth/providers`);

  if (!response.ok) {
    return handleError(response, "Failed to load sign-in providers");
  }

  return response.json();
}

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    return handleError(response, "Login failed");
  }

  return response.json();
}


export async function loginWithGoogle(
  credential: string
): Promise<LoginResponse> {

  const response = await fetch(`${API_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });

  if (!response.ok) {
    return handleError(response, "Google sign-in failed");
  }

  return response.json();
}


export async function getMe(): Promise<AuthUser> {

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    return handleError(response, "Failed to load current user");
  }

  return response.json();
}


export interface RegisterRequest {
  full_name: string;
  phone: string;
  username: string;
  password: string;
  role: SelfRole;
  license_number?: string;
  interview?: string;
}


export interface RegisterResponse {
  username: string;
  role: Role;
  status: UserStatus;
  message: string;
}


export async function register(
  data: RegisterRequest
): Promise<RegisterResponse> {

  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    return handleError(response, "Registration failed");
  }

  return response.json();
}


export interface PatientRegisterRequest {
  username: string;
  password: string;
  name: string;
  parent_name?: string;
  birth_date?: string;
  gender?: string;
  phone: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  occupation?: string;
  marital_status?: string;
  blood_group?: string;
  current_health_issues?: string;
  previous_history?: string;
  character_notes?: string;
}


export async function registerPatient(
  data: PatientRegisterRequest
): Promise<RegisterResponse> {

  const response = await fetch(`${API_URL}/auth/register-patient`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    return handleError(response, "Registration failed");
  }

  return response.json();
}


export interface NotifyResponse {
  delivered: boolean;
  simulated: boolean;
  detail: string;
}


export async function notifyEmail(
  to: string,
  subject: string,
  message: string
): Promise<NotifyResponse> {

  const response = await fetch(`${API_URL}/notify/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject, message }),
  });

  if (!response.ok) {
    return handleError(response, "Failed to send email");
  }

  return response.json();
}


export async function notifySms(
  to: string,
  message: string
): Promise<NotifyResponse> {

  const response = await fetch(`${API_URL}/notify/sms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject: "SMS", message }),
  });

  if (!response.ok) {
    return handleError(response, "Failed to send SMS");
  }

  return response.json();
}


export async function notifyWhatsapp(
  to: string,
  message: string
): Promise<NotifyResponse> {

  const response = await fetch(`${API_URL}/notify/whatsapp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject: "WhatsApp", message }),
  });

  if (!response.ok) {
    return handleError(response, "Failed to send WhatsApp message");
  }

  return response.json();
}


// ----- Patients (doctor + admin) -----

export interface PatientProfile {
  id: number;
  user_id: number;
  name: string;
  parent_name?: string;
  birth_date?: string;
  gender?: string;
  phone: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  occupation?: string;
  marital_status?: string;
  blood_group?: string;
  current_health_issues?: string;
  previous_history?: string;
  character_notes?: string;
  created_at: string;
}


export async function getPatients(): Promise<PatientProfile[]> {

  const response = await fetch(`${API_URL}/patients`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    return handleError(response, "Failed to fetch patients");
  }

  return response.json();
}


interface BulkDeleteResponse {
  success: boolean;
  deleted: number;
}


export async function deletePatientRecords(
  patientIds: number[]
): Promise<BulkDeleteResponse> {

  const response = await fetch(`${API_URL}/patients/bulk-delete`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ ids: patientIds }),
  });

  if (!response.ok) {
    return handleError(response, "Failed to delete patient records");
  }

  return response.json();
}


// ----- User management (admin) -----

export interface CreateUserRequest {
  username: string;
  password: string;
  role: Role;
  phone?: string;
  full_name?: string;
}


export async function getUsers(): Promise<AuthUser[]> {

  const response = await fetch(`${API_URL}/users`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    return handleError(response, "Failed to fetch users");
  }

  return response.json();
}


export async function createUser(
  user: CreateUserRequest
): Promise<AuthUser> {

  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    return handleError(response, "Failed to create user");
  }

  return response.json();
}


export async function deleteUser(userId: number): Promise<void> {

  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!response.ok) {
    return handleError(response, "Failed to delete user");
  }
}


export async function approveUser(userId: number): Promise<AuthUser> {

  const response = await fetch(`${API_URL}/users/${userId}/approve`, {
    method: "POST",
    headers: authHeaders(),
  });

  if (!response.ok) {
    return handleError(response, "Failed to approve user");
  }

  return response.json();
}


// ----- Tasks -----

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
}


export interface CreateTaskRequest {
  title: string;
  description?: string;
}


export async function getTasks(): Promise<Task[]> {

  const response = await fetch(`${API_URL}/tasks`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    return handleError(response, "Failed to fetch tasks");
  }

  return response.json();
}


export async function createTask(
  task: CreateTaskRequest
): Promise<Task> {

  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    return handleError(response, "Failed to create task");
  }

  return response.json();
}


export async function deleteTask(taskId: number): Promise<void> {

  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!response.ok) {
    return handleError(response, "Failed to delete task");
  }
}


// ----- Appointments -----

export interface CreateAppointmentRequest {
  name: string;
  email: string;
  phone: string;
  preferred_date: string;
  message?: string;
}


export interface Appointment {
  id: number;
  name: string;
  email: string;
  phone: string;
  preferred_date: string;
  message?: string;
  created_by?: string;
  created_at: string;
}


export async function getAppointments(): Promise<Appointment[]> {

  const response = await fetch(`${API_URL}/appointments`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    return handleError(response, "Failed to fetch appointments");
  }

  return response.json();
}


export async function getMyAppointments(): Promise<Appointment[]> {

  const response = await fetch(`${API_URL}/appointments/mine`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    return handleError(response, "Failed to fetch appointments");
  }

  return response.json();
}


export async function createAppointment(
  appointment: CreateAppointmentRequest
): Promise<Appointment> {

  const response = await fetch(`${API_URL}/appointments`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(appointment),
  });

  if (!response.ok) {
    return handleError(response, "Failed to submit appointment");
  }

  return response.json();
}


export async function deleteAppointments(
  appointmentIds: number[]
): Promise<BulkDeleteResponse> {

  const response = await fetch(`${API_URL}/appointments/bulk-delete`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ ids: appointmentIds }),
  });

  if (!response.ok) {
    return handleError(response, "Failed to delete appointments");
  }

  return response.json();
}


// ----- AI assistant -----

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}


export interface ChatResponse {
  reply: string;
  model: string;
  simulated: boolean;
}


export async function sendChat(
  message: string,
  history: ChatMessage[]
): Promise<ChatResponse> {

  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    return handleError(response, "Chat request failed");
  }

  return response.json();
}
