import { apiSlice } from "../../../store/api/apiSlice";

export const transactionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query({
      query: ({ page = 1, limit = 10, search = "", status = "completed" }) => {
        const params = {
          page,
          per_page: limit,
        };

        if (search) params.search = search;
        if (status) params.status = status;

        return {
          url: '/api/admin/transactions',
          params: params,
        };
      },
      transformResponse: (response) => {
        // Handle paginated response structure
        const transactionsData = response.data || [];
        const paginationInfo = {
          current_page: response.current_page || 1,
          total: response.total || 0,
          per_page: response.per_page || 10,
          last_page: response.last_page || 1,
          next_page_url: response.next_page_url,
          prev_page_url: response.prev_page_url
        };

        // Transform transaction data to match table structure
        const transformedData = transactionsData.map(transaction => {
          const isFnb = transaction.transaction_type === "F&B" || transaction.transaction_type === "Room & F&B";
          const isRoom = transaction.transaction_type === "Room" || transaction.transaction_type === "Room & F&B";

          // Determine booking type
          const bookingType = transaction.booking_type === "Online" ? "Online" : "Manual (OTS)";

          // Determine payment method
          const metodePembayaran = transaction.payment_method === "midtrans" ? "QRIS" :
            transaction.payment_method === "cash" ? "Cash" :
              transaction.payment_method || "Unknown";

          // Format booking date
          const tanggalBooking = new Date(transaction.booking_date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

          // Format payment date
          const tanggalPembayaran = transaction.payment_date ?
            new Date(transaction.payment_date).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }) : null;

          // Format F&B items for display
          const fnbItems = transaction.fnb_items || [];
          const fnbDisplay = fnbItems.length > 0 ?
            fnbItems.map(item => `${item.name} x${item.quantity}`).join(", ") : "-";

          return {
            id: transaction.id,
            noTransaction: transaction.invoice_number,
            bookingType: bookingType,
            type: transaction.transaction_type === "F&B" ? "Food & Drink" :
              transaction.transaction_type === "Room" ? "Room" :
                transaction.transaction_type === "Room & F&B" ? "Room & F&B" : "Unknown",
            name: transaction.customer_name,
            phoneNumber: transaction.customer_phone,
            details: isFnb ? fnbDisplay : `${transaction.unit_name || "-"} - ${transaction.console_names?.join(", ") || "-"}`,
            quantity: isFnb ? fnbItems.reduce((sum, item) => sum + item.quantity, 0) : transaction.duration_hours || 1,
            quantityUnit: isFnb ? "pcs" : "hrs",
            tanggalBooking: tanggalBooking,
            totalPembayaran: parseFloat(transaction.final_amount),
            metodePembayaran: metodePembayaran,
            status: transaction.status,
            tanggalPembayaran: tanggalPembayaran,
            rawBooking: transaction,
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

