/* eslint-disable no-unused-vars */
import { apiSlice } from "../../../store/api/apiSlice";

// --- BAGIAN MOCK DATA (Lengkap & Bebas JSX) ---

const mockOrderSummaryData = {
  daily: { rental: 30, foodDrink: 80 },
  weekly: { rental: 200, foodDrink: 500 },
  monthly: { rental: 900, foodDrink: 2100 },
};

const mockMostPopularData = [
  {
    name: "VIP Unit 1",
    category: "Most Popular Unit",
    type: "unit",
    color: "bg-blue-500",
  },
  {
    name: "EA FC 24",
    category: "Most Popular Game",
    type: "game",
    color: "bg-purple-500",
  },
  {
    name: "Indomie Goreng",
    category: "Most Popular Food",
    type: "food",
    color: "bg-orange-500",
  },
  {
    name: "Es Teh Manis",
    category: "Most Popular Drink",
    type: "drink",
    color: "bg-teal-500",
  },
];



const mockConsoleStatsData = [
  { name: "Playstation 5", value: 55, color: "#3b82f6" },
  { name: "Playstation 4", value: 35, color: "#22c55e" },
  { name: "Playstation 3", value: 10, color: "#f97316" },
];

const mockWebsiteTrafficData = {
  daily: [
    { name: "Bookings", value: 15 },
    { name: "Visited", value: 15 },
  ],
  weekly: [
    { name: "Bookings", value: 80 },
    { name: "Visited", value: 120 },
  ],
  monthly: [
    { name: "Bookings", value: 320 },
    { name: "Visited", value: 400 },
  ],
};

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Endpoint untuk statistik utama (Total Revenue, Bookings, dll.)
    getDashboardData: builder.query({
      query: () => "/api/admin/analytics/main",
      transformResponse: (response) => ({
        totalStats: {
          booking: response.total_bookings,
          foodDrink: response.total_fnb_orders,
          revenue: response.total_revenue,
          customer: response.total_customers,
        },
      }),
      providesTags: ["Dashboard"],
    }),

    // Endpoint untuk data Revenue Chart
    getRevenueChartData: builder.query({
      query: ({ period }) => ({
        url: "/api/admin/analytics/revenue",
        method: "POST",
        body: { period },
      }),
      transformResponse: (response, meta, arg) => {
        const { period } = arg;

        // Add null checking for response
        if (!response) {
          return {
            type: "error",
            message: "No response from server"
          };
        }

        if (period === "daily") {
          // Handle daily period - show hourly breakdown
          const revenueDataFromApi = response.today?.revenue_by_hour || [];

          return {
            type: "chart",
            data: revenueDataFromApi.map((item) => ({
              name: item.hour,
              Pemasukan: item.total_revenue || 0,
            })),
            // Tambahkan data yesterday untuk perhitungan total kemarin
            yesterday: response.yesterday,
          };
        } else if (period === "weekly") {
          // Handle weekly period - show daily breakdown
          const dailyBreakdown = response.current_week?.daily_breakdown || [];
          return {
            type: "chart",
            data: dailyBreakdown.map((item) => ({
              name: item.day_name,
              date: item.date,
              Pemasukan: item.total_revenue || 0,
            })),
            // Tambahkan data previous_week untuk perhitungan total minggu sebelumnya
            previous_week: response.previous_week,
          };
        } else if (period === "monthly") {
          // Handle monthly period - show weekly breakdown
          const weeklyBreakdown = response.current_month?.weekly_breakdown || [];
          return {
            type: "chart",
            data: weeklyBreakdown.map((item) => ({
              name: item.week,
              Pemasukan: item.total_revenue || 0,
            })),
            // Tambahkan data previous_month untuk perhitungan total bulan sebelumnya
            previous_month: response.previous_month,
          };
        }

        // Fallback for unknown periods
        return {
          type: "error",
          message: "Invalid period specified"
        };
      },
      providesTags: ["Dashboard"],
    }),

    // Endpoint untuk data Peak Time Chart
    getPeakTimeData: builder.query({
      query: ({ period }) => ({
        url: "/api/admin/analytics/peak-hours",
        method: "POST",
        body: { period },
      }),
      transformResponse: (response) => {
        const peakHours = response.peak_hours || [];
        return peakHours.map((item) => ({
          time: item.hour,
          bookings: item.booking_count,
        }));
      },
      providesTags: ["Dashboard"],
    }),

    // Endpoint untuk Order Summary Chart
    getOrderSummaryData: builder.query({
      query: ({ period = "daily" }) => ({
        url: "/api/admin/analytics/order",
        method: "POST",
        body: { period },
      }),
      transformResponse: (response, meta, arg) => {
        const { period } = arg;

        if (!response) {
          return {
            type: "error",
            message: "No response from server"
          };
        }

        if (period === "monthly") {
          // Handle monthly period - show weekly breakdown
          const weeklyBreakdown = response.current_month?.weekly_breakdown || [];
          return {
            type: "chart",
            data: weeklyBreakdown.map((item) => ({
              name: item.week,
              "Unit Booking": item.unit_booking_count || 0,
              "F&B Booking": item.fnb_booking_count || 0,
            })),
            current_month: response.current_month,
            previous_month: response.previous_month,
          };
        } else if (period === "weekly") {
          // Handle weekly period - show daily breakdown
          const dailyBreakdown = response.current_week?.daily_breakdown || [];
          return {
            type: "chart",
            data: dailyBreakdown.map((item) => ({
              name: item.day_name,
              "Unit Booking": item.unit_booking_count || 0,
              "F&B Booking": item.fnb_booking_count || 0,
            })),
            current_week: response.current_week,
            previous_week: response.previous_week,
          };
        } else if (period === "daily") {
          // Handle daily period - show hourly breakdown
          const hourlyBreakdown = response.today?.hourly_breakdown || [];
          return {
            type: "chart",
            data: hourlyBreakdown.map((item) => ({
              name: item.hour,
              "Unit Booking": item.unit_booking_count || 0,
              "F&B Booking": item.fnb_booking_count || 0,
            })),
            today: response.today,
            yesterday: response.yesterday,
          };
        }

        // Fallback for unknown periods
        return {
          type: "error",
          message: "Invalid period specified"
        };
      },
      providesTags: ["Dashboard"],
    }),
    getMostPopularData: builder.query({
      query: ({ period = "daily" }) => ({
        url: "/api/admin/analytics/popularatity-stats",
        method: "POST",
        body: { period },
      }),
      transformResponse: (response) => {
        const mostPopularUnit = response.most_popular_units?.[0];
        const mostPopularGame = response.most_popular_games?.[0];
        const mostPopularFnb = response.most_popular_fnb?.[0];
        const mostPopularConsole = response.most_popular_consoles?.[0];

        const popularData = [];
        if (mostPopularUnit)
          popularData.push({
            name: mostPopularUnit.name,
            category: "Most Popular Unit",
            type: "unit",
            color: "bg-blue-500",
          });
        if (mostPopularGame)
          popularData.push({
            name: mostPopularGame.title,
            category: "Most Popular Game",
            type: "game",
            color: "bg-purple-500",
          });
        if (mostPopularFnb)
          popularData.push({
            name: mostPopularFnb.name,
            category: "Most Popular Food/Drink",
            type: "food",
            color: "bg-orange-500",
          });
        if (mostPopularConsole)
          popularData.push({
            name: mostPopularConsole.name,
            category: "Most Popular Console",
            type: "console",
            color: "bg-green-500",
          });

        return popularData;
      },
      providesTags: ["Dashboard"],
    }),
    getTodaysBookingData: builder.query({
      query: ({ period = "daily" }) => ({
        url: "/api/admin/analytics/today-bookings",
        method: "POST",
        body: { period },
      }),
      providesTags: ["Dashboard"],
    }),
    getWhatsTrendingData: builder.query({
      query: ({ period = "daily" }) => ({
        url: "/api/admin/analytics/booking-details",
        method: "POST",
        body: { period },
      }),
      transformResponse: (response) => {
        return {
          rental: response.booking_counts_by_unit?.map(item => ({
            name: item.name,
            totalOrders: item.booking_count
          })) || [],
          fnb: response.most_popular_fnbs?.map(item => ({
            name: item.name,
            totalOrders: item.total_quantity_sold
          })) || [],
          console: response.booking_counts_by_console?.map(item => ({
            name: item.name,
            totalOrders: item.booking_count
          })) || [],
        };
      },
      providesTags: ["Dashboard"],
    }),
    getConsoleStatsData: builder.query({
      queryFn: () => ({ data: mockConsoleStatsData }),
      providesTags: ["Dashboard"],
    }),
    getWebsiteTrafficData: builder.query({
      queryFn: (arg) => {
        const { period = "daily" } = arg || {};
        return { data: mockWebsiteTrafficData[period] || [] };
      },
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetDashboardDataQuery,
  useGetRevenueChartDataQuery,
  useGetPeakTimeDataQuery,
  useGetOrderSummaryDataQuery,
  useGetMostPopularDataQuery,
  useGetTodaysBookingDataQuery,
  useGetWhatsTrendingDataQuery,
  useGetConsoleStatsDataQuery,
  useGetWebsiteTrafficDataQuery,
} = dashboardApiSlice;
