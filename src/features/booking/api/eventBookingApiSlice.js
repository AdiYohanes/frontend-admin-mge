import { apiSlice } from "../../../store/api/apiSlice";

export const eventBookingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEventBookings: builder.query({
      query: ({ page = 1, limit = 10, search = "", status = "" }) => ({
        url: "/api/admin/events",
        method: "GET",
        params: { page, limit, search, status },
      }),
      transformResponse: (response) => {
        console.log('API Response:', response);

        // Transform the array of events into the expected format
        const events = response || [];
        console.log('Events array:', events);

        // Flatten bookings from all events
        const allBookings = events.flatMap(event => {
          console.log('Processing event:', event);
          console.log('Event bookings:', event.bookings);

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
              console: booking.unit?.console?.name || "Playstation 4", // Add console info
              room: booking.unit?.room?.name || "Regular", // Add room info
              unit: booking.unit?.name || "N/A",
              unitId: booking.unit?.id || 1, // Add unitId for editing
              unitIds: [booking.unit?.id || 1], // Add unitIds array for editing
              totalPerson: booking.total_visitors || 0,
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

        console.log('Transformed bookings:', allBookings);

        return {
          bookings: allBookings,
          totalPages: 1, // Default to 1 page since we don't have pagination info
          currentPage: 1, // Default to page 1
          total: allBookings.length,
        };
      },
      providesTags: ["EventBooking"],
    }),

    addEventBooking: builder.mutation({
      query: (newEvent) => {
        console.log('=== API MUTATION DEBUG ===');
        console.log('Raw payload received:', newEvent);
        console.log('Payload type:', typeof newEvent);
        console.log('Payload keys:', Object.keys(newEvent));
        console.log('=== END API DEBUG ===');

        return {
          url: "/api/admin/events",
          method: "POST",
          body: newEvent, // Send the payload directly as it's already formatted correctly
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
            console: booking.unit?.name || "N/A",
            room: "Event Area",
            unit: booking.unit?.name || "N/A",
            totalPerson: booking.total_visitors || 0,
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
        console.log('=== UPDATE API DEBUG ===');
        console.log('Update ID:', id);
        console.log('Update payload:', updatedEvent);
        console.log('=== END UPDATE DEBUG ===');

        return {
          url: `/api/admin/events/${id}`,
          method: "POST",
          body: updatedEvent, // Send the payload directly as it's already formatted correctly
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
