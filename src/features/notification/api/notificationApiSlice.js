import { apiSlice } from "../../../store/api/apiSlice";
import { subMinutes } from "date-fns";

const createMockNotification = (id, text, minutesAgo, read = false) => ({
  id,
  text,
  timestamp: subMinutes(new Date(), minutesAgo).toISOString(),
  read,
});

let mockNotifications = [
  createMockNotification(
    1,
    "MonsterHunter booked VIP Unit A for 2 hours.",
    1,
    false
  ),
  createMockNotification(2, "New Customer is registered!", 25, false),
  createMockNotification(
    3,
    "MonsterHunter booked VVIP Unit A for 5 hours.",
    25,
    false
  ),
  createMockNotification(
    4,
    "AsepSubagja booked Regular Unit A for 2 hours.",
    120,
    true
  ),
  createMockNotification(
    5,
    "MonsterHunter booked VIP Unit A for 2 hours.",
    1440,
    true
  ),
  createMockNotification(6, "New Customer is registered!", 2880, true),
];

export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // PERBAIKAN 1: Gunakan providesTags dengan pola objek
    getNotifications: builder.query({
      queryFn: async () => {
        const sortedNotifs = [...mockNotifications].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: { notifications: sortedNotifs } };
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

    // PERBAIKAN 2: Gunakan pola imutabel (.map) dan invalidatesTags yang benar
    markAllAsRead: builder.mutation({
      queryFn: async () => {
        // Jangan mutasi langsung! Buat array baru dengan .map
        mockNotifications = mockNotifications.map((notif) => ({
          ...notif,
          read: true,
        }));
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: "ok" };
      },
      // Invalidate tag 'LIST' yang spesifik
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkAllAsReadMutation } =
  notificationApiSlice;
