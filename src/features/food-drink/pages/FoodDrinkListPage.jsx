import React, { useState, useEffect, useRef } from "react";
import {
  useGetFoodDrinkItemsQuery,
  useDeleteFoodDrinkItemMutation,
} from "../api/foodDrinkApiSlice";
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
import FoodDrinkTable from "../components/FoodDrinkTable";
import AddEditFoodDrinkModal from "../components/AddEditFoodDrinkModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const FoodDrinkListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const deleteModalRef = useRef(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [orderedItems, setOrderedItems] = useState([]);

  const { data, isLoading, isFetching } = useGetFoodDrinkItemsQuery({
    page: currentPage,
    limit,
    search: debouncedSearchTerm,
  });

  const [deleteItem, { isLoading: isDeleting }] =
    useDeleteFoodDrinkItemMutation();

  useEffect(() => {
    if (data?.items) {
      setOrderedItems(data.items);
    }
  }, [data?.items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setOrderedItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleOpenAddModal = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };
  const handleOpenEditModal = (itemData) => {
    setEditingData(itemData);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
  };
  const handleOpenDeleteModal = (itemData) => {
    setItemToDelete(itemData);
    deleteModalRef.current?.showModal();
  };
  const handleConfirmDelete = async () => {
    try {
      await deleteItem(itemToDelete.id).unwrap();
      toast.success("Item berhasil dihapus!");
      deleteModalRef.current?.close();
    } catch (err) {
      toast.error("Gagal menghapus item.");
      console.error("Failed to delete item:", err);
    }
  };

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Food & Drink Management</h2>
          <TableControls
            limit={limit}
            setLimit={setLimit}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddClick={handleOpenAddModal}
            addButtonText="Add Item"
            showMonthFilter={false}
          />
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedItems}
              strategy={verticalListSortingStrategy}
            >
              <FoodDrinkTable
                items={orderedItems}
                isLoading={isLoading || isFetching}
                page={currentPage}
                limit={limit}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
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

      <AddEditFoodDrinkModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingData={editingData}
      />
      <ConfirmationModal
        ref={deleteModalRef}
        title="Konfirmasi Hapus Item"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      >
        <p>
          Apakah Anda yakin ingin menghapus item{" "}
          <span className="font-bold">{itemToDelete?.name}</span>?
        </p>
      </ConfirmationModal>
    </>
  );
};

export default FoodDrinkListPage;
