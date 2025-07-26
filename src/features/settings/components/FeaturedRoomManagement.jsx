import React from "react";
import {
  useGetFeaturedRoomsQuery,
} from "../api/settingsApiSlice";
import FeaturedRoomTable from "./FeaturedRoomTable";

const FeaturedRoomManagement = () => {
  const { data, isLoading } = useGetFeaturedRoomsQuery();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Featured Rooms</h3>
          <p className="text-sm text-base-content/60">
            Kelola room yang ditampilkan di halaman utama
          </p>
        </div>
      </div>

      <FeaturedRoomTable
        rooms={data?.rooms}
        isLoading={isLoading}
      />
    </div>
  );
};
export default FeaturedRoomManagement;
