import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Bars3Icon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useUpdateRoomMutation } from "../api/rentalApiSlice";
import { toast } from "react-hot-toast";

const DraggableRoomRow = ({ room, index, page, limit, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: room.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : "auto",
  };

  // 1. Inisialisasi hook mutation untuk update
  const [updateRoom, { isLoading: isUpdatingStatus }] = useUpdateRoomMutation();

  // 2. Buat fungsi handler untuk menangani klik pada toggle
  const handleToggleStatus = async () => {
    try {
      // Kirim hanya ID dan status baru untuk diupdate
      // Backend mengharapkan semua data, jadi kita kirim data room lengkap
      await updateRoom({ ...room, is_available: !room.is_available }).unwrap();
      toast.success(`Status untuk ${room.name} berhasil diperbarui.`);
    } catch (err) {
      toast.error("Gagal memperbarui status ruangan.");
      console.error("Failed to toggle status:", err);
    }
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={isDragging ? "bg-base-300 shadow-lg" : "hover"}
    >
      <td className="w-12 text-center">
        <button
          {...listeners}
          className="btn btn-ghost btn-xs cursor-grab active:cursor-grabbing"
        >
          <Bars3Icon className="h-5 w-5 text-gray-400" />
        </button>
      </td>
      <th>{(page - 1) * limit + index + 1}</th>
      <td>
        <div className="avatar">
          <div className="mask mask-squircle w-12 h-12">
            <img src={room.imageUrl} alt={room.name} />
          </div>
        </div>
      </td>
      <td className="font-semibold">{room.name}</td>
      <td className="text-sm opacity-80 max-w-md truncate">
        {room.description}
      </td>
      <td className="font-medium">{room.max_visitors || "-"} orang</td>
      <td className="text-sm">
        {room.consoleNames && room.consoleNames !== "N/A" ? (
          <ul className="list-disc list-inside space-y-1">
            {room.consoleNames.split(", ").map((consoleName, idx) => (
              <li key={idx} className="text-xs">
                {consoleName}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-gray-400 italic text-xs">No consoles</span>
        )}
      </td>
      <td>
        <div
          className="tooltip"
          data-tip={room.is_available ? "Available" : "Not Available"}
        >
          <input
            type="checkbox"
            className="toggle toggle-success"
            checked={room.is_available}
            onChange={handleToggleStatus}
            disabled={isUpdatingStatus}
          />
        </div>
      </td>

      <td className="text-center">
        <div className="flex items-center justify-center gap-1">
          <div className="tooltip" data-tip="Edit">
            <button
              onClick={() => onEdit(room)}
              className="btn btn-ghost btn-sm"
            >
              <PencilSquareIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="tooltip tooltip-error" data-tip="Hapus">
            <button
              onClick={() => onDelete(room)}
              className="btn btn-ghost btn-sm text-error"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default DraggableRoomRow;
