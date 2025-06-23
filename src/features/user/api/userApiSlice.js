import { apiSlice } from "../../../store/api/apiSlice";

const createMockUser = (i) => ({
  id: i + 1,
  name: `Customer Name ${i + 1}`,
  username: `customer${i + 1}`,
  phoneNumber: `081234567${String(i + 1).padStart(3, "0")}`,
  email: `customer${i + 1}@example.com`,
  totalSpending: 1500000 - i * 75000,
  type: "customer",
});
const createMockAdmin = (i, name, email, role) => ({
  id: 50 + i,
  name: name,
  username: name.toLowerCase().replace(" ", ""),
  phoneNumber: `081111111${String(i).padStart(3, "0")}`,
  email: email,
  totalSpending: 0,
  type: "admin",
  role: role,
});
let mockUsers = Array.from({ length: 40 }, (_, i) => createMockUser(i));

const adminData = [
  createMockAdmin(1, "Admin Utama", "super@rental.com", "Superadmin"),
  createMockAdmin(2, "Kasir Siang", "kasir.siang@rental.com", "Admin"),
  createMockAdmin(3, "Kasir Malam", "kasir.malam@rental.com", "Admin"),
];
mockUsers.push(...adminData);

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      queryFn: async (arg) => {
        const { page = 1, limit = 10, search = "", type = "customer" } = arg;

        // 1. Filter data berdasarkan tipe (customer/admin)
        const typeFilteredData = mockUsers.filter((user) => user.type === type);

        // 2. Ambil 3 user teratas berdasarkan total spending
        const topUsers = [...typeFilteredData]
          .sort((a, b) => b.totalSpending - a.totalSpending)
          .slice(0, 3);

        // 3. Terapkan search pada data utama
        let searchFilteredData = typeFilteredData;
        if (search) {
          searchFilteredData = typeFilteredData.filter(
            (user) =>
              user.name.toLowerCase().includes(search.toLowerCase()) ||
              user.username.toLowerCase().includes(search.toLowerCase()) ||
              user.email.toLowerCase().includes(search.toLowerCase())
          );
        }

        // 4. Terapkan paginasi
        const totalItems = searchFilteredData.length;
        const totalPages = Math.ceil(totalItems / limit);
        const paginatedData = searchFilteredData.slice(
          (page - 1) * limit,
          page * limit
        );

        await new Promise((resolve) => setTimeout(resolve, 500));

        // 5. Kembalikan data dalam format yang kita butuhkan
        return {
          data: {
            users: paginatedData,
            topUsers,
            totalPages,
            currentPage: page,
          },
        };
      },
      providesTags: ["User"],
    }),
    addUser: builder.mutation({
      queryFn: async (newUser) => {
        // totalSpending untuk user baru (baik customer/admin) adalah 0
        const completeUser = { ...newUser, id: Date.now(), totalSpending: 0 };
        mockUsers.unshift(completeUser);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: completeUser };
      },
      invalidatesTags: ["User"],
    }),

    updateUser: builder.mutation({
      queryFn: async (updatedUser) => {
        const index = mockUsers.findIndex((u) => u.id === updatedUser.id);
        if (index !== -1) {
          mockUsers[index] = { ...mockUsers[index], ...updatedUser };
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: updatedUser };
      },
      invalidatesTags: (result, error, arg) => [
        { type: "User", id: arg.id },
        { type: "User", id: "LIST" },
      ],
    }),

    deleteUser: builder.mutation({
      queryFn: async (userId) => {
        mockUsers = mockUsers.filter((u) => u.id !== userId);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: userId };
      },
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApiSlice;
