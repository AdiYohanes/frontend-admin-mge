/* eslint-disable no-unused-vars */
import React from "react";
import {
  useGetDashboardDataQuery,
  useGetOrderSummaryDataQuery,
  useGetConsoleStatsDataQuery,
} from "../features/dashboard/api/dashboardApiSlice";

// Impor semua komponen dasbor yang kita gunakan
import OrderStats from "../features/dashboard/components/OrderStats";
import RevenueChart from "../features/dashboard/components/RevenueChart";
import PeakTimeChart from "../features/dashboard/components/PeakTimeChart";
import OrderSummaryChart from "../features/dashboard/components/OrderSummaryChart";
import TodaysBooking from "../features/dashboard/components/TodaysBooking";
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
      <div className="min-h-screen bg-base-50 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="space-y-2">
              <div className="skeleton h-8 w-48"></div>
              <div className="skeleton h-4 w-96"></div>
            </div>
            <div className="skeleton h-6 w-32"></div>
          </div>

          {/* Stats Card Skeleton */}
          <div className="card bg-base-100 shadow-xl border border-base-200 p-6">
            <div className="skeleton h-32 w-full"></div>
          </div>

          {/* Revenue Chart Skeleton */}
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <div className="skeleton h-80 w-full"></div>
            </div>
          </div>

          {/* Today's Booking Skeleton */}
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <div className="skeleton h-96 w-full"></div>
            </div>
          </div>

          {/* Stats Section Skeleton */}
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <div className="skeleton h-96 w-full"></div>
            </div>
          </div>

          {/* Peak Time Skeleton */}
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <div className="skeleton h-80 w-full"></div>
            </div>
          </div>

          {/* Charts Grid Skeleton */}
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="skeleton h-80 w-full"></div>
                <div className="skeleton h-80 w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-base-50 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body text-center py-16">
              <div className="text-error mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-error mb-2">
                Gagal Memuat Dashboard
              </h3>
              <p className="text-base-content/70 mb-6">
                Gagal memuat data dasbor. Silakan coba lagi nanti.
              </p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => window.location.reload()}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Muat Ulang Halaman
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Dashboard dengan info tambahan */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-base-content">
              Dashboard
            </h1>
            <p className="text-base-content/70 mt-1">
              Selamat datang kembali! Berikut adalah ringkasan bisnis Anda hari ini.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <div className="badge badge-success badge-sm">Live</div>
            <span>Terakhir diperbarui: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Baris 1: Kartu Statistik Utama dengan shadow yang lebih modern */}
        <div className="card bg-base-100 shadow-xl border border-base-200 p-6">
          <OrderStats stats={dashboardData?.totalStats} />
        </div>

        {/* Baris 2: Revenue Chart dengan shadow yang konsisten */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <RevenueChart />
          </div>
        </div>

        {/* Baris 3: Today's Booking (Full Width) */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <TodaysBooking />
          </div>
        </div>

        {/* Baris 4: Statistik Populer & Konsol dengan design yang diperbaiki */}
        <div className="card bg-base-100 shadow-xl border border-base-200 min-h-[400px]">
          <div className="card-body">
            <StatsSection />
          </div>
        </div>

        {/* Baris 5: Peak Time Chart dengan design yang konsisten */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <PeakTimeChart />
          </div>
        </div>

        {/* Baris 6: Order Summary dengan spacing yang lebih baik */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <OrderSummaryChart />
          </div>
        </div>

        {/* Footer informasi */}
        <div className="text-center text-sm text-base-content/50 py-4">
          <p>Dashboard terakhir diperbarui pada {new Date().toLocaleString('id-ID')}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
