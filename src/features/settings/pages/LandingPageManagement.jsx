import React from "react";
import BannerManagement from "../components/BannerManagement";
import FeaturedConsoleManagement from "../components/FeaturedConsoleManagement";
import FeaturedRoomManagement from "../components/FeaturedRoomManagement";
import FeaturedGameManagement from "../components/FeaturedGameManagement";
import CustomerReviewManagement from "../components/CustomerReviewManagement";
import PricelistTable from "../components/PricelistTable";

const LandingPageManagement = () => {
  return (
    <div className="space-y-8">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6">Landing Page Management</h2>
          <p className="text-base-content/70 mb-4">
            Kelola semua konten yang ditampilkan di halaman utama website
          </p>
        </div>
      </div>

      {/* Banner Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold">Banner Management</h3>
              <p className="text-sm text-base-content/60">
                Kelola banner yang ditampilkan di halaman utama
              </p>
            </div>
          </div>
          <BannerManagement />
        </div>
      </div>

      {/* Featured Consoles Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold">Featured Consoles</h3>
              <p className="text-sm text-base-content/60">
                Kelola console yang ditampilkan di halaman utama
              </p>
            </div>
          </div>
          <FeaturedConsoleManagement />
        </div>
      </div>

      {/* Featured Games Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold">Featured Games</h3>
              <p className="text-sm text-base-content/60">
                Kelola game yang ditampilkan di halaman utama
              </p>
            </div>
          </div>
          <FeaturedGameManagement />
        </div>
      </div>

      {/* Featured Rooms Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <FeaturedRoomManagement />
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold">Customer Reviews</h3>
              <p className="text-sm text-base-content/60">
                Kelola review customer yang ditampilkan di halaman utama
              </p>
            </div>
          </div>
          <CustomerReviewManagement />
        </div>
      </div>

      {/* Pricelist Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <PricelistTable />
        </div>
      </div>
    </div>
  );
};

export default LandingPageManagement;
