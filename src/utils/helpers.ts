// ==================== UTILITY HELPER FUNCTIONS ====================

/**
 * Generate a unique ID (simple implementation for MVP)
 * In production, this would be handled by the database (UUID)
 */
export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format ISO date string to readable format
 * @example "2025-11-25T10:00:00.000Z" → "Monday, November 25, 2025"
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format ISO date string to short date
 * @example "2025-11-25T10:00:00.000Z" → "Nov 25, 2025"
 */
export function formatShortDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format ISO date string to time
 * @example "2025-11-25T10:00:00.000Z" → "10:00 AM"
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format time range from two ISO strings
 * @example ("2025-11-25T10:00:00Z", "2025-11-25T11:00:00Z") → "10:00 AM - 11:00 AM"
 */
export function formatTimeRange(startISO: string, endISO: string): string {
  return `${formatTime(startISO)} - ${formatTime(endISO)}`;
}

/**
 * Check if cancellation is allowed (must be >24 hours before appointment)
 * @returns true if cancellation is allowed
 */
export function isWithinCancellationWindow(slotStartISO: string): boolean {
  const slotStart = new Date(slotStartISO);
  const now = new Date();
  const hoursUntilSlot =
    (slotStart.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilSlot > 24;
}

/**
 * Check if booking is too close to slot start time (must be >1 hour before)
 * @returns true if booking is allowed
 */
export function isBookingAllowed(slotStartISO: string): boolean {
  const slotStart = new Date(slotStartISO);
  const now = new Date();
  const hoursUntilSlot =
    (slotStart.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilSlot > 1;
}

/**
 * Check if two time ranges overlap
 */
export function slotsOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();

  return s1 < e2 && s2 < e1;
}

/**
 * Check if a slot is in the past
 */
export function isPastSlot(slotEndISO: string): boolean {
  const slotEnd = new Date(slotEndISO);
  const now = new Date();
  return slotEnd < now;
}

/**
 * Format date for input field (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format time for input field (HH:MM)
 */
export function formatTimeForInput(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Combine date and time inputs into ISO string
 */
export function combineDateTime(dateStr: string, timeStr: string): string {
  return new Date(`${dateStr}T${timeStr}:00`).toISOString();
}

/**
 * Get relative time description
 * @example "in 2 days", "in 3 hours", "2 days ago"
 */
export function getRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.abs(diffMs) / (1000 * 60 * 60);
  const diffDays = Math.abs(diffMs) / (1000 * 60 * 60 * 24);

  if (diffMs > 0) {
    // Future
    if (diffHours < 1) return "in less than 1 hour";
    if (diffHours < 24) return `in ${Math.floor(diffHours)} hours`;
    if (diffDays < 7) return `in ${Math.floor(diffDays)} days`;
    return "in over a week";
  } else {
    // Past
    if (diffHours < 1) return "less than 1 hour ago";
    if (diffHours < 24) return `${Math.floor(diffHours)} hours ago`;
    if (diffDays < 7) return `${Math.floor(diffDays)} days ago`;
    return "over a week ago";
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get today's date at midnight (for filtering)
 */
export function getTodayStart(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Get date N days from now
 */
export function getDaysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
