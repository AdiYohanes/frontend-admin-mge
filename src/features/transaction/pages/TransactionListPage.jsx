import React, { useState, useEffect, useMemo } from "react";
import useDebounce from "../../../hooks/useDebounce";
import Pagination from "../../../components/common/Pagination";
import TransactionTable from "../components/TransactionTable";
import { useGetTransactionsQuery } from "../api/transactionApiSlice";
import { useSearchParams } from 'react-router';
import { ChevronUpIcon, ChevronDownIcon, CalendarIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';
import DatePickerModal from '../../../components/common/DatePickerModal';

const TransactionListPage = () => {
  // --- URL PARAMETER MANAGEMENT ---
  const [searchParams, setSearchParams] = useSearchParams();

  // --- STATE MANAGEMENT ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [exportData, setExportData] = useState([]);
  const [showComingSoon, setShowComingSoon] = useState(false);

  // State untuk date picker modal
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const statusTabs = ['All', 'completed', 'confirmed', 'cancelled'];

  // --- URL PARAMETER SYNCHRONIZATION ---
  // Initialize state from URL parameters on component mount
  useEffect(() => {
    const urlMonth = searchParams.get('month') || '';
    const urlYear = searchParams.get('year') || '';
    const urlPage = parseInt(searchParams.get('page')) || 1;
    const urlLimit = parseInt(searchParams.get('per_page')) || 10;
    const urlSearch = searchParams.get('search') || '';
    const urlStatus = searchParams.get('status') || 'All';
    const urlSortDirection = searchParams.get('sortOrder') || 'asc';

    setMonthFilter(urlMonth);
    setYearFilter(urlYear);
    setCurrentPage(urlPage);
    setLimit(urlLimit);
    setSearchTerm(urlSearch);
    setStatusFilter(urlStatus);
    setSortOrder(urlSortDirection === 'desc' ? 'newest' : 'oldest');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Update URL parameters when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (monthFilter) params.set('month', monthFilter);
    if (yearFilter) params.set('year', yearFilter);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (limit !== 10) params.set('per_page', limit.toString());
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (statusFilter && statusFilter !== 'All') params.set('status', statusFilter);
    params.set('sortBy', 'created_at');
    params.set('sortOrder', sortOrder === 'newest' ? 'asc' : 'desc');

    // Only update URL if parameters have changed
    const currentParams = searchParams.toString();
    const newParams = params.toString();

    if (currentParams !== newParams) {
      setSearchParams(params, { replace: true });
    }
  }, [monthFilter, yearFilter, currentPage, limit, searchTerm, statusFilter, sortOrder, setSearchParams, searchParams]);

  // Use RTK Query hook for API calls
  const queryParams = {
    page: currentPage,
    limit: limit,
    search: debouncedSearchTerm,
    month: monthFilter,
    year: yearFilter,
    sortBy: 'created_at',
    sortOrder: sortOrder === 'newest' ? 'asc' : 'desc',
    status: statusFilter
  };

  const { data, isLoading, error, refetch } = useGetTransactionsQuery(queryParams);

  // Extract data from API response
  const transactions = useMemo(() => data?.transactions || [], [data?.transactions]);
  const pagination = useMemo(() => data?.pagination || {
    current_page: 1,
    total: 0,
    per_page: 10, // Changed default to 10
    last_page: 1
  }, [data?.pagination]);


  // All filtering is now handled by backend
  const filteredTransactions = transactions;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [limit, debouncedSearchTerm, monthFilter, yearFilter, statusFilter, sortOrder]);

  // Handle sort toggle
  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

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

  // Handle export preview
  const handleExportPreview = async () => {
    setIsExporting(true);
    try {
      // Fetch all data without pagination for export
      const exportResponse = await refetch({
        page: 1,
        limit: 1000, // Large number to get all data
        search: debouncedSearchTerm,
        status: statusFilter === 'All' ? undefined : statusFilter
      });

      const transactionsToExport = exportResponse.data?.transactions || [];

      // Prepare data for Excel
      const excelData = transactionsToExport.map((tx, index) => ({
        'No': index + 1,
        'No Transaksi': tx.invoiceNumber,
        'Nama': tx.customerName,
        'No Telepon': tx.customerPhone,
        'Booking Type': tx.bookingType,
        'Type': tx.transactionType,
        'Tanggal Booking': tx.bookingDate ? new Date(tx.bookingDate).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) : '-',
        'Unit': tx.unitName || '-',
        'Duration': tx.durationHours ? `${tx.durationHours} jam` : '-',
        'Subtotal Room': tx.subtotalRoom || '0.00',
        'Food & Drink': tx.fnbItems?.length > 0 ?
          (tx.fnbItems.map(item => `${item.name} x${item.quantity}`).join(', ')) : '-',
        'Subtotal Food&Drink': tx.subtotalFnb || '0.00',
        'PB1': tx.taxAmount || '0.00',
        'Service Fee': tx.serviceFeeAmount || '0.00',
        'Total Pembayaran': tx.finalAmount,
        'Total Discount': tx.discountAmount || '0.00',
        'Metode Pembayaran': tx.paymentMethod,
        'Tanggal Pembayaran': tx.paymentDate ? new Date(tx.paymentDate).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) : '-',
        'Status': tx.status
      }));

      setExportData(excelData);
      setShowExportPreview(true);

    } catch (error) {
      console.error('Export preview failed:', error);
      alert('Gagal memuat data untuk preview. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle actual Excel download
  const handleDownloadExcel = () => {
    try {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Get the range of the worksheet
      const range = XLSX.utils.decode_range(ws['!ref']);
      const totalRows = range.e.r + 1;
      const totalCols = range.e.c + 1;

      // Set column widths with better proportions
      const colWidths = [
        { wch: 6 },   // No
        { wch: 22 },  // No Transaksi
        { wch: 18 },  // Nama
        { wch: 16 },  // No Telepon
        { wch: 14 },  // Booking Type
        { wch: 14 },  // Type
        { wch: 16 },  // Tanggal Booking
        { wch: 16 },  // Unit
        { wch: 12 },  // Duration
        { wch: 16 },  // Subtotal Room
        { wch: 35 },  // Food & Drink
        { wch: 20 },  // Subtotal Food&Drink
        { wch: 12 },  // PB1
        { wch: 14 },  // Service Fee
        { wch: 18 },  // Total Pembayaran
        { wch: 16 },  // Total Discount
        { wch: 16 },  // Metode Pembayaran
        { wch: 16 },  // Tanggal Pembayaran
        { wch: 12 }   // Status
      ];
      ws['!cols'] = colWidths;

      // Set row heights
      ws['!rows'] = [];
      for (let row = 0; row < totalRows; row++) {
        ws['!rows'][row] = { hpt: row === 0 ? 25 : 20 };
      }

      // Apply styling to all cells
      for (let row = 0; row < totalRows; row++) {
        for (let col = 0; col < totalCols; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });

          if (!ws[cellAddress]) {
            ws[cellAddress] = { v: '' };
          }

          if (row === 0) {
            // Header row styling - bright blue background with white text
            ws[cellAddress].s = {
              font: {
                name: "Arial",
                size: 11,
                bold: true,
                color: { rgb: "FFFFFF" }
              },
              fill: {
                fgColor: { rgb: "2563EB" } // Bright blue
              },
              alignment: {
                horizontal: "center",
                vertical: "center"
              },
              border: {
                top: { style: "thin", color: { rgb: "1E40AF" } },
                bottom: { style: "thin", color: { rgb: "1E40AF" } },
                left: { style: "thin", color: { rgb: "1E40AF" } },
                right: { style: "thin", color: { rgb: "1E40AF" } }
              }
            };
          } else {
            // Data row styling
            const isEvenRow = row % 2 === 0;
            const cellStyle = {
              font: {
                name: "Arial",
                size: 10
              },
              alignment: {
                vertical: "center"
              },
              border: {
                top: { style: "thin", color: { rgb: "E5E7EB" } },
                bottom: { style: "thin", color: { rgb: "E5E7EB" } },
                left: { style: "thin", color: { rgb: "E5E7EB" } },
                right: { style: "thin", color: { rgb: "E5E7EB" } }
              }
            };

            // Add alternating row colors
            if (isEvenRow) {
              cellStyle.fill = { fgColor: { rgb: "F8FAFC" } }; // Very light gray
            }

            // Apply number formatting for currency columns
            const currencyColumns = [9, 11, 12, 13, 14, 15]; // Subtotal Room, Subtotal Food&Drink, PB1, Service Fee, Total Pembayaran, Total Discount
            if (currencyColumns.includes(col)) {
              cellStyle.numFmt = '#,##0.00';
              cellStyle.alignment = { horizontal: "right", vertical: "center" };
            }

            ws[cellAddress].s = cellStyle;
          }
        }
      }

      // Add autofilter
      ws['!autofilter'] = { ref: ws['!ref'] };

      // Add freeze panes (freeze header row)
      ws['!freeze'] = { xSplit: 0, ySplit: 1 };

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `transactions_${currentDate}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      setShowExportPreview(false);

    } catch (error) {
      console.error('Download failed:', error);
      alert('Gagal mengunduh file Excel. Silakan coba lagi.');
    }
  };

  // Handle print - show coming soon modal
  const handlePrint = () => {
    setShowComingSoon(true);
  };

  // Date picker handlers
  const handleDateSelect = (date) => {
    if (date) {
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();
      setMonthFilter(month);
      setYearFilter(year);
      setSelectedMonth(date);
      setSelectedYear(date);
    } else {
      setMonthFilter('');
      setYearFilter('');
      setSelectedMonth(null);
      setSelectedYear(null);
    }
  };

  const handleClearFilters = () => {
    setMonthFilter('');
    setYearFilter('');
    setSelectedMonth(null);
    setSelectedYear(null);
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
              Menampilkan transaksi {statusFilter === 'All' ? 'semua status' : `dengan status ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`}
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

            {/* Sort toggle button */}
            <button
              onClick={handleSortToggle}
              className="btn btn-outline btn-sm gap-2"
              title={sortOrder === 'newest' ? 'Sort by Oldest First' : 'Sort by Newest First'}
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

        {/* Status Tabs */}
        <div className="tabs tabs-boxed mb-4 bg-base-200 self-start">
          {statusTabs.map(tab => (
            <a
              key={tab}
              className={`tab tab-sm sm:tab-md ${statusFilter === tab ? 'tab-active' : ''}`}
              onClick={() => setStatusFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </a>
          ))}
        </div>

        {/* Custom Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Show Entries Controls - Left Side */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-base-content">Show</span>
            <select
              className="select select-bordered select-sm"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={25}>25</option>
            </select>
            <span className="text-sm text-base-content">entries</span>
          </div>

          {/* Search, Filter and Export Button - Right Side */}
          <div className="flex flex-col sm:flex-row gap-2 flex-1 justify-end">
            <div className="form-control">
              <input
                type="text"
                placeholder="Search transactions..."
                className="input input-bordered input-sm w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="form-control">
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="btn btn-outline btn-sm gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                {monthFilter && yearFilter ? `Filter: ${monthFilter}/${yearFilter}` : 'Filter'}
              </button>
            </div>
            {(monthFilter || yearFilter) && (
              <div className="form-control">
                <button
                  onClick={handleClearFilters}
                  className="btn btn-ghost btn-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}
            <div className="form-control">
              <button
                onClick={handleExportPreview}
                className="btn btn-outline btn-sm"
                title="Export to Excel"
                disabled={isLoading || isRefreshing || isExporting || transactions.length === 0}
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Loading...
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Export
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <TransactionTable
          transactions={filteredTransactions}
          isLoading={isLoading || isRefreshing}
          page={currentPage}
          limit={limit}
        />

        {/* Show total count from API */}
        {!debouncedSearchTerm.trim() && pagination.total > 0 && (
          <div className="text-sm text-gray-600 mt-2 text-center">
            Showing {filteredTransactions.length} of {pagination.total} transactions
            {(monthFilter || yearFilter) && (
              <> for {monthFilter && yearFilter ? `${monthFilter}/${yearFilter}` : monthFilter ? `month ${monthFilter}` : `year ${yearFilter}`}</>
            )}
          </div>
        )}
        {/* Show filtered count when searching */}
        {debouncedSearchTerm.trim() && (
          <div className="text-sm text-gray-600 mt-2 text-center">
            Found {filteredTransactions.length} transactions matching "{debouncedSearchTerm}"
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={pagination.last_page}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Export Preview Modal */}
      {showExportPreview && (
        <div className="modal modal-open">
          <div className="modal-box max-w-7xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Preview Export Data</h3>
              <button
                onClick={() => setShowExportPreview(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 text-sm text-gray-600">
              <p>Total records: {exportData.length}</p>
              <p>Status filter: {statusFilter === 'All' ? 'All Statuses' : statusFilter}</p>
            </div>

            <div className="overflow-x-auto max-h-96 border rounded-lg">
              <table className="table table-sm table-zebra w-full export-preview-table">
                <thead className="bg-primary text-primary-content sticky top-0">
                  <tr>
                    {exportData.length > 0 && Object.keys(exportData[0]).map((key, index) => (
                      <th key={index} className="text-xs font-bold">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exportData.slice(0, 50).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex} className="text-xs">
                          {typeof value === 'string' && value.length > 30
                            ? `${value.substring(0, 30)}...`
                            : value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {exportData.length > 50 && (
                <div className="text-center p-2 text-sm text-gray-500">
                  Showing first 50 records of {exportData.length} total records
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                onClick={() => setShowExportPreview(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handlePrint}
                className="btn btn-outline"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              <button
                onClick={handleDownloadExcel}
                className="btn btn-primary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="modal modal-open">
          <div className="modal-box text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold mb-2">Feature Coming Soon!</h3>
            <p className="text-gray-600 mb-6">
              Print functionality is currently under development.
              <br />
              Stay tuned for updates! 📄✨
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setShowComingSoon(false)}
                className="btn btn-primary"
              >
                Got it! 👍
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        selectedDate={selectedMonth || selectedYear}
        onDateSelect={handleDateSelect}
        title="Select Date Filter"
        yearRange={20}
      />
    </div>
  );
};

export default TransactionListPage;
