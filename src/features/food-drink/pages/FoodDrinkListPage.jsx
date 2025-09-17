import React, { useState, useRef, useMemo } from "react";
import {
  useGetFoodDrinkItemsQuery,
  useDeleteFoodDrinkItemMutation,
} from "../api/foodDrinkApiSlice";
import useDebounce from "../../../hooks/useDebounce";
import { toast } from "react-hot-toast";

import TableControls from "../../../components/common/TableControls";
import FoodDrinkTable from "../components/FoodDrinkTable";
import Pagination from "../../../components/common/Pagination";
import AddEditFoodDrinkModal from "../components/AddEditFoodDrinkModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const FoodDrinkListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const deleteModalRef = useRef(null);

  // Remove search from API call for frontend filtering
  const { data, isLoading, isFetching } = useGetFoodDrinkItemsQuery({
    page: currentPage,
    limit,
  });

  // Frontend filtering based on search term
  const filteredItems = useMemo(() => {
    if (!data?.items) return [];

    if (!debouncedSearchTerm.trim()) return data.items;

    return data.items.filter(item =>
      item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
      (item.category && item.category.name && item.category.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    );
  }, [data?.items, debouncedSearchTerm]);
  const [deleteItem, { isLoading: isDeleting }] =
    useDeleteFoodDrinkItemMutation();

  const handleOpenAddModal = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };
  const handleOpenEditModal = (item) => {
    setEditingData(item);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
  };
  const handleOpenDeleteModal = (item) => {
    setItemToDelete(item);
    deleteModalRef.current?.showModal();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteItem(itemToDelete.id).unwrap();
      toast.success("Item berhasil dihapus!");
      deleteModalRef.current?.close();
    } catch (err) {
      toast.error("Gagal menghapus item.");
      console.error("Delete error:", err);
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
          <FoodDrinkTable
            items={filteredItems}
            isLoading={isLoading || isFetching}
            page={currentPage}
            limit={limit}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
          />
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
