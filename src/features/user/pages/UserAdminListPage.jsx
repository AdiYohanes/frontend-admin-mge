import React, { useState, useRef, useEffect, useMemo } from "react";
import { useGetUsersQuery, useDeleteUserMutation } from "../api/userApiSlice";
import useDebounce from "../../../hooks/useDebounce";
import { toast } from "react-hot-toast";

// Impor semua komponen yang dibutuhkan oleh halaman ini
import TableControls from "../../../components/common/TableControls";
import Pagination from "../../../components/common/Pagination";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import UserAdminTable from "../components/UserAdminTable";
import AddEditAdminModal from "../components/AddEditAdminModal";

const UserAdminListPage = () => {
  // --- STATE MANAGEMENT ---
  // State untuk filter dan paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // State untuk mengontrol modal Tambah/Edit dan Hapus
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const deleteModalRef = useRef(null);

  // --- RTK QUERY HOOKS ---
  // Get all admin users for frontend filtering
  const { data: tableData, isLoading, isFetching } = useGetUsersQuery({
    page: 1,
    per_page: 9999, // Get all users for client-side filtering
    search: '', // Remove backend search, do it frontend
    role: "ADMN",
  });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  // Reset page when search term or limit changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, limit]);

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
        user.phone?.toLowerCase().includes(searchLower) ||
        user.role?.toLowerCase().includes(searchLower)
      );
    });
  }, [tableData?.users, debouncedSearchTerm]);

  // Frontend pagination for filtered results
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, limit]);

  // Calculate total pages for filtered results
  const totalPages = Math.ceil(filteredUsers.length / limit);

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
          <h2 className="card-title text-2xl mb-4">User Admin List</h2>
          <TableControls
            limit={limit}
            setLimit={setLimit}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showMonthFilter={false}
            onAddClick={handleOpenAddModal}
            addButtonText="Add Admin"
          />
          <UserAdminTable
            users={paginatedUsers}
            isLoading={isLoading || isFetching}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
          />

          {/* Show filtered count when searching */}
          {debouncedSearchTerm.trim() && (
            <div className="text-sm text-gray-600 mt-2 text-center">
              Found {filteredUsers.length} admin users matching "{debouncedSearchTerm}"
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
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
