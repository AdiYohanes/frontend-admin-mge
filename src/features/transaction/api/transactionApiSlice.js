import { apiSlice } from "../../../store/api/apiSlice";

export const transactionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) => {
        const params = {
          page,
          per_page: limit,
          // Tidak filter status di backend, ambil semua data
        };

        if (search) params.search = search;

        return {
          url: '/api/admin/bookings',
          params: params,
        };
      },
      transformResponse: (response) => {
        // Handle paginated response structure
        const bookingsData = response.data || [];
        const paginationInfo = {
          current_page: response.current_page || 1,
          total: response.total || 0,
          per_page: response.per_page || 10,
          last_page: response.last_page || 1,
          next_page_url: response.next_page_url,
          prev_page_url: response.prev_page_url
        };

        // Get all transactions and filter by status in frontend
        const transformedData = bookingsData
          .filter(booking => booking.status === "completed") // Filter status completed di frontend
          .map(booking => {
            const isFnb = booking.invoice_number?.startsWith("FNB");
            const customerName = booking.bookable?.name || "Guest";
            const customerPhone = booking.bookable?.phone || "-";

            // Determine booking type (Online vs Manual/OTS)
            const bookingType = booking.bookable_type?.includes('Guest') ? 'Manual (OTS)' : 'Online';

            // Determine payment method based on booking type
            const metodePembayaran = bookingType === 'Manual (OTS)' ? 'Cash' : 'QRIS';

            // Determine booking details
            let details = "";
            let quantity = "";
            let quantityUnit = "";

            if (isFnb) {
              details = booking.notes || "Food & Drink Order";
              quantity = booking.total_visitors || 1;
              quantityUnit = "pcs";
            } else {
              // Extract unit, console, and room information
              const unitName = booking.unit?.name || "";
              const consoleName = booking.unit?.consoles?.[0]?.name || "";
              const roomName = booking.unit?.room?.name || "";

              // Build details string with unit, console, and room information
              const detailsParts = [];
              if (unitName) detailsParts.push(unitName);
              if (consoleName) detailsParts.push(consoleName);
              if (roomName) detailsParts.push(roomName);

              details = detailsParts.length > 0 ? detailsParts.join(" - ") : "Room Booking";

              if (booking.start_time && booking.end_time) {
                const start = new Date(booking.start_time);
                const end = new Date(booking.end_time);
                const hours = Math.ceil((end - start) / (1000 * 60 * 60));
                quantity = hours;
                quantityUnit = "hrs";
              } else {
                quantity = booking.total_visitors || 1;
                quantityUnit = "visitors";
              }
            }

            // Determine status with refund details
            let status = booking.status || "Unknown";
            let totalRefund = null;

            if (booking.status === "refunded" || booking.status === "cancelled") {
              // Determine if full or partial refund (you can adjust this logic)
              const refundAmount = parseFloat(booking.total_price) * 0.5; // 50% refund for example
              totalRefund = refundAmount;
            }

            return {
              id: booking.id,
              noTransaction: booking.invoice_number,
              bookingType: bookingType,
              type: isFnb ? "Food & Drink" : "Room",
              name: customerName,
              phoneNumber: customerPhone,
              details: details,
              quantity: quantity,
              quantityUnit: quantityUnit,
              tanggalBooking: new Date(booking.created_at).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }),
              totalPembayaran: parseFloat(booking.total_price),
              metodePembayaran: metodePembayaran,
              status: status,
              totalRefund: totalRefund,
              rawBooking: booking,
            };
          });



        // Return both transformed data and pagination info
        return {
          transactions: transformedData,
          pagination: paginationInfo
        };
      },
      providesTags: (result) => {
        if (!result) return [{ type: 'Transaction', id: 'LIST' }];

        const tags = [{ type: 'Transaction', id: 'LIST' }];
        if (result.transactions) {
          tags.push(...result.transactions.map(({ id }) => ({ type: 'Transaction', id })));
        }
        return tags;
      },
    }),
  }),
});

export const { useGetTransactionsQuery } = transactionApiSlice;
