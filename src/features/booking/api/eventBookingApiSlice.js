import { apiSlice } from "../../../store/api/apiSlice";

export const eventBookingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEventBookings: builder.query({
      query: ({ page = 1, limit = 10, search = "", status = "", month = "", year = "", sort_direction = "desc" }) => {
        const params = {
          page,
          per_page: limit,
        };

        // Hanya kirim parameter yang relevan ke backend
        if (search && search.trim()) params.search = search.trim();
        if (status && status !== 'All') params.status = status.toLowerCase();
        if (month) params.month = month;
        if (year) params.year = year;
        if (sort_direction) params.sort_direction = sort_direction;

        console.log('🔍 DEBUG - Event API Query params:', params);

        return {
          url: '/api/admin/events',
          params: params,
        };
      },
      transformResponse: (response) => {
        // Handle Laravel pagination response structure
        const events = response?.data || [];
        const pagination = {
          currentPage: response?.current_page || 1,
          totalPages: response?.last_page || 1,
          total: response?.total || 0,
          perPage: response?.per_page || 15,
        };

        // Transform events to show event-level data instead of individual bookings
        const transformedEvents = events.map(event => {
          // Calculate duration from event start and end time
          const startTime = new Date(event.start_time);
          const endTime = new Date(event.end_time);
          const durationHours = Math.round((endTime - startTime) / (1000 * 60 * 60));

          // Get booking count and first booking for reference
          const firstBooking = event.bookings?.[0];
          const bookingCount = event.bookings?.length || 0;

          return {
            id: event.id,
            noTransaction: firstBooking?.invoice_number || `EVT-${event.id}`,
            eventName: event.name,
            eventDescription: event.description,
            room: firstBooking?.unit?.room?.name || "Event Area",
            unit: bookingCount > 1 ? `${bookingCount} Units` : (firstBooking?.unit?.name || "N/A"),
            unitId: firstBooking?.unit?.id || 1,
            unitIds: event.bookings?.map(b => b.unit?.id).filter(Boolean) || [],
            tanggalBooking: event.start_time,
            startTime: event.start_time,
            duration: durationHours,
            endTime: event.end_time,
            statusBooking: event.status ? (event.status.charAt(0).toUpperCase() + event.status.slice(1)) : "Unknown",
            bookingCount: bookingCount,
            totalVisitors: event.bookings?.reduce((sum, b) => sum + (b.total_visitors || 0), 0) || 0,
            totalPrice: event.bookings?.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0) || 0,
            rawEvent: event,
            rawBookings: event.bookings || [],
          };
        });

        return {
          bookings: transformedEvents, // Now showing events instead of individual bookings
          events: events, // Keep original events for reference
          pagination: {
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            total: pagination.total, // Keep original total from API (events count)
            perPage: pagination.perPage,
          },
        };
      },
      providesTags: ["EventBooking"],
    }),

    addEventBooking: builder.mutation({
      query: (newEvent) => {
        return {
          url: "/api/admin/events",
          method: "POST",
          body: newEvent,
        };
      },
      transformResponse: (response) => {
        // Transform the response to match the expected format
        const event = response.event;
        const bookings = event?.bookings || [];

        if (bookings.length > 0) {
          // Return the first booking for consistency with existing code
          const booking = bookings[0];
          return {
            id: booking.id,
            noTransaction: booking.invoice_number,
            eventName: event.name,
            eventDescription: event.description,
            room: booking.unit?.room?.name || "Event Area",
            unit: booking.unit?.name || "N/A",
            tanggalBooking: booking.start_time,
            startTime: booking.start_time,
            duration: 4,
            endTime: booking.end_time,
            statusBooking: booking.status ? (booking.status.charAt(0).toUpperCase() + booking.status.slice(1)) : "Unknown",
            bookable: booking.bookable,
            rawBooking: booking,
            rawEvent: event,
          };
        }

        return response;
      },
      invalidatesTags: ["EventBooking"],
    }),

    updateEventBooking: builder.mutation({
      query: ({ id, ...updatedEvent }) => {
        return {
          url: `/api/admin/events/${id}`,
          method: "POST",
          body: updatedEvent,
        };
      },
      invalidatesTags: ["EventBooking"],
    }),

    deleteEventBooking: builder.mutation({
      query: (eventId) => ({
        url: `/api/admin/events/${eventId}`,
        method: "DELETE",
      }),
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
