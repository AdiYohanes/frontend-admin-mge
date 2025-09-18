import { apiSlice } from "../../../store/api/apiSlice";

// --- TIDAK ADA LAGI MOCK DATA DI SINI ---
// Semua data sekarang 100% diambil dari backend.

export const settingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // === Tax Endpoints ===
    getTaxes: builder.query({
      query: () => ({ url: "/api/public/taxes" }),
      transformResponse: (response) => ({
        taxes: Array.isArray(response)
          ? response.map((t) => ({
            id: t.id,
            name: t.name,
            percentage: Number(t.percentage ?? 0),
            isActive: Boolean(t.is_active),
          }))
          : [],
      }),
      providesTags: [{ type: "Tax", id: "LIST" }],
    }),
    updateTax: builder.mutation({
      query: ({ id, percentage }) => ({
        url: `/api/admin/taxes/${id}`,
        method: "POST",
        body: { percentage },
      }),
      invalidatesTags: [{ type: "Tax", id: "LIST" }],
    }),

    // === Service Fee Endpoints ===
    getServiceFees: builder.query({
      query: () => ({ url: "/api/public/services-fee" }),
      transformResponse: (response) => ({
        services: Array.isArray(response)
          ? response.map((s) => ({
            id: s.id,
            name: s.name,
            amount: Number(s.amount ?? 0),
            isActive: Boolean(s.is_active),
          }))
          : [],
      }),
      providesTags: [{ type: "ServiceFee", id: "LIST" }],
    }),
    updateServiceFee: builder.mutation({
      query: ({ id, amount }) => ({
        url: `/api/admin/services-fee/${id}`,
        method: "POST",
        body: { amount },
      }),
      invalidatesTags: [{ type: "ServiceFee", id: "LIST" }],
    }),
    // === Promo Endpoints ===
    getPromos: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) => ({
        url: "/api/public/promos",
        params: { page, per_page: limit, search },
      }),
      transformResponse: (response) => ({
        promos: response.data.map((promo) => ({
          id: promo.id,
          promo_code: promo.promo_code,
          percentage: promo.percentage,
          is_active: promo.is_active,
          start_date: promo.start_date,
          end_date: promo.end_date,
          usage_limit: promo.usage_limit,
          usage_limit_per_user: promo.usage_limit_per_user,
          times_used: promo.times_used,
          created_at: promo.created_at,
          updated_at: promo.updated_at,
        })),
        totalPages: response.last_page,
        currentPage: response.current_page,
        total: response.total,
        perPage: response.per_page,
        from: response.from,
        to: response.to,
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
      query: (newPromo) => {
        const body = {
          promo_code: newPromo.promo_code || "",
          percentage: newPromo.percentage || 0,
          is_active: newPromo.is_active !== undefined ? newPromo.is_active : true,
          start_date: newPromo.start_date || "",
          end_date: newPromo.end_date || "",
          usage_limit: newPromo.usage_limit || 0,
          usage_limit_per_user: newPromo.usage_limit_per_user || 0,
        };

        return {
          url: "/api/admin/promos",
          method: "POST",
          body,
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      invalidatesTags: [{ type: "Promo", id: "LIST" }],
    }),
    updatePromo: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/api/admin/promos/${id}`,
        method: "POST",
        body: {
          promo_code: String(patch.promo_code).trim(),
          percentage: Number(patch.percentage),
          is_active: Boolean(patch.is_active),
          start_date: String(patch.start_date),
          end_date: String(patch.end_date),
          usage_limit: Number(patch.usage_limit),
          usage_limit_per_user: Number(patch.usage_limit_per_user),
        },
        headers: {
          'Content-Type': 'application/json',
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
      query: () => ({ url: "/api/public/banners" }),
      transformResponse: (response) => ({
        banners: response.data.map((banner) => ({
          ...banner,
          title: banner.title || banner.description, // Use title if available, fallback to description
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
        formData.append("is_active", "1"); // Always active when creating
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
      query: () => "/api/public/consoles",
      transformResponse: (response) => ({
        consoles: response.data.map((console) => ({
          id: console.id,
          name: console.name,
          imageUrl: console.image
            ? `${import.meta.env.VITE_IMAGE_BASE_URL}/${console.image}`
            : `https://placehold.co/150x75/EEE/31343C?text=No+Image`,
          isActive: console.is_active || false,
          description: console.description || "",
        })),
      }),
      providesTags: [{ type: "FeaturedConsole", id: "LIST" }],
    }),
    updateConsoleFeaturedStatus: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/api/admin/consoles/${id}`,
        method: "POST",
        body: { is_active: isActive },
      }),
      invalidatesTags: [{ type: "FeaturedConsole", id: "LIST" }],
    }),

    // === Featured Games Endpoints ===
    getFeaturedGames: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) => ({
        url: "/api/public/games",
        params: { page, per_page: limit, search },
      }),
      transformResponse: (response) => ({
        games: response.data.map((game) => ({
          id: game.id,
          name: game.title || game.name,
          imageUrl: game.image
            ? `${import.meta.env.VITE_IMAGE_BASE_URL}/${game.image}`
            : `https://placehold.co/150x75/EEE/31343C?text=No+Image`,
          isActive: game.is_active || false,
          description: game.description || "",
        })),
        totalPages: response.last_page,
        currentPage: response.current_page,
        totalItems: response.total,
      }),
      providesTags: [{ type: "FeaturedGame", id: "LIST" }],
    }),
    updateGameFeaturedStatus: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/api/admin/games/${id}`,
        method: "POST",
        body: { is_active: isActive },
      }),
      invalidatesTags: [{ type: "FeaturedGame", id: "LIST" }],
    }),

    // === Rewards (Admin) ===
    getRewards: builder.query({
      query: () => "/api/public/rewards",
      transformResponse: (response) => {
        console.log("🔍 DEBUG - getRewards response:", response);

        // Response is already an array directly
        const rewardsData = Array.isArray(response) ? response : [];

        return {
          rewards: rewardsData.map((r) => ({
            id: r.id,
            name: r.name,
            description: r.description || "",
            imageUrl: r.image
              ? `${import.meta.env.VITE_IMAGE_BASE_URL}/${r.image}`
              : `https://placehold.co/48x48/EEE/31343C?text=Img`,
            rewardType: r.effects?.type || "-",
            pointsRequired: Number(r.points_required ?? 0),
            effects: r.effects || {},
            unit: r.unit || null,
            isActive: Boolean(r.is_active),
          }))
        };
      },
      providesTags: (result) =>
        result && result.rewards
          ? [{ type: "Rewards", id: "LIST" }, ...result.rewards.map((r) => ({ type: "Rewards", id: r.id }))]
          : [{ type: "Rewards", id: "LIST" }],
    }),

    // === Rewards (Admin) ===
    addReward: builder.mutation({
      query: (formData) => ({
        url: "/api/admin/rewards",
        method: "POST",
        body: formData,
        // Don't set Content-Type header, let browser set it with boundary for FormData
      }),
      invalidatesTags: [{ type: "Rewards", id: "LIST" }],
    }),
    updateReward: builder.mutation({
      query: ({ id, formData }) => {
        // Add _method field for Laravel method spoofing (POST method)
        formData.append('_method', 'POST');
        return {
          url: `/api/admin/rewards/${id}`,
          method: "POST",
          body: formData,
          // Don't set Content-Type header, let browser set it with boundary for FormData
        };
      },
      invalidatesTags: (result, error, arg) => {
        console.log("🔍 DEBUG - Invalidating tags for updateReward:", {
          result,
          error,
          argId: arg.id,
          tags: [
            { type: "Rewards", id: "LIST" },
            { type: "Rewards", id: arg.id },
          ]
        });

        // Force invalidate all rewards cache
        return [
          { type: "Rewards", id: "LIST" },
          { type: "Rewards", id: arg.id },
          { type: "Rewards", id: "PARTIAL-LIST" },
        ];
      },
    }),
    deleteReward: builder.mutation({
      query: (id) => ({
        url: `/api/admin/rewards/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (r, e, arg) => [
        { type: "Rewards", id: "LIST" },
        { type: "Rewards", id: arg },
      ],
    }),
    updateRewardStatus: builder.mutation({
      query: ({ id, isActive }) => {
        const formData = new FormData();
        formData.append('_method', 'POST');
        formData.append('is_active', isActive ? '1' : '0');

        return {
          url: `/api/admin/rewards/${id}`,
          method: "POST",
          body: formData,
          // Don't set Content-Type header, let browser set it with boundary for FormData
        };
      },
      invalidatesTags: (r, e, arg) => {
        console.log("🔍 DEBUG - Invalidating tags for updateRewardStatus:", {
          result: r,
          error: e,
          argId: arg.id,
          tags: [
            { type: "Rewards", id: "LIST" },
            { type: "Rewards", id: arg.id },
          ]
        });
        return [
          { type: "Rewards", id: "LIST" },
          { type: "Rewards", id: arg.id },
        ];
      },
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
      query: ({ page = 1, per_page = 15 } = {}) => {
        const params = new URLSearchParams();
        if (page > 1) params.set('page', page.toString());
        if (per_page !== 15) params.set('per_page', per_page.toString());

        const queryString = params.toString();
        return `/api/public/customer-reviews${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response) => ({
        reviews: response.data || [],
        pagination: {
          currentPage: response.current_page || 1,
          totalPages: response.last_page || 1,
          total: response.total || 0,
          perPage: response.per_page || 15,
          from: response.from || 0,
          to: response.to || 0,
        },
      }),
      providesTags: [{ type: "CustomerReview", id: "LIST" }],
    }),
    addCustomerReview: builder.mutation({
      query: (item) => ({
        url: "/api/admin/customer-reviews",
        method: "POST",
        body: item,
      }),
      invalidatesTags: [{ type: "CustomerReview", id: "LIST" }],
    }),
    updateCustomerReview: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/api/admin/customer-reviews/${id}`,
        method: "POST",
        body: { ...patch, _method: "POST" },
      }),
      invalidatesTags: (r, e, arg) => [
        { type: "CustomerReview", id: "LIST" },
        { type: "CustomerReview", id: arg.id },
      ],
    }),
    deleteCustomerReview: builder.mutation({
      query: (id) => ({ url: `/api/admin/customer-reviews/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "CustomerReview", id: "LIST" }],
    }),
  }),
});

export const {
  useGetTaxesQuery,
  useUpdateTaxMutation,
  useGetServiceFeesQuery,
  useUpdateServiceFeeMutation,
  useGetRewardsQuery,
  useAddRewardMutation,
  useUpdateRewardMutation,
  useDeleteRewardMutation,
  useUpdateRewardStatusMutation,
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
  useUpdateConsoleFeaturedStatusMutation,
  useGetFeaturedGamesQuery,
  useUpdateGameFeaturedStatusMutation,
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

// Pricelist endpoints
export const pricelistApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPricelists: builder.query({
      query: () => ({
        url: `/api/public/pricelists`,
        method: 'GET',
      }),
      transformResponse: (response) => {
        console.log('Pricelist API - Raw response:', response);
        // Return the response directly since it's already an array
        return Array.isArray(response) ? response : [];
      },
      providesTags: ['Pricelist'],
    }),
  }),
});

export const {
  useGetPricelistsQuery,
} = pricelistApiSlice;
