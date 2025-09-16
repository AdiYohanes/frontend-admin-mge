import { apiSlice } from "../../../store/api/apiSlice";
import { format, parseISO, differenceInHours } from "date-fns";

export const bookingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query({
      query: ({ month = '', year = '', status = '', page = 1, per_page = 10, sort_direction = 'desc' }) => {
        const params = {
          page,
          per_page,
          sort_direction
        };
        // Hanya kirim parameter yang relevan ke backend
        if (month) params.month = month;
        if (year) params.year = year;
        if (status && status !== 'All') params.status = status;

        console.log('🔍 DEBUG - API Query params:', params);

        return {
          url: '/api/admin/bookings-room',
          params: params,
        };
      },
      // Transformasi data mentah dari backend
      transformResponse: (response) => {
        console.log('🔍 DEBUG - Raw response dari backend:', response);

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

        const transformedData = bookingsData
          .map(booking => {
            const hasValidTimes = booking.start_time && booking.end_time;
            const startTime = hasValidTimes ? parseISO(booking.start_time) : null;
            const endTime = hasValidTimes ? parseISO(booking.end_time) : null;

            return {
              id: booking.id,
              noTransaction: booking.invoice_number,
              bookingType: booking.booking_type || 'N/A',
              name: booking.bookable?.name || 'N/A',
              phoneNumber: booking.bookable?.phone || '-',
              console: booking.unit?.consoles?.[0]?.name || 'N/A',
              room: booking.unit?.room?.name || '-',
              unit: booking.unit?.name || '-',
              totalPerson: booking.total_visitors,
              startTime: startTime ? format(startTime, 'HH:mm') : '-',
              duration: startTime && endTime ? differenceInHours(endTime, startTime) : 0,
              endTime: endTime ? format(endTime, 'HH:mm') : '-',
              tanggalBooking: startTime ? format(startTime, 'dd MMMM yyyy') : 'N/A',
              totalPembayaran: parseFloat(booking.total_price) || 0,
              metodePembayaran: booking.payment_method || 'N/A',
              statusBooking: booking.status ? (booking.status.charAt(0).toUpperCase() + booking.status.slice(1)) : 'Unknown',
              rawBooking: booking,
            }
          });

        // Gunakan pagination info asli dari backend (tidak diubah)
        const filteredPaginationInfo = {
          ...paginationInfo,
          // total: paginationInfo.total, // Gunakan total asli dari backend
          // original_total: paginationInfo.total // Simpan total asli untuk debugging
        };

        console.log('🔍 DEBUG - Transformed data:', {
          originalCount: bookingsData.length,
          transformedCount: transformedData.length,
          paginationInfo: filteredPaginationInfo,
          sampleData: transformedData.slice(0, 3)
        });

        // Return both transformed data and pagination info
        return {
          bookings: transformedData,
          pagination: filteredPaginationInfo
        };
      },
      providesTags: (result) => {
        if (!result) return [{ type: 'Booking', id: 'LIST' }];

        const tags = [{ type: 'Booking', id: 'LIST' }];
        if (result.bookings) {
          tags.push(...result.bookings.map(({ id }) => ({ type: 'Booking', id })));
        }
        return tags;
      },
    }),

    getBookingDetail: builder.query({
      query: (bookingId) => ({
        url: `/api/admin/bookings/${bookingId}`,
      }),
      transformResponse: (response) => {
        console.log('🔍 DEBUG - Booking detail response:', response);

        // Transform booking detail data
        const booking = response;
        const isFnb = booking.invoice_number?.startsWith('FNB');

        return {
          id: booking.id,
          invoiceNumber: booking.invoice_number,
          bookableType: booking.bookable_type,
          bookableId: booking.bookable_id,
          unitId: booking.unit_id,
          gameId: booking.game_id,
          startTime: booking.start_time,
          endTime: booking.end_time,
          totalPrice: parseFloat(booking.total_price) || 0,
          status: booking.status,
          notes: booking.notes,
          createdAt: booking.created_at,
          updatedAt: booking.updated_at,
          eventId: booking.event_id,
          totalVisitors: booking.total_visitors,
          promoId: booking.promo_id,
          reminderSent: booking.reminder_sent,
          createdByAdminId: booking.created_by_admin_id,
          taxAmount: parseFloat(booking.tax_amount) || 0,
          serviceFeeAmount: parseFloat(booking.service_fee_amount) || 0,
          bookable: booking.bookable,
          unit: booking.unit,
          game: booking.game,
          fnbs: booking.fnbs || [],
          transactions: booking.transactions || [],
          createdByAdmin: booking.created_by_admin,
          isFnb: isFnb,
          type: isFnb ? 'Food & Beverage' : 'Room Booking'
        };
      },
      providesTags: (result, error, id) => [{ type: 'Booking', id }],
    }),
  }),
});

export const { useGetBookingsQuery, useGetBookingDetailQuery } = bookingApiSlice;
