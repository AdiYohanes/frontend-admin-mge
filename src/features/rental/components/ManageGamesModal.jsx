import React, { useState, useEffect } from "react";
import {
  useGetAllGamesQuery,
  useUpdateUnitMutation,
} from "../api/rentalApiSlice";
import { toast } from "react-hot-toast";
import { XCircleIcon, PlusCircleIcon } from "@heroicons/react/24/solid";

const ManageGamesModal = ({ isOpen, onClose, unitData }) => {
  const { data: masterGames, isLoading: isLoadingGames } =
    useGetAllGamesQuery();
  const [updateUnit, { isLoading: isUpdating }] = useUpdateUnitMutation();

  const [currentGames, setCurrentGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (unitData?.games) {
      setCurrentGames(unitData.games);
    } else {
      setCurrentGames([]);
    }
    setSearchTerm("");
  }, [unitData, isOpen]);

  const handleAddGame = (gameName) => {
    if (!currentGames.includes(gameName)) {
      setCurrentGames([...currentGames, gameName].sort());
    }
  };

  const handleRemoveGame = (gameName) => {
    setCurrentGames(currentGames.filter((g) => g !== gameName));
  };

  const handleSaveChanges = async () => {
    try {
      // Siapkan data unit lengkap untuk dikirim
      const unitPayload = {
        name: unitData.name,
        room_id: unitData.room_id,
        description: unitData.description,
        status: unitData.status,
        max_visitors: unitData.max_visitors,
        price: unitData.rentPrice,
        console_ids: unitData.console_ids,
        game_ids:
          masterGames
            ?.filter((g) => currentGames.includes(g.title))
            .map((g) => g.id) || [],
      };

      await updateUnit({ id: unitData.id, ...unitPayload }).unwrap();
      toast.success(`Daftar game untuk ${unitData.name} berhasil diperbarui!`);
      onClose();
    } catch (err) {
      toast.error("Gagal menyimpan perubahan.");
      console.error("Update unit error:", err);
    }
  };

  const availableGames =
    masterGames?.filter(
      (masterGame) =>
        !currentGames.includes(masterGame.title) &&
        masterGame.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-4xl">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="font-bold text-lg">
          Manage Game List for{" "}
          <span className="text-primary">{unitData?.name}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="bg-base-200 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">
              Games on this Unit ({currentGames.length})
            </h4>
            <div className="h-64 overflow-y-auto space-y-2 pr-2">
              {currentGames.length > 0 ? (
                currentGames.map((game) => (
                  <div
                    key={game}
                    className="flex justify-between items-center bg-base-100 p-2 rounded shadow-sm"
                  >
                    <span className="text-sm">{game}</span>
                    <button
                      onClick={() => handleRemoveGame(game)}
                      className="btn btn-xs btn-ghost text-error"
                      aria-label={`Remove ${game}`}
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-gray-500 mt-10">
                  Belum ada game di unit ini.
                </p>
              )}
            </div>
          </div>
          <div className="bg-base-200 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Add Game from Library</h4>
            <input
              type="text"
              placeholder="Cari game..."
              className="input input-sm input-bordered w-full mb-2"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="h-64 overflow-y-auto space-y-2 pr-2">
              {isLoadingGames ? (
                <span className="loading loading-spinner mx-auto block"></span>
              ) : (
                availableGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex justify-between items-center bg-base-100 p-2 rounded shadow-sm"
                  >
                    <span className="text-sm">{game.title}</span>
                    <button
                      onClick={() => handleAddGame(game.title)}
                      className="btn btn-xs btn-ghost text-success"
                      aria-label={`Add ${game.title}`}
                    >
                      <PlusCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="modal-action pt-6">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Batal
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveChanges}
            disabled={isUpdating}
          >
            {isUpdating && <span className="loading loading-spinner"></span>}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageGamesModal;
