import React from "react";

const FeaturedGameTable = ({ games, isLoading, onToggleStatus, currentPage = 1, limit = 10 }) => {

  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-lg"></span>
      </div>
    );

  return (
    <div className="overflow-x-auto w-full bg-base-100 rounded-lg shadow">
      <table className="table">
        <thead className="bg-base-200">
          <tr>
            <th>No</th>
            <th>Image</th>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {(!games || games.length === 0) ? (
            <tr>
              <td colSpan="4" className="text-center py-8 text-base-content/60">
                Tidak ada data game yang ditemukan.
              </td>
            </tr>
          ) : (
            games.map((game, index) => (
              <tr key={game.id} className="hover">
                <th>{(currentPage - 1) * limit + index + 1}</th>
                <td>
                  <div className="avatar">
                    <div className="mask mask-squircle w-16 h-16">
                      <img src={game.imageUrl} alt={game.name} />
                    </div>
                  </div>
                </td>
                <td className="font-bold">{game.name}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className={`toggle toggle-sm ${game.isActive ? 'toggle-success' : 'toggle-error'}`}
                      checked={game.isActive}
                      onChange={() => onToggleStatus(game)}
                    />
                    <span className={`text-sm ${game.isActive ? 'text-success' : 'text-error'}`}>
                      {game.isActive ? 'Featured' : 'Not Featured'}
                    </span>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
export default FeaturedGameTable;
