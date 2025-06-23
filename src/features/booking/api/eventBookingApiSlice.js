import { apiSlice } from "../../../store/api/apiSlice";

const createMockEvent = (i) => {
  const statuses = [
    "Booking Success",
    "Waiting Payment",
    "Booking Complete",
    "Cancelled",
  ];
  const eventNames = [
    "Turnamen FIFA Community",
    "Nobar Final Liga Champion",
    "Ulang Tahun Anak",
  ];

  return {
    id: i + 1,
    noTransaction: `EVT-202504${String(i + 1).padStart(3, "0")}`,
    eventName: eventNames[i % eventNames.length],
    eventDescription: "Acara komunitas untuk para penggemar game sepak bola.",
    console: "PS5",
    room: "Area Event",
    unit: "Semua Unit",
    totalPerson: 10 + (i % 15),
    tanggalBooking: new Date(2025, 3, 15 + i).toISOString(), // Simpan sebagai ISO string untuk konsistensi
    startTime: "19:00",
    duration: 4,
    endTime: "23:00",
    statusBooking: statuses[i % statuses.length],
  };
};

let mockEventBookings = Array.from({ length: 15 }, (_, i) =>
  createMockEvent(i)
);

export const eventBookingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEventBookings: builder.query({
      queryFn: async (arg) => {
        const { page = 1, limit = 10, search = "", status = "" } = arg;

        const sortedData = [...mockEventBookings].sort(
          (a, b) => new Date(b.tanggalBooking) - new Date(a.tanggalBooking)
        );

        let processedData = sortedData;

        if (status && status !== "All") {
          processedData = processedData.filter(
            (event) => event.statusBooking === status
          );
        }

        if (search) {
          processedData = processedData.filter(
            (event) =>
              event.eventName.toLowerCase().includes(search.toLowerCase()) ||
              event.noTransaction.toLowerCase().includes(search.toLowerCase())
          );
        }

        const totalItems = processedData.length;
        const totalPages = Math.ceil(totalItems / limit);
        const paginatedData = processedData.slice(
          (page - 1) * limit,
          page * limit
        );

        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          data: { bookings: paginatedData, totalPages, currentPage: page },
        };
      },
      providesTags: ["EventBooking"],
    }),
    addEventBooking: builder.mutation({
      queryFn: async (newEvent) => {
        const completeEvent = {
          ...newEvent,
          id: Date.now(),
          noTransaction: `EVT-${Date.now()}`,
          statusBooking: "Booking Success",
        };
        mockEventBookings.unshift(completeEvent);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: completeEvent };
      },
      invalidatesTags: ["EventBooking"],
    }),
    updateEventBooking: builder.mutation({
      queryFn: async (updatedEvent) => {
        const index = mockEventBookings.findIndex(
          (e) => e.id === updatedEvent.id
        );
        if (index !== -1) {
          mockEventBookings[index] = {
            ...mockEventBookings[index],
            ...updatedEvent,
          };
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: updatedEvent };
      },
      invalidatesTags: ["EventBooking"],
    }),
    deleteEventBooking: builder.mutation({
      queryFn: async (eventId) => {
        mockEventBookings = mockEventBookings.filter((e) => e.id !== eventId);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: eventId };
      },
      invalidatesTags: ["EventBooking"],
    }),
  }),
});

export const {
  useGetEventBookingsQuery,
  useAddEventBookingMutation,
  useUpdateEventBookingMutation,
  useDeleteEventBookingMutation,
} = eventBookingApiSlice;
