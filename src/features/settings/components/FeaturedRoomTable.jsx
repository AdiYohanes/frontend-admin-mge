import React from "react";
import { useUpdateRoomFeaturedStatusMutation } from "../api/settingsApiSlice";
import { toast } from "react-hot-toast";

const FeaturedRoomTable = ({ rooms, isLoading, onEdit, onDelete }) => {
  const [updateRoomStatus, { isLoading: isUpdatingStatus }] =
    useUpdateRoomFeaturedStatusMutation();

  const handleToggleStatus = async (room) => {
    try {
      await updateRoomStatus({
        id: room.id,
        isActive: !room.isActive
      }).unwrap();
      toast.success(`Status ${room.name} berhasil diperbarui.`);
    } catch (error) {
      toast.error("Gagal memperbarui status.");
      console.error("Update room status error:", error);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-lg"></span>
      </div>
    );

  return (
    <div className="overflow-x-auto w-full bg-base-100 rounded-lg shadow">
      <table className="table">
        <thead className="bg-base-200">
          <tr>
            <th>No</th>
            <th>Image</th>
            <th>Nama Room</th>
            <th>Featured Status</th>
          </tr>
        </thead>
        <tbody>
          {(!rooms || rooms.length === 0) ? (
            <tr>
              <td colSpan="4" className="text-center py-8 text-base-content/60">
                Tidak ada data room yang tersedia.
              </td>
            </tr>
          ) : (
            rooms.map((room, index) => (
              <tr key={room.id} className="hover">
                <th>{index + 1}</th>
                <td>
                  <div className="avatar">
                    <div className="mask mask-squircle w-16 h-16">
                      <img
                        src={room.imageUrl}
                        alt={room.name}
                        className="object-cover"
                      />
                    </div>
                  </div>
                </td>
                <td>
                  <div className="font-bold text-base-content">{room.name}</div>
                  {room.description && (
                    <div className="text-xs opacity-70 max-w-md truncate">
                      {room.description}
                    </div>
                  )}
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={room.isActive}
                    onChange={() => handleToggleStatus(room)}
                    disabled={isUpdatingStatus}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
export default FeaturedRoomTable;
