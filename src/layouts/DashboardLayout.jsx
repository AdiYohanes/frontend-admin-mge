import React from "react";
import { Outlet } from "react-router";
import Header from "../layouts/Header";
import Sidebar from "../layouts/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="drawer lg:drawer-open">
      {/* INI BAGIAN PENTING 1: Checkbox tersembunyi sebagai saklar */}
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

      {/* Konten Halaman: berisi Header dan Outlet */}
      <div className="drawer-content flex flex-col">
        <Header />
        <main className="flex-1 p-6 lg:p-8 bg-base-200">
          <Outlet />
        </main>
      </div>

      {/* Sidebar (Drawer) */}
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-2"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <Sidebar />
      </div>
    </div>
  );
};

export default DashboardLayout;
