import { useState, useEffect } from "react";
import type {
  User,
  SlotWithTeacher,
  AppointmentWithDetails,
  ToastMessage,
  SlotFilters,
} from "../types";
import {
  getSlots,
  getUserAppointments,
  bookAppointment,
  cancelAppointment,
} from "../lib/mockApi";
import { Header } from "../components/Header";
import { SlotList } from "../components/SlotList";
import { AppointmentList } from "../components/AppointmentList";
import { BookModal } from "../components/BookModal";
import { ToastContainer } from "../components/Toast";
import { uid } from "../utils/helpers";

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
}

export function Dashboard({ currentUser, onLogout }: DashboardProps) {
  const [slots, setSlots] = useState<SlotWithTeacher[]>([]);
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SlotFilters>({ available: true });
  const [selectedSlot, setSelectedSlot] = useState<SlotWithTeacher | null>(
    null
  );
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [slotsData, appointmentsData] = await Promise.all([
        getSlots(filters),
        getUserAppointments(currentUser.id, "STUDENT"),
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

  const handleBookSlot = (slot: SlotWithTeacher) => {
    setSelectedSlot(slot);
    setIsBookModalOpen(true);
  };

  const handleConfirmBooking = async (notes?: string) => {
    if (!selectedSlot) return;

    try {
      await bookAppointment(selectedSlot.id, currentUser.id, notes);
      showToast("success", "Appointment booked successfully!");
      loadData();
      setIsBookModalOpen(false);
      setSelectedSlot(null);
    } catch (error) {
      throw error; // Let BookModal handle the error
    }
  };

  const handleCancelAppointment = async (
    appointment: AppointmentWithDetails
  ) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      await cancelAppointment(appointment.id, currentUser.id);
      showToast("success", "Appointment cancelled successfully");
      loadData();
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Failed to cancel appointment"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentUser={currentUser} onLogout={onLogout} />

      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Student Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Book appointments with your teachers
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
            {/* Available Slots Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  Available Appointment Slots
                </h3>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={filters.available}
                    onChange={(e) =>
                      setFilters({ ...filters, available: e.target.checked })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Show only available slots
                </label>
              </div>
              <SlotList
                slots={slots}
                currentUser={currentUser}
                onBook={handleBookSlot}
              />
            </section>

            {/* My Appointments Section */}
            <section>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Your Appointments
              </h3>
              <AppointmentList
                appointments={appointments}
                currentUser={currentUser}
                onCancel={handleCancelAppointment}
              />
            </section>
          </div>
        )}
      </main>

      {/* Modals */}
      <BookModal
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          setSelectedSlot(null);
        }}
        onConfirm={handleConfirmBooking}
        slot={selectedSlot}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={handleToastClose} />
    </div>
  );
}
