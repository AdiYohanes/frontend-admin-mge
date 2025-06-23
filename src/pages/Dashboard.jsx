/* eslint-disable no-unused-vars */
import React from "react";
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import { useGetDashboardDataQuery } from "../features/dashboard/api/dashboardApiSlice";

import OrderStats from "../features/dashboard/components/OrderStats.jsx";
import RevenueChart from "../features/dashboard/components/RevenueChart.jsx";
import TodaysBooking from "../features/dashboard/components/TodaysBooking.jsx";
import PopularityStats from "../features/dashboard/components/PopularityStats.jsx";
import PeakTimeChart from "../features/dashboard/components/PeakTimeChart.jsx";
import OrderSummaryChart from "../features/dashboard/components/OrderSummaryChart.jsx";
import WebsiteTrafficChart from "../features/dashboard/components/WebsiteTrafficChart.jsx";

const DashboardPage = () => {
  const { data, isLoading, isError, error } = useGetDashboardDataQuery();

  const formatCurrency = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number || 0);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center p-10">
        <span className="loading loading-lg"></span>
      </div>
    );
  }

  if (isError) {
    return <div className="alert alert-error">Error: {error.toString()}</div>;
  }

  const stats = data?.totalStats || {};

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="mb-6">
        <OrderStats stats={data?.totalStats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <TodaysBooking data={data?.todaysBooking} />
        </div>
        <div className="lg:col-span-3">
          <PopularityStats />
        </div>
        <div className="lg:col-span-2">
          <PeakTimeChart />
        </div>
        <div>
          <OrderSummaryChart />
        </div>
        <div className="lg:col-span-3">
          <WebsiteTrafficChart />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
