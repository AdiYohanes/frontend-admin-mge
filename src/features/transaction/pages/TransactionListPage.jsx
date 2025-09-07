import React, { useState, useEffect, useMemo } from "react";
import useDebounce from "../../../hooks/useDebounce";
import TableControls from "../../../components/common/TableControls";
import Pagination from "../../../components/common/Pagination";
import TransactionTable from "../components/TransactionTable";
import { useGetTransactionsQuery } from "../api/transactionApiSlice";
import * as XLSX from 'xlsx';

const TransactionListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10); // Changed default to 10
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Use RTK Query hook for API calls
  const { data, isLoading, error, refetch } = useGetTransactionsQuery({
    page: currentPage,
    limit: limit,
    search: debouncedSearchTerm,
    status: "pending"
  });

  // Extract data from API response
  const transactions = useMemo(() => data?.transactions || [], [data?.transactions]);
  const pagination = useMemo(() => data?.pagination || {
    current_page: 1,
    total: 0,
    per_page: 10, // Changed default to 10
    last_page: 1
  }, [data?.pagination]);

  // Debug logging
  console.log('TransactionListPage Debug:', {
    data,
    transactions,
    pagination,
    isLoading,
    error
  });

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

  // Handle export to Excel
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      // Fetch all data without pagination for export
      const exportData = await refetch({
        page: 1,
        limit: 1000, // Large number to get all data
        search: debouncedSearchTerm,
        status: "pending"
      });

      const transactionsToExport = exportData.data?.transactions || [];

      // Prepare data for Excel
      const excelData = transactionsToExport.map((tx, index) => ({
        'No': index + 1,
        'No Transaksi': tx.noTransaction,
        'Nama': tx.name,
        'No Telepon': tx.phoneNumber,
        'Booking Type': tx.bookingType,
        'Type': tx.type,
        'Tanggal Booking': tx.tanggalBooking,
        'Unit': tx.rawBooking?.unit_name || '-',
        'Duration': tx.rawBooking?.duration_hours ? `${tx.rawBooking.duration_hours} jam` : '-',
        'Subtotal Room': tx.rawBooking?.subtotal_room || '0.00',
        'Food & Drink': tx.type === "Food & Drink" ?
          (tx.rawBooking?.fnb_items?.map(item => `${item.name} x${item.quantity}`).join(', ') || '-') : '-',
        'Subtotal Food&Drink': tx.rawBooking?.subtotal_fnb || '0.00',
        'Promo (%)': tx.rawBooking?.promo_percentage ? `${tx.rawBooking.promo_percentage}%` : '-',
        'Service Fee': tx.rawBooking?.service_fee_amount || '0.00',
        'Total Pembayaran': tx.totalPembayaran,
        'Metode Pembayaran': tx.metodePembayaran,
        'Tanggal Pembayaran': tx.tanggalPembayaran || '-',
        'Status': tx.status
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 5 },   // No
        { wch: 20 },  // No Transaksi
        { wch: 15 },  // Nama
        { wch: 15 },  // No Telepon
        { wch: 12 },  // Booking Type
        { wch: 12 },  // Type
        { wch: 15 },  // Tanggal Booking
        { wch: 15 },  // Unit
        { wch: 10 },  // Duration
        { wch: 15 },  // Subtotal Room
        { wch: 30 },  // Food & Drink
        { wch: 18 },  // Subtotal Food&Drink
        { wch: 10 },  // Promo (%)
        { wch: 12 },  // Service Fee
        { wch: 15 },  // Total Pembayaran
        { wch: 15 },  // Metode Pembayaran
        { wch: 15 },  // Tanggal Pembayaran
        { wch: 10 }   // Status
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `transactions_${currentDate}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Gagal mengekspor data. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
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
              Menampilkan transaksi dengan status Pending
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
          searchPlaceholder="Search ..."
          exportButton={
            <button
              onClick={handleExportExcel}
              className="btn btn-outline btn-sm"
              title="Export to Excel"
              disabled={isLoading || isRefreshing || isExporting || transactions.length === 0}
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export
                </>
              )}
            </button>
          }
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
              `Showing ${((pagination.current_page - 1) * pagination.per_page) + 1} to ${Math.min(pagination.current_page * pagination.per_page, pagination.total)} of ${pagination.total} pending transactions`
            ) : (
              ""
            )}
          </div>
        )}

        {/* Show filtered count when searching or filtering */}
        {(debouncedSearchTerm.trim() || monthFilter) && (
          <div className="text-sm text-gray-600 mt-2 text-center">
            {debouncedSearchTerm.trim() && monthFilter ? (
              `Found ${filteredTransactions.length} pending transactions matching "${debouncedSearchTerm}" in ${new Date(monthFilter + "-01").toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`
            ) : debouncedSearchTerm.trim() ? (
              `Found ${filteredTransactions.length} pending transactions matching "${debouncedSearchTerm}"`
            ) : (
              `Found ${filteredTransactions.length} pending transactions in ${new Date(monthFilter + "-01").toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`
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
