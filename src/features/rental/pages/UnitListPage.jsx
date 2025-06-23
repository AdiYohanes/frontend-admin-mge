import React, { useState, useEffect, useRef } from "react";
import { useGetUnitsQuery, useDeleteUnitMutation } from "../api/rentalApiSlice";
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
import UnitTable from "../components/UnitTable";
import AddEditUnitModal from "../components/AddEditUnitModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import ManageGamesModal from "../components/ManageGamesModal";

const UnitListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [unitToDelete, setUnitToDelete] = useState(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [unitToManageGames, setUnitToManageGames] = useState(null);
  const deleteModalRef = useRef(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data, isLoading, isFetching } = useGetUnitsQuery({
    page: currentPage,
    limit,
    search: debouncedSearchTerm,
  });

  const [deleteUnit, { isLoading: isDeleting }] = useDeleteUnitMutation();
  const [orderedUnits, setOrderedUnits] = useState([]);

  useEffect(() => {
    if (data?.units) {
      setOrderedUnits(data.units);
    }
  }, [data?.units]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setOrderedUnits((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleOpenAddModal = () => {
    setEditingData(null);
    setIsAddEditModalOpen(true);
  };
  const handleOpenEditModal = (unitData) => {
    setEditingData(unitData);
    setIsAddEditModalOpen(true);
  };
  const handleCloseAddEditModal = () => {
    setIsAddEditModalOpen(false);
    setEditingData(null);
  };
  const handleOpenDeleteModal = (unitData) => {
    setUnitToDelete(unitData);
    deleteModalRef.current?.showModal();
  };
  const handleConfirmDelete = async () => {
    try {
      await deleteUnit(unitToDelete.id).unwrap();
      toast.success("Unit berhasil dihapus!");
      deleteModalRef.current?.close();
    } catch (err) {
      toast.error("Gagal menghapus unit.");
      console.error("Delete unit error:", err);
    }
  };
  const handleOpenGameModal = (unit) => {
    setUnitToManageGames(unit);
    setIsGameModalOpen(true);
  };
  const handleCloseGameModal = () => {
    setIsGameModalOpen(false);
    setUnitToManageGames(null);
  };

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Unit Management</h2>
          <TableControls
            limit={limit}
            setLimit={setLimit}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddClick={handleOpenAddModal}
            addButtonText="Add Unit"
            showMonthFilter={false}
          />
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedUnits}
              strategy={verticalListSortingStrategy}
            >
              <UnitTable
                units={orderedUnits}
                isLoading={isLoading || isFetching}
                page={currentPage}
                limit={limit}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                onManageGames={handleOpenGameModal}
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

      <AddEditUnitModal
        isOpen={isAddEditModalOpen}
        onClose={handleCloseAddEditModal}
        editingData={editingData}
      />
      <ConfirmationModal
        ref={deleteModalRef}
        title="Konfirmasi Hapus Unit"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      >
        <p>
          Apakah Anda yakin ingin menghapus unit{" "}
          <span className="font-bold">{unitToDelete?.name}</span>?
        </p>
      </ConfirmationModal>
      <ManageGamesModal
        isOpen={isGameModalOpen}
        onClose={handleCloseGameModal}
        unitData={unitToManageGames}
      />
    </>
  );
};

export default UnitListPage;
