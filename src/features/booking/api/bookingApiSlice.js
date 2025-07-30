/* eslint-disable no-unused-vars */
import { apiSlice } from "../../../store/api/apiSlice";
import { format, parseISO, differenceInHours } from "date-fns";

export const bookingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query({
      // --- PERBAIKAN UTAMA DI SINI ---
      query: ({ month = '', status = '', page = 1, per_page = 10 }) => {
        const params = {
          page,
          per_page
        };
        // Hanya kirim parameter yang relevan ke backend
        if (month) params.month = month;
        if (status && status !== 'All') params.status = status.toLowerCase();

        console.log('🔍 DEBUG - API Query params:', params);

        return {
          url: '/api/admin/bookings',
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
          // PERBAIKAN: Hapus filter strict BOOK prefix karena data bisa EVT-, BOOK-, dll
          // .filter(booking => booking.invoice_number && booking.invoice_number.startsWith('BOOK'))
          // Filter: Exclude FNB invoice numbers
          .filter(booking => !booking.invoice_number?.startsWith('FNB'))
          .map(booking => {
            const hasValidTimes = booking.start_time && booking.end_time;
            const startTime = hasValidTimes ? parseISO(booking.start_time) : null;
            const endTime = hasValidTimes ? parseISO(booking.end_time) : null;

            return {
              id: booking.id,
              noTransaction: booking.invoice_number,
              bookingType: booking.bookable_type?.includes('Guest') ? 'OTS' : 'Online',
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
              metodePembayaran: 'QRIS',
              statusBooking: booking.status ? (booking.status.charAt(0).toUpperCase() + booking.status.slice(1)) : 'Unknown',
              rawBooking: booking,
            }
          });

        // PERBAIKAN: Update pagination info dengan count yang sudah difilter
        const filteredPaginationInfo = {
          ...paginationInfo,
          total: transformedData.length, // Gunakan count yang sudah difilter
          original_total: paginationInfo.total // Simpan total asli untuk debugging
        };

        console.log('🔍 DEBUG - Transformed data:', {
          originalCount: bookingsData.length,
          transformedCount: transformedData.length,
          originalTotal: paginationInfo.total,
          filteredTotal: filteredPaginationInfo.total,
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

    addBooking: builder.mutation({
      query: (newBooking) => ({
        url: "/api/admin/bookings",
        method: "POST",
        body: newBooking,
      }),
      invalidatesTags: [{ type: "Booking", id: "LIST" }],
    }),
    updateBooking: builder.mutation({
      query: ({ id, ...patch }) => {
        const formData = new FormData();
        // Loop melalui data patch dan tambahkan ke FormData
        for (const key in patch) {
          formData.append(key, patch[key]);
        }

        return {
          url: `/api/admin/bookings/${id}/update`,
          method: 'POST',
          body: formData, // Kirim sebagai FormData
        };
      },
      invalidatesTags: (result, error, arg) => [{ type: 'Booking', id: 'LIST' }, { type: 'Booking', id: arg.id }],
    }),
    deleteBooking: builder.mutation({
      query: (bookingId) => ({
        url: `/api/admin/bookings/${bookingId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Booking", id: "LIST" }],
    }), getAvailableDays: builder.mutation({
      query: ({ unitId, startDate, endDate }) => ({
        url: `/api/public/get-availability-day/${unitId}`,
        method: 'POST',
        body: {
          start_date: startDate,
          end_date: endDate,
        },
      }),
    }),

    // Mutation untuk memeriksa ketersediaan jam pada hari tertentu
    getAvailableTimes: builder.mutation({
      query: ({ unitId, date }) => ({
        url: `/api/public/get-availability-time/${unitId}`,
        method: 'POST',
        body: { date },
      }),
    }),

    // Ganti updateBooking dengan mutation yang lebih spesifik
    rescheduleBooking: builder.mutation({
      query: ({ bookingId, startTime, endTime }) => ({
        url: `/api/reschedule/${bookingId}`,
        method: 'POST',
        body: {
          start_time: startTime,
          end_time: endTime,
        },
      }),
      // Invalidate getBookings agar tabel di-refresh
      invalidatesTags: [{ type: 'Booking', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useAddBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
  useGetAvailableDaysMutation, // Hook baru
  useGetAvailableTimesMutation, // Hook baru
  useRescheduleBookingMutation, // Hook baru
} = bookingApiSlice;
