import React, { useState, useRef, useEffect, useMemo } from "react";
import { useGetUsersQuery, useDeleteUserMutation } from "../api/userApiSlice";
import useDebounce from "../../../hooks/useDebounce";
import { toast } from "react-hot-toast";
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

    console.log('🔍 DEBUG - URL Parameter Update:', {
      currentParams,
      newParams,
      searchTerm,
      searchTermTrimmed: searchTerm.trim(),
      willUpdate: currentParams !== newParams
    });

    if (currentParams !== newParams) {
      setSearchParams(params, { replace: true });
    }
  }, [currentPage, limit, searchTerm, setSearchParams, searchParams]);

  // --- RTK QUERY HOOKS ---
  const { data: tableData, isLoading, isFetching } = useGetUsersQuery({
    page: currentPage,
    per_page: limit,
    search: debouncedSearchTerm,
    role: "ADMN",
    sort_direction: "desc",
  });

  // Debug logs for search functionality
  useEffect(() => {
    console.log('🔍 DEBUG - UserAdminListPage Search State:', {
      searchTerm,
      debouncedSearchTerm,
      currentPage,
      limit
    });
  }, [searchTerm, debouncedSearchTerm, currentPage, limit]);

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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [limit, searchTerm]);

  // --- HANDLER FUNCTIONS ---

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
            users={paginatedUsers}
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
                  {debouncedSearchTerm.trim() ? (
                    <>
                      {paginationData.total} admin user{paginationData.total !== 1 ? 's' : ''} matching "{debouncedSearchTerm}"
                    </>
                  ) : (
                    <>
                      Showing {paginationData.from || 0} to {paginationData.to || 0} of{' '}
                      {paginationData.total} admin users
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
