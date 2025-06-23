import React, { useState, useRef } from "react";
import { useGetUsersQuery, useDeleteUserMutation } from "../api/userApiSlice";
import useDebounce from "../../../hooks/useDebounce";
import { toast } from "react-hot-toast";

import TableControls from "../../../components/common/TableControls";
import Pagination from "../../../components/common/Pagination";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import UserAdminTable from "../components/UserAdminTable";
import AddEditAdminModal from "../components/AddEditAdminModal";

const UserAdminListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // State untuk modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const deleteModalRef = useRef(null);

  const { data, isLoading, isFetching } = useGetUsersQuery({
    type: "admin",
    page: currentPage,
    limit,
    search: debouncedSearchTerm,
  });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  // Handlers untuk modal
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
            users={data?.users}
            isLoading={isLoading || isFetching}
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

      <AddEditAdminModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingData={editingData}
      />

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
