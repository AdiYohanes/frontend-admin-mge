import React, { useState, useEffect, useMemo } from "react";
import useDebounce from "../../../hooks/useDebounce";
import TableControls from "../../../components/common/TableControls";
import Pagination from "../../../components/common/Pagination";
import TransactionTable from "../components/TransactionTable";
import { useGetTransactionsQuery } from "../api/transactionApiSlice";

const TransactionListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10); // Changed default to 10
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Use RTK Query hook for API calls
  const { data, isLoading, error, refetch } = useGetTransactionsQuery({
    page: currentPage,
    limit: limit,
    search: debouncedSearchTerm,
    status: "completed"
  });

  // Extract data from API response
  const transactions = data?.transactions || [];
  const pagination = data?.pagination || {
    current_page: 1,
    total: 0,
    per_page: 10, // Changed default to 10
    last_page: 1
  };

  // Filter transactions by month if monthFilter is set
  const filteredTransactions = useMemo(() => {
    if (!monthFilter) return transactions;

    const filterDate = new Date(monthFilter + "-01");
    const filterYear = filterDate.getFullYear();
    const filterMonth = filterDate.getMonth();

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.rawBooking.created_at);
      return transactionDate.getFullYear() === filterYear &&
        transactionDate.getMonth() === filterMonth;
    });
  }, [transactions, monthFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [limit, debouncedSearchTerm, monthFilter]);

  // Handle refresh with loading state
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle error state
  if (error) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Error loading transactions: {error.message || 'Unknown error occurred'}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="btn btn-primary"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Refreshing...
              </>
            ) : (
              'Retry'
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="card-title text-2xl">Transaction History</h2>
            <p className="text-sm opacity-70 mt-1">
              Menampilkan transaksi dengan status Completed
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Loading indicator */}
            {(isLoading || isRefreshing) && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-gold"></div>
                <span>{isRefreshing ? 'Refreshing...' : 'Loading...'}</span>
              </div>
            )}

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              className="btn btn-outline btn-sm"
              title="Refresh data"
              disabled={isLoading || isRefreshing}
            >
              <svg
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        <TableControls
          limit={limit}
          setLimit={setLimit}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          monthFilter={monthFilter}
          setMonthFilter={setMonthFilter}
          showMonthFilter={true}
          searchPlaceholder="Search by transaction number..." // Added placeholder for clarity
        />

        <TransactionTable
          transactions={filteredTransactions}
          isLoading={isLoading || isRefreshing}
          page={currentPage}
          limit={limit}
        />

        {/* Show total count */}
        {!debouncedSearchTerm.trim() && !monthFilter && (
          <div className="text-sm text-gray-600 mt-2 text-center">
            {pagination.total > 0 ? (
              `Showing ${((pagination.current_page - 1) * pagination.per_page) + 1} to ${Math.min(pagination.current_page * pagination.per_page, pagination.total)} of ${pagination.total} completed transactions`
            ) : (
              "No completed transactions found"
            )}
          </div>
        )}

        {/* Show filtered count when searching or filtering */}
        {(debouncedSearchTerm.trim() || monthFilter) && (
          <div className="text-sm text-gray-600 mt-2 text-center">
            {debouncedSearchTerm.trim() && monthFilter ? (
              `Found ${filteredTransactions.length} completed transactions matching "${debouncedSearchTerm}" in ${new Date(monthFilter + "-01").toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`
            ) : debouncedSearchTerm.trim() ? (
              `Found ${filteredTransactions.length} completed transactions matching "${debouncedSearchTerm}"`
            ) : (
              `Found ${filteredTransactions.length} completed transactions in ${new Date(monthFilter + "-01").toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`
            )}
          </div>
        )}

        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.last_page}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default TransactionListPage;
