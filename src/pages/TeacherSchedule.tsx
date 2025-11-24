import { useState, useEffect } from "react";
import type {
  User,
  Slot,
  SlotWithTeacher,
  AppointmentWithDetails,
  ToastMessage,
} from "../types";
import {
  getSlots,
  getUserAppointments,
  createSlot,
  updateSlot,
  deleteSlot,
  cancelAppointment,
  markAttended,
} from "../lib/mockApi";
import { Header } from "../components/Header";
import { SlotList } from "../components/SlotList";
import { AppointmentList } from "../components/AppointmentList";
import { SlotModal } from "../components/SlotModal";
import { ToastContainer } from "../components/Toast";
import { uid } from "../utils/helpers";

interface TeacherScheduleProps {
  currentUser: User;
  onLogout: () => void;
}

export function TeacherSchedule({
  currentUser,
  onLogout,
}: TeacherScheduleProps) {
  const [slots, setSlots] = useState<SlotWithTeacher[]>([]);
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | undefined>();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [slotsData, appointmentsData] = await Promise.all([
        getSlots({ teacherId: currentUser.id }),
        getUserAppointments(currentUser.id, "TEACHER"),
      ]);
      setSlots(slotsData);
      setAppointments(appointmentsData);
    } catch (error) {
      showToast("error", "Failed to load data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: ToastMessage["type"], message: string) => {
    const toast: ToastMessage = { id: uid(), type, message };
    setToasts((prev) => [...prev, toast]);
  };

  const handleToastClose = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreateSlot = () => {
    setEditingSlot(undefined);
    setIsSlotModalOpen(true);
  };

  const handleEditSlot = (slot: SlotWithTeacher) => {
    setEditingSlot(slot);
    setIsSlotModalOpen(true);
  };

  const handleDeleteSlot = async (slot: SlotWithTeacher) => {
    if (
      !confirm(
        `Are you sure you want to delete this slot?\n\n${new Date(
          slot.startISO
        ).toLocaleString()}`
      )
    ) {
      return;
    }

    try {
      await deleteSlot(slot.id);
      showToast("success", "Slot deleted successfully");
      loadData();
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Failed to delete slot"
      );
    }
  };

  const handleSubmitSlot = async (
    slotData: Omit<Slot, "id" | "availableSeats">
  ) => {
    try {
      if (editingSlot) {
        await updateSlot(editingSlot.id, slotData);
        showToast("success", "Slot updated successfully");
      } else {
        await createSlot(slotData);
        showToast("success", "Slot created successfully");
      }
      loadData();
    } catch (error) {
      throw error; // Let SlotModal handle the error
    }
  };

  const handleCancelAppointment = async (
    appointment: AppointmentWithDetails
  ) => {
    if (
      !confirm(
        "Are you sure you want to cancel this appointment? The student will be notified."
      )
    ) {
      return;
    }

    try {
      await cancelAppointment(appointment.id, currentUser.id);
      showToast("success", "Appointment cancelled");
      loadData();
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Failed to cancel appointment"
      );
    }
  };

  const handleMarkAttended = async (appointment: AppointmentWithDetails) => {
    try {
      await markAttended(appointment.id);
      showToast("success", "Appointment marked as attended");
      loadData();
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Failed to mark as attended"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentUser={currentUser} onLogout={onLogout} />

      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Teacher Schedule</h2>
          <p className="text-gray-600 mt-1">
            Manage your appointment slots and bookings
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* My Slots Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  Your Appointment Slots
                </h3>
                <button
                  onClick={handleCreateSlot}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create New Slot
                </button>
              </div>
              <SlotList
                slots={slots}
                currentUser={currentUser}
                onEdit={handleEditSlot}
                onDelete={handleDeleteSlot}
              />
            </section>

            {/* Booked Appointments Section */}
            <section>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Booked Appointments
              </h3>
              <AppointmentList
                appointments={appointments}
                currentUser={currentUser}
                onCancel={handleCancelAppointment}
                onMarkAttended={handleMarkAttended}
              />
            </section>
          </div>
        )}
      </main>

      {/* Slot Modal */}
      <SlotModal
        isOpen={isSlotModalOpen}
        onClose={() => {
          setIsSlotModalOpen(false);
          setEditingSlot(undefined);
        }}
        onSubmit={handleSubmitSlot}
        currentUser={currentUser}
        existingSlot={editingSlot}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={handleToastClose} />
    </div>
  );
}
