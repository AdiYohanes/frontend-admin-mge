import React, { useState, useRef, useMemo } from "react";
import {
  useGetCustomerReviewsQuery,
  useDeleteCustomerReviewMutation,
} from "../api/settingsApiSlice";
import { toast } from "react-hot-toast";
import TableControls from "../../../components/common/TableControls";
import AddEditCustomerReviewModal from "./AddEditCustomerReviewModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import CustomerReviewTable from "./CustomerReviewTable";
import Pagination from "../../../components/common/Pagination";

const CustomerReviewManagement = () => {
  // 1. STATE UNTUK MENGONTROL MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const deleteModalRef = useRef(null);

  // 2. STATE UNTUK PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useGetCustomerReviewsQuery();
  const [deleteReview, { isLoading: isDeleting }] =
    useDeleteCustomerReviewMutation();

  // 3. FILTER DATA BERDASARKAN SEARCH
  const filteredReviews = useMemo(() => {
    if (!data?.reviews) return [];

    if (!search.trim()) return data.reviews;

    return data.reviews.filter((review) => {
      const searchLower = search.toLowerCase();
      return (
        review.booking?.invoice_number?.toLowerCase().includes(searchLower) ||
        review.booking?.bookable?.name?.toLowerCase().includes(searchLower) ||
        review.booking?.bookable?.username?.toLowerCase().includes(searchLower) ||
        review.description?.toLowerCase().includes(searchLower)
      );
    });
  }, [data?.reviews, search]);

  // 2. HANDLER UNTUK MEMBUKA MODAL
  const handleEdit = (item) => {
    setEditingData(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    deleteModalRef.current?.showModal();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteReview(itemToDelete.id).unwrap();
      toast.success("Review berhasil dihapus.");
      deleteModalRef.current?.close();
      refetch(); // Refresh data after delete
    } catch {
      toast.error("Gagal menghapus review.");
    }
  };

  // 4. HANDLER UNTUK PAGINATION
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing per page
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <>
      {/* Table controls with search functionality */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Show entries control */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show</span>
          <select
            value={perPage}
            onChange={(e) => handlePerPageChange(Number(e.target.value))}
            className="select select-bordered select-sm w-20"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={25}>25</option>
          </select>
          <span className="text-sm text-gray-600">entries</span>
        </div>

        {/* Search control */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={handleSearchChange}
            className="input input-bordered input-sm w-64"
          />
        </div>
      </div>

      <CustomerReviewTable
        reviews={filteredReviews}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {data?.pagination && data.pagination.total > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="text-sm text-gray-600">
            Showing {filteredReviews.length} of {data.pagination.total} reviews
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={data.pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* 4. PASTIKAN MODAL DIRENDER DENGAN PROPS YANG BENAR */}
      <AddEditCustomerReviewModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingData(null);
        }}
        editingData={editingData}
        onSuccess={() => {
          refetch(); // Refresh data after successful edit
        }}
      />

      <ConfirmationModal
        ref={deleteModalRef}
        title="Hapus Customer Review"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      >
        <p>
          Yakin ingin menghapus review dari{" "}
          <span className="font-bold">"{itemToDelete?.name}"</span>?
        </p>
      </ConfirmationModal>
    </>
  );
};

export default CustomerReviewManagement;
