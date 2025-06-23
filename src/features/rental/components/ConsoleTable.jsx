import React from "react";
import DraggableTableRow from "./DraggableTableRow";

const ConsoleTable = ({
  consoles,
  isLoading,
  page,
  limit,
  onEdit,
  onDelete,
}) => {
  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-lg"></span>
      </div>
    );
  if (!consoles || consoles.length === 0)
    return (
      <div className="text-center p-10">
        Tidak ada data konsol yang ditemukan.
      </div>
    );

  return (
    <div className="overflow-x-auto w-full bg-base-100 rounded-lg shadow">
      <table className="table">
        <thead className="bg-base-200">
          <tr>
            <th className="w-12"></th>
            <th>No</th>
            <th>Image</th>
            <th>Name</th>
            <th>Amount</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {consoles.map((console, index) => (
            <DraggableTableRow
              key={console.id}
              console={console}
              index={index}
              page={page}
              limit={limit}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConsoleTable;
