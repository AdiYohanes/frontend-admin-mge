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
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : "auto",
  };

  const getStatusBadge = (status) => {
    const base = "badge badge-sm font-semibold capitalize"; // Tambahkan 'capitalize'
    switch (status) {
      case "available":
        return `${base} badge-success`;
      case "maintenance":
        return `${base} badge-warning`;
      case "booked":
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
      <td className="w-12 text-center">
        <button
          {...listeners}
          className="btn btn-ghost btn-xs cursor-grab active:cursor-grabbing"
        >
          <Bars3Icon className="h-5 w-5 text-gray-400" />
        </button>
      </td>
      <th>{(page - 1) * limit + index + 1}</th>
      <td className="font-bold">{unit.name}</td>
      <td>{unit.roomName}</td>
      <td>{unit.consoleNames}</td>
      <td className="font-semibold">{formatCurrency(unit.rentPrice)}/jam</td>
      <td className="text-center font-semibold">{unit.points_per_hour || 0} pts</td>
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
