import { apiSlice } from "../../../store/api/apiSlice";

// --- TIDAK ADA LAGI MOCK DATA DI SINI ---
// Semua data sekarang 100% diambil dari backend.

export const settingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // === Promo Endpoints ===
    getPromos: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) => ({
        url: "/api/public/promos",
        params: { page, per_page: limit, search },
      }),
      transformResponse: (response) => ({
        promos: response.data.map((promo) => ({
          id: promo.id,
          code: promo.name,
          description: promo.description,
          nominal: promo.percentage,
          isActive: promo.is_active,
        })),
        totalPages: response.last_page,
        currentPage: response.current_page,
      }),
      providesTags: (result) =>
        result
          ? [
            { type: "Promo", id: "LIST" },
            ...result.promos.map(({ id }) => ({ type: "Promo", id })),
          ]
          : [{ type: "Promo", id: "LIST" }],
    }),
    addPromo: builder.mutation({
      query: (newPromo) => ({
        url: "/api/admin/promos",
        method: "POST",
        body: {
          name: newPromo.code,
          description: newPromo.description,
          percentage: newPromo.nominal,
          is_active: true,
        },
      }),
      invalidatesTags: [{ type: "Promo", id: "LIST" }],
    }),
    updatePromo: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/api/admin/promos/${id}`,
        method: "POST",
        body: {
          name: patch.code,
          description: patch.description,
          percentage: patch.nominal,
          is_active: patch.isActive,
          _method: "POST",
        },
      }),
      invalidatesTags: (r, e, arg) => [
        { type: "Promo", id: "LIST" },
        { type: "Promo", id: arg.id },
      ],
    }),
    deletePromo: builder.mutation({
      query: (id) => ({ url: `/api/admin/promos/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Promo", id: "LIST" }],
    }),

    // === FAQ Endpoints ===
    getFaqs: builder.query({
      query: () => "/api/public/faqs",
      transformResponse: (response) => ({ faqs: response }),
      providesTags: (result) =>
        result
          ? [
            { type: "Faq", id: "LIST" },
            ...result.faqs.map(({ id }) => ({ type: "Faq", id })),
          ]
          : [{ type: "Faq", id: "LIST" }],
    }),
    addFaq: builder.mutation({
      query: (newFaq) => ({
        url: "/api/admin/faqs",
        method: "POST",
        body: newFaq,
      }),
      invalidatesTags: [{ type: "Faq", id: "LIST" }],
    }),
    updateFaq: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/api/admin/faqs/${id}`,
        method: "POST",
        body: { ...patch, _method: "POST" },
      }),
      invalidatesTags: (r, e, arg) => [
        { type: "Faq", id: "LIST" },
        { type: "Faq", id: arg.id },
      ],
    }),
    deleteFaq: builder.mutation({
      query: (id) => ({ url: `/api/admin/faqs/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Faq", id: "LIST" }],
    }),

    // === Banner Endpoints ===
    getBanners: builder.query({
      query: () => ({ url: "/api/admin/banners" }),
      transformResponse: (response) => ({
        banners: response.data.map((banner) => ({
          ...banner,
          isActive: banner.is_active,
          imageUrl: banner.image
            ? `${import.meta.env.VITE_IMAGE_BASE_URL}/${banner.image}`
            : `https://placehold.co/150x75/EEE/31343C?text=No+Image`,
        })),
        totalPages: response.last_page,
        currentPage: response.current_page,
      }),
      providesTags: (result) =>
        result
          ? [
            { type: "Banner", id: "LIST" },
            ...result.banners.map(({ id }) => ({ type: "Banner", id })),
          ]
          : [{ type: "Banner", id: "LIST" }],
    }),
    addBanner: builder.mutation({
      query: (item) => {
        const formData = new FormData();
        formData.append("title", item.title);
        formData.append("description", item.description);
        if (item.image && item.image.length > 0)
          formData.append("image", item.image[0]);
        return { url: "/api/admin/banners", method: "POST", body: formData };
      },
      invalidatesTags: [{ type: "Banner", id: "LIST" }],
    }),
    updateBanner: builder.mutation({
      query: ({ id, ...patch }) => {
        const formData = new FormData();
        // Hanya kirim data yang ada di patch (yang diubah)
        if (patch.title) formData.append("title", patch.title);
        if (patch.description)
          formData.append("description", patch.description);
        if (patch.image && patch.image.length > 0)
          formData.append("image", patch.image[0]);
        if (patch.isActive !== undefined)
          formData.append("is_active", patch.isActive ? 1 : 0);

        formData.append("_method", "POST"); // Method spoofing
        return {
          url: `/api/admin/banners/${id}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (r, e, arg) => [
        { type: "Banner", id: "LIST" },
        { type: "Banner", id: arg.id },
      ],
    }),
    deleteBanner: builder.mutation({
      query: (id) => ({ url: `/api/admin/banners/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Banner", id: "LIST" }],
    }),

    // === Featured Consoles Endpoints ===
    getFeaturedConsoles: builder.query({
      query: () => "/api/admin/featured-consoles", // Asumsi endpoint
      providesTags: [{ type: "FeaturedConsole", id: "LIST" }],
    }),
    addFeaturedConsole: builder.mutation({
      query: (item) => ({
        url: "/api/admin/featured-consoles",
        method: "POST",
        body: item,
      }),
      invalidatesTags: [{ type: "FeaturedConsole", id: "LIST" }],
    }),
    updateFeaturedConsole: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/api/admin/featured-consoles/${id}`,
        method: "POST",
        body: { ...patch, _method: "POST" },
      }),
      invalidatesTags: (r, e, arg) => [
        { type: "FeaturedConsole", id: "LIST" },
        { type: "FeaturedConsole", id: arg.id },
      ],
    }),
    deleteFeaturedConsole: builder.mutation({
      query: (id) => ({
        url: `/api/admin/featured-consoles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "FeaturedConsole", id: "LIST" }],
    }),

    // === Featured Games Endpoints ===
    getFeaturedGames: builder.query({
      query: () => "/api/admin/featured-games", // Asumsi endpoint
      providesTags: [{ type: "FeaturedGame", id: "LIST" }],
    }),
    addFeaturedGame: builder.mutation({
      query: (item) => ({
        url: "/api/admin/featured-games",
        method: "POST",
        body: item,
      }),
      invalidatesTags: [{ type: "FeaturedGame", id: "LIST" }],
    }),
    updateFeaturedGame: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/api/admin/featured-games/${id}`,
        method: "POST",
        body: { ...patch, _method: "POST" },
      }),
      invalidatesTags: (r, e, arg) => [
        { type: "FeaturedGame", id: "LIST" },
        { type: "FeaturedGame", id: arg.id },
      ],
    }),
    deleteFeaturedGame: builder.mutation({
      query: (id) => ({
        url: `/api/admin/featured-games/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "FeaturedGame", id: "LIST" }],
    }),

    // === Featured Rooms Endpoints ===
    getFeaturedRooms: builder.query({
      query: () => "/api/public/rooms",
      transformResponse: (response) => ({
        rooms: response.data.map((room) => ({
          id: room.id,
          name: room.name,
          imageUrl: room.image
            ? `${import.meta.env.VITE_IMAGE_BASE_URL}/${room.image}`
            : `https://placehold.co/150x75/EEE/31343C?text=No+Image`,
          isActive: room.is_available || false, // Map is_available to isActive
          description: room.description || "",
        })),
      }),
      providesTags: [{ type: "FeaturedRoom", id: "LIST" }],
    }),
    updateRoomFeaturedStatus: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/api/admin/rooms/${id}`,
        method: "POST",
        body: { is_available: isActive }, // Send is_available in request body
      }),
      invalidatesTags: [{ type: "FeaturedRoom", id: "LIST" }],
    }),
    addFeaturedRoom: builder.mutation({
      query: (item) => ({
        url: "/api/admin/featured-rooms",
        method: "POST",
        body: item,
      }),
      invalidatesTags: [{ type: "FeaturedRoom", id: "LIST" }],
    }),
    updateFeaturedRoom: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/api/admin/featured-rooms/${id}`,
        method: "POST",
        body: { ...patch, _method: "POST" },
      }),
      invalidatesTags: (r, e, arg) => [
        { type: "FeaturedRoom", id: "LIST" },
        { type: "FeaturedRoom", id: arg.id },
      ],
    }),
    deleteFeaturedRoom: builder.mutation({
      query: (id) => ({
        url: `/api/admin/featured-rooms/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "FeaturedRoom", id: "LIST" }],
    }),

    // === Customer Reviews Endpoints ===
    getCustomerReviews: builder.query({
      query: () => "/api/admin/reviews", // Asumsi endpoint
      providesTags: [{ type: "CustomerReview", id: "LIST" }],
    }),
    addCustomerReview: builder.mutation({
      query: (item) => ({
        url: "/api/admin/reviews",
        method: "POST",
        body: item,
      }),
      invalidatesTags: [{ type: "CustomerReview", id: "LIST" }],
    }),
    updateCustomerReview: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/api/admin/reviews/${id}`,
        method: "POST",
        body: { ...patch, _method: "POST" },
      }),
      invalidatesTags: (r, e, arg) => [
        { type: "CustomerReview", id: "LIST" },
        { type: "CustomerReview", id: arg.id },
      ],
    }),
    deleteCustomerReview: builder.mutation({
      query: (id) => ({ url: `/api/admin/reviews/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "CustomerReview", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPromosQuery,
  useAddPromoMutation,
  useUpdatePromoMutation,
  useDeletePromoMutation,
  useGetFaqsQuery,
  useAddFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  useGetBannersQuery,
  useAddBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useGetFeaturedConsolesQuery,
  useAddFeaturedConsoleMutation,
  useUpdateFeaturedConsoleMutation,
  useDeleteFeaturedConsoleMutation,
  useGetFeaturedGamesQuery,
  useAddFeaturedGameMutation,
  useUpdateFeaturedGameMutation,
  useDeleteFeaturedGameMutation,
  useGetFeaturedRoomsQuery,
  useUpdateRoomFeaturedStatusMutation,
  useAddFeaturedRoomMutation,
  useUpdateFeaturedRoomMutation,
  useDeleteFeaturedRoomMutation,
  useGetCustomerReviewsQuery,
  useAddCustomerReviewMutation,
  useUpdateCustomerReviewMutation,
  useDeleteCustomerReviewMutation,
} = settingsApiSlice;
