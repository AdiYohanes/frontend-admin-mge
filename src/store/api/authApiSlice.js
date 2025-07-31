import { apiSlice } from "./apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/api/auth/login",
        method: "POST",
        body: { ...credentials },
      }),
    }),
    getProfile: builder.query({
      query: () => ({
        url: "/api/auth/profile",
        method: "GET",
      }),
    }),
  }),
});

export const { useLoginMutation, useGetProfileQuery } = authApiSlice;
