import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Bars3Icon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const DraggableRoomRow = ({ room, index, page, limit, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: room.id });

  // Style ini penting untuk memberikan efek visual saat baris di-drag
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : "auto", // Memastikan baris yang di-drag tampil di atas
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={isDragging ? "bg-base-300 shadow-lg" : "hover"}
    >
      {/* Kolom untuk Drag Handle */}
      <td className="w-12 text-center">
        <button
          {...listeners}
          className="btn btn-ghost btn-xs cursor-grab active:cursor-grabbing"
        >
          <Bars3Icon className="h-5 w-5 text-gray-400" />
        </button>
      </td>

      {/* Kolom Nomor Urut */}
      <th>{(page - 1) * limit + index + 1}</th>

      {/* Kolom Gambar */}
      <td>
        <div className="avatar">
          <div className="mask mask-squircle w-12 h-12">
            <img src={room.imageUrl} alt={room.name} />
          </div>
        </div>
      </td>

      {/* Kolom Nama & Deskripsi */}
      <td className="font-semibold">{room.name}</td>
      <td className="text-sm opacity-80 max-w-md truncate">
        {room.description}
      </td>

      {/* Kolom Aksi */}
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
