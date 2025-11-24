import type { SlotWithTeacher, User } from "../types";
import {
  formatShortDate,
  formatTimeRange,
  isBookingAllowed,
  isPastSlot,
} from "../utils/helpers";

interface SlotListProps {
  slots: SlotWithTeacher[];
  currentUser: User;
  onBook?: (slot: SlotWithTeacher) => void;
  onEdit?: (slot: SlotWithTeacher) => void;
  onDelete?: (slot: SlotWithTeacher) => void;
}

export function SlotList({
  slots,
  currentUser,
  onBook,
  onEdit,
  onDelete,
}: SlotListProps) {
  if (slots.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No slots available
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {currentUser.role === "TEACHER"
            ? "Create your first appointment slot to get started."
            : "Check back later for available appointment slots."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {slots.map((slot) => {
        const isPast = isPastSlot(slot.endISO);
        const canBook =
          currentUser.role === "STUDENT" && isBookingAllowed(slot.startISO);
        const isAvailable = slot.availableSeats > 0;

        return (
          <div
            key={slot.id}
            className={`bg-white rounded-xl shadow-md border-2 transition-all hover:shadow-lg ${
              isPast
                ? "border-gray-200 opacity-60"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="p-6">
              {/* Date and Time */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {formatShortDate(slot.startISO)}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatTimeRange(slot.startISO, slot.endISO)}
                  </p>
                </div>
                {isPast && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Past
                  </span>
                )}
                {!isPast && !isAvailable && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Full
                  </span>
                )}
                {!isPast && isAvailable && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Available
                  </span>
                )}
              </div>

              {/* Teacher Info */}
              {currentUser.role === "STUDENT" && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Teacher</p>
                  <p className="font-medium text-gray-900">
                    {slot.teacher.name}
                  </p>
                </div>
              )}

              {/* Location */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">Location</p>
                <p className="text-sm text-gray-900">{slot.location}</p>
              </div>

              {/* Capacity */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">Availability</p>
                <p className="text-sm text-gray-900">
                  {slot.availableSeats} of {slot.maxSeats} seats available
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                {currentUser.role === "STUDENT" && !isPast && (
                  <button
                    onClick={() => onBook && onBook(slot)}
                    disabled={!isAvailable || !canBook}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      !isAvailable || !canBook
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                    aria-label={`Book appointment on ${formatShortDate(
                      slot.startISO
                    )} at ${formatTimeRange(slot.startISO, slot.endISO)}`}
                  >
                    {!canBook && isAvailable
                      ? "Too soon to book"
                      : !isAvailable
                      ? "Fully Booked"
                      : "Book Appointment"}
                  </button>
                )}

                {currentUser.role === "TEACHER" && !isPast && (
                  <>
                    <button
                      onClick={() => onEdit && onEdit(slot)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                      aria-label="Edit slot"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(slot)}
                      disabled={slot.availableSeats < slot.maxSeats}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        slot.availableSeats < slot.maxSeats
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                      }`}
                      aria-label="Delete slot"
                      title={
                        slot.availableSeats < slot.maxSeats
                          ? "Cannot delete slot with bookings"
                          : "Delete this slot"
                      }
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
