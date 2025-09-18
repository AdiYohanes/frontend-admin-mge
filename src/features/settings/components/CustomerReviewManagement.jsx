import React, { useState, useRef } from "react";
import {
  useGetCustomerReviewsQuery,
  useDeleteCustomerReviewMutation,
} from "../api/settingsApiSlice";
import { toast } from "react-hot-toast";
import TableControls from "../../../components/common/TableControls";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import CustomerReviewTable from "./CustomerReviewTable";
import Pagination from "../../../components/common/Pagination";

const CustomerReviewManagement = () => {
  // 1. STATE UNTUK MENGONTROL MODAL
  const [itemToDelete, setItemToDelete] = useState(null);
  const deleteModalRef = useRef(null);

  // 2. STATE UNTUK PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const { data, isLoading, refetch } = useGetCustomerReviewsQuery({
    page: currentPage,
    per_page: perPage,
  });
  const [deleteReview, { isLoading: isDeleting }] =
    useDeleteCustomerReviewMutation();

  // Reviews data from API (no frontend filtering needed)
  const reviews = data?.reviews || [];

  // 2. HANDLER UNTUK MEMBUKA MODAL
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

      </div>

      <CustomerReviewTable
        reviews={reviews}
        isLoading={isLoading}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {data?.pagination && data.pagination.total > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="text-sm text-gray-600">
            Showing {reviews.length} of {data.pagination.total} reviews
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={data.pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

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
