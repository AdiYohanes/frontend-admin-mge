import { apiSlice } from "../../../store/api/apiSlice";

// Fungsi untuk membuat data booking tiruan yang beragam
const createMockBooking = (i) => {
  const statuses = [
    "Finished",
    "Booking Success",
    "Ongoing",
    "Cancelled",
    "Refunded",
    "Rescheduled",
  ];
  const methods = ["QRIS", "Cash", "Card"];
  const consoles = ["PS5", "PS4 Pro", "PS4 Slim"];
  const rooms = ["Reguler", "VIP", "Smoking Area"];

  // Mensimulasikan tanggal yang berbeda-beda agar pengurutan terlihat
  const bookingDate = new Date(2025, i % 3, 20 - i);
  const startTime = new Date(bookingDate.setHours(10 + (i % 12), 0, 0));
  const duration = (i % 4) + 1;
  const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

  return {
    id: i + 1,
    rawBookingDate: startTime.toISOString(), // Menyimpan object Date asli untuk pengurutan yang akurat
    noTransaction: `TRX-202503${String(i + 1).padStart(3, "0")}`,
    bookingType: i % 2 === 0 ? "Online" : "OTS",
    name: `Customer ${i + 1}`,
    phoneNumber: `081234567${String(i + 1).padStart(3, "0")}`,
    console: consoles[i % consoles.length],
    room: rooms[i % rooms.length],
    unit: `Unit #${(i % 5) + 1}`,
    totalPerson: (i % 4) + 1,
    startTime: startTime.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    duration: duration,
    endTime: endTime.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    tanggalBooking: startTime.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    totalPembayaran: 50000 * duration + i * 1000,
    metodePembayaran: methods[i % methods.length],
    statusBooking: statuses[i % statuses.length],
  };
};

// Gunakan 'let' agar array bisa dimodifikasi oleh fungsi delete
let mockBookings = Array.from({ length: 20 }, (_, i) => createMockBooking(i));

export const bookingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query({
      queryFn: async (arg) => {
        const {
          page = 1,
          limit = 10,
          search = "",
          month = "",
          status = "",
        } = arg;

        // 1. Urutkan seluruh data berdasarkan tanggal terbaru
        const sortedData = [...mockBookings].sort((a, b) =>
          b.rawBookingDate.localeCompare(a.rawBookingDate)
        );

        // 2. Terapkan filter secara berantai
        let processedData = sortedData;

        if (status && status !== "All") {
          processedData = processedData.filter(
            (booking) => booking.statusBooking === status
          );
        }

        if (month) {
          // format month adalah "YYYY-MM"
          processedData = processedData.filter((booking) => {
            const bookingDate = booking.rawBookingDate;
            const bookingMonthAndYear = `${bookingDate.getFullYear()}-${String(
              bookingDate.getMonth() + 1
            ).padStart(2, "0")}`;
            return bookingMonthAndYear === month;
          });
        }

        if (search) {
          processedData = processedData.filter(
            (booking) =>
              booking.name.toLowerCase().includes(search.toLowerCase()) ||
              booking.noTransaction.toLowerCase().includes(search.toLowerCase())
          );
        }

        // 3. Lakukan paginasi pada data hasil akhir
        const totalItems = processedData.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = processedData.slice(startIndex, endIndex);

        // Simulasi delay jaringan
        await new Promise((resolve) => setTimeout(resolve, 500));

        return {
          data: {
            bookings: paginatedData,
            totalPages,
            currentPage: page,
            totalItems,
          },
        };
      },
      providesTags: (result) =>
        result
          ? [
              { type: "Booking", id: "LIST" },
              ...result.bookings.map(({ id }) => ({ type: "Booking", id })),
            ]
          : [{ type: "Booking", id: "LIST" }],
    }),

    addBooking: builder.mutation({
      queryFn: async (newBooking) => {
        const completeBooking = {
          ...newBooking,
          rawBookingDate: new Date().toISOString(),
        };
        mockBookings.unshift(completeBooking);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: completeBooking };
      },
      invalidatesTags: [{ type: "Booking", id: "LIST" }],
    }),

    updateBooking: builder.mutation({
      queryFn: async (updatedBooking) => {
        const index = mockBookings.findIndex((b) => b.id === updatedBooking.id);
        if (index !== -1) {
          mockBookings[index] = { ...mockBookings[index], ...updatedBooking };
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: updatedBooking };
      },
      invalidatesTags: (result, error, arg) => [
        { type: "Booking", id: arg.id },
        { type: "Booking", id: "LIST" },
      ],
    }),

    deleteBooking: builder.mutation({
      queryFn: async (bookingId) => {
        mockBookings = mockBookings.filter((b) => b.id !== bookingId);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: bookingId };
      },
      invalidatesTags: [{ type: "Booking", id: "LIST" }],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useAddBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
} = bookingApiSlice;
