import { apiSlice } from "../../../store/api/apiSlice";

const createMockOrder = (i) => {
  const statuses = ["Complete", "Waiting for Payment"];
  const types = ["Food", "Drink"];
  const orderNames = [
    ["Nasi Goreng", "Mie Ayam", "Soto"],
    ["Es Teh Manis", "Kopi Hitam", "Jus Jeruk"],
  ];
  const typeIndex = i % 2;
  const bookingDate = i % 3 === 0 ? null : new Date(2025, i % 3, 20 - i);

  return {
    id: i + 1,
    noTransaction: `FNB-202503${String(i + 1).padStart(3, "0")}`,
    tanggalTransaksi: new Date(2025, 2, 20 - i).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    admin: "Admin",
    name: `Customer ${i + 1}`,
    phoneNumber: `081234567${String(i + 1).padStart(3, "0")}`,
    type: types[typeIndex],
    orderName: orderNames[typeIndex][i % 3],
    quantity: (i % 5) + 1,
    tanggalBooking: bookingDate
      ? bookingDate.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "-",
    metodePembayaran: "QRIS",
    totalPembayaran: ((i % 5) + 1) * 15000,
    statusBooking: statuses[i % statuses.length],
  };
};

let mockFoodDrinkOrders = Array.from({ length: 25 }, (_, i) =>
  createMockOrder(i)
);

export const foodDrinkBookingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFoodDrinkBookings: builder.query({
      queryFn: async (arg) => {
        const { page = 1, limit = 10, search = "", status = "" } = arg;

        let processedData = mockFoodDrinkOrders;

        // Terapkan filter status
        if (status && status !== "All") {
          processedData = processedData.filter(
            (order) => order.statusBooking === status
          );
        }

        // Terapkan filter search pada hasil sebelumnya
        if (search) {
          processedData = processedData.filter(
            (order) =>
              order.name.toLowerCase().includes(search.toLowerCase()) ||
              order.noTransaction.toLowerCase().includes(search.toLowerCase())
          );
        }

        const totalItems = processedData.length;
        const totalPages = Math.ceil(totalItems / limit);
        const paginatedData = processedData.slice(
          (page - 1) * limit,
          page * limit
        );

        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          data: { bookings: paginatedData, totalPages, currentPage: page },
        };
      },
      providesTags: ["FoodDrinkBooking"],
    }),

    deleteFoodDrinkBooking: builder.mutation({
      queryFn: async (orderId) => {
        console.log("Simulating DELETE request for F&B order id:", orderId);
        mockFoodDrinkOrders = mockFoodDrinkOrders.filter(
          (o) => o.id !== orderId
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: orderId };
      },
      invalidatesTags: ["FoodDrinkBooking"],
    }),
  }),
});

export const {
  useGetFoodDrinkBookingsQuery,
  useDeleteFoodDrinkBookingMutation,
} = foodDrinkBookingApiSlice;
