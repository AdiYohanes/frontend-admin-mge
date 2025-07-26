import { apiSlice } from "../../../store/api/apiSlice";

export const transactionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) => ({
        url: "/api/admin/bookings",
        params: { page, per_page: limit, search },
      }),
      transformResponse: (response) => {
        // Filter hanya status finished dan refunded
        const filteredData = response.data.filter(
          (booking) => booking.status === "finished" || booking.status === "refunded"
        );

        // Transform data untuk table
        const transactions = filteredData.map((booking) => {
          const isFnb = booking.invoice_number.startsWith("FNB");
          const customerName = booking.bookable?.name || "Guest";
          const customerPhone = booking.bookable?.phone || "-";

          // Determine booking details
          let details = "";
          let quantity = "";
          let quantityUnit = "";

          if (isFnb) {
            details = booking.notes || "Food & Drink Order";
            quantity = booking.total_visitors || 1;
            quantityUnit = "items";
          } else {
            details = booking.unit?.name || "Room Booking";
            if (booking.start_time && booking.end_time) {
              const start = new Date(booking.start_time);
              const end = new Date(booking.end_time);
              const hours = Math.ceil((end - start) / (1000 * 60 * 60));
              quantity = hours;
              quantityUnit = "hours";
            } else {
              quantity = booking.total_visitors || 1;
              quantityUnit = "visitors";
            }
          }

          return {
            id: booking.id,
            noTransaction: booking.invoice_number,
            type: isFnb ? "Food & Drink" : "Room Booking",
            name: customerName,
            phoneNumber: customerPhone,
            details: details,
            quantity: quantity,
            quantityUnit: quantityUnit,
            tanggalBooking: new Date(booking.created_at).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }),
            totalPembayaran: parseFloat(booking.total_price),
            metodePembayaran: "QRIS", // Default value
            status: booking.status === "finished" ? "Finished" : "Refunded",
            totalRefund: booking.status === "refunded" ? parseFloat(booking.total_price) * 0.5 : null, // Simulate 50% refund
          };
        });

        return {
          transactions,
          totalPages: response.last_page,
          currentPage: response.current_page,
        };
      },
      providesTags: ["Transaction"],
    }),
  }),
});

export const { useGetTransactionsQuery } = transactionApiSlice;
