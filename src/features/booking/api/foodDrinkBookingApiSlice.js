import { apiSlice } from '../../../store/api/apiSlice';
import { format, parseISO } from 'date-fns';

// Helper function to transform booking detail
const transformBookingDetail = (response) => {
  if (!response) {
    return null;
  }

  const createdDate = response.created_at ? parseISO(response.created_at) : new Date();
  const transaction = response.transactions?.[0]; // Ambil transaksi pertama

  // Transform F&B items
  const fnbItems = response.fnbs?.map(fnb => ({
    id: fnb.id,
    name: fnb.name,
    category: fnb.fnb_category_id,
    price: parseFloat(fnb.price) || 0,
    quantity: fnb.pivot?.quantity || 1,
    totalPrice: parseFloat(fnb.pivot?.price) || 0,
    description: fnb.description || '-',
  })) || [];

  return {
    id: response.id,
    noTransaction: response.invoice_number,
    name: response.bookable?.name || 'N/A',
    phoneNumber: response.bookable?.phone || '-',
    email: response.bookable?.email || '-',
    orderName: response.notes || 'F&B Order',
    quantity: response.total_visitors || 1,
    totalPembayaran: parseFloat(response.total_price) || 0,
    metodePembayaran: transaction?.payment_method?.toUpperCase() || 'QRIS',
    statusBooking: response.status ? (response.status.charAt(0).toUpperCase() + response.status.slice(1)) : 'Unknown',
    tanggalTransaksi: format(createdDate, 'dd/MM/yyyy'),
    tanggalBooking: format(createdDate, 'dd/MM/yyyy'),
    admin: 'Asep', // Default admin name
    fnbItems: fnbItems,
    transaction: transaction,
    rawBooking: response,
  };
};

// Slice ini khusus untuk mengambil data booking yang relevan dengan F&B
export const foodDrinkBookingApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getFoodDrinkBookings: builder.query({
      // Gunakan endpoint baru untuk F&B bookings
      query: ({ page = 1, limit = 15, status = '' }) => {
        const params = {
          page,
          per_page: limit,
          invoice_prefix: 'FNB', // Filter hanya invoice yang berawalan FNB
        };

        // Hanya kirim parameter status jika tidak 'All'
        if (status && status !== 'All') {
          params.status = status.toLowerCase();
        }

        return {
          url: '/api/admin/bookings-fnb',
          params: params,
        };
      },
      // Transformasi data sesuai dengan response API baru
      transformResponse: (response) => {
        console.log('Raw F&B API Response:', response);

        if (!response || !response.data) {
          console.log('No response data found');
          return {
            bookings: [],
            pagination: {
              currentPage: 1,
              totalPages: 1,
              total: 0,
              perPage: 15
            }
          };
        }

        // Transform data booking sesuai dengan struktur baru
        const transformedBookings = response.data.map(booking => {
          const createdDate = booking.created_at ? parseISO(booking.created_at) : new Date();

          // For F&B only bookings, create a simple order summary
          const orderSummary = booking.notes || 'F&B Order';

          return {
            id: booking.id,
            noTransaction: booking.invoice_number,
            name: 'Guest', // Default name since bookable info might not be included
            phoneNumber: '-',
            email: '-',
            orderName: orderSummary,
            notes: booking.notes, // Include notes for display
            quantity: booking.total_visitors || 1,
            totalPembayaran: parseFloat(booking.total_price) || 0,
            metodePembayaran: 'QRIS', // Default payment method
            statusBooking: booking.status ? (booking.status.charAt(0).toUpperCase() + booking.status.slice(1)) : 'Unknown',
            tanggalTransaksi: format(createdDate, 'dd/MM/yyyy'),
            tanggalBooking: format(createdDate, 'dd/MM/yyyy'),
            admin: 'Asep', // Default admin name
            bookableType: booking.bookable_type || 'N/A',
            bookableId: booking.bookable_id || null,
            unitId: booking.unit_id || null,
            gameId: booking.game_id || null,
            startTime: booking.start_time || null,
            endTime: booking.end_time || null,
            eventId: booking.event_id || null,
            promoId: booking.promo_id || null,
            reminderSent: booking.reminder_sent || false,
            taxAmount: parseFloat(booking.tax_amount) || 0,
            serviceFeeAmount: parseFloat(booking.service_fee_amount) || 0,
            fnbItems: [], // Will be populated from detail API if needed
            rawBooking: booking, // Simpan data mentah untuk referensi
          };
        });

        return {
          bookings: transformedBookings,
          pagination: {
            currentPage: response.current_page || 1,
            totalPages: response.last_page || 1,
            total: response.total || 0,
            perPage: response.per_page || 15
          }
        };
      },
      providesTags: (result) =>
        result ? [
          { type: 'FoodDrinkBooking', id: 'LIST' },
          ...result.bookings.map(({ id }) => ({ type: 'FoodDrinkBooking', id }))
        ] : [{ type: 'FoodDrinkBooking', id: 'LIST' }],
    }),

    // Endpoint untuk mendapatkan detail booking F&B
    getFoodDrinkBookingDetail: builder.query({
      query: (bookingId) => {
        // Single booking detail - menggunakan format /api/admin/bookings/{id}
        return {
          url: `/api/admin/bookings/${bookingId}`,
        };
      },
      transformResponse: (response) => {
        console.log('Raw F&B Detail API Response:', response);

        if (!response) {
          return null;
        }

        // Transform single booking detail
        return transformBookingDetail(response);
      },
      providesTags: (result, error, id) => [{ type: 'FoodDrinkBooking', id }],
    }),
  }),
});

export const {
  useGetFoodDrinkBookingsQuery,
  useGetFoodDrinkBookingDetailQuery,
} = foodDrinkBookingApiSlice;
