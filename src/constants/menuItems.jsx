import {
  HomeIcon,
  BookmarkSquareIcon,
  UsersIcon,
  RectangleStackIcon,
  ShoppingBagIcon,
  BanknotesIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const iconClass = `h-4 w-4`;

const menuItems = [
  {
    title: "Dashboard",
    icon: <HomeIcon className={`${iconClass} text-B99733`} />,
    path: "/",
  },
  {
    title: "Booking",
    icon: <BookmarkSquareIcon className={iconClass} />,
    submenu: [
      { title: "Room", path: "/booking/room" },
      { title: "Food & Drink", path: "/booking/food-drink" },
      { title: "Event", path: "/booking/event" },
    ],
  },
  {
    title: "User",
    icon: <UsersIcon className={iconClass} />,
    submenu: [
      { title: "Customer", path: "/user/customer" },
      { title: "User Admin", path: "/user/admin" },
    ],
  },
  {
    title: "Rental",
    icon: <RectangleStackIcon className={iconClass} />,
    submenu: [
      { title: "Consoles", path: "/rental/consoles" },
      { title: "Rooms", path: "/rental/rooms" },
      { title: "Units", path: "/rental/units" },
      { title: "Games", path: "/rental/games" },
    ],
  },
  {
    title: "Food & Drink",
    icon: <ShoppingBagIcon className={iconClass} />,
    submenu: [
      { title: "Food & Drink", path: "/food-drink/items" },
      { title: "Category", path: "/food-drink/categories" },
    ],
  },
  {
    title: "Transaction",
    icon: <BanknotesIcon className={iconClass} />,
    path: "/transaction",
  },
  {
    title: "Settings",
    icon: <Cog6ToothIcon className={iconClass} />,
    submenu: [
      { title: "Promo Management", path: "/settings/promo" },
      { title: "FAQ", path: "/settings/faq" },
      { title: "Landing Page", path: "/settings/landing-page" },
    ],
  },
];

export default menuItems;
