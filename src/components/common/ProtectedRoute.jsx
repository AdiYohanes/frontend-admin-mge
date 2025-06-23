import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, Outlet } from "react-router";
import { selectCurrentToken } from "../../store/slices/authSlice";

/**
 * @file ProtectedRoute.jsx
 * @description Komponen untuk menjaga rute yang memerlukan autentikasi.
 * Menggunakan pola Layout Route dari React Router v6.
 */
const ProtectedRoute = () => {
  const token = useSelector(selectCurrentToken);
  const location = useLocation();

  // 1. Cek apakah ada token (pengguna sudah login)
  if (!token) {
    // Jika tidak ada token, alihkan ke halaman login.
    // 'state={{ from: location }}' berguna agar setelah login,
    // pengguna bisa dikembalikan ke halaman yang tadinya ingin ia tuju.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Jika ada token, render komponen <Outlet />.
  // <Outlet /> adalah "placeholder" dari React Router.
  // Semua rute anak (seperti DashboardLayout) akan dirender di sini.
  return <Outlet />;
};

export default ProtectedRoute;
