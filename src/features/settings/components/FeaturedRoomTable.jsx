import React from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useUpdateFeaturedRoomMutation } from "../api/settingsApiSlice";
import { toast } from "react-hot-toast";

const FeaturedRoomTable = ({ rooms, isLoading, onEdit, onDelete }) => {
  const [updateRoom, { isLoading: isUpdatingStatus }] =
    useUpdateFeaturedRoomMutation();

  const handleToggleStatus = async (room) => {
    try {
      await updateRoom({ ...room, isActive: !room.isActive }).unwrap();
      toast.success(`Status berhasil diperbarui.`);
    } catch {
      toast.error("Gagal memperbarui status.");
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-lg"></span>
      </div>
    );
  if (!rooms || rooms.length === 0)
    return <div className="text-center p-10">Tidak ada data.</div>;

  return (
    <div className="overflow-x-auto w-full bg-base-100 rounded-lg shadow">
      <table className="table">
        <thead className="bg-base-200">
          <tr>
            <th>No</th>
            <th>Images</th>
            <th>Title & Description</th>
            <th>Activation</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room, index) => (
            <tr key={room.id} className="hover">
              <th>{index + 1}</th>
              <td>
                <div className="avatar-group -space-x-8">
                  {room.images.map((img, i) => (
                    <div key={i} className="avatar border-2 border-base-100">
                      <div className="w-12">
                        <img src={img} alt={`Room image ${i + 1}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </td>
              <td>
                <div className="font-bold">{room.title}</div>
                <div className="text-xs opacity-70 max-w-md truncate">
                  {room.description}
                </div>
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
              <td className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => onEdit(room)}
                    className="btn btn-ghost btn-sm"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(room)}
                    className="btn btn-ghost btn-sm text-error"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default FeaturedRoomTable;
