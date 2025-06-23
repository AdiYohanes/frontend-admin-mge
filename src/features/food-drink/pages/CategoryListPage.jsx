import React, { useState, useRef } from "react";
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
} from "../api/foodDrinkApiSlice";
import useDebounce from "../../../hooks/useDebounce";
import { toast } from "react-hot-toast";

import TableControls from "../../../components/common/TableControls";
import Pagination from "../../../components/common/Pagination";
import CategoryTable from "../components/CategoryTable";
import AddEditCategoryModal from "../components/AddEditCategoryModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const CategoryListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const deleteModalRef = useRef(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data, isLoading, isFetching } = useGetCategoriesQuery({
    page: currentPage,
    limit,
    search: debouncedSearchTerm,
  });

  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  const handleOpenAddModal = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (categoryData) => {
    setEditingData(categoryData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
  };

  const handleOpenDeleteModal = (categoryData) => {
    setCategoryToDelete(categoryData);
    deleteModalRef.current?.showModal();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteCategory(categoryToDelete.id).unwrap();
      toast.success("Kategori berhasil dihapus!");
      deleteModalRef.current?.close();
    } catch (err) {
      toast.error("Gagal menghapus kategori.");
      console.error("Failed to delete category:", err);
    }
  };

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Food & Drink Categories</h2>
          <TableControls
            limit={limit}
            setLimit={setLimit}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddClick={handleOpenAddModal}
            addButtonText="Add Category"
            showMonthFilter={false}
          />
          <CategoryTable
            categories={data?.categories}
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

      <AddEditCategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingData={editingData}
      />
      <ConfirmationModal
        ref={deleteModalRef}
        title="Konfirmasi Hapus Kategori"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      >
        <p>
          Apakah Anda yakin ingin menghapus kategori{" "}
          <span className="font-bold">{categoryToDelete?.name}</span>?
        </p>
      </ConfirmationModal>
    </>
  );
};

export default CategoryListPage;
