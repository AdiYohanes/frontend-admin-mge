/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect, useMemo } from "react";
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

  const [customerToDelete, setCustomerToDelete] = useState(null);
  const deleteModalRef = useRef(null);

  // State untuk modal edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);

  // Reset page to 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // Reset page to 1 when limit changes
  useEffect(() => {
    setCurrentPage(1);
  }, [limit]);

  const {
    data: tableData,
    isLoading: isLoadingTable,
    isFetching: isFetchingTable,
  } = useGetUsersQuery({
    page: 1,
    per_page: 9999, // Get all users for client-side filtering
    role: "CUST",
  });

  const { data: topUsers, isLoading: isLoadingTopUsers } =
    useGetTopSpendersQuery();

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  // Client-side filtering
  const filteredUsers = useMemo(() => {
    if (!tableData?.users) return [];

    if (!debouncedSearchTerm.trim()) {
      return tableData.users;
    }

    const searchLower = debouncedSearchTerm.toLowerCase();
    return tableData.users.filter((user) => {
      return (
        user.name?.toLowerCase().includes(searchLower) ||
        user.username?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phone?.toLowerCase().includes(searchLower)
      );
    });
  }, [tableData?.users, debouncedSearchTerm]);

  // Pagination for filtered results
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, limit]);

  // Calculate total pages for filtered results
  const totalPages = Math.ceil(filteredUsers.length / limit);

  const handleDeleteCustomer = (user) => {
    setCustomerToDelete(user);
    deleteModalRef.current?.showModal();
  };

  const handleEditCustomer = (user) => {
    console.log("🔍 DEBUG - Edit Customer:", user);
    setCustomerToEdit(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    console.log("🔍 DEBUG - Closing Edit Modal");
    setIsEditModalOpen(false);
    setCustomerToEdit(null);
    // Data akan update otomatis dengan optimistic updates
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

          <TableControls
            limit={limit}
            setLimit={setLimit}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showMonthFilter={false}
            searchPlaceholder="Search ..."
          />

          <CustomerTable
            users={paginatedUsers}
            isLoading={isLoadingTable || isFetchingTable}
            page={currentPage}
            limit={limit}
            onDelete={handleDeleteCustomer}
            onEdit={handleEditCustomer}
          />

          {/* Show filtered count when searching */}
          {debouncedSearchTerm.trim() && (
            <div className="text-sm text-gray-600 mt-2 text-center">
              Found {filteredUsers.length} customers matching "{debouncedSearchTerm}"
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

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

      <AddEditCustomerModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        editingData={customerToEdit}
      />
    </div>
  );
};

export default CustomerListPage;
