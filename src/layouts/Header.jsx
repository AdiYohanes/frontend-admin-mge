import React, { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router";
import {
  ArrowLeftStartOnRectangleIcon,
  BellIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { selectCurrentUser, logOut } from "../store/slices/authSlice";
import useTheme from "../hooks/useTheme";
import {
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
} from "../features/notification/api/notificationApiSlice";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const { theme, toggleTheme } = useTheme();

  // --- LOGIKA NOTIFIKASI ---
  const { data: notificationsData } = useGetNotificationsQuery(undefined, {
    pollingInterval: 30000, // Ambil data baru setiap 30 detik
    refetchOnFocus: true, // Ambil data baru saat user kembali ke tab ini
  });

  const [markAllAsRead, { isLoading: isMarkingRead }] =
    useMarkAllAsReadMutation();

  // Hitung notifikasi yang belum dibaca secara efisien dengan useMemo
  const unreadCount = useMemo(() => {
    return notificationsData?.notifications?.filter((n) => !n.read).length ?? 0;
  }, [notificationsData]);

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      await markAllAsRead().unwrap();
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };
  // --- AKHIR LOGIKA NOTIFIKASI ---

  const handleLogout = () => {
    dispatch(logOut());
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "A";
    const names = name.split(" ");
    const initials = names.map((n) => n[0]).join("");
    return initials.slice(0, 2).toUpperCase();
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  return (
    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-30">
      {/* Tombol untuk membuka sidebar di mode mobile */}
      <div className="navbar-start">
        <label
          htmlFor="my-drawer-2"
          className="btn btn-ghost drawer-button lg:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-5 h-5 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </label>
      </div>

      <div className="navbar-end">
        {/* Theme Toggle Button */}
        <button
          onClick={handleThemeToggle}
          className="btn btn-ghost btn-circle"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <MoonIcon className="h-6 w-6" />
          ) : (
            <SunIcon className="h-6 w-6" />
          )}
        </button>

        {/* Dropdown Notifikasi */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <div className="indicator">
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="badge badge-sm bg-brand-gold text-white border-brand-gold indicator-item">
                  {unreadCount}
                </span>
              )}
            </div>
          </label>
          <div
            tabIndex={0}
            className="mt-3 z-[1] card card-compact dropdown-content w-80 md:w-96 bg-base-100 shadow"
          >
            <div className="card-body">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg">Notification</span>
                {unreadCount > 0 && (
                  <span className="badge bg-brand-gold text-white border-brand-gold">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <ul className="space-y-2 max-h-96 overflow-y-auto p-1">
                {notificationsData?.notifications &&
                  notificationsData.notifications.length > 0 ? (
                  notificationsData.notifications.map((notif) => (
                    <li
                      key={notif.id}
                      className={`p-2 rounded-lg ${!notif.read ? "bg-blue-50" : ""
                        }`}
                    >
                      <p className="text-sm font-medium text-gray-800">
                        {notif.text}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notif.timestamp), {
                          addSuffix: true,
                          locale: idLocale,
                        })}
                      </p>
                    </li>
                  ))
                ) : (
                  <li className="p-4 text-center text-sm text-gray-500">
                    Tidak ada notifikasi.
                  </li>
                )}
              </ul>
              <div className="card-actions mt-4">
                <button
                  className="btn bg-brand-gold btn-block text-white"
                  onClick={handleMarkAllRead}
                  disabled={isMarkingRead || unreadCount === 0}
                >
                  {isMarkingRead ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Tandai semua sudah dibaca"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dropdown Profil Pengguna */}
        <div className="dropdown dropdown-end ml-4">
          {/* Pemicu dropdown dibuat lebih besar */}
          <label
            tabIndex={0}
            role="button"
            className="flex items-center gap-3 cursor-pointer p-2 hover:bg-base-200 rounded-lg"
          >
            <div className="hidden md:block">
              {/* Font nama diperbesar */}
              <div className="font-bold text-base text-right">
                {user?.name || "Admin"}
              </div>
            </div>
            <div className="avatar">
              {/* Ukuran avatar diperbesar */}
              <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                {user?.profile_photo_url ? (
                  <img src={user.profile_photo_url} alt="Profil" />
                ) : (
                  <div className="avatar placeholder">
                    <div className="bg-neutral-focus text-neutral-content rounded-full w-12">
                      <span className="text-xl">{getInitials(user?.name)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </label>

          {/* Konten dropdown dibuat lebih besar */}
          <ul
            tabIndex={0}
            className="menu dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-64"
          >
            <li className="p-2 font-bold text-base border-b border-base-200">
              {user?.name || "Admin"}
            </li>
            {/* Ukuran font item menu diperbesar dan diberi ikon */}
            <li className="text-base mt-1">
              <Link to="/profile">
                <UserCircleIcon className="h-5 w-5" />
                Profile
              </Link>
            </li>
            <li className="text-base">
              <a onClick={handleLogout}>
                <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
                Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
