import React, { useState } from "react";
import BannerManagement from "../components/BannerManagement";
import FeaturedConsoleManagement from "../components/FeaturedConsoleManagement";
import FeaturedRoomManagement from "../components/FeaturedRoomManagement";
import FeaturedGameManagement from "../components/FeaturedGameManagement";
import CustomerReviewManagement from "../components/CustomerReviewManagement";
const LandingPageManagement = () => {
  const [activeTab, setActiveTab] = useState("Banners");
  const tabs = [
    "Banners",
    "Featured Consoles",
    "Featured Games",
    "Featured Rooms",
    "Customer Reviews",
  ];

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">Landing Page Management</h2>

        {/* --- Navigasi Tab --- */}
        <div className="tabs tabs-boxed">
          {tabs.map((tab) => (
            <a
              key={tab}
              className={`tab ${activeTab === tab ? "tab-active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </a>
          ))}
        </div>

        {/* --- Konten Tab --- */}
        <div className="mt-6">
          {activeTab === "Banners" && <BannerManagement />}
          {activeTab === "Featured Consoles" && <FeaturedConsoleManagement />}

          {activeTab === "Featured Games" && <FeaturedGameManagement />}
          {activeTab === "Featured Rooms" && <FeaturedRoomManagement />}
          {activeTab === "Customer Reviews" && <CustomerReviewManagement />}
        </div>
      </div>
    </div>
  );
};

export default LandingPageManagement;
