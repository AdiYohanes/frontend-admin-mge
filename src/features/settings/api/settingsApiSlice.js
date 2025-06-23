import { apiSlice } from "../../../store/api/apiSlice";

// --- BAGIAN MOCK DATA (Tidak ada perubahan) ---
let mockPromos = [
  {
    id: 1,
    code: "RAMADAN25",
    description: "Diskon spesial bulan Ramadan",
    nominal: 25,
    isActive: true,
  },
];
let mockFaqs = [
  {
    id: 1,
    question: "Bagaimana cara booking?",
    answer: "Anda bisa booking melalui halaman Booking > Room.",
    isPublished: true,
  },
];
let mockBanners = [
  {
    id: 1,
    title: "Promo Ramadan Besar!",
    description: "Diskon hingga 25%...",
    imageUrl:
      "https://images.unsplash.com/photo-1555529771-788878a17634?w=800&q=80",
    isActive: true,
  },
];
let mockFeaturedConsoles = [
  {
    id: 1,
    title: "PlayStation 5",
    imageUrl:
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&q=80",
  },
];
let mockFeaturedGames = [
  {
    id: 1,
    description: "Game Paling Populer Bulan Ini",
    highlightedGames: ["EA FC 24", "GTA V"],
    isActive: true,
  },
];
let mockFeaturedRooms = [
  {
    id: 1,
    title: "Ruangan VIP Eksklusif",
    description: "Pengalaman bermain premium.",
    images: [
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&q=80",
    ],
    isActive: true,
  },
];
let mockCustomerReviews = [
  {
    id: 1,
    name: "Budi Hartono",
    description: "Tempatnya nyaman!",
    rating: 5,
    avatarUrl: "https://i.pravatar.cc/150?u=budi",
    isActive: true,
  },
];

export const settingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // === Promo Endpoints ===
    getPromos: builder.query({
      queryFn: async () => ({ data: { promos: mockPromos } }),
      providesTags: (result) =>
        result
          ? [
              { type: "Promo", id: "LIST" },
              ...result.promos.map(({ id }) => ({ type: "Promo", id })),
            ]
          : [{ type: "Promo", id: "LIST" }],
    }),
    addPromo: builder.mutation({
      queryFn: async (item) => {
        const newItem = { ...item, id: Date.now(), isActive: true };
        mockPromos = [newItem, ...mockPromos];
        return { data: newItem };
      },
      invalidatesTags: [{ type: "Promo", id: "LIST" }],
    }),
    updatePromo: builder.mutation({
      queryFn: async (item) => {
        mockPromos = mockPromos.map((p) =>
          p.id === item.id ? { ...p, ...item } : p
        );
        return { data: item };
      },
      invalidatesTags: (r, e, arg) => [
        { type: "Promo", id: "LIST" },
        { type: "Promo", id: arg.id },
      ],
    }),
    deletePromo: builder.mutation({
      queryFn: async (id) => {
        mockPromos = mockPromos.filter((p) => p.id !== id);
        return { data: id };
      },
      invalidatesTags: [{ type: "Promo", id: "LIST" }],
    }),

    // === FAQ Endpoints ===
    getFaqs: builder.query({
      queryFn: async () => ({ data: { faqs: mockFaqs } }),
      providesTags: (result) =>
        result
          ? [
              { type: "Faq", id: "LIST" },
              ...result.faqs.map(({ id }) => ({ type: "Faq", id })),
            ]
          : [{ type: "Faq", id: "LIST" }],
    }),
    addFaq: builder.mutation({
      queryFn: async (item) => {
        const newItem = { ...item, id: Date.now(), isPublished: false };
        mockFaqs = [newItem, ...mockFaqs];
        return { data: newItem };
      },
      invalidatesTags: [{ type: "Faq", id: "LIST" }],
    }),
    updateFaq: builder.mutation({
      queryFn: async (item) => {
        mockFaqs = mockFaqs.map((f) =>
          f.id === item.id ? { ...f, ...item } : f
        );
        return { data: item };
      },
      invalidatesTags: (r, e, arg) => [
        { type: "Faq", id: "LIST" },
        { type: "Faq", id: arg.id },
      ],
    }),
    deleteFaq: builder.mutation({
      queryFn: async (id) => {
        mockFaqs = mockFaqs.filter((f) => f.id !== id);
        return { data: id };
      },
      invalidatesTags: [{ type: "Faq", id: "LIST" }],
    }),

    // === Banner Endpoints ===
    getBanners: builder.query({
      queryFn: async () => ({ data: { banners: mockBanners } }),
      providesTags: (result) =>
        result
          ? [
              { type: "Banner", id: "LIST" },
              ...result.banners.map(({ id }) => ({ type: "Banner", id })),
            ]
          : [{ type: "Banner", id: "LIST" }],
    }),
    addBanner: builder.mutation({
      queryFn: async (item) => {
        const newItem = { ...item, id: Date.now(), isActive: true };
        mockBanners = [newItem, ...mockBanners];
        return { data: newItem };
      },
      invalidatesTags: [{ type: "Banner", id: "LIST" }],
    }),
    updateBanner: builder.mutation({
      queryFn: async (item) => {
        mockBanners = mockBanners.map((b) =>
          b.id === item.id ? { ...b, ...item } : b
        );
        return { data: item };
      },
      invalidatesTags: (r, e, arg) => [
        { type: "Banner", id: "LIST" },
        { type: "Banner", id: arg.id },
      ],
    }),
    deleteBanner: builder.mutation({
      queryFn: async (id) => {
        mockBanners = mockBanners.filter((b) => b.id !== id);
        return { data: id };
      },
      invalidatesTags: [{ type: "Banner", id: "LIST" }],
    }),

    // ... Pola yang sama diterapkan untuk semua endpoint lainnya ...
    getFeaturedConsoles: builder.query({
      queryFn: async () => ({ data: { consoles: mockFeaturedConsoles } }),
      providesTags: (result) =>
        result
          ? [
              { type: "FeaturedConsole", id: "LIST" },
              ...result.consoles.map(({ id }) => ({
                type: "FeaturedConsole",
                id,
              })),
            ]
          : [{ type: "FeaturedConsole", id: "LIST" }],
    }),
    addFeaturedConsole: builder.mutation({
      queryFn: async (item) => {
        const newItem = { ...item, id: Date.now() };
        mockFeaturedConsoles = [newItem, ...mockFeaturedConsoles];
        return { data: newItem };
      },
      invalidatesTags: [{ type: "FeaturedConsole", id: "LIST" }],
    }),
    updateFeaturedConsole: builder.mutation({
      queryFn: async (item) => {
        mockFeaturedConsoles = mockFeaturedConsoles.map((c) =>
          c.id === item.id ? { ...c, ...item } : c
        );
        return { data: item };
      },
      invalidatesTags: (r, e, arg) => [
        { type: "FeaturedConsole", id: "LIST" },
        { type: "FeaturedConsole", id: arg.id },
      ],
    }),
    deleteFeaturedConsole: builder.mutation({
      queryFn: async (id) => {
        mockFeaturedConsoles = mockFeaturedConsoles.filter((c) => c.id !== id);
        return { data: id };
      },
      invalidatesTags: [{ type: "FeaturedConsole", id: "LIST" }],
    }),

    getFeaturedGames: builder.query({
      queryFn: async () => ({ data: { games: mockFeaturedGames } }),
      providesTags: (result) =>
        result
          ? [
              { type: "FeaturedGame", id: "LIST" },
              ...result.games.map(({ id }) => ({ type: "FeaturedGame", id })),
            ]
          : [{ type: "FeaturedGame", id: "LIST" }],
    }),
    addFeaturedGame: builder.mutation({
      queryFn: async (item) => {
        const newItem = { ...item, id: Date.now(), isActive: true };
        mockFeaturedGames = [newItem, ...mockFeaturedGames];
        return { data: newItem };
      },
      invalidatesTags: [{ type: "FeaturedGame", id: "LIST" }],
    }),
    updateFeaturedGame: builder.mutation({
      queryFn: async (item) => {
        mockFeaturedGames = mockFeaturedGames.map((g) =>
          g.id === item.id ? { ...g, ...item } : g
        );
        return { data: item };
      },
      invalidatesTags: (r, e, arg) => [
        { type: "FeaturedGame", id: "LIST" },
        { type: "FeaturedGame", id: arg.id },
      ],
    }),
    deleteFeaturedGame: builder.mutation({
      queryFn: async (id) => {
        mockFeaturedGames = mockFeaturedGames.filter((g) => g.id !== id);
        return { data: id };
      },
      invalidatesTags: [{ type: "FeaturedGame", id: "LIST" }],
    }),

    getFeaturedRooms: builder.query({
      queryFn: async () => ({ data: { rooms: mockFeaturedRooms } }),
      providesTags: (result) =>
        result
          ? [
              { type: "FeaturedRoom", id: "LIST" },
              ...result.rooms.map(({ id }) => ({ type: "FeaturedRoom", id })),
            ]
          : [{ type: "FeaturedRoom", id: "LIST" }],
    }),
    addFeaturedRoom: builder.mutation({
      queryFn: async (item) => {
        const newItem = { ...item, id: Date.now(), isActive: true };
        mockFeaturedRooms = [newItem, ...mockFeaturedRooms];
        return { data: newItem };
      },
      invalidatesTags: [{ type: "FeaturedRoom", id: "LIST" }],
    }),
    updateFeaturedRoom: builder.mutation({
      queryFn: async (item) => {
        mockFeaturedRooms = mockFeaturedRooms.map((r) =>
          r.id === item.id ? { ...r, ...item } : r
        );
        return { data: item };
      },
      invalidatesTags: (r, e, arg) => [
        { type: "FeaturedRoom", id: "LIST" },
        { type: "FeaturedRoom", id: arg.id },
      ],
    }),
    deleteFeaturedRoom: builder.mutation({
      queryFn: async (id) => {
        mockFeaturedRooms = mockFeaturedRooms.filter((r) => r.id !== id);
        return { data: id };
      },
      invalidatesTags: [{ type: "FeaturedRoom", id: "LIST" }],
    }),

    getCustomerReviews: builder.query({
      queryFn: async () => ({ data: { reviews: mockCustomerReviews } }),
      providesTags: (result) =>
        result
          ? [
              { type: "CustomerReview", id: "LIST" },
              ...result.reviews.map(({ id }) => ({
                type: "CustomerReview",
                id,
              })),
            ]
          : [{ type: "CustomerReview", id: "LIST" }],
    }),
    addCustomerReview: builder.mutation({
      queryFn: async (item) => {
        const newItem = { ...item, id: Date.now(), isActive: true };
        // BENAR: Membuat array baru, bukan .push()
        mockCustomerReviews = [newItem, ...mockCustomerReviews];
        console.log(
          "Data review baru ditambahkan ke mock:",
          mockCustomerReviews
        );
        return { data: newItem };
      },
      invalidatesTags: [{ type: "CustomerReview", id: "LIST" }],
    }),
    updateCustomerReview: builder.mutation({
      queryFn: async (item) => {
        // BENAR: Membuat array baru dengan .map()
        mockCustomerReviews = mockCustomerReviews.map((r) =>
          r.id === item.id ? { ...r, ...item } : r
        );
        return { data: item };
      },
      invalidatesTags: (r, e, arg) => [
        { type: "CustomerReview", id: "LIST" },
        { type: "CustomerReview", id: arg.id },
      ],
    }),
    deleteCustomerReview: builder.mutation({
      queryFn: async (id) => {
        // BENAR: .filter() sudah menghasilkan array baru
        mockCustomerReviews = mockCustomerReviews.filter((r) => r.id !== id);
        return { data: id };
      },
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
  useAddFeaturedRoomMutation,
  useUpdateFeaturedRoomMutation,
  useDeleteFeaturedRoomMutation,
  useGetCustomerReviewsQuery,
  useAddCustomerReviewMutation,
  useUpdateCustomerReviewMutation,
  useDeleteCustomerReviewMutation,
} = settingsApiSlice;
