import React from "react";
import { NavLink, Link } from "react-router";
import menuItems from "../constants/menuItems.jsx";

const Sidebar = () => {
  // Fungsi untuk kelas NavLink kita perbarui
  const getNavLinkClasses = ({ isActive }) => {
    const baseClasses = "text-base py-3";
    return isActive ? `${baseClasses} bg-[#B99733] text-white` : baseClasses;
  };

  return (
    <ul className="menu font-funnel p-4 w-80 min-h-full bg-base-100 text-base-content">
      {/* Bagian Logo dan Nama Perusahaan */}
      <li className="mb-4">
        {/* Ukuran font nama perusahaan juga diperbesar */}
        <Link to="/" className="text-2xl font-bold p-2 hover:bg-transparent">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img src="/images/logo.png" alt="Logo Rental PS" />
              </div>
            </div>
            <span>Gaming Play</span>
          </div>
        </Link>
      </li>

      {menuItems.map((item, index) => (
        <li key={index}>
          {item.submenu ? (
            // Untuk menu dengan submenu (dropdown)
            <details>
              {/* Tambahkan kelas untuk memperbesar font dan padding */}
              <summary className="text-base py-3">
                {item.icon}
                {item.title}
              </summary>
              <ul className="!pl-2">
                {item.submenu.map((subItem, subIndex) => (
                  <li key={subIndex}>
                    <NavLink
                      to={subItem.path}
                      // Gunakan fungsi kelas yang sudah diperbarui
                      className={getNavLinkClasses}
                    >
                      {subItem.title}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </details>
          ) : (
            // Untuk menu tunggal
            <NavLink
              to={item.path}
              end={item.path === "/"}
              // Gunakan fungsi kelas yang sudah diperbarui
              className={getNavLinkClasses}
            >
              {item.icon}
              {item.title}
            </NavLink>
          )}
        </li>
      ))}
    </ul>
  );
};

export default Sidebar;
