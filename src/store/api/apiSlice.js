/* eslint-disable no-unused-vars */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,

    // --- PERUBAHAN DI SINI ---
    // Bagian ini diaktifkan untuk secara otomatis menyisipkan token
    // ke dalam header setiap permintaan API.
    prepareHeaders: (headers, { getState }) => {
      // Ambil token dari state Redux 'auth'
      const token = getState().auth.token;
      if (token) {
        // Jika token ada, tambahkan sebagai header Authorization
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  // Daftar tag ini digunakan untuk caching dan invalidasi otomatis
  tagTypes: [
    "Dashboard",
    "Booking",
    "User",
    "Console",
    "Room",
    "Unit",
    "Game",
    "Promo",
    "Faq",
    "Banner",
    "FeaturedConsole",
    "FeaturedGame",
    "FeaturedRoom",
    "CustomerReview",
    "FoodDrinkBooking",
    "EventBooking",
    "Transaction",
    "Notification",
  ],

  // Endpoints akan di-inject dari file-file slice lainnya
  endpoints: (builder) => ({}),
});
