import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  useGetUsersQuery,
  useGetTopSpendersQuery,
  useDeleteUserMutation,
} from "../api/userApiSlice";
import useDebounce from "../../../hooks/useDebounce";
import { toast } from "react-hot-toast";
import { useSearchParams } from 'react-router';

import TableControls from "../../../components/common/TableControls";
import Pagination from "../../../components/common/Pagination";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import TopUserCard from "../components/TopUserCard";
import CustomerTable from "../components/CustomerTable";
import AddEditCustomerModal from "../components/AddEditCustomerModal";

const CustomerListPage = () => {
  // --- URL PARAMETER MANAGEMENT ---
  const [searchParams, setSearchParams] = useSearchParams();

  // --- STATE MANAGEMENT ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [customerToDelete, setCustomerToDelete] = useState(null);
  const deleteModalRef = useRef(null);

  // State untuk modal edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);

  // --- URL PARAMETER SYNCHRONIZATION ---
  // Initialize state from URL parameters on component mount
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page')) || 1;
    const urlLimit = parseInt(searchParams.get('limit')) || 15;
    const urlSearch = searchParams.get('search') || '';

    setCurrentPage(urlPage);
    setLimit(urlLimit);
    setSearchTerm(urlSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Update URL parameters when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (currentPage > 1) params.set('page', currentPage.toString());
    if (limit !== 15) params.set('limit', limit.toString());
    if (searchTerm.trim()) params.set('search', searchTerm.trim());

    // Only update URL if parameters have changed
    const currentParams = searchParams.toString();
    const newParams = params.toString();

    if (currentParams !== newParams) {
      setSearchParams(params, { replace: true });
    }
  }, [currentPage, limit, searchTerm, setSearchParams, searchParams]);

  const {
    data: tableData,
    isLoading: isLoadingTable,
    isFetching: isFetchingTable,
  } = useGetUsersQuery({
    page: currentPage,
    per_page: limit,
    search: debouncedSearchTerm,
    role: "CUST",
    sort_direction: "desc",
  });

  const { data: topUsers, isLoading: isLoadingTopUsers } =
    useGetTopSpendersQuery();

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  // Frontend pagination for filtered results
  const { paginatedUsers, paginationData } = useMemo(() => {
    const allUsers = tableData?.users || [];

    // If no search term, use backend pagination
    if (!debouncedSearchTerm.trim()) {
      return {
        paginatedUsers: allUsers,
        paginationData: tableData?.pagination || {
          currentPage: 1,
          totalPages: 1,
          total: 0,
          perPage: 15
        }
      };
    }

    // Frontend filtering and pagination
    const filteredUsers = allUsers.filter(user =>
      user.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredUsers.length / limit);
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return {
      paginatedUsers,
      paginationData: {
        currentPage,
        totalPages,
        total: filteredUsers.length,
        perPage: limit,
        from: startIndex + 1,
        to: Math.min(endIndex, filteredUsers.length)
      }
    };
  }, [tableData, debouncedSearchTerm, currentPage, limit]);

  // --- HANDLER FUNCTIONS ---

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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [limit, searchTerm]);

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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <h2 className="card-title text-2xl">Customer List</h2>
          </div>

          <TableControls
            limit={limit}
            setLimit={setLimit}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showMonthFilter={false}
            showYearFilter={false}
            searchPlaceholder="Search by name, username, email, or phone..."
          />

          <CustomerTable
            users={paginatedUsers}
            isLoading={isLoadingTable || isFetchingTable}
            page={currentPage}
            limit={limit}
            onDelete={handleDeleteCustomer}
            onEdit={handleEditCustomer}
          />

          {/* Table Information */}
          <div className="text-center mb-4">
            <div className="text-sm text-base-content/70 mb-2">
              {isLoadingTable || isFetchingTable ? (
                <span>Loading...</span>
              ) : (
                <span>
                  {debouncedSearchTerm.trim() ? (
                    <>
                      {paginationData.total} customer{paginationData.total !== 1 ? 's' : ''} matching "{debouncedSearchTerm}"
                    </>
                  ) : (
                    <>
                      Showing {paginationData.total} of {paginationData.total} customers
                    </>
                  )}
                  {paginationData.totalPages > 1 && (
                    <span className="ml-2 text-info">
                      (Page {paginationData.currentPage} of {paginationData.totalPages})
                    </span>
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
