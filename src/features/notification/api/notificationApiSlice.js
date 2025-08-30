import { apiSlice } from "../../../store/api/apiSlice";

export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all notifications from API
    getNotifications: builder.query({
      query: () => "/api/admin/notifications",
      transformResponse: (response) => {
        // Transform the response to match the expected structure
        return {
          notifications: response.map((notif) => ({
            id: notif.id,
            text: notif.message,
            timestamp: notif.created_at,
            read: notif.is_read,
            link: notif.link,
            read_at: notif.read_at,
            updated_at: notif.updated_at,
          })),
        };
      },
      providesTags: (result) =>
        result
          ? [
            { type: "Notification", id: "LIST" },
            ...result.notifications.map(({ id }) => ({
              type: "Notification",
              id,
            })),
          ]
          : [{ type: "Notification", id: "LIST" }],
    }),

    // Mark all notifications as read
    markAllAsRead: builder.mutation({
      query: () => ({
        url: "/api/admin/notifications/read-all",
        method: "POST",
      }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),

    // Mark single notification as read
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/api/admin/notifications/${id}/read`,
        method: "POST",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Notification", id: "LIST" },
        { type: "Notification", id: arg },
      ],
    }),

    // Delete single notification
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/api/admin/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Notification", id: "LIST" },
        { type: "Notification", id: arg },
      ],
    }),

    // Delete all read notifications
    deleteAllReadNotifications: builder.mutation({
      query: () => ({
        url: "/api/admin/notifications",
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllReadNotificationsMutation
} = notificationApiSlice;
