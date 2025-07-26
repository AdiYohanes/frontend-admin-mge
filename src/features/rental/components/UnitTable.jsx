import React from "react";
import DraggableUnitRow from "./DraggableUnitRow";

const UnitTable = ({
  units,
  isLoading,
  page,
  limit,
  onEdit,
  onDelete,
  onManageGames,
}) => {
  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-lg"></span>
      </div>
    );
  if (!units || units.length === 0)
    return (
      <div className="text-center p-10">
        Tidak ada data unit yang ditemukan.
      </div>
    );

  return (
    <div className="overflow-x-auto w-full bg-base-100 rounded-lg shadow">
      <table className="table">
        <thead className="bg-base-200">
          <tr>
            <th className="w-12"></th>
            <th>No</th>
            <th>Unit Name</th>
            <th>Room</th>
            <th>Console</th>
            <th>Rent Price</th>
            <th>Game List</th>
            <th>Status</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {units.map((unit, index) => (
            <DraggableUnitRow
              key={unit.id}
              unit={unit}
              index={index}
              page={page}
              limit={limit}
              onEdit={onEdit}
              onDelete={onDelete}
              onManageGames={onManageGames}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UnitTable;
