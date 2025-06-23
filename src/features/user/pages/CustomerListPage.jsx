import React, { useState, useRef } from "react";
import { useGetUsersQuery, useDeleteUserMutation } from "../api/userApiSlice";
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
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const deleteModalRef = useRef(null);

  const { data, isLoading, isFetching } = useGetUsersQuery({
    page: currentPage,
    limit,
    search: debouncedSearchTerm,
    type: "customer",
  });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const topUsers = data?.topUsers || [];

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Top Customers</h2>
        <p className="text-sm text-gray-500 mb-4">
          3 customer dengan total spending terbanyak sepanjang masa.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-48 w-full"></div>
              ))
            : topUsers.map((user, index) => (
                <TopUserCard key={user.id} user={user} rank={index + 1} />
              ))}
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Customer List</h2>
          <TableControls
            limit={limit}
            setLimit={setLimit}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showMonthFilter={false}
            onAddClick={handleOpenAddModal}
            addButtonText="Add Customer"
          />
          <CustomerTable
            users={data?.users}
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
