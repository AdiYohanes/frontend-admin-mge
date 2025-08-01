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

const CustomerListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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
          />

          <CustomerTable
            users={tableData?.users}
            isLoading={isLoadingTable || isFetchingTable}
            page={currentPage}
            limit={limit}
            onDelete={handleDeleteCustomer}
          />
          <Pagination
            currentPage={tableData?.currentPage}
            totalPages={tableData?.totalPages}
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
    </div>
  );
};

export default CustomerListPage;
