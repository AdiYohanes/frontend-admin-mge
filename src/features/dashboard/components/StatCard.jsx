import React from "react";

const StatCard = ({ icon, title, value, description }) => {
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <div className="flex items-center gap-4">
          <div className="text-primary">{icon}</div>
          <div>
            <div className="text-gray-500 text-sm">{title}</div>
            <div className="card-title text-2xl">{value}</div>
            {description && (
              <div className="text-xs text-gray-400">{description}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
