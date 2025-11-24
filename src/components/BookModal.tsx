import { useState } from "react";
import type { SlotWithTeacher } from "../types";
import { formatDate, formatTimeRange } from "../utils/helpers";

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => Promise<void>;
  slot: SlotWithTeacher | null;
}

export function BookModal({
  isOpen,
  onClose,
  onConfirm,
  slot,
}: BookModalProps) {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm(notes.trim() || undefined);
      setNotes("");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to book appointment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNotes("");
    setError(null);
    onClose();
  };

  if (!isOpen || !slot) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-modal-title"
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2
              id="book-modal-title"
              className="text-xl font-bold text-gray-900"
            >
              Book Appointment
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {/* Appointment Details */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-gray-900 mb-3">
              Appointment Details
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-600">Teacher</dt>
                <dd className="font-medium text-gray-900">
                  {slot.teacher.name}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Date</dt>
                <dd className="font-medium text-gray-900">
                  {formatDate(slot.startISO)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Time</dt>
                <dd className="font-medium text-gray-900">
                  {formatTimeRange(slot.startISO, slot.endISO)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Location</dt>
                <dd className="font-medium text-gray-900">{slot.location}</dd>
              </div>
            </dl>
          </div>

          {/* Notes (Optional) */}
          <div className="mb-4">
            <label
              htmlFor="booking-notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notes (Optional)
            </label>
            <textarea
              id="booking-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What would you like to discuss? (e.g., assignment help, project feedback)"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={500}
            />
            <p className="mt-1 text-xs text-gray-500">
              {notes.length}/500 characters
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div
              className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
              role="alert"
            >
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Policy Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-yellow-800">
              <strong>📋 Cancellation Policy:</strong> You can cancel this
              appointment up to 24 hours before the scheduled time.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isSubmitting
                  ? "bg-blue-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
