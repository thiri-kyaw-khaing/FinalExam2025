import type { AppointmentWithDetails, User } from "../types";
import {
  formatShortDate,
  formatTimeRange,
  isWithinCancellationWindow,
  getRelativeTime,
} from "../utils/helpers";

interface AppointmentListProps {
  appointments: AppointmentWithDetails[];
  currentUser: User;
  onCancel?: (appointment: AppointmentWithDetails) => void;
  onMarkAttended?: (appointment: AppointmentWithDetails) => void;
}

export function AppointmentList({
  appointments,
  currentUser,
  onCancel,
  onMarkAttended,
}: AppointmentListProps) {
  const sortedAppointments = [...appointments].sort(
    (a, b) =>
      new Date(a.slot.startISO).getTime() - new Date(b.slot.startISO).getTime()
  );

  if (sortedAppointments.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-md">
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No appointments
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {currentUser.role === "STUDENT"
            ? "You haven't booked any appointments yet."
            : "No appointments have been booked for your slots yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedAppointments.map((appointment) => {
        const canCancel = isWithinCancellationWindow(appointment.slot.startISO);
        const statusColor = {
          BOOKED: "bg-green-100 text-green-800",
          CANCELLED: "bg-red-100 text-red-800",
          ATTENDED: "bg-blue-100 text-blue-800",
        }[appointment.status];

        const statusIcon = {
          BOOKED: "✓",
          CANCELLED: "✕",
          ATTENDED: "★",
        }[appointment.status];

        return (
          <div
            key={appointment.id}
            className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              {/* Left side - Appointment details */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
                  >
                    <span aria-hidden="true">{statusIcon}</span>
                    <span className="ml-1">{appointment.status}</span>
                  </span>
                  <span className="text-xs text-gray-500">
                    {getRelativeTime(appointment.slot.startISO)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-medium text-gray-900">
                      {formatShortDate(appointment.slot.startISO)}
                    </p>
                    <p className="text-sm text-gray-900">
                      {formatTimeRange(
                        appointment.slot.startISO,
                        appointment.slot.endISO
                      )}
                    </p>
                  </div>

                  {currentUser.role === "STUDENT" && appointment.teacher && (
                    <div>
                      <p className="text-sm text-gray-600">Teacher</p>
                      <p className="text-sm text-gray-900">
                        {appointment.teacher.name}
                      </p>
                    </div>
                  )}

                  {currentUser.role === "TEACHER" && appointment.student && (
                    <div>
                      <p className="text-sm text-gray-600">Student</p>
                      <p className="text-sm text-gray-900">
                        {appointment.student.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {appointment.student.email}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="text-sm text-gray-900">
                      {appointment.slot.location}
                    </p>
                  </div>

                  {appointment.notes && (
                    <div>
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="text-sm text-gray-900 italic">
                        "{appointment.notes}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Actions */}
              {appointment.status === "BOOKED" && (
                <div className="flex md:flex-col gap-2">
                  {currentUser.role === "STUDENT" && (
                    <button
                      onClick={() => onCancel && onCancel(appointment)}
                      disabled={!canCancel}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 whitespace-nowrap ${
                        !canCancel
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                      }`}
                      title={
                        !canCancel
                          ? "Cannot cancel within 24 hours of appointment"
                          : "Cancel this appointment"
                      }
                      aria-label={`Cancel appointment on ${formatShortDate(
                        appointment.slot.startISO
                      )}`}
                    >
                      {canCancel ? "Cancel" : "Too late to cancel"}
                    </button>
                  )}

                  {currentUser.role === "TEACHER" && (
                    <>
                      <button
                        onClick={() =>
                          onMarkAttended && onMarkAttended(appointment)
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
                        aria-label="Mark as attended"
                      >
                        Mark Attended
                      </button>
                      <button
                        onClick={() => onCancel && onCancel(appointment)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 whitespace-nowrap"
                        aria-label="Cancel appointment"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
