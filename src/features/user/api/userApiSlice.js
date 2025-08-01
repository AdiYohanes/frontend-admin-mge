/* eslint-disable no-unused-vars */
import { apiSlice } from "../../../store/api/apiSlice";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: ({ page = 1, per_page = 10, search = "", role = "CUST" }) => {
        const params = { page, per_page, role };
        if (search) params.search = search;
        return {
          url: "/api/admin/user",
          params: params,
        };
      },
      transformResponse: (response) => {
        const users = response.data || [];
        const pagination = {
          currentPage: response.current_page || 1,
          totalPages: response.last_page || 1,
          total: response.total || 0,
          perPage: response.per_page || 10,
        };
        return { users, pagination };
      },
      providesTags: (result) =>
        result
          ? [
            { type: "User", id: "LIST" },
            ...result.users.map(({ id }) => ({ type: "User", id })),
          ]
          : [{ type: "User", id: "LIST" }],
    }),

    getTopSpenders: builder.query({
      query: () => ({
        url: "/api/admin/user",
        params: {
          role: "CUST",
          per_page: 9999,
        },
      }),
      transformResponse: (response) => {
        const allUsers = response.data || [];
        const sortedCustomers = [...allUsers].sort(
          (a, b) => parseFloat(b.total_spend) - parseFloat(a.total_spend)
        );
        return sortedCustomers.slice(0, 3);
      },
      providesTags: [{ type: "User", id: "TOP_SPENDERS" }],
    }),

    addUser: builder.mutation({
      query: (newUser) => {
        const { confirmPassword, ...dataToSend } = newUser;
        // Pastikan role yang dikirim adalah ADMN
        const body = { ...dataToSend, role: "ADMN" };
        return {
          url: "/api/admin/user",
          method: "POST",
          body: body,
        };
      },
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    updateUser: builder.mutation({
      query: ({ id, ...patch }) => {
        const { confirmPassword, ...dataToSend } = patch;

        return {
          url: `/api/admin/user/${id}`,
          method: "POST",
          body: dataToSend, // <-- Tidak ada lagi '_method: "PUT"'
        };
      },
      invalidatesTags: (result, error, arg) => [
        { type: "User", id: "LIST" },
        { type: "User", id: arg.id },
      ],
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/api/admin/user/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    verifyUser: builder.query({
      query: (phone) => ({
        url: "/api/admin/user",
        method: "GET",
        params: { phone },
      }),
      transformResponse: (response) => {
        if (response && response.data && response.data.length > 0) {
          return response.data[0]; // Return first user found
        }
        return null;
      },
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetTopSpendersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useVerifyUserQuery,
} = userApiSlice;
