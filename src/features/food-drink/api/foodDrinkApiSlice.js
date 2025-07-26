import { apiSlice } from "../../../store/api/apiSlice";

// --- TIDAK ADA LAGI MOCK DATA DI SINI ---
// Semua data sekarang 100% diambil dari backend.

export const foodDrinkApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // === Food & Drink Items Endpoints (Terhubung ke Backend) ===
    getFoodDrinkItems: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) => ({
        url: "/api/public/fnbs",
        params: { page, per_page: limit, search },
      }),
      transformResponse: (response) => {
        return {
          items: response.data.map((item) => ({
            ...item,
            category: item.fnb_category?.category || "Uncategorized",
            imageUrl: item.image
              ? `${import.meta.env.VITE_IMAGE_BASE_URL}/${item.image}`
              : `https://placehold.co/60x60/EEE/31343C?text=${item.name.charAt(
                  0
                )}`,
          })),
          totalPages: response.last_page,
          currentPage: response.current_page,
        };
      },
      providesTags: (result) =>
        result
          ? [
              { type: "FoodDrink", id: "LIST" },
              ...result.items.map(({ id }) => ({ type: "FoodDrink", id })),
            ]
          : [{ type: "FoodDrink", id: "LIST" }],
    }),
    addFoodDrinkItem: builder.mutation({
      query: (newItem) => {
        const formData = new FormData();
        formData.append("name", newItem.name);
        formData.append("fnb_category_id", newItem.fnb_category_id);
        formData.append("price", newItem.price);
        formData.append("description", newItem.description || "");
        if (newItem.image && newItem.image.length > 0) {
          formData.append("image", newItem.image[0]);
        }
        return { url: "/api/admin/fnb", method: "POST", body: formData };
      },
      invalidatesTags: [{ type: "FoodDrink", id: "LIST" }],
    }),
    updateFoodDrinkItem: builder.mutation({
      query: ({ id, ...patch }) => {
        const formData = new FormData();

        // --- PERBAIKAN UTAMA DI SINI ---
        // Hanya tambahkan field ke FormData jika ada nilainya di 'patch'
        if (patch.name) formData.append("name", patch.name);
        if (patch.fnb_category_id)
          formData.append("fnb_category_id", patch.fnb_category_id);
        if (patch.price) formData.append("price", patch.price);
        if (patch.description)
          formData.append("description", patch.description);
        if (patch.is_available !== undefined) {
          formData.append("is_available", patch.is_available ? 1 : 0);
        }
        // Hanya tambahkan gambar jika file baru benar-benar dipilih
        if (patch.image && patch.image[0] instanceof File) {
          formData.append("image", patch.image[0]);
        }

        formData.append("_method", "POST");
        return { url: `/api/admin/fnb/${id}`, method: "POST", body: formData };
      },
      invalidatesTags: (r, e, arg) => [
        { type: "FoodDrink", id: "LIST" },
        { type: "FoodDrink", id: arg.id },
      ],
    }),
    deleteFoodDrinkItem: builder.mutation({
      query: (id) => ({ url: `/api/admin/fnb/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "FoodDrink", id: "LIST" }],
    }),

    // === Category Endpoints (Terhubung ke Backend) ===
    getCategories: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) => ({
        url: "/api/public/fnb-category",
        params: { page, per_page: limit, search },
      }),
      transformResponse: (response) => ({
        categories: response.data.map((category) => ({
          id: category.id,
          name: category.category,
          type: category.type,
          totalItems: category.fnbs.length,
        })),
        totalPages: response.last_page,
        currentPage: response.current_page,
      }),
      providesTags: (result) =>
        result
          ? [
              { type: "Category", id: "LIST" },
              ...result.categories.map(({ id }) => ({ type: "Category", id })),
            ]
          : [{ type: "Category", id: "LIST" }],
    }),
    getAllCategories: builder.query({
      query: () => "/api/public/fnb-category?per_page=9999",
      transformResponse: (response) => response.data,
      providesTags: ["Category"],
    }),
    addCategory: builder.mutation({
      query: (newCategory) => ({
        url: "/api/admin/fnb-category",
        method: "POST",
        body: newCategory,
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/api/admin/fnb-category/${id}`,
        method: "POST",
        body: { ...patch, _method: "POST" },
      }),
      invalidatesTags: (r, e, arg) => [
        { type: "Category", id: "LIST" },
        { type: "Category", id: arg.id },
      ],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/api/admin/fnb-category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),
  }),
});

export const {
  useGetFoodDrinkItemsQuery,
  useAddFoodDrinkItemMutation,
  useUpdateFoodDrinkItemMutation,
  useDeleteFoodDrinkItemMutation,
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetAllCategoriesQuery,
} = foodDrinkApiSlice;
