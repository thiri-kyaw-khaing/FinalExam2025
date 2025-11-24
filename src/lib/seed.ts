// ==================== DATA SEEDING ====================
// This file populates localStorage with initial sample data for demonstration.
// Runs automatically on first app load if no data exists.

import type { User, Slot, Appointment } from "../types";
import { getDaysFromNow, formatDateForInput, uid } from "../utils/helpers";

const STORAGE_KEYS = {
  USERS: "uas_users",
  SLOTS: "uas_slots",
  APPOINTMENTS: "uas_appointments",
};

/**
 * Check if data has already been seeded
 */
export function isDataSeeded(): boolean {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users !== null && users !== "[]";
}

/**
 * Seed sample users (students and teachers)
 */
function seedUsers(): User[] {
  const users: User[] = [
    // Students
    {
      id: "student1",
      name: "Alice Johnson",
      role: "STUDENT",
      email: "alice.johnson@university.edu",
      phone: "+1-555-0101",
    },
    {
      id: "student2",
      name: "Bob Martinez",
      role: "STUDENT",
      email: "bob.martinez@university.edu",
      phone: "+1-555-0102",
    },
    {
      id: "student3",
      name: "Carol Wang",
      role: "STUDENT",
      email: "carol.wang@university.edu",
      phone: "+1-555-0103",
    },
    // Teachers
    {
      id: "teacher1",
      name: "Dr. Robert Smith",
      role: "TEACHER",
      email: "robert.smith@university.edu",
      phone: "+1-555-0201",
    },
    {
      id: "teacher2",
      name: "Prof. Emily Chen",
      role: "TEACHER",
      email: "emily.chen@university.edu",
      phone: "+1-555-0202",
    },
  ];

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  console.log(`✅ Seeded ${users.length} users`);
  return users;
}

/**
 * Seed sample appointment slots for the next 2 weeks
 */
function seedSlots(): Slot[] {
  const slots: Slot[] = [];

  // Dr. Robert Smith's slots (Computer Science)
  const teacher1Slots = [
    // Week 1
    {
      teacherId: "teacher1",
      date: getDaysFromNow(1),
      times: [
        { start: "10:00", end: "11:00" },
        { start: "14:00", end: "15:00" },
      ],
      location: "Room 301, Engineering Building",
      maxSeats: 1,
    },
    {
      teacherId: "teacher1",
      date: getDaysFromNow(2),
      times: [
        { start: "11:00", end: "12:00" },
        { start: "15:00", end: "16:00" },
      ],
      location: "Room 301, Engineering Building",
      maxSeats: 1,
    },
    {
      teacherId: "teacher1",
      date: getDaysFromNow(3),
      times: [
        { start: "10:00", end: "11:00" },
        { start: "13:00", end: "14:00" },
      ],
      location: "Room 301, Engineering Building",
      maxSeats: 1,
    },
    // Week 2
    {
      teacherId: "teacher1",
      date: getDaysFromNow(8),
      times: [
        { start: "10:00", end: "11:00" },
        { start: "14:00", end: "15:00" },
      ],
      location: "Room 301, Engineering Building",
      maxSeats: 1,
    },
    {
      teacherId: "teacher1",
      date: getDaysFromNow(9),
      times: [
        { start: "11:00", end: "12:00" },
        { start: "15:00", end: "16:00" },
      ],
      location: "Room 301, Engineering Building",
      maxSeats: 1,
    },
  ];

  // Prof. Emily Chen's slots (Mathematics)
  const teacher2Slots = [
    // Week 1
    {
      teacherId: "teacher2",
      date: getDaysFromNow(1),
      times: [
        { start: "09:00", end: "10:00" },
        { start: "14:00", end: "15:00" },
      ],
      location: "Room 205, Science Hall",
      maxSeats: 3, // Group sessions
    },
    {
      teacherId: "teacher2",
      date: getDaysFromNow(2),
      times: [
        { start: "10:00", end: "11:00" },
        { start: "13:00", end: "14:00" },
      ],
      location: "Room 205, Science Hall",
      maxSeats: 2,
    },
    {
      teacherId: "teacher2",
      date: getDaysFromNow(4),
      times: [
        { start: "09:00", end: "10:00" },
        { start: "11:00", end: "12:00" },
      ],
      location: "Room 205, Science Hall",
      maxSeats: 3,
    },
    // Week 2
    {
      teacherId: "teacher2",
      date: getDaysFromNow(8),
      times: [
        { start: "09:00", end: "10:00" },
        { start: "14:00", end: "15:00" },
      ],
      location: "Room 205, Science Hall",
      maxSeats: 3,
    },
    {
      teacherId: "teacher2",
      date: getDaysFromNow(11),
      times: [
        { start: "10:00", end: "11:00" },
        { start: "13:00", end: "14:00" },
      ],
      location: "Room 205, Science Hall",
      maxSeats: 2,
    },
  ];

  // Convert to Slot objects
  [...teacher1Slots, ...teacher2Slots].forEach((slotConfig) => {
    slotConfig.times.forEach((timeSlot) => {
      const dateStr = formatDateForInput(slotConfig.date);
      const startISO = new Date(
        `${dateStr}T${timeSlot.start}:00`
      ).toISOString();
      const endISO = new Date(`${dateStr}T${timeSlot.end}:00`).toISOString();

      slots.push({
        id: uid(),
        teacherId: slotConfig.teacherId,
        startISO,
        endISO,
        location: slotConfig.location,
        maxSeats: slotConfig.maxSeats,
        availableSeats: slotConfig.maxSeats,
      });
    });
  });

  localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
  console.log(`✅ Seeded ${slots.length} appointment slots`);
  return slots;
}

/**
 * Seed a few sample appointments
 */
function seedAppointments(slots: Slot[]): Appointment[] {
  const appointments: Appointment[] = [];

  // Alice has booked an appointment with Dr. Smith (tomorrow at 2pm)
  const aliceSlot = slots.find(
    (s) =>
      s.teacherId === "teacher1" &&
      s.startISO.includes(formatDateForInput(getDaysFromNow(1))) &&
      s.startISO.includes("14:00")
  );

  if (aliceSlot) {
    appointments.push({
      id: uid(),
      slotId: aliceSlot.id,
      studentId: "student1",
      status: "BOOKED",
      notes:
        "I would like to discuss my final project proposal and get feedback on my research direction.",
      createdAt: new Date(Date.now() - 86400000).toISOString(), // Booked yesterday
    });

    // Update slot availability
    aliceSlot.availableSeats -= 1;
  }

  // Bob has booked an appointment with Prof. Chen (in 2 days at 10am)
  const bobSlot = slots.find(
    (s) =>
      s.teacherId === "teacher2" &&
      s.startISO.includes(formatDateForInput(getDaysFromNow(2))) &&
      s.startISO.includes("10:00")
  );

  if (bobSlot) {
    appointments.push({
      id: uid(),
      slotId: bobSlot.id,
      studentId: "student2",
      status: "BOOKED",
      notes: "Need help with calculus homework problem set 5.",
      createdAt: new Date(Date.now() - 43200000).toISOString(), // Booked 12 hours ago
    });

    bobSlot.availableSeats -= 1;
  }

  // Carol also booked the same group session with Prof. Chen
  if (bobSlot && bobSlot.maxSeats > 1) {
    appointments.push({
      id: uid(),
      slotId: bobSlot.id,
      studentId: "student3",
      status: "BOOKED",
      notes: "Same as Bob - working on problem set 5 together.",
      createdAt: new Date(Date.now() - 21600000).toISOString(), // Booked 6 hours ago
    });

    bobSlot.availableSeats -= 1;
  }

  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  // Update slots with reduced availability
  localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));

  console.log(`✅ Seeded ${appointments.length} appointments`);
  return appointments;
}

/**
 * Main seeding function - run on app initialization
 */
export function seedData(): void {
  if (isDataSeeded()) {
    console.log("📊 Data already seeded, skipping initialization");
    return;
  }

  console.log("🌱 Seeding initial data...");

  seedUsers();
  const slots = seedSlots();
  const appointments = seedAppointments(slots);

  console.log(`
    ✅ Data seeding complete!
    
    Sample Accounts (No password required in MVP):
    
    👨‍🎓 Students:
       - Alice Johnson (ID: student1)
       - Bob Martinez (ID: student2)
       - Carol Wang (ID: student3)
    
    👩‍🏫 Teachers:
       - Dr. Robert Smith (ID: teacher1)
       - Prof. Emily Chen (ID: teacher2)
    
    📅 Created ${slots.length} appointment slots over the next 2 weeks
    📝 Created ${appointments.length} sample bookings
    
    🚀 Ready to use!
  `);
}

/**
 * Clear all data (useful for testing/reset)
 */
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.SLOTS);
  localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
  localStorage.removeItem("uas_currentUser");
  console.log("🗑️ All data cleared from localStorage");
}

/**
 * Export current data (for backup/debugging)
 */
export function exportData() {
  return {
    users: JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]"),
    slots: JSON.parse(localStorage.getItem(STORAGE_KEYS.SLOTS) || "[]"),
    appointments: JSON.parse(
      localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || "[]"
    ),
  };
}
