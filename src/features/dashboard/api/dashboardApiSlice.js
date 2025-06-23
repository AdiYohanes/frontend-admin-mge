import { apiSlice } from "../../../store/api/apiSlice";

// --- KUMPULAN MOCK DATA ---
const mockRevenueData = {
  daily: [
    { name: "00:00", Pemasukan: 120000 },
    { name: "03:00", Pemasukan: 300000 },
    { name: "06:00", Pemasukan: 250000 },
    { name: "09:00", Pemasukan: 680000 },
    { name: "12:00", Pemasukan: 950000 },
    { name: "15:00", Pemasukan: 1100000 },
    { name: "18:00", Pemasukan: 1800000 },
    { name: "21:00", Pemasukan: 2300000 },
  ],
  weekly: [
    { name: "Senin", Pemasukan: 2100000 },
    { name: "Selasa", Pemasukan: 2500000 },
    { name: "Rabu", Pemasukan: 1900000 },
    { name: "Kamis", Pemasukan: 3100000 },
    { name: "Jumat", Pemasukan: 4200000 },
    { name: "Sabtu", Pemasukan: 5500000 },
    { name: "Minggu", Pemasukan: 4800000 },
  ],
  monthly: [
    { name: "Jan", Pemasukan: 35000000 },
    { name: "Feb", Pemasukan: 42000000 },
    { name: "Mar", Pemasukan: 51000000 },
    { name: "Apr", Pemasukan: 48000000 },
    { name: "Mei", Pemasukan: 62000000 },
    { name: "Jun", Pemasukan: 58000000 },
  ],
};
const mockTodaysBookingData = {
  units: [
    {
      id: 1,
      customerName: "Budi Hartono",
      itemName: "PS5 Disc #2",
      time: "19:00 - 21:00",
      avatar: "https://i.pravatar.cc/150?u=budi",
    },
    {
      id: 2,
      customerName: "Citra Lestari",
      itemName: "Kamar VIP 1",
      time: "20:00 - 22:00",
      avatar: "https://i.pravatar.cc/150?u=citra",
    },
    {
      id: 3,
      customerName: "Doni Firmansyah",
      itemName: "PS4 Pro #5",
      time: "20:30 - 22:30",
      avatar: "https://i.pravatar.cc/150?u=doni",
    },
  ],
  foodDrinks: [
    {
      id: 1,
      customerName: "Budi Hartono",
      itemName: "Indomie Goreng x2, Teh Botol x1",
      status: "Selesai",
      avatar: "https://i.pravatar.cc/150?u=budi",
    },
    {
      id: 2,
      customerName: "Agus Salim",
      itemName: "Kopi Hitam x1",
      status: "Disajikan",
      avatar: "https://i.pravatar.cc/150?u=agus",
    },
  ],
};
const mockPopularityData = {
  mostPopular: {
    daily: {
      unit: "PS4 Pro #2",
      game: "Spider-Man 2",
      food: "Roti Bakar",
      drink: "Air Mineral",
    },
    weekly: {
      unit: "Kamar VIP 1",
      game: "EA FC 24",
      food: "Nasi Goreng",
      drink: "Coca-Cola",
    },
    monthly: {
      unit: "PS5 Disc #3",
      game: "GTA V",
      food: "Indomie Goreng",
      drink: "Es Teh Manis",
    },
  },
  trending: {
    rental: {
      daily: [
        { name: "PS5 #1", value: 15 },
        { name: "VIP Room 2", value: 12 },
        { name: "PS4 #3", value: 10 },
        { name: "Nintendo Switch #1", value: 8 },
        { name: "PC Gaming #2", value: 6 },
      ],
      weekly: [
        { name: "PS5 #1", value: 98 },
        { name: "VIP Room 2", value: 75 },
        { name: "PS4 #3", value: 60 },
        { name: "Nintendo Switch #1", value: 45 },
        { name: "PC Gaming #2", value: 38 },
      ],
      monthly: [
        { name: "PS5 #1", value: 410 },
        { name: "VIP Room 2", value: 350 },
        { name: "PS4 #3", value: 280 },
        { name: "Nintendo Switch #1", value: 220 },
        { name: "PC Gaming #2", value: 185 },
      ],
    },
    foodDrink: {
      daily: [
        { name: "Indomie", value: 45 },
        { name: "Kopi Hitam", value: 30 },
        { name: "Teh Botol", value: 25 },
        { name: "Nasi Uduk", value: 22 },
        { name: "Es Jeruk", value: 18 },
      ],
      weekly: [
        { name: "Indomie", value: 280 },
        { name: "Kopi Hitam", value: 190 },
        { name: "Teh Botol", value: 150 },
        { name: "Nasi Uduk", value: 135 },
        { name: "Es Jeruk", value: 120 },
      ],
      monthly: [
        { name: "Indomie", value: 1200 },
        { name: "Kopi Hitam", value: 850 },
        { name: "Teh Botol", value: 700 },
        { name: "Nasi Uduk", value: 580 },
        { name: "Es Jeruk", value: 520 },
      ],
    },
  },
};
const mockPeakTimeData = {
  daily: [
    { time: "09:00", bookings: 5 },
    { time: "11:00", bookings: 8 },
    { time: "13:00", bookings: 15 },
    { time: "15:00", bookings: 12 },
    { time: "17:00", bookings: 22 },
    { time: "19:00", bookings: 40 },
    { time: "21:00", bookings: 35 },
  ],
  weekly: [
    { time: "09:00", bookings: 40 },
    { time: "11:00", bookings: 60 },
    { time: "13:00", bookings: 110 },
    { time: "15:00", bookings: 90 },
    { time: "17:00", bookings: 180 },
    { time: "19:00", bookings: 350 },
    { time: "21:00", bookings: 310 },
  ],
  monthly: [
    { time: "09:00", bookings: 150 },
    { time: "11:00", bookings: 250 },
    { time: "13:00", bookings: 400 },
    { time: "15:00", bookings: 350 },
    { time: "17:00", bookings: 700 },
    { time: "19:00", bookings: 1500 },
    { time: "21:00", bookings: 1300 },
  ],
};
const mockOrderSummaryData = {
  daily: [
    { name: "Rental", value: 45 },
    { name: "Food & Drink", value: 30 },
  ],
  weekly: [
    { name: "Rental", value: 310 },
    { name: "Food & Drink", value: 250 },
  ],
  monthly: [
    { name: "Rental", value: 1250 },
    { name: "Food & Drink", value: 980 },
  ],
};
const mockWebsiteTrafficData = {
  daily: [
    { name: "Visitors", value: 1200 },
    { name: "Clicks", value: 3400 },
  ],
  weekly: [
    { name: "Visitors", value: 8400 },
    { name: "Clicks", value: 23800 },
  ],
  monthly: [
    { name: "Visitors", value: 35000 },
    { name: "Clicks", value: 99000 },
  ],
};

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardData: builder.query({
      queryFn: () => ({
        data: {
          totalStats: {
            booking: 120,
            foodDrink: 85,
            revenue: 15700000,
            customer: 45,
          },
          todaysBooking: mockTodaysBookingData,
        },
      }),
      providesTags: ["Dashboard"],
    }),

    getRevenueChartData: builder.query({
      queryFn: (arg) => ({ data: mockRevenueData[arg.period] || [] }),
    }),

    getOrderSummaryData: builder.query({
      queryFn: (arg) => ({ data: mockOrderSummaryData[arg.period] || [] }),
    }),

    getWebsiteTrafficData: builder.query({
      queryFn: (arg) => ({ data: mockWebsiteTrafficData[arg.period] || [] }),
    }),

    getPeakTimeData: builder.query({
      queryFn: (arg) => ({ data: mockPeakTimeData[arg.period] || [] }),
    }),

    getPopularityStatsData: builder.query({
      queryFn: () => ({ data: mockPopularityData }),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetDashboardDataQuery,
  useGetPeakTimeDataQuery,
  useGetRevenueChartDataQuery,
  useGetOrderSummaryDataQuery,
  useGetWebsiteTrafficDataQuery,
  useGetPopularityStatsDataQuery,
} = dashboardApiSlice;
