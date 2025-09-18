import { apiSlice } from "../../../store/api/apiSlice";

export const transactionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query({
      query: ({ page = 1, limit = 10, search = "", status, month = "", year = "", sortBy = "total_price", sortOrder = "asc" }) => {
        const params = {
          page,
          per_page: limit,
          sortBy,
          sortOrder
        };

        if (search) params.search = search;
        if (status && status !== 'All') params.status = status;
        if (month) params.month = month;
        if (year) params.year = year;

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

        // Transform transaction data - ambil semua data langsung dari API response
        const transformedData = transactionsData.map(transaction => {
          return {
            // Field utama dari API response
            id: transaction.id,
            bookingId: transaction.booking_id,
            invoiceNumber: transaction.invoice_number,
            customerName: transaction.customer_name,
            customerPhone: transaction.customer_phone,
            bookingType: transaction.booking_type,
            transactionType: transaction.transaction_type,
            bookingDate: transaction.booking_date,
            startTime: transaction.start_time,
            endTime: transaction.end_time,
            durationHours: transaction.duration_hours,
            unitName: transaction.unit_name,
            consoleNames: transaction.console_names,
            gameName: transaction.game_name,
            fnbItems: transaction.fnb_items,
            subtotalRoom: transaction.subtotal_room,
            subtotalFnb: transaction.subtotal_fnb,
            promoCode: transaction.promo_code,
            promoPercentage: transaction.promo_percentage,
            rewardVoucherCode: transaction.reward_voucher_code,
            discountAmount: transaction.discount_amount,
            taxAmount: transaction.tax_amount,
            serviceFeeAmount: transaction.service_fee_amount,
            finalAmount: transaction.final_amount,
            paymentMethod: transaction.payment_method,
            paymentDate: transaction.payment_date,
            gatewayTransactionId: transaction.gateway_transaction_id,
            status: transaction.status,
            payload: transaction.payload,
            createdAt: transaction.created_at,
            updatedAt: transaction.updated_at,
            deletedAt: transaction.deleted_at,
            booking2: transaction.booking2,

            // Field untuk kompatibilitas dengan UI yang sudah ada
            noTransaction: transaction.invoice_number,
            name: transaction.customer_name,
            phoneNumber: transaction.customer_phone,
            totalPembayaran: parseFloat(transaction.final_amount),
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

