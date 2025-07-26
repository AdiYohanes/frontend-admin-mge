import React, { useState, useEffect, useRef } from "react";
import {
  useGetConsolesQuery,
  useDeleteConsoleMutation,
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
import ConsoleTable from "../components/ConsoleTable";
import AddEditConsoleModal from "../components/AddEditConsoleModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const ConsoleListPage = () => {
  // --- STATE MANAGEMENT ---
  // State untuk paginasi dan filter
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // State untuk mengontrol modal Tambah/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // State dan Ref untuk mengontrol modal konfirmasi Hapus
  const [consoleToDelete, setConsoleToDelete] = useState(null);
  const deleteModalRef = useRef(null);

  // State untuk urutan data (untuk drag-and-drop)
  const [orderedConsoles, setOrderedConsoles] = useState([]);

  // --- RTK QUERY HOOKS ---
  const { data, isLoading, isFetching } = useGetConsolesQuery({
    page: currentPage,
    limit,
    search: debouncedSearchTerm,
  });

  const [deleteConsole, { isLoading: isDeleting }] = useDeleteConsoleMutation();

  // Sinkronkan urutan lokal dengan data dari API
  useEffect(() => {
    if (data?.consoles) {
      setOrderedConsoles(data.consoles);
    }
  }, [data?.consoles]);

  // --- DRAG & DROP LOGIC ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Mulai drag setelah mouse bergerak 8px
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setOrderedConsoles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // --- HANDLER FUNCTIONS ---
  const handleAddConsole = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleEditConsole = (consoleData) => {
    setEditingData(consoleData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
  };

  const handleDeleteConsole = (consoleData) => {
    setConsoleToDelete(consoleData);
    deleteModalRef.current?.showModal();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteConsole(consoleToDelete.id).unwrap();
      toast.success("Konsol berhasil dihapus!");
      deleteModalRef.current?.close();
    } catch (err) {
      toast.error("Gagal menghapus konsol.");
      console.error("Delete console error:", err);
    }
  };

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Console Management</h2>

          <TableControls
            limit={limit}
            setLimit={setLimit}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddClick={handleAddConsole}
            addButtonText="Add Console"
            showMonthFilter={false}
          />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedConsoles}
              strategy={verticalListSortingStrategy}
            >
              <ConsoleTable
                consoles={orderedConsoles}
                isLoading={isLoading || isFetching}
                page={currentPage}
                limit={limit}
                onEdit={handleEditConsole}
                onDelete={handleDeleteConsole}
              />
            </SortableContext>
          </DndContext>

          <Pagination
            currentPage={data?.currentPage}
            totalPages={data?.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <AddEditConsoleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingData={editingData}
      />

      <ConfirmationModal
        ref={deleteModalRef}
        title="Konfirmasi Hapus Konsol"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      >
        <p>
          Apakah Anda yakin ingin menghapus konsol{" "}
          <span className="font-bold">{consoleToDelete?.name}</span>?
        </p>
      </ConfirmationModal>
    </>
  );
};

export default ConsoleListPage;
