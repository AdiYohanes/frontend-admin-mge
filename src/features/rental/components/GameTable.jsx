import React from "react";
import DraggableGameRow from "./DraggableGameRow";

const GameTable = ({ games, isLoading, page, limit, onEdit, onDelete }) => {
  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-lg"></span>
      </div>
    );
  if (!games || games.length === 0)
    return (
      <div className="text-center p-10">
        Tidak ada data game yang ditemukan.
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
            <th>Console</th>
            <th>Genre</th>
            <th>Available at</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, index) => (
            <DraggableGameRow
              key={game.id}
              game={game}
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
export default GameTable;
