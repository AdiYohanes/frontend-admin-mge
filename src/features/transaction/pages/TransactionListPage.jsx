import React, { useState } from "react";
import { useGetTransactionsQuery } from "../api/transactionApiSlice";
import useDebounce from "../../../hooks/useDebounce";

import TableControls from "../../../components/common/TableControls";
import Pagination from "../../../components/common/Pagination";
import TransactionTable from "../components/TransactionTable";

const TransactionListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data, isLoading, isFetching } = useGetTransactionsQuery({
    page: currentPage,
    limit,
    search: debouncedSearchTerm,
  });

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">Transaction History</h2>
        <p className="text-sm opacity-70 mb-4">
          Menampilkan transaksi dengan status Finished dan Refunded
        </p>

        <TableControls
          limit={limit}
          setLimit={setLimit}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showMonthFilter={false}
        />

        <TransactionTable
          transactions={data?.transactions}
          isLoading={isLoading || isFetching}
          page={currentPage}
          limit={limit}
        />

        <Pagination
          currentPage={data?.currentPage}
          totalPages={data?.totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default TransactionListPage;
