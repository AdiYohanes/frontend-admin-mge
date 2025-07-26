import React from "react";
import { DollarSign, ShoppingCart, Users, Calendar } from "lucide-react";

const OrderStats = ({ stats, loading = false }) => {
  const formatCurrency = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number || 0);
  const formatNumber = (number) =>
    new Intl.NumberFormat("id-ID").format(number || 0);

  const statItems = [
    {
      title: "Total Bookings",
      value: formatNumber(stats?.booking),
      icon: Calendar,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Food & Drink Orders",
      value: formatNumber(stats?.foodDrink),
      icon: ShoppingCart,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats?.revenue),
      icon: DollarSign,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "New Customers",
      value: formatNumber(stats?.customer),
      icon: Users,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg bg-gray-100 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center gap-2">
        <span className="font-bold text-lg text-gray-900">Order Stats</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white rounded-lg p-4 flex items-center gap-4">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">{item.title}</div>
                <div className="text-xl font-bold text-gray-900">{item.value}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStats;
