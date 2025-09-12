import { apiSlice } from "../../../store/api/apiSlice";

export const eventBookingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEventBookings: builder.query({
      query: ({ page = 1, limit = 10, search = "", status = "" }) => {
        // Build query parameters
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (search) params.append('search', search);
        if (status) params.append('status', status);

        const queryString = params.toString();
        const fullUrl = `/api/admin/events${queryString ? `?${queryString}` : ''}`;

        return {
          url: fullUrl,
          method: "GET",
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

        // Flatten bookings from all events
        const allBookings = events.flatMap(event => {
          return event.bookings?.map(booking => {
            // Calculate duration from start and end time
            const startTime = new Date(booking.start_time);
            const endTime = new Date(booking.end_time);
            const durationHours = Math.round((endTime - startTime) / (1000 * 60 * 60));

            return {
              id: booking.id,
              noTransaction: booking.invoice_number,
              eventName: event.name,
              eventDescription: event.description,
              room: booking.unit?.room?.name || "Regular",
              unit: booking.unit?.name || "N/A",
              unitId: booking.unit?.id || 1,
              unitIds: [booking.unit?.id || 1],
              tanggalBooking: booking.created_at,
              startTime: booking.start_time,
              duration: durationHours,
              endTime: booking.end_time,
              statusBooking: booking.status ? (booking.status.charAt(0).toUpperCase() + booking.status.slice(1)) : "Unknown",
              bookable: booking.bookable,
              rawBooking: booking,
              rawEvent: event,
            };
          }) || [];
        });

        return {
          bookings: allBookings,
          totalPages: pagination.totalPages,
          currentPage: pagination.currentPage,
          total: pagination.total,
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
            tanggalBooking: booking.created_at,
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
