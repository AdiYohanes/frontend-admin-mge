/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  useGetAllGamesQuery,
  useUpdateUnitMutation,
  useReorderGamesMutation,
} from "../api/rentalApiSlice";
import { toast } from "react-hot-toast";
import { XCircleIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Draggable Game Item Component
const DraggableGameItem = ({ game, onRemove, isDraggable = true }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: game.id || game.title, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex justify-between items-center bg-base-100 p-2 rounded shadow-sm cursor-move hover:bg-base-300 transition-colors ${isDragging ? "ring-2 ring-primary" : ""
        }`}
    >
      <span className="text-sm">{game.title || game}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(game.title || game);
        }}
        className="btn btn-xs btn-ghost text-error"
        aria-label={`Remove ${game.title || game}`}
      >
        <XCircleIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

const ManageGamesModal = ({ isOpen, onClose, unitData }) => {
  const { data: masterGames, isLoading: isLoadingGames } =
    useGetAllGamesQuery();
  const [updateUnit, { isLoading: isUpdating }] = useUpdateUnitMutation();
  const [reorderGames, { isLoading: isReordering }] = useReorderGamesMutation();

  const [currentGames, setCurrentGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasOrderChanged, setHasOrderChanged] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    if (unitData?.gameDetails) {
      // Use gameDetails for better data structure
      setCurrentGames(unitData.gameDetails);
    } else if (unitData?.games) {
      // Fallback to old format
      setCurrentGames(unitData.games.map(title => ({ title })));
    } else {
      setCurrentGames([]);
    }
    setSearchTerm("");
    setHasOrderChanged(false);
  }, [unitData, isOpen]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCurrentGames((items) => {
        const oldIndex = items.findIndex((item) => (item.id || item.title) === active.id);
        const newIndex = items.findIndex((item) => (item.id || item.title) === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        setHasOrderChanged(true);
        return newOrder;
      });
    }
  };

  const handleAddGame = (game) => {
    const gameTitle = game.title || game;
    if (!currentGames.some(g => (g.title || g) === gameTitle)) {
      setCurrentGames([...currentGames, game]);
    }
  };

  const handleRemoveGame = (gameName) => {
    setCurrentGames(currentGames.filter((g) => (g.title || g) !== gameName));
  };

  const handleSaveChanges = async () => {
    try {
      // If order has changed, reorder games first
      if (hasOrderChanged && currentGames.length > 0) {
        const gameIds = currentGames.map(game => game.id || game.game_id);
        if (gameIds.length > 0) {
          await reorderGames({ unitId: unitData.id, gameIds }).unwrap();
          toast.success("Urutan game berhasil diubah!");
        }
      }

      // Prepare unit data for update
      const unitPayload = {
        name: unitData.name,
        room_id: unitData.room_id,
        description: unitData.description,
        status: unitData.status,
        max_visitors: unitData.max_visitors,
        price: unitData.rentPrice,
        console_ids: unitData.console_ids,
        game_ids: currentGames.map(game => game.id || game.game_id).filter(Boolean),
      };

      await updateUnit({ id: unitData.id, ...unitPayload }).unwrap();
      toast.success(`Daftar game untuk ${unitData.name} berhasil diperbarui!`);
      setHasOrderChanged(false);
      onClose();
    } catch (err) {
      toast.error("Gagal menyimpan perubahan.");
      console.error("Update unit error:", err);
    }
  };

  const availableGames =
    masterGames?.filter(
      (masterGame) =>
        !currentGames.some(g => (g.title || g) === masterGame.title) &&
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
              {hasOrderChanged && (
                <span className="text-xs text-warning ml-2">⚠️ Urutan berubah</span>
              )}
            </h4>
            <p className="text-xs text-gray-500 mb-2">
              Drag & drop untuk mengubah urutan game
            </p>
            <div className="h-64 overflow-y-auto space-y-2 pr-2">
              {currentGames.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={currentGames.map(game => game.id || game.title)}
                    strategy={verticalListSortingStrategy}
                  >
                    {currentGames.map((game, index) => (
                      <DraggableGameItem
                        key={game.id || game.title}
                        game={game}
                        onRemove={handleRemoveGame}
                        isDraggable={true}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
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
                      onClick={() => handleAddGame(game)}
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
            disabled={isUpdating || isReordering}
          >
            {(isUpdating || isReordering) && <span className="loading loading-spinner"></span>}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageGamesModal;
