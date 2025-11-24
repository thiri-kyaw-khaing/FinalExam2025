// ==================== MOCK API LAYER ====================
// This file simulates a backend API using localStorage as a database.
// All functions return Promises with artificial delays to simulate network latency.
// Console logs simulate API request/response logging.

import type {
  User,
  Slot,
  Appointment,
  SlotFilters,
  SlotWithTeacher,
  AppointmentWithDetails,
} from "../types";
import {
  uid,
  slotsOverlap,
  isBookingAllowed,
  isWithinCancellationWindow,
} from "../utils/helpers";

// ==================== CONSTANTS ====================
const STORAGE_KEYS = {
  USERS: "uas_users",
  SLOTS: "uas_slots",
  APPOINTMENTS: "uas_appointments",
  CURRENT_USER: "uas_currentUser",
};

const NETWORK_DELAY_MS = { min: 300, max: 700 };

// ==================== UTILITY FUNCTIONS ====================

/**
 * Simulate network delay to make the mock API feel realistic
 */
function simulateNetworkDelay(): Promise<void> {
  const delay =
    Math.random() * (NETWORK_DELAY_MS.max - NETWORK_DELAY_MS.min) +
    NETWORK_DELAY_MS.min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Get data from localStorage
 */
function getFromStorage<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

/**
 * Save data to localStorage
 */
function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ==================== AUTH API ====================

/**
 * Mock login - just retrieves user by ID (no password in MVP)
 * In production: POST /api/auth/login with email/password, returns JWT
 */
export async function login(userId: string): Promise<User> {
  console.log(`📡 POST /api/auth/login - Authenticating user ${userId}`);
  await simulateNetworkDelay();

  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Store current user in localStorage (simulates session)
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  console.log(`✅ Login successful:`, user);

  return user;
}

/**
 * Get current logged-in user
 */
export function getCurrentUser(): User | null {
  const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userData ? JSON.parse(userData) : null;
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  console.log(`📡 POST /api/auth/logout`);
  await simulateNetworkDelay();

  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  console.log(`✅ Logout successful`);
}

// ==================== USER API ====================

/**
 * Get all users (for seeding/admin purposes)
 * In production: GET /api/users (admin only)
 */
export async function getUsers(): Promise<User[]> {
  console.log(`📡 GET /api/users`);
  await simulateNetworkDelay();

  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  console.log(`✅ Retrieved ${users.length} users`);

  return users;
}

/**
 * Get user by ID
 * In production: GET /api/users/:id
 */
export async function getUserById(userId: string): Promise<User | null> {
  console.log(`📡 GET /api/users/${userId}`);
  await simulateNetworkDelay();

  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  const user = users.find((u) => u.id === userId);

  console.log(user ? `✅ User found` : `❌ User not found`);
  return user || null;
}

/**
 * Create a new user
 * In production: POST /api/users
 */
export async function createUser(user: User): Promise<User> {
  console.log(`📡 POST /api/users`, user);
  await simulateNetworkDelay();

  const users = getFromStorage<User>(STORAGE_KEYS.USERS);

  // Check if user already exists
  if (users.some((u) => u.id === user.id || u.email === user.email)) {
    throw new Error("User already exists");
  }

  users.push(user);
  saveToStorage(STORAGE_KEYS.USERS, users);

  console.log(`✅ User created successfully`);
  return user;
}

// ==================== SLOT API ====================

/**
 * Get slots with optional filters
 * In production: GET /api/slots?teacherId=...&startDate=...&available=true
 */
export async function getSlots(
  filters?: SlotFilters
): Promise<SlotWithTeacher[]> {
  console.log(`📡 GET /api/slots`, filters);
  await simulateNetworkDelay();

  let slots = getFromStorage<Slot>(STORAGE_KEYS.SLOTS);
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);

  // Apply filters
  if (filters?.teacherId) {
    slots = slots.filter((s) => s.teacherId === filters.teacherId);
  }

  if (filters?.startDate) {
    slots = slots.filter((s) => s.startISO >= filters.startDate!);
  }

  if (filters?.endDate) {
    slots = slots.filter((s) => s.startISO <= filters.endDate!);
  }

  if (filters?.available) {
    slots = slots.filter((s) => s.availableSeats > 0);
  }

  // Enrich with teacher information
  const enrichedSlots: SlotWithTeacher[] = slots.map((slot) => {
    const teacher = users.find((u) => u.id === slot.teacherId);
    return {
      ...slot,
      teacher: teacher || {
        id: "",
        name: "Unknown",
        role: "TEACHER",
        email: "",
      },
    };
  });

  console.log(`✅ Retrieved ${enrichedSlots.length} slots`);
  return enrichedSlots;
}

/**
 * Get single slot by ID
 * In production: GET /api/slots/:id
 */
export async function getSlotById(
  slotId: string
): Promise<SlotWithTeacher | null> {
  console.log(`📡 GET /api/slots/${slotId}`);
  await simulateNetworkDelay();

  const slots = getFromStorage<Slot>(STORAGE_KEYS.SLOTS);
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  const slot = slots.find((s) => s.id === slotId);

  if (!slot) {
    console.log(`❌ Slot not found`);
    return null;
  }

  const teacher = users.find((u) => u.id === slot.teacherId);
  const enrichedSlot: SlotWithTeacher = {
    ...slot,
    teacher: teacher || { id: "", name: "Unknown", role: "TEACHER", email: "" },
  };

  console.log(`✅ Slot found`);
  return enrichedSlot;
}

/**
 * Create a new appointment slot (teacher only)
 * In production: POST /api/slots
 */
export async function createSlot(slotData: Omit<Slot, "id">): Promise<Slot> {
  console.log(`📡 POST /api/slots`, slotData);
  await simulateNetworkDelay();

  // Validate teacher exists
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  const teacher = users.find(
    (u) => u.id === slotData.teacherId && u.role === "TEACHER"
  );

  if (!teacher) {
    throw new Error("Invalid teacher ID or user is not a teacher");
  }

  // Validate time range
  if (new Date(slotData.startISO) >= new Date(slotData.endISO)) {
    throw new Error("End time must be after start time");
  }

  // Check for overlapping slots for this teacher
  const slots = getFromStorage<Slot>(STORAGE_KEYS.SLOTS);
  const overlap = slots.find(
    (s) =>
      s.teacherId === slotData.teacherId &&
      slotsOverlap(s.startISO, s.endISO, slotData.startISO, slotData.endISO)
  );

  if (overlap) {
    throw new Error("This slot overlaps with an existing slot");
  }

  const newSlot: Slot = {
    id: uid(),
    ...slotData,
    availableSeats: slotData.maxSeats,
  };

  slots.push(newSlot);
  saveToStorage(STORAGE_KEYS.SLOTS, slots);

  console.log(`✅ Slot created:`, newSlot.id);
  return newSlot;
}

/**
 * Update an existing slot (teacher only)
 * In production: PUT /api/slots/:id
 */
export async function updateSlot(
  slotId: string,
  updates: Partial<Omit<Slot, "id" | "teacherId">>
): Promise<Slot> {
  console.log(`📡 PUT /api/slots/${slotId}`, updates);
  await simulateNetworkDelay();

  const slots = getFromStorage<Slot>(STORAGE_KEYS.SLOTS);
  const slotIndex = slots.findIndex((s) => s.id === slotId);

  if (slotIndex === -1) {
    throw new Error("Slot not found");
  }

  const slot = slots[slotIndex];

  // Don't allow updates if there are bookings (business rule)
  const appointments = getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS);
  const hasBookings = appointments.some(
    (a) => a.slotId === slotId && a.status === "BOOKED"
  );

  if (hasBookings && (updates.startISO || updates.endISO)) {
    throw new Error("Cannot change time of a slot that has bookings");
  }

  // Update slot
  slots[slotIndex] = {
    ...slot,
    ...updates,
  };

  saveToStorage(STORAGE_KEYS.SLOTS, slots);
  console.log(`✅ Slot updated`);

  return slots[slotIndex];
}

/**
 * Delete a slot (teacher only)
 * In production: DELETE /api/slots/:id
 */
export async function deleteSlot(slotId: string): Promise<void> {
  console.log(`📡 DELETE /api/slots/${slotId}`);
  await simulateNetworkDelay();

  const slots = getFromStorage<Slot>(STORAGE_KEYS.SLOTS);
  const slotIndex = slots.findIndex((s) => s.id === slotId);

  if (slotIndex === -1) {
    throw new Error("Slot not found");
  }

  // Don't allow deletion if there are bookings
  const appointments = getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS);
  const hasBookings = appointments.some(
    (a) => a.slotId === slotId && a.status === "BOOKED"
  );

  if (hasBookings) {
    throw new Error("Cannot delete a slot that has bookings");
  }

  slots.splice(slotIndex, 1);
  saveToStorage(STORAGE_KEYS.SLOTS, slots);

  console.log(`✅ Slot deleted`);
}

// ==================== APPOINTMENT API ====================

/**
 * Book an appointment (student only)
 * In production: POST /api/appointments
 */
export async function bookAppointment(
  slotId: string,
  studentId: string,
  notes?: string
): Promise<Appointment> {
  console.log(`📡 POST /api/appointments`, { slotId, studentId, notes });
  await simulateNetworkDelay();

  // Validate student exists
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  const student = users.find((u) => u.id === studentId && u.role === "STUDENT");

  if (!student) {
    throw new Error("Invalid student ID or user is not a student");
  }

  // Validate slot exists and is available
  const slots = getFromStorage<Slot>(STORAGE_KEYS.SLOTS);
  const slot = slots.find((s) => s.id === slotId);

  if (!slot) {
    throw new Error("Slot not found");
  }

  if (slot.availableSeats <= 0) {
    throw new Error("This slot is fully booked");
  }

  // Check if booking is too close to start time
  if (!isBookingAllowed(slot.startISO)) {
    throw new Error(
      "Cannot book appointments less than 1 hour before start time"
    );
  }

  // Check for student conflicts (overlapping appointments)
  const appointments = getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS);
  const studentAppointments = appointments.filter(
    (a) => a.studentId === studentId && a.status === "BOOKED"
  );

  for (const appt of studentAppointments) {
    const apptSlot = slots.find((s) => s.id === appt.slotId);
    if (
      apptSlot &&
      slotsOverlap(
        slot.startISO,
        slot.endISO,
        apptSlot.startISO,
        apptSlot.endISO
      )
    ) {
      throw new Error("You have a conflicting appointment at this time");
    }
  }

  // Create appointment
  const newAppointment: Appointment = {
    id: uid(),
    slotId,
    studentId,
    status: "BOOKED",
    notes,
    createdAt: new Date().toISOString(),
  };

  appointments.push(newAppointment);
  saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);

  // Update slot availability
  slot.availableSeats -= 1;
  const slotIndex = slots.findIndex((s) => s.id === slotId);
  slots[slotIndex] = slot;
  saveToStorage(STORAGE_KEYS.SLOTS, slots);

  console.log(`✅ Appointment booked:`, newAppointment.id);
  return newAppointment;
}

/**
 * Cancel an appointment
 * In production: PUT /api/appointments/:id/cancel
 */
export async function cancelAppointment(
  appointmentId: string,
  userId: string
): Promise<void> {
  console.log(`📡 PUT /api/appointments/${appointmentId}/cancel`);
  await simulateNetworkDelay();

  const appointments = getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS);
  const appointmentIndex = appointments.findIndex(
    (a) => a.id === appointmentId
  );

  if (appointmentIndex === -1) {
    throw new Error("Appointment not found");
  }

  const appointment = appointments[appointmentIndex];

  // Verify ownership (student who booked or teacher who owns the slot)
  const slots = getFromStorage<Slot>(STORAGE_KEYS.SLOTS);
  const slot = slots.find((s) => s.id === appointment.slotId);

  if (!slot) {
    throw new Error("Associated slot not found");
  }

  if (appointment.studentId !== userId && slot.teacherId !== userId) {
    throw new Error("You are not authorized to cancel this appointment");
  }

  // Check cancellation policy (24 hours)
  if (
    appointment.studentId === userId &&
    !isWithinCancellationWindow(slot.startISO)
  ) {
    throw new Error("Cannot cancel within 24 hours of appointment time");
  }

  // Cancel appointment
  appointments[appointmentIndex].status = "CANCELLED";
  appointments[appointmentIndex].cancelledAt = new Date().toISOString();
  saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);

  // Restore slot availability
  slot.availableSeats += 1;
  const slotIndex = slots.findIndex((s) => s.id === appointment.slotId);
  slots[slotIndex] = slot;
  saveToStorage(STORAGE_KEYS.SLOTS, slots);

  console.log(`✅ Appointment cancelled`);
}

/**
 * Mark appointment as attended (teacher only)
 * In production: PUT /api/appointments/:id/attend
 */
export async function markAttended(appointmentId: string): Promise<void> {
  console.log(`📡 PUT /api/appointments/${appointmentId}/attend`);
  await simulateNetworkDelay();

  const appointments = getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS);
  const appointmentIndex = appointments.findIndex(
    (a) => a.id === appointmentId
  );

  if (appointmentIndex === -1) {
    throw new Error("Appointment not found");
  }

  appointments[appointmentIndex].status = "ATTENDED";
  saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);

  console.log(`✅ Appointment marked as attended`);
}

/**
 * Get all appointments for a user (student or teacher)
 * In production: GET /api/appointments?userId=...&role=...
 */
export async function getUserAppointments(
  userId: string,
  role: "STUDENT" | "TEACHER"
): Promise<AppointmentWithDetails[]> {
  console.log(`📡 GET /api/appointments?userId=${userId}&role=${role}`);
  await simulateNetworkDelay();

  const appointments = getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS);
  const slots = getFromStorage<Slot>(STORAGE_KEYS.SLOTS);
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);

  let filteredAppointments: Appointment[];

  if (role === "STUDENT") {
    filteredAppointments = appointments.filter((a) => a.studentId === userId);
  } else {
    // Teacher: find all appointments for their slots
    const teacherSlots = slots.filter((s) => s.teacherId === userId);
    const slotIds = teacherSlots.map((s) => s.id);
    filteredAppointments = appointments.filter((a) =>
      slotIds.includes(a.slotId)
    );
  }

  // Enrich with details
  const enrichedAppointments: AppointmentWithDetails[] =
    filteredAppointments.map((appt) => {
      const slot = slots.find((s) => s.id === appt.slotId);
      const student = users.find((u) => u.id === appt.studentId);
      const teacher = slot
        ? users.find((u) => u.id === slot.teacherId)
        : undefined;

      return {
        ...appt,
        slot: slot || ({} as Slot),
        student,
        teacher,
      };
    });

  console.log(`✅ Retrieved ${enrichedAppointments.length} appointments`);
  return enrichedAppointments;
}

/**
 * Get all appointments for a specific slot (teacher view)
 * In production: GET /api/slots/:slotId/appointments
 */
export async function getSlotAppointments(
  slotId: string
): Promise<AppointmentWithDetails[]> {
  console.log(`📡 GET /api/slots/${slotId}/appointments`);
  await simulateNetworkDelay();

  const appointments = getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS);
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  const slots = getFromStorage<Slot>(STORAGE_KEYS.SLOTS);

  const slotAppointments = appointments.filter((a) => a.slotId === slotId);

  const enrichedAppointments: AppointmentWithDetails[] = slotAppointments.map(
    (appt) => {
      const slot = slots.find((s) => s.id === appt.slotId);
      const student = users.find((u) => u.id === appt.studentId);
      const teacher = slot
        ? users.find((u) => u.id === slot.teacherId)
        : undefined;

      return {
        ...appt,
        slot: slot || ({} as Slot),
        student,
        teacher,
      };
    }
  );

  console.log(
    `✅ Retrieved ${enrichedAppointments.length} appointments for slot`
  );
  return enrichedAppointments;
}
