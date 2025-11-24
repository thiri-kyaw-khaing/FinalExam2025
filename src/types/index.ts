// ==================== TYPE DEFINITIONS ====================
// These interfaces define the data structures used throughout the application.
// They mirror the database schema that would be used in a production backend.

/**
 * User represents both students and teachers in the system.
 * Role-based access control is enforced based on the 'role' field.
 */
export interface User {
  id: string;
  name: string;
  role: "STUDENT" | "TEACHER";
  email: string;
  phone?: string;
}

/**
 * Slot represents an appointment time slot created by a teacher.
 * Teachers create slots, students book them.
 */
export interface Slot {
  id: string;
  teacherId: string;
  startISO: string; // ISO 8601 date-time string
  endISO: string; // ISO 8601 date-time string
  location: string;
  maxSeats: number;
  availableSeats: number;
}

/**
 * Appointment represents a booking made by a student for a specific slot.
 * Tracks the lifecycle: BOOKED → CANCELLED or ATTENDED
 */
export interface Appointment {
  id: string;
  slotId: string;
  studentId: string;
  status: "BOOKED" | "CANCELLED" | "ATTENDED";
  notes?: string;
  createdAt: string;
  cancelledAt?: string;
}

/**
 * Enriched slot with teacher information for display purposes
 */
export interface SlotWithTeacher extends Slot {
  teacher: User;
}

/**
 * Enriched appointment with slot and student information
 */
export interface AppointmentWithDetails extends Appointment {
  slot: Slot;
  student?: User;
  teacher?: User;
}

/**
 * Filter options for querying slots
 */
export interface SlotFilters {
  teacherId?: string;
  startDate?: string;
  endDate?: string;
  available?: boolean;
}

/**
 * Toast notification types
 */
export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}
