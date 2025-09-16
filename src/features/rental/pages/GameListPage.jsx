import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  useGetGameListQuery,
  useDeleteGameMutation,
} from "../api/rentalApiSlice";
import useDebounce from "../../../hooks/useDebounce";
import { toast } from "react-hot-toast";

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

import TableControls from "../../../components/common/TableControls";
import Pagination from "../../../components/common/Pagination";
import GameTable from "../components/GameTable";
import AddEditGameModal from "../components/AddEditGameModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const GameListPage = () => {
  // State untuk filter dan paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // State untuk mengontrol modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [gameToDelete, setGameToDelete] = useState(null);
  const deleteModalRef = useRef(null);

  // State untuk urutan data (untuk drag-and-drop)
  const [orderedGames, setOrderedGames] = useState([]);

  // Panggilan API
  const { data, isLoading, isFetching } = useGetGameListQuery({
    page: currentPage,
    limit,
    search: "", // Always fetch all data for frontend filtering
  });

  const [deleteGame, { isLoading: isDeleting }] = useDeleteGameMutation();

  // Frontend pagination for filtered results
  const { paginatedGames, paginationData } = useMemo(() => {
    const allGames = data?.games || [];

    // If no search term, use backend pagination but calculate from/to correctly
    if (!debouncedSearchTerm.trim()) {
      const total = data?.total || allGames.length;
      const currentPageNum = data?.currentPage || currentPage;
      const totalPages = data?.totalPages || Math.ceil(total / limit);
      const from = ((currentPageNum - 1) * limit) + 1;
      const to = Math.min(currentPageNum * limit, total);

      return {
        paginatedGames: allGames,
        paginationData: {
          currentPage: currentPageNum,
          totalPages,
          total,
          perPage: limit,
          from,
          to
        }
      };
    }

    // Frontend filtering and pagination
    const filteredGames = allGames.filter(game =>
      game.title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      game.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      game.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      game.genre?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      game.console?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredGames.length / limit);
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedGames = filteredGames.slice(startIndex, endIndex);

    return {
      paginatedGames,
      paginationData: {
        currentPage,
        totalPages,
        total: filteredGames.length,
        perPage: limit,
        from: filteredGames.length > 0 ? startIndex + 1 : 0,
        to: Math.min(endIndex, filteredGames.length)
      }
    };
  }, [data, debouncedSearchTerm, currentPage, limit]);

  // Sinkronkan urutan lokal dengan data dari API
  useEffect(() => {
    if (paginatedGames) {
      setOrderedGames(paginatedGames);
    }
  }, [paginatedGames]);

  // Konfigurasi sensor untuk dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handler saat aksi drag selesai
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setOrderedGames((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Kumpulan fungsi handler untuk aksi CRUD
  const handleOpenAddModal = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (gameData) => {
    setEditingData(gameData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
  };

  const handleOpenDeleteModal = (gameData) => {
    setGameToDelete(gameData);
    deleteModalRef.current?.showModal();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteGame(gameToDelete.id).unwrap();
      toast.success("Game berhasil dihapus!");
      deleteModalRef.current?.close();
    } catch (err) {
      if (
        err.data?.message &&
        err.data.message.includes("foreign key constraint")
      ) {
        toast.error("Gagal: Game ini masih digunakan di data booking lain.");
      } else {
        toast.error("Gagal menghapus game.");
      }
      console.error("Delete game error:", err);
      deleteModalRef.current?.close(); // Tutup modal meskipun gagal
    }
  };

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Master Game List</h2>
          <TableControls
            limit={limit}
            setLimit={setLimit}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddClick={handleOpenAddModal}
            addButtonText="Add Game"
          />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedGames}
              strategy={verticalListSortingStrategy}
            >
              <GameTable
                games={orderedGames}
                isLoading={isLoading || isFetching}
                page={currentPage}
                limit={limit}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
              />
            </SortableContext>
          </DndContext>

          {/* Table Information */}
          <div className="text-center mb-4">
            <div className="text-sm text-base-content/70 mb-2">
              {isLoading || isFetching ? (
                <span>Loading...</span>
              ) : (
                <span>
                  {debouncedSearchTerm.trim() ? (
                    <>
                      {paginationData.total} game{paginationData.total !== 1 ? 's' : ''} matching "{debouncedSearchTerm}"
                    </>
                  ) : (
                    <>
                      Showing {paginationData.total} of {paginationData.total} games
                    </>
                  )}
                </span>
              )}
            </div>
          </div>

          <Pagination
            currentPage={paginationData.currentPage}
            totalPages={paginationData.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <AddEditGameModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingData={editingData}
      />

      <ConfirmationModal
        ref={deleteModalRef}
        title="Konfirmasi Hapus Game"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      >
        <p>
          Apakah Anda yakin ingin menghapus game{" "}
          <span className="font-bold">{gameToDelete?.name}</span>?
        </p>
      </ConfirmationModal>
    </>
  );
};

export default GameListPage;
