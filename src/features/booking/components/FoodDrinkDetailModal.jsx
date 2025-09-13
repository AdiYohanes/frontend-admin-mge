import React from 'react';
import { useGetFoodDrinkBookingDetailQuery } from '../api/foodDrinkBookingApiSlice';
import { formatCurrency } from '../../../utils/formatters';
import {
    XMarkIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    DocumentTextIcon,
    CreditCardIcon,
    CalendarIcon,
    ClockIcon,
    ShoppingBagIcon
} from '@heroicons/react/24/outline';

const FoodDrinkDetailModal = ({ isOpen, onClose, bookingId }) => {
    const { data: bookingDetail, isLoading, isError } = useGetFoodDrinkBookingDetailQuery(bookingId, {
        skip: !isOpen || !bookingId,
    });

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-3xl h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-base-300">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-gold/10 rounded-lg">
                            <ShoppingBagIcon className="h-5 w-5 text-brand-gold" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-base-content">
                                Booking Detail
                            </h3>
                            <p className="text-sm text-base-content/60">
                                Detail pesanan pelanggan
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-sm btn-ghost btn-circle"
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col justify-center items-center py-8 flex-1">
                        <span className="loading loading-spinner loading-lg text-brand-gold"></span>
                        <p className="mt-3 text-base-content/60">Memuat detail...</p>
                    </div>
                ) : isError ? (
                    <div className="alert alert-error my-4">
                        <span>Gagal memuat detail booking.</span>
                    </div>
                ) : !bookingDetail ? (
                    <div className="alert alert-warning my-4">
                        <span>Data tidak ditemukan.</span>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto py-4">
                        <div className="space-y-6">
                            {/* Transaction Info */}
                            <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                                <h4 className="text-base font-semibold mb-3 flex items-center gap-2 text-brand-gold">
                                    <DocumentTextIcon className="h-4 w-4" />
                                    Informasi Transaksi
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-base-content/60">No. Transaksi</p>
                                        <p className="font-mono font-bold text-sm">{bookingDetail.noTransaction}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-base-content/60">Tanggal</p>
                                        <p className="font-semibold text-sm">{bookingDetail.tanggalTransaksi}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-base-content/60">Pembayaran</p>
                                        <p className="font-semibold text-sm">{bookingDetail.metodePembayaran}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-base-content/60">Status</p>
                                        <span className={`badge badge-sm ${bookingDetail.statusBooking?.toLowerCase() === 'confirmed' ? 'badge-success' :
                                            bookingDetail.statusBooking?.toLowerCase() === 'pending' ? 'badge-warning' :
                                                'badge-ghost'
                                            }`}>
                                            {bookingDetail.statusBooking}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                                <h4 className="text-base font-semibold mb-3 flex items-center gap-2 text-brand-gold">
                                    <UserIcon className="h-4 w-4" />
                                    Informasi Pelanggan
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-base-content/60">Nama</p>
                                        <p className="font-semibold text-sm">{bookingDetail.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-base-content/60">Telepon</p>
                                        <p className="font-semibold text-sm">{bookingDetail.phoneNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-base-content/60">Email</p>
                                        <p className="font-semibold text-sm break-all">{bookingDetail.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* F&B Items */}
                            <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                                <h4 className="text-base font-semibold mb-3 flex items-center gap-2 text-brand-gold">
                                    <ShoppingBagIcon className="h-4 w-4" />
                                    Item Pesanan
                                </h4>
                                {bookingDetail.fnbItems && bookingDetail.fnbItems.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="table table-sm w-full">
                                            <thead>
                                                <tr>
                                                    <th className="text-center text-xs">No</th>
                                                    <th className="text-xs">Item</th>
                                                    <th className="text-center text-xs">Qty</th>
                                                    <th className="text-right text-xs">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bookingDetail.fnbItems.map((item, index) => (
                                                    <tr key={item.id}>
                                                        <td className="text-center font-bold text-xs">{index + 1}</td>
                                                        <td className="text-xs">
                                                            <div className="font-semibold">{item.name}</div>
                                                            <div className="text-xs text-base-content/60">{item.description}</div>
                                                        </td>
                                                        <td className="text-center font-bold text-xs">{item.quantity}</td>
                                                        <td className="text-right font-bold text-brand-gold text-xs">
                                                            {formatCurrency(item.totalPrice)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="border-t border-base-300">
                                                    <td colSpan="3" className="text-right font-semibold text-sm">Subtotal:</td>
                                                    <td className="text-right font-semibold text-sm">
                                                        {formatCurrency(bookingDetail.totalPembayaran - bookingDetail.taxAmount - bookingDetail.serviceFeeAmount)}
                                                    </td>
                                                </tr>
                                                {bookingDetail.taxAmount > 0 && (
                                                    <tr>
                                                        <td colSpan="3" className="text-right font-semibold text-sm">Pajak (PB1):</td>
                                                        <td className="text-right font-semibold text-sm">
                                                            {formatCurrency(bookingDetail.taxAmount)}
                                                        </td>
                                                    </tr>
                                                )}
                                                {bookingDetail.serviceFeeAmount > 0 && (
                                                    <tr>
                                                        <td colSpan="3" className="text-right font-semibold text-sm">Service Fee:</td>
                                                        <td className="text-right font-semibold text-sm">
                                                            {formatCurrency(bookingDetail.serviceFeeAmount)}
                                                        </td>
                                                    </tr>
                                                )}
                                                <tr className="border-t-2 border-brand-gold">
                                                    <td colSpan="3" className="text-right font-bold text-base">Total:</td>
                                                    <td className="text-right font-bold text-brand-gold text-lg">
                                                        {formatCurrency(bookingDetail.totalPembayaran)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-base-content/60">
                                        <p className="text-sm">Tidak ada item pesanan</p>
                                    </div>
                                )}
                            </div>

                            {/* Transaction Details */}
                            {bookingDetail.transaction && (
                                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                                    <h4 className="text-base font-semibold mb-3 flex items-center gap-2 text-brand-gold">
                                        <CreditCardIcon className="h-4 w-4" />
                                        Detail Transaksi
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-base-content/60">Status</p>
                                            <span className={`badge badge-sm ${bookingDetail.transaction.status === 'success' ? 'badge-success' : 'badge-warning'
                                                }`}>
                                                {bookingDetail.transaction.status}
                                            </span>
                                        </div>
                                        {bookingDetail.transaction.payload && (
                                            <>
                                                <div>
                                                    <p className="text-xs text-base-content/60">Transaction Time</p>
                                                    <p className="font-semibold text-xs">{bookingDetail.transaction.payload.transaction_time}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-base-content/60">Settlement Time</p>
                                                    <p className="font-semibold text-xs">{bookingDetail.transaction.payload.settlement_time}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="modal-action pt-4 border-t border-base-300">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-sm bg-brand-gold hover:bg-amber-600 text-white"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FoodDrinkDetailModal; 