import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Toaster } from "react-hot-toast";

// Layouts & Pages
import ProtectedRoute from "./components/common/ProtectedRoute";
import ThemeProvider from "./components/common/ThemeProvider";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import BookingRoomPage from "./features/booking/pages/BookingRoomPage";
import FoodDrinkBookingPage from "./features/booking/pages/FoodDrinkBookingPage";
import EventBookingPage from "./features/booking/pages/EventBookingPage";
import CustomerListPage from "./features/user/pages/CustomerListPage";
import UserAdminListPage from "./features/user/pages/UserAdminListPage";
import ConsoleListPage from "./features/rental/pages/ConsoleListPage";
import RoomListPage from "./features/rental/pages/RoomListPage";
import UnitListPage from "./features/rental/pages/UnitListPage";
import GameListPage from "./features/rental/pages/GameListPage";
import GenreListPage from "./features/rental/pages/GenreListPage";
import FoodDrinkListPage from "./features/food-drink/pages/FoodDrinkListPage";
import CategoryListPage from "./features/food-drink/pages/CategoryListPage";
import TransactionListPage from "./features/transaction/pages/TransactionListPage";
import PromoManagementPage from "./features/settings/pages/PromoManagementPage";
import FaqManagementPage from "./features/settings/pages/FaqManagementPage";
import LandingPageManagement from "./features/settings/pages/LandingPageManagement";
import AppSettingsPage from "./features/settings/pages/AppSettingsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          {
            path: "booking/room",
            element: <BookingRoomPage />,
          },
          { path: "booking/food-drink", element: <FoodDrinkBookingPage /> },
          { path: "booking/event", element: <EventBookingPage /> },
          { path: "user/customer", element: <CustomerListPage /> },
          { path: "user/admin", element: <UserAdminListPage /> },
          { path: "rental/consoles", element: <ConsoleListPage /> },
          { path: "rental/rooms", element: <RoomListPage /> },
          { path: "rental/units", element: <UnitListPage /> },
          { path: "rental/games", element: <GameListPage /> },
          { path: "rental/genres", element: <GenreListPage /> },
          { path: "food-drink/items", element: <FoodDrinkListPage /> },
          { path: "food-drink/categories", element: <CategoryListPage /> },
          { path: "transaction", element: <TransactionListPage /> },
          { path: "settings/promo", element: <PromoManagementPage /> },
          { path: "settings/faq", element: <FaqManagementPage /> },
          { path: "settings/landing-page", element: <LandingPageManagement /> },
          { path: "settings/app", element: <AppSettingsPage /> },
          // Rute terproteksi lainnya akan ditambahkan di sini
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" reverseOrder={false} />
    </ThemeProvider>
  );
}

export default App;
