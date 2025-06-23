import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Bars3Icon,
  PencilSquareIcon,
  TrashIcon,
  PuzzlePieceIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency } from "../../../utils/formatters";

const DraggableUnitRow = ({
  unit,
  index,
  page,
  limit,
  onEdit,
  onDelete,
  onManageGames,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: unit.id });

  // Style untuk memberikan efek visual saat baris di-drag
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : "auto",
  };

  // Fungsi helper untuk menentukan warna badge status
  const getStatusBadge = (status) => {
    const base = "badge badge-sm font-semibold";
    switch (status) {
      case "Available":
        return `${base} badge-success`;
      case "Under Maintenance":
        return `${base} badge-warning`;
      case "Booked":
        return `${base} badge-error`;
      default:
        return `${base} badge-ghost`;
    }
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

      {/* Kolom Data Unit */}
      <td className="font-bold">{unit.name}</td>
      <td>{unit.room}</td>
      <td>{unit.console}</td>
      <td>
        <div className="flex flex-wrap gap-1">
          {unit.addons?.map((addon) => (
            <div key={addon} className="badge badge-neutral badge-sm">
              {addon}
            </div>
          ))}
        </div>
      </td>
      <td className="font-semibold">{formatCurrency(unit.rentPrice)}/jam</td>
      <td className="text-center">
        <div className="tooltip" data-tip="Manage Games">
          <button
            onClick={() => onManageGames(unit)}
            className="btn btn-ghost btn-xs"
          >
            <PuzzlePieceIcon className="h-5 w-5" />
          </button>
        </div>
      </td>
      <td>
        <span className={getStatusBadge(unit.status)}>{unit.status}</span>
      </td>

      {/* Kolom Aksi */}
      <td className="text-center">
        <div className="flex items-center justify-center gap-1">
          <div className="tooltip" data-tip="Edit">
            <button
              onClick={() => onEdit(unit)}
              className="btn btn-ghost btn-sm"
            >
              <PencilSquareIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="tooltip tooltip-error" data-tip="Hapus">
            <button
              onClick={() => onDelete(unit)}
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

export default DraggableUnitRow;
