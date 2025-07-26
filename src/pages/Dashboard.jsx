/* eslint-disable no-unused-vars */
import React from "react";
import {
  useGetDashboardDataQuery,
  useGetOrderSummaryDataQuery,
  useGetConsoleStatsDataQuery,
  useGetTodaysBookingDataQuery,
} from "../features/dashboard/api/dashboardApiSlice";

// Impor semua komponen dasbor yang kita gunakan
import OrderStats from "../features/dashboard/components/OrderStats";
import RevenueChart from "../features/dashboard/components/RevenueChart";
import PeakTimeChart from "../features/dashboard/components/PeakTimeChart";
import OrderSummaryChart from "../features/dashboard/components/OrderSummaryChart";
import TodaysBooking from "../features/dashboard/components/TodaysBooking";
import WebsiteTrafficChart from "../features/dashboard/components/WebsiteTrafficChart";
import StatsSection from "../features/dashboard/components/StatsSection";

const DashboardPage = () => {
  // Panggil semua hook yang diperlukan untuk setiap komponen
  const {
    data: dashboardData,
    isLoading: isLoadingStats,
    isError,
  } = useGetDashboardDataQuery();
  const { data: orderSummaryData } = useGetOrderSummaryDataQuery();
  const { data: consoleStatsData } = useGetConsoleStatsDataQuery();

  // Tampilkan skeleton loading untuk seluruh halaman saat data statistik utama dimuat
  if (isLoadingStats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="skeleton h-32 w-full"></div>
        <div className="skeleton h-96 w-full"></div>
        <div className="skeleton h-96 w-full"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="skeleton h-96"></div>
          <div className="skeleton h-96"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 skeleton h-96"></div>
          <div className="skeleton h-96"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-error">
        Gagal memuat data dasbor. Silakan coba lagi nanti.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Baris 1: Kartu Statistik Utama */}
      <OrderStats stats={dashboardData?.totalStats} />

      {/* Baris 2: Revenue Chart (Full Width) */}
      <RevenueChart />

      {/* Baris 3: Today's Booking (Full Width) */}
      <TodaysBooking />

      {/* Baris 4: Statistik Populer & Konsol dengan shared period filter */}
      <div className="card bg-base-100 shadow-md p-6">
        <StatsSection />
      </div>

      {/* Baris 5: Peak Time (Full Width) */}
      <PeakTimeChart />

      {/* Baris 6: Order Summary & Website Traffic dalam satu card besar */}
      <div className="card bg-base-100 shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OrderSummaryChart />
          <WebsiteTrafficChart />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
