import React, { useState, useEffect, useMemo, useCallback } from "react";

import useDebounce from "../../../hooks/useDebounce";

import TableControls from "../../../components/common/TableControls";
import Pagination from "../../../components/common/Pagination";
import TransactionTable from "../components/TransactionTable";

const TransactionListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Ambil semua data dari semua halaman
  const [allPagesData, setAllPagesData] = useState([]);
  const [isLoadingAllPages, setIsLoadingAllPages] = useState(false);

  // Function untuk mengambil semua halaman
  const fetchAllPages = useCallback(async () => {
    setIsLoadingAllPages(true);
    const allData = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://lg84oss0kw4gc80kk8skk8c8.168.231.84.221.sslip.io'}/api/admin/bookings?page=${currentPage}&per_page=100&search=${debouncedSearchTerm || ''}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          console.error('🔍 ERROR - API Response not ok:', {
            status: response.status,
            statusText: response.statusText
          });
          hasMorePages = false;
          continue;
        }

        const data = await response.json();

        console.log('🔍 DEBUG - API Response page', currentPage, ':', {
          status: response.status,
          dataLength: data.data?.length || 0,
          lastPage: data.last_page,
          currentPage: data.current_page,
          sampleData: data.data?.slice(0, 1)
        });

        if (data.data && data.data.length > 0) {
          allData.push(...data.data);
          currentPage++;

          // Check if there are more pages
          if (currentPage > data.last_page) {
            hasMorePages = false;
          }
        } else {
          hasMorePages = false;
        }
      } catch (error) {
        console.error('Error fetching page:', currentPage, error);
        hasMorePages = false;
      }
    }

    console.log('🔍 DEBUG - All pages loaded:', {
      totalPages: currentPage - 1,
      totalData: allData.length,
      fnbData: allData.filter(b => b.invoice_number?.startsWith('FNB')).length,
      roomData: allData.filter(b => !b.invoice_number?.startsWith('FNB')).length,
      completedData: allData.filter(b => b.status === 'completed').length
    });

    setAllPagesData(allData);
    setIsLoadingAllPages(false);
  }, [debouncedSearchTerm]);

  // Fetch all pages when component mounts or search changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔍 DEBUG - Token available:', !!token);
    if (token) {
      fetchAllPages();
    } else {
      console.error('🔍 ERROR - No token found');
    }
  }, [fetchAllPages]);

  // Transform all pages data
  const allTransactions = useMemo(() => {
    console.log('🔍 DEBUG - allPagesData:', {
      totalData: allPagesData.length,
      sampleData: allPagesData.slice(0, 2)
    });

    if (!allPagesData.length) return [];

    const completedBookings = allPagesData.filter(booking => booking.status === "completed");
    console.log('🔍 DEBUG - Completed bookings:', {
      totalCompleted: completedBookings.length,
      sampleCompleted: completedBookings.slice(0, 2)
    });

    return completedBookings
      .map(booking => {
        const isFnb = booking.invoice_number?.startsWith("FNB");
        const customerName = booking.bookable?.name || "Guest";
        const customerPhone = booking.bookable?.phone || "-";

        // Determine booking type (Online vs Manual/OTS)
        const bookingType = booking.bookable_type?.includes('Guest') ? 'Manual (OTS)' : 'Online';

        // Determine payment method based on booking type
        const metodePembayaran = bookingType === 'Manual (OTS)' ? 'Cash' : 'QRIS';

        // Determine booking details
        let details = "";
        let quantity = "";
        let quantityUnit = "";

        if (isFnb) {
          details = booking.notes || "Food & Drink Order";
          quantity = booking.total_visitors || 1;
          quantityUnit = "pcs";
        } else {
          // Extract unit, console, and room information
          const unitName = booking.unit?.name || "";
          const consoleName = booking.unit?.consoles?.[0]?.name || "";
          const roomName = booking.unit?.room?.name || "";

          // Build details string with unit, console, and room information
          const detailsParts = [];
          if (unitName) detailsParts.push(unitName);
          if (consoleName) detailsParts.push(consoleName);
          if (roomName) detailsParts.push(roomName);

          details = detailsParts.length > 0 ? detailsParts.join(" - ") : "Room Booking";

          if (booking.start_time && booking.end_time) {
            const start = new Date(booking.start_time);
            const end = new Date(booking.end_time);
            const hours = Math.ceil((end - start) / (1000 * 60 * 60));
            quantity = hours;
            quantityUnit = "hrs";
          } else {
            quantity = booking.total_visitors || 1;
            quantityUnit = "visitors";
          }
        }

        // Determine status with refund details
        let status = booking.status || "Unknown";
        let totalRefund = null;

        if (booking.status === "refunded" || booking.status === "cancelled") {
          // Determine if full or partial refund (you can adjust this logic)
          const refundAmount = parseFloat(booking.total_price) * 0.5; // 50% refund for example
          totalRefund = refundAmount;
        }

        return {
          id: booking.id,
          noTransaction: booking.invoice_number,
          bookingType: bookingType,
          type: isFnb ? "Food & Drink" : "Room",
          name: customerName,
          phoneNumber: customerPhone,
          details: details,
          quantity: quantity,
          quantityUnit: quantityUnit,
          tanggalBooking: new Date(booking.created_at).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          totalPembayaran: parseFloat(booking.total_price),
          metodePembayaran: metodePembayaran,
          status: status,
          totalRefund: totalRefund,
          rawBooking: booking,
        };
      });
  }, [allPagesData]);

  console.log('🔍 DEBUG - allTransactions after transform:', {
    totalTransactions: allTransactions.length,
    fnbTransactions: allTransactions.filter(t => t.type === 'Food & Drink').length,
    roomTransactions: allTransactions.filter(t => t.type === 'Room').length,
    sampleTransactions: allTransactions.slice(0, 2)
  });

  // Debug: Log data yang diterima
  useEffect(() => {
    console.log('🔍 DEBUG - Transaction data:', {
      totalTransactions: allTransactions?.length || 0,
      fnbTransactions: allTransactions?.filter(t => t.type === 'Food & Drink').length || 0,
      roomTransactions: allTransactions?.filter(t => t.type === 'Room').length || 0,
      sampleTransactions: allTransactions?.slice(0, 3).map(t => ({
        id: t.id,
        noTransaction: t.noTransaction,
        type: t.type,
        name: t.name
      }))
    });
  }, [allTransactions]);



  // --- LOGIKA PENCARIAN & PAGINASI DI FRONTEND ---
  const { paginatedTransactions, totalPages } = useMemo(() => {
    if (!allTransactions) {
      return { paginatedTransactions: [], totalPages: 1 };
    }

    // Filter berdasarkan search term dan month filter
    let filtered = [...allTransactions];

    // Filter by search term (sudah dilakukan di backend)
    // Filter by month di frontend
    if (monthFilter) {
      const filterDate = new Date(monthFilter + "-01");
      const filterYear = filterDate.getFullYear();
      const filterMonth = filterDate.getMonth();

      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.rawBooking.created_at);
        return transactionDate.getFullYear() === filterYear &&
          transactionDate.getMonth() === filterMonth;
      });
    }

    // Do frontend pagination untuk data yang sudah difilter
    const total = Math.ceil(filtered.length / limit);
    const paginated = filtered.slice((currentPage - 1) * limit, currentPage * limit);

    console.log('🔍 DEBUG - Pagination result:', {
      totalFiltered: filtered.length,
      totalPages: total,
      currentPage,
      paginatedCount: paginated.length,
      samplePaginated: paginated.slice(0, 2)
    });

    return {
      paginatedTransactions: paginated,
      totalPages: total
    };
  }, [allTransactions, currentPage, limit, monthFilter]);



  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [limit, debouncedSearchTerm, monthFilter]);

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
            {/* Auto-refresh indicator */}
            {isLoadingAllPages && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-gold"></div>
                <span>Loading all pages...</span>
              </div>
            )}

            {/* Manual refresh button */}
            <button
              onClick={() => fetchAllPages()}
              className="btn btn-outline btn-sm"
              title="Refresh data"
              disabled={isLoadingAllPages}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
        />

        <TransactionTable
          transactions={paginatedTransactions}
          isLoading={isLoadingAllPages}
          page={currentPage}
          limit={limit}
        />

        {/* Show total count */}
        {!debouncedSearchTerm.trim() && !monthFilter && (
          <div className="text-sm text-gray-600 mt-2 text-center">
            {allTransactions.length > 0 ? (
              `Showing ${((currentPage - 1) * limit) + 1} to ${Math.min(currentPage * limit, allTransactions.length)} of ${allTransactions.length} completed transactions`
            ) : (
              "No completed transactions found"
            )}
          </div>
        )}
        {/* Show filtered count when searching or filtering */}
        {(debouncedSearchTerm.trim() || monthFilter) && (
          <div className="text-sm text-gray-600 mt-2 text-center">
            {debouncedSearchTerm.trim() && monthFilter ? (
              `Found ${paginatedTransactions.length} completed transactions matching "${debouncedSearchTerm}" in ${new Date(monthFilter + "-01").toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`
            ) : debouncedSearchTerm.trim() ? (
              `Found ${paginatedTransactions.length} completed transactions matching "${debouncedSearchTerm}"`
            ) : (
              `Found ${paginatedTransactions.length} completed transactions in ${new Date(monthFilter + "-01").toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`
            )}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default TransactionListPage;
