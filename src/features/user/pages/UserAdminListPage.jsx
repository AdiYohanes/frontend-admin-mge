import React, { useState, useRef, useEffect, useMemo } from "react";
import { useGetUsersQuery, useDeleteUserMutation } from "../api/userApiSlice";
import useDebounce from "../../../hooks/useDebounce";
import { toast } from "react-hot-toast";
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'react-router';

// Impor semua komponen yang dibutuhkan oleh halaman ini
import TableControls from "../../../components/common/TableControls";
import Pagination from "../../../components/common/Pagination";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import UserAdminTable from "../components/UserAdminTable";
import AddEditAdminModal from "../components/AddEditAdminModal";

const UserAdminListPage = () => {
  // --- URL PARAMETER MANAGEMENT ---
  const [searchParams, setSearchParams] = useSearchParams();

  // --- STATE MANAGEMENT ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // State untuk mengontrol modal Tambah/Edit dan Hapus
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const deleteModalRef = useRef(null);

  // --- URL PARAMETER SYNCHRONIZATION ---
  // Initialize state from URL parameters on component mount
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page')) || 1;
    const urlLimit = parseInt(searchParams.get('limit')) || 15;
    const urlSearch = searchParams.get('search') || '';
    const urlSortDirection = searchParams.get('sort_direction') || 'desc';

    setCurrentPage(urlPage);
    setLimit(urlLimit);
    setSearchTerm(urlSearch);
    setSortOrder(urlSortDirection === 'desc' ? 'newest' : 'oldest');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Update URL parameters when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (currentPage > 1) params.set('page', currentPage.toString());
    if (limit !== 15) params.set('limit', limit.toString());
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (sortOrder !== 'newest') params.set('sort_direction', sortOrder === 'newest' ? 'desc' : 'asc');

    // Only update URL if parameters have changed
    const currentParams = searchParams.toString();
    const newParams = params.toString();

    if (currentParams !== newParams) {
      setSearchParams(params, { replace: true });
    }
  }, [currentPage, limit, searchTerm, sortOrder, setSearchParams, searchParams]);

  // --- RTK QUERY HOOKS ---
  const { data: tableData, isLoading, isFetching } = useGetUsersQuery({
    page: currentPage,
    per_page: limit,
    search: debouncedSearchTerm,
    role: "ADMN",
    sort_direction: sortOrder === 'newest' ? 'desc' : 'asc',
  });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  // Use data directly from API (backend handles filtering and pagination)
  const users = useMemo(() => tableData?.users || [], [tableData?.users]);
  const paginationData = useMemo(() => tableData?.pagination || {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 15
  }, [tableData?.pagination]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [limit, debouncedSearchTerm, sortOrder]);

  // --- HANDLER FUNCTIONS ---
  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  const handleOpenAddModal = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingData(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
  };

  const handleOpenDeleteModal = (user) => {
    setUserToDelete(user);
    deleteModalRef.current?.showModal();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteUser(userToDelete.id).unwrap();
      toast.success("User admin berhasil dihapus!");
      deleteModalRef.current?.close();
    } catch (err) {
      toast.error("Gagal menghapus user admin.");
      console.error("Failed to delete user admin:", err);
    }
  };

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <h2 className="card-title text-2xl">User Admin List</h2>

            {/* Sort Toggle Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSortToggle}
                className="btn btn-outline btn-sm gap-2"
                title={sortOrder === 'newest' ? 'Sort by Oldest Created First' : 'Sort by Newest Created First'}
              >
                {sortOrder === 'newest' ? (
                  <>
                    <ChevronDownIcon className="h-4 w-4" />
                    Newest
                  </>
                ) : (
                  <>
                    <ChevronUpIcon className="h-4 w-4" />
                    Oldest
                  </>
                )}
              </button>
            </div>
          </div>

          <TableControls
            limit={limit}
            setLimit={setLimit}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showMonthFilter={false}
            showYearFilter={false}
            onAddClick={handleOpenAddModal}
            addButtonText="Add Admin"
            searchPlaceholder="Search by name, username, email, or phone..."
          />
          <UserAdminTable
            users={users}
            isLoading={isLoading || isFetching}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
          />

          {/* Table Information */}
          <div className="text-center mb-4">
            <div className="text-sm text-base-content/70 mb-2">
              {isLoading || isFetching ? (
                <span>Loading...</span>
              ) : (
                <span>
                  Showing {users.length} of{' '}
                  {paginationData.total} admin users
                </span>
              )}
            </div>

            {/* Show filtered count when searching */}
            {debouncedSearchTerm.trim() && (
              <div className="text-sm text-info">
                Found {users.length} admin users matching "{debouncedSearchTerm}"
              </div>
            )}
          </div>

          <Pagination
            currentPage={paginationData.currentPage}
            totalPages={paginationData.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modal untuk Tambah dan Edit Admin */}
      <AddEditAdminModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingData={editingData}
      />

      {/* Modal untuk Konfirmasi Hapus */}
      <ConfirmationModal
        ref={deleteModalRef}
        title="Konfirmasi Hapus Admin"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      >
        <p>
          Apakah Anda yakin ingin menghapus user admin{" "}
          <span className="font-bold">{userToDelete?.name}</span>?
        </p>
      </ConfirmationModal>
    </>
  );
};

export default UserAdminListPage;
