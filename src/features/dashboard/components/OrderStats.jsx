import React from "react";
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

const OrderStats = ({ stats }) => {
  // Helper untuk memformat angka menjadi Rupiah
  const formatCurrency = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number || 0);

  // Mendefinisikan data statistik dalam sebuah array agar mudah di-map
  const statItems = [
    {
      title: "Total Bookings",
      value: stats?.booking || 0,
      icon: <CalendarDaysIcon className="h-8 w-8 text-primary" />,
    },
    {
      title: "Food & Drink Orders",
      value: stats?.foodDrink || 0,
      icon: <ShoppingCartIcon className="h-8 w-8 text-secondary" />,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats?.revenue),
      icon: <CurrencyDollarIcon className="h-8 w-8 text-success" />,
    },
    {
      title: "New Customers",
      value: stats?.customer || 0,
      icon: <UsersIcon className="h-8 w-8 text-accent" />,
    },
  ];

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <h2 className="card-title mb-4">Order Statistic</h2>

        {/* Menggunakan grid untuk menata 4 item statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center p-4 bg-base-200 rounded-lg"
            >
              <div className="mr-4">{item.icon}</div>
              <div>
                <div className="text-gray-500 text-sm font-semibold">
                  {item.title}
                </div>
                <div className="text-2xl font-bold">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderStats;
