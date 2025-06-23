import { apiSlice } from "../../../store/api/apiSlice";

// Kita simulasikan data transaksi yang sudah selesai dari berbagai sumber
const createMockTransaction = (i) => {
  const isRoomBooking = i % 2 === 0;
  const hasRefund = i % 5 === 0;

  return {
    id: i + 1,
    noTransaction: isRoomBooking
      ? `TRX-202503${String(i + 1).padStart(3, "0")}`
      : `FNB-202503${String(i + 1).padStart(3, "0")}`,
    type: isRoomBooking ? "Room Booking" : "Food & Drink",
    name: `Customer ${i + 1}`,
    phoneNumber: `081234567${String(i + 1).padStart(3, "0")}`,
    details: isRoomBooking ? `PS5 / VIP 1 / Unit A` : "Nasi Goreng x2",
    quantity: isRoomBooking ? 3 : 2,
    quantityUnit: isRoomBooking ? "hours" : "pcs",
    tanggalBooking: new Date(2025, 1, 25 - i).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    totalPembayaran: isRoomBooking ? 150000 : 30000,
    metodePembayaran: "QRIS",
    status: hasRefund ? "Refunded" : "Finished",
    totalRefund: hasRefund ? 50000 : null,
  };
};

let mockTransactions = Array.from({ length: 30 }, (_, i) =>
  createMockTransaction(i)
);

export const transactionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query({
      queryFn: async (arg) => {
        const { page = 1, limit = 10, search = "" } = arg;
        let data = mockTransactions.filter(
          (tx) =>
            tx.name.toLowerCase().includes(search.toLowerCase()) ||
            tx.noTransaction.toLowerCase().includes(search.toLowerCase())
        );
        const paginatedData = data.slice((page - 1) * limit, page * limit);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          data: {
            transactions: paginatedData,
            totalPages: Math.ceil(data.length / limit),
            currentPage: page,
          },
        };
      },
      providesTags: ["Transaction"],
    }),
  }),
});

export const { useGetTransactionsQuery } = transactionApiSlice;
