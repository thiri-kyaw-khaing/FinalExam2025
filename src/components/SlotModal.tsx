import { useState } from "react";
import type { Slot, User } from "../types";
import {
  formatDateForInput,
  formatTimeForInput,
  combineDateTime,
} from "../utils/helpers";

interface SlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (slotData: Omit<Slot, "id" | "availableSeats">) => Promise<void>;
  currentUser: User;
  existingSlot?: Slot;
}

export function SlotModal({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
  existingSlot,
}: SlotModalProps) {
  const isEdit = !!existingSlot;

  const [formData, setFormData] = useState(() => {
    if (existingSlot) {
      const startDate = new Date(existingSlot.startISO);
      const endDate = new Date(existingSlot.endISO);
      return {
        date: formatDateForInput(startDate),
        startTime: formatTimeForInput(startDate),
        endTime: formatTimeForInput(endDate),
        location: existingSlot.location,
        maxSeats: existingSlot.maxSeats,
      };
    }
    return {
      date: formatDateForInput(new Date(Date.now() + 86400000)), // Tomorrow
      startTime: "10:00",
      endTime: "11:00",
      location: "",
      maxSeats: 1,
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = "Cannot create slots in the past";
      }
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      if (end <= start) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (formData.maxSeats < 1 || formData.maxSeats > 10) {
      newErrors.maxSeats = "Max seats must be between 1 and 10";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const startISO = combineDateTime(formData.date, formData.startTime);
      const endISO = combineDateTime(formData.date, formData.endTime);

      await onSubmit({
        teacherId: currentUser.id,
        startISO,
        endISO,
        location: formData.location.trim(),
        maxSeats: Number(formData.maxSeats),
      });

      onClose();
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Failed to save slot",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 id="modal-title" className="text-xl font-bold text-gray-900">
              {isEdit ? "Edit Appointment Slot" : "Create Appointment Slot"}
            </h2>
            <button
              onClick={onClose}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.date ? "border-red-500" : "border-gray-300"
              }`}
              required
              aria-required="true"
              aria-invalid={!!errors.date}
              aria-describedby={errors.date ? "date-error" : undefined}
            />
            {errors.date && (
              <p
                id="date-error"
                className="mt-1 text-sm text-red-600"
                role="alert"
              >
                {errors.date}
              </p>
            )}
          </div>

          {/* Start Time */}
          <div>
            <label
              htmlFor="startTime"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.startTime ? "border-red-500" : "border-gray-300"
              }`}
              required
              aria-required="true"
              aria-invalid={!!errors.startTime}
              aria-describedby={
                errors.startTime ? "startTime-error" : undefined
              }
            />
            {errors.startTime && (
              <p
                id="startTime-error"
                className="mt-1 text-sm text-red-600"
                role="alert"
              >
                {errors.startTime}
              </p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label
              htmlFor="endTime"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.endTime ? "border-red-500" : "border-gray-300"
              }`}
              required
              aria-required="true"
              aria-invalid={!!errors.endTime}
              aria-describedby={errors.endTime ? "endTime-error" : undefined}
            />
            {errors.endTime && (
              <p
                id="endTime-error"
                className="mt-1 text-sm text-red-600"
                role="alert"
              >
                {errors.endTime}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Room 301, Engineering Building"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.location ? "border-red-500" : "border-gray-300"
              }`}
              required
              aria-required="true"
              aria-invalid={!!errors.location}
              aria-describedby={errors.location ? "location-error" : undefined}
            />
            {errors.location && (
              <p
                id="location-error"
                className="mt-1 text-sm text-red-600"
                role="alert"
              >
                {errors.location}
              </p>
            )}
          </div>

          {/* Max Seats */}
          <div>
            <label
              htmlFor="maxSeats"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Maximum Students <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="maxSeats"
              name="maxSeats"
              value={formData.maxSeats}
              onChange={handleChange}
              min="1"
              max="10"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.maxSeats ? "border-red-500" : "border-gray-300"
              }`}
              required
              aria-required="true"
              aria-invalid={!!errors.maxSeats}
              aria-describedby={errors.maxSeats ? "maxSeats-error" : undefined}
            />
            <p className="mt-1 text-xs text-gray-500">
              Number of students who can book this slot (1-10)
            </p>
            {errors.maxSeats && (
              <p
                id="maxSeats-error"
                className="mt-1 text-sm text-red-600"
                role="alert"
              >
                {errors.maxSeats}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div
              className="bg-red-50 border border-red-200 rounded-lg p-3"
              role="alert"
            >
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
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
              {isSubmitting
                ? "Saving..."
                : isEdit
                ? "Save Changes"
                : "Create Slot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
