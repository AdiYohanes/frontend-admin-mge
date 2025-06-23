import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Bars3Icon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency } from "../../../utils/formatters";

const DraggableFoodDrinkRow = ({
  item,
  index,
  page,
  limit,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : "auto",
  };

  const getStatusBadge = (status) => {
    return status === "Available" ? "badge badge-success" : "badge badge-error";
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
            <img src={item.imageUrl} alt={item.name} />
          </div>
        </div>
      </td>
      <td>
        <div className="font-bold">{item.name}</div>
      </td>
      <td>
        <div className="badge badge-ghost">{item.category}</div>
      </td>
      <td className="font-semibold">{formatCurrency(item.price)}</td>
      <td>
        <span className={getStatusBadge(item.status)}>{item.status}</span>
      </td>
      <td className="text-center">
        <div className="flex items-center justify-center gap-1">
          <div className="tooltip" data-tip="Edit">
            <button
              onClick={() => onEdit(item)}
              className="btn btn-ghost btn-sm"
            >
              <PencilSquareIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="tooltip tooltip-error" data-tip="Hapus">
            <button
              onClick={() => onDelete(item)}
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

export default DraggableFoodDrinkRow;
