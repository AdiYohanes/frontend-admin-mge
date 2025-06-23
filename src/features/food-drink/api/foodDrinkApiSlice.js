import { apiSlice } from "../../../store/api/apiSlice";

const createMockFoodDrink = (id, name, category, price, status, imageUrl) => ({
  id,
  name,
  category,
  price,
  status,
  imageUrl,
});

let mockFoodDrinks = [
  createMockFoodDrink(
    1,
    "Nasi Goreng Spesial",
    "Makanan Berat",
    25000,
    "Available",
    "https://images.unsplash.com/photo-1512058564366-185109023959?w=500&q=80"
  ),
  createMockFoodDrink(
    2,
    "Indomie Goreng Telor",
    "Makanan Berat",
    15000,
    "Available",
    "https://images.unsplash.com/photo-1626723223297-b9e8a5a0d6f6?w=500&q=80"
  ),
  createMockFoodDrink(
    3,
    "Es Teh Manis",
    "Minuman Dingin",
    5000,
    "Available",
    "https://images.unsplash.com/photo-1597402682482-274a2d961e29?w=500&q=80"
  ),
  createMockFoodDrink(
    4,
    "Kopi Hitam",
    "Minuman Panas",
    7000,
    "Sold Out",
    "https://images.unsplash.com/photo-1511920183353-3c9c9b0a1d5a?w=500&q=80"
  ),
  createMockFoodDrink(
    5,
    "Kentang Goreng",
    "Snack",
    12000,
    "Available",
    "https://images.unsplash.com/photo-1541592106381-b58e75a27709?w=500&q=80"
  ),
];
const createMockCategory = (id, name) => ({ id, name });
let mockCategories = [
  createMockCategory(1, "Makanan Berat"),
  createMockCategory(2, "Snack"),
  createMockCategory(3, "Minuman Dingin"),
  createMockCategory(4, "Minuman Panas"),
  createMockCategory(5, "Dessert"),
];
export const foodDrinkApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFoodDrinkItems: builder.query({
      queryFn: async (arg) => {
        const { page = 1, limit = 10, search = "" } = arg;
        let data = mockFoodDrinks.filter((item) =>
          item.name.toLowerCase().includes(search.toLowerCase())
        );
        const paginatedData = data.slice((page - 1) * limit, page * limit);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          data: {
            items: paginatedData,
            totalPages: Math.ceil(data.length / limit),
            currentPage: page,
          },
        };
      },
      providesTags: ["FoodDrink"],
    }),
    addFoodDrinkItem: builder.mutation({
      queryFn: async (newItem) => {
        const completeItem = { ...newItem, id: Date.now() };
        mockFoodDrinks.unshift(completeItem);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: completeItem };
      },
      invalidatesTags: ["FoodDrink"],
    }),
    updateFoodDrinkItem: builder.mutation({
      queryFn: async (updatedItem) => {
        const index = mockFoodDrinks.findIndex(
          (item) => item.id === updatedItem.id
        );
        if (index !== -1) {
          mockFoodDrinks[index] = { ...mockFoodDrinks[index], ...updatedItem };
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: updatedItem };
      },
      invalidatesTags: ["FoodDrink"],
    }),
    deleteFoodDrinkItem: builder.mutation({
      queryFn: async (itemId) => {
        mockFoodDrinks = mockFoodDrinks.filter((item) => item.id !== itemId);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: itemId };
      },
      invalidatesTags: ["FoodDrink"],
    }),
    getCategories: builder.query({
      queryFn: async (arg) => {
        const { page = 1, limit = 10, search = "" } = arg;
        let data = mockCategories.filter((cat) =>
          cat.name.toLowerCase().includes(search.toLowerCase())
        );
        const paginatedData = data.slice((page - 1) * limit, page * limit);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          data: {
            categories: paginatedData,
            totalPages: Math.ceil(data.length / limit),
            currentPage: page,
          },
        };
      },
      providesTags: ["Category"],
    }),
    addCategory: builder.mutation({
      queryFn: async (newCategory) => {
        const completeCategory = { ...newCategory, id: Date.now() };
        mockCategories.unshift(completeCategory);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: completeCategory };
      },
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation({
      queryFn: async (updatedCategory) => {
        const index = mockCategories.findIndex(
          (cat) => cat.id === updatedCategory.id
        );
        if (index !== -1) {
          mockCategories[index] = {
            ...mockCategories[index],
            ...updatedCategory,
          };
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: updatedCategory };
      },
      invalidatesTags: ["Category"],
    }),
    deleteCategory: builder.mutation({
      queryFn: async (categoryId) => {
        mockCategories = mockCategories.filter((cat) => cat.id !== categoryId);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: categoryId };
      },
      invalidatesTags: ["Category"],
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
} = foodDrinkApiSlice;
