import React, { useState, useEffect } from "react";
import {
  useGetAllGamesQuery,
  useUpdateUnitMutation,
} from "../api/rentalApiSlice";
import { toast } from "react-hot-toast";
import { XCircleIcon, PlusCircleIcon } from "@heroicons/react/24/solid";

const ManageGamesModal = ({ isOpen, onClose, unitData }) => {
  // 1. Mengambil daftar master semua game yang tersedia
  const { data: masterGames, isLoading: isLoadingGames } =
    useGetAllGamesQuery();

  // 2. Hook mutation untuk menyimpan perubahan pada unit
  const [updateUnit, { isLoading: isUpdating }] = useUpdateUnitMutation();

  // 3. State lokal untuk menyimpan daftar game yang sedang diedit
  const [currentGames, setCurrentGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // 4. Sinkronkan state lokal dengan data unit saat modal dibuka
  useEffect(() => {
    if (isOpen && unitData?.games) {
      setCurrentGames(unitData.games);
    } else {
      // Bersihkan jika tidak ada data atau modal ditutup
      setCurrentGames([]);
    }
    // Reset pencarian setiap kali modal dibuka
    setSearchTerm("");
  }, [unitData, isOpen]);

  // Handler untuk menambah game ke state lokal
  const handleAddGame = (gameName) => {
    if (!currentGames.includes(gameName)) {
      setCurrentGames([...currentGames, gameName].sort()); // Langsung diurutkan agar rapi
    }
  };

  // Handler untuk menghapus game dari state lokal
  const handleRemoveGame = (gameName) => {
    setCurrentGames(currentGames.filter((g) => g !== gameName));
  };

  // Handler untuk menyimpan semua perubahan ke "backend"
  const handleSaveChanges = async () => {
    try {
      // Kirim seluruh data unit dengan properti 'games' yang sudah diperbarui
      await updateUnit({ ...unitData, games: currentGames }).unwrap();
      toast.success(`Daftar game untuk ${unitData.name} berhasil diperbarui!`);
      onClose(); // Tutup modal setelah berhasil
    } catch (err) {
      toast.error("Gagal menyimpan perubahan.");
      console.error("Failed to save game list:", err);
    }
  };

  // Filter daftar game di perpustakaan untuk menampilkan yang belum ada di unit & sesuai pencarian
  const availableGames =
    masterGames?.filter(
      (masterGame) =>
        !currentGames.includes(masterGame.name) &&
        masterGame.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          {/* Kolom Kiri: Game yang sudah ada di unit */}
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

          {/* Kolom Kanan: Perpustakaan Game untuk ditambahkan */}
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
                    <span className="text-sm">{game.name}</span>
                    <button
                      onClick={() => handleAddGame(game.name)}
                      className="btn btn-xs btn-ghost text-success"
                      aria-label={`Add ${game.name}`}
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
