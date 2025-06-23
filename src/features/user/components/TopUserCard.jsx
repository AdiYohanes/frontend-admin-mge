import React from "react";
import { TrophyIcon } from "@heroicons/react/24/solid";
import { formatCurrency } from "../../../utils/formatters";

const TopUserCard = ({ user, rank }) => {
  const rankColor = {
    1: "bg-gradient-to-br from-yellow-400 to-amber-500 text-white",
    2: "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800",
    3: "bg-gradient-to-br from-amber-600 to-yellow-700 text-white",
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body p-4 items-center text-center">
        <div className={`avatar placeholder mb-2`}>
          <div
            className={`w-16 rounded-full ring ring-offset-base-100 ring-offset-2 ${rankColor[rank]}`}
          >
            <span className="text-2xl font-bold">{rank}</span>
          </div>
        </div>
        <h2 className="card-title text-base">{user.name}</h2>
        <p className="text-xs -mt-1 text-gray-500">@{user.username}</p>
        <div className="badge badge-lg badge-success badge-outline mt-2 font-bold">
          {formatCurrency(user.totalSpending)}
        </div>
      </div>
    </div>
  );
};

export default TopUserCard;
