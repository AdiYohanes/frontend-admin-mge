import React from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useUpdateFeaturedGameMutation } from "../api/settingsApiSlice";
import { toast } from "react-hot-toast";

const FeaturedGameTable = ({ games, isLoading, onEdit, onDelete }) => {
  const [updateGame, { isLoading: isUpdatingStatus }] =
    useUpdateFeaturedGameMutation();

  const handleToggleStatus = async (game) => {
    try {
      await updateGame({ ...game, isActive: !game.isActive }).unwrap();
      toast.success(`Status berhasil diperbarui.`);
    } catch {
      toast.error("Gagal memperbarui status.");
    }
  };

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
            <th>Description</th>
            <th>Highlighted Games</th>
            <th>Activation</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(!games || games.length === 0) ? (
            <tr>
              <td colSpan="5" className="text-center py-8 text-base-content/60">
                Tidak ada data game yang ditemukan.
              </td>
            </tr>
          ) : (
            games.map((game, index) => (
              <tr key={game.id} className="hover">
                <th>{index + 1}</th>
                <td className="text-sm max-w-sm">{game.description}</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {game.highlightedGames.map((g) => (
                      <div key={g} className="badge badge-primary badge-outline">
                        {g}
                      </div>
                    ))}
                  </div>
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={game.isActive}
                    onChange={() => handleToggleStatus(game)}
                    disabled={isUpdatingStatus}
                  />
                </td>
                <td className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onEdit(game)}
                      className="btn btn-ghost btn-sm"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(game)}
                      className="btn btn-ghost btn-sm text-error"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
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
