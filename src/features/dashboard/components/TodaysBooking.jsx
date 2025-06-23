import React, { useState } from "react";

const TodaysBooking = ({ data }) => {
  const [activeTab, setActiveTab] = useState("rental");

  const rentalBookings = data?.units || [];
  const foodDrinkOrders = data?.foodDrinks || [];

  const renderList = () => {
    const items = activeTab === "rental" ? rentalBookings : foodDrinkOrders;

    if (items.length === 0) {
      return (
        <div className="flex-grow flex justify-center items-center text-gray-500">
          Tidak ada data {activeTab === "rental" ? "rental" : "pesanan"} hari
          ini.
        </div>
      );
    }

    return (
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-4">
            <div className="avatar">
              <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={item.avatar} alt={item.customerName} />
              </div>
            </div>
            <div className="flex-grow">
              {/* PERUBAHAN 1: Font nama item diperbesar dan ditebalkan */}
              <p className="font-bold text-base truncate">{item.itemName}</p>
              <p className="text-sm text-gray-500">{item.customerName}</p>
            </div>
            {/* PERUBAHAN 2: Ukuran font diperbesar dan warna diubah menjadi brand-gold */}
            <div className="text-sm text-right text-brand-gold font-semibold whitespace-nowrap">
              {activeTab === "rental" ? item.time : item.status}
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="card bg-base-100 shadow-md h-96">
      <div className="card-body">
        <h2 className="card-title">Today's Bookings</h2>
        <div className="tabs tabs-boxed self-start">
          <a
            className={`tab ${activeTab === "rental" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("rental")}
          >
            Rental
          </a>
          <a
            className={`tab ${
              activeTab === "food & drink" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("food & drink")}
          >
            Food & Drink
          </a>
        </div>

        <div className="flex-grow overflow-y-auto mt-4 -mr-4 pr-4">
          {renderList()}
        </div>
      </div>
    </div>
  );
};

export default TodaysBooking;
