import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Bars3Icon,
    PencilSquareIcon,
    TrashIcon,
    TagIcon,
} from "@heroicons/react/24/outline";

const DraggableGenreRow = ({
    genre,
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
    } = useSortable({ id: genre.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : "auto",
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
                <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                        <div className="bg-brand-gold/10 text-brand-gold rounded-full w-10 h-10 flex items-center justify-center">
                            <TagIcon className="h-5 w-5" />
                        </div>
                    </div>
                    <div>
                        <div className="font-semibold">{genre.name}</div>
                    </div>
                </div>
            </td>
            <td className="text-center">
                <div className="flex items-center justify-center gap-1">
                    <div className="tooltip" data-tip="Edit">
                        <button
                            onClick={() => onEdit(genre)}
                            className="btn btn-ghost btn-sm"
                        >
                            <PencilSquareIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="tooltip tooltip-error" data-tip="Delete">
                        <button
                            onClick={() => onDelete(genre)}
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

export default DraggableGenreRow; 