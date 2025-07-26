/* eslint-disable no-unused-vars */
import React, { useState, useRef } from "react";
import {
  useGetUsersQuery,
  useGetTopSpendersQuery,
  useDeleteUserMutation,
} from "../api/userApiSlice";
import useDebounce from "../../../hooks/useDebounce";
import { toast } from "react-hot-toast";

import TableControls from "../../../components/common/TableControls";
import Pagination from "../../../components/common/Pagination";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import TopUserCard from "../components/TopUserCard";
import CustomerTable from "../components/CustomerTable";
import AddEditCustomerModal from "../components/AddEditCustomerModal";

const CustomerListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const deleteModalRef = useRef(null);

  const {
    data: tableData,
    isLoading: isLoadingTable,
    isFetching: isFetchingTable,
  } = useGetUsersQuery({
    page: currentPage,
    per_page: limit,
    search: debouncedSearchTerm,
    role: "CUST",
  });

  const { data: topUsers, isLoading: isLoadingTopUsers } =
    useGetTopSpendersQuery();

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const handleEditCustomer = (user) => {
    setEditingData(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
  };

  const handleDeleteCustomer = (user) => {
    setCustomerToDelete(user);
    deleteModalRef.current?.showModal();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteUser(customerToDelete.id).unwrap();
      toast.success("Customer berhasil dihapus!");
      deleteModalRef.current?.close();
    } catch (err) {
      toast.error("Gagal menghapus customer.");
      console.error("Failed to delete customer:", err);
    }
  };

  const handleRedeemPoint = () => {
    toast.info("Fitur Redeem Point akan segera hadir!");
  };

  return (
    <div className="space-y-6">
      {/* Bagian Top Customers */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Top Customers</h2>
        <p className="text-sm text-gray-500 mb-4">
          3 customer dengan total spending terbanyak sepanjang masa.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isLoadingTopUsers
            ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-48 w-full"></div>
            ))
            : topUsers?.map((user, index) => (
              <TopUserCard key={user.id} user={user} rank={index + 1} />
            ))}
        </div>
      </div>

      {/* Bagian Daftar Customer */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Customer List</h2>

          {/* Custom Table Controls with Redeem Point Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Show</span>
                </label>
                <select
                  className="select select-bordered select-sm"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Search</span>
                </label>
                <input
                  type="text"
                  placeholder="Search customers..."
                  className="input input-bordered input-sm w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRedeemPoint}
                className="btn btn-sm bg-brand-gold hover:bg-amber-600 text-white"
              >
                Redeem Point
              </button>
            </div>
          </div>

          <CustomerTable
            users={tableData?.users}
            isLoading={isLoadingTable || isFetchingTable}
            page={currentPage}
            limit={limit}
            onEdit={handleEditCustomer}
            onDelete={handleDeleteCustomer}
            onRedeemPoint={handleRedeemPoint}
          />
          <Pagination
            currentPage={tableData?.currentPage}
            totalPages={tableData?.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modal untuk Tambah dan Edit Customer */}
      <AddEditCustomerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingData={editingData}
      />

      <ConfirmationModal
        ref={deleteModalRef}
        title="Konfirmasi Hapus Customer"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      >
        <p>
          Apakah Anda yakin ingin menghapus customer{" "}
          <span className="font-bold">{customerToDelete?.name}</span>?
        </p>
      </ConfirmationModal>
    </div>
  );
};

export default CustomerListPage;
