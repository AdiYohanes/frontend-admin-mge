import React from 'react';
import { XMarkIcon, UserIcon, CalendarIcon, ClockIcon, CurrencyDollarIcon, CreditCardIcon, ShoppingBagIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../../../utils/formatters';
import { format, parseISO } from 'date-fns';

const BookingDetailModal = ({ isOpen, onClose, bookingData, isLoading, error }) => {
    if (!isOpen) return null;

    const getStatusBadge = (status) => {
        const baseClasses = 'badge font-semibold capitalize';
        switch (status?.toLowerCase()) {
            case 'confirmed':
            case 'completed':
                return `${baseClasses} badge-success`;
            case 'pending':
                return `${baseClasses} badge-info`;
            case 'cancelled':
                return `${baseClasses} badge-error`;
            case 'refunded':
                return `${baseClasses} badge-accent`;
            default:
                return `${baseClasses} badge-ghost`;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            return format(parseISO(dateString), 'dd MMM yyyy, HH:mm');
        } catch (error) {
            return dateString;
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '-';
        try {
            return format(parseISO(dateString), 'HH:mm');
        } catch (error) {
            return dateString;
        }
    };

    const calculateDuration = (startTime, endTime) => {
        if (!startTime || !endTime) return '-';
        try {
            const start = parseISO(startTime);
            const end = parseISO(endTime);
            const diffInHours = (end - start) / (1000 * 60 * 60);
            return `${diffInHours.toFixed(1)} hours`;
        } catch (error) {
            return '-';
        }
    };

    if (isLoading) {
        return (
            <div className="modal modal-open">
                <div className="modal-box max-w-md">
                    <div className="flex justify-center items-center h-24">
                        <span className="loading loading-md"></span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="modal modal-open">
                <div className="modal-box max-w-md">
                    <div className="alert alert-error">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">Error loading booking details</span>
                    </div>
                    <div className="modal-action">
                        <button className="btn btn-sm" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        );
    }

    if (!bookingData) {
        return (
            <div className="modal modal-open">
                <div className="modal-box max-w-md">
                    <div className="text-center p-6">
                        <p className="text-gray-500 text-sm">No booking data available</p>
                    </div>
                    <div className="modal-action">
                        <button className="btn btn-sm" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-md max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-lg font-bold">Booking Details</h3>
                        <p className="text-xs text-gray-500">Invoice: {bookingData.invoiceNumber}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-xs btn-circle"
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>

                {/* Status & Type */}
                <div className="flex items-center gap-2 mb-3">
                    <span className={getStatusBadge(bookingData.status)}>
                        {bookingData.status}
                    </span>
                    <span className="badge badge-outline badge-xs">{bookingData.type}</span>
                </div>

                {/* Compact Layout */}
                <div className="space-y-3">
                    {/* Customer Info */}
                    <div className="bg-base-200 p-3 rounded">
                        <div className="flex items-center gap-2 mb-2">
                            <UserIcon className="h-3 w-3 text-blue-500" />
                            <h4 className="font-semibold text-xs">Customer</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                            <div>
                                <span className="text-gray-600">Name:</span>
                                <div className="font-medium truncate">{bookingData.bookable?.name || 'N/A'}</div>
                            </div>
                            <div>
                                <span className="text-gray-600">Phone:</span>
                                <div className="font-medium">{bookingData.bookable?.phone || 'N/A'}</div>
                            </div>
                            <div className="col-span-2">
                                <span className="text-gray-600">Email:</span>
                                <div className="font-medium truncate">{bookingData.bookable?.email || 'N/A'}</div>
                            </div>
                            <div>
                                <span className="text-gray-600">Points:</span>
                                <div className="font-medium">{bookingData.bookable?.total_points || 0} pts</div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Info */}
                    <div className="bg-base-200 p-3 rounded">
                        <div className="flex items-center gap-2 mb-2">
                            <CalendarIcon className="h-3 w-3 text-green-500" />
                            <h4 className="font-semibold text-xs">Booking Info</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                            <div>
                                <span className="text-gray-600">Created:</span>
                                <div className="font-medium">{formatDate(bookingData.createdAt)}</div>
                            </div>
                            <div>
                                <span className="text-gray-600">Visitors:</span>
                                <div className="font-medium">{bookingData.totalVisitors || 1}</div>
                            </div>
                            {bookingData.notes && (
                                <div className="col-span-2">
                                    <span className="text-gray-600">Notes:</span>
                                    <div className="font-medium">{bookingData.notes}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Time Info */}
                    <div className="bg-base-200 p-3 rounded">
                        <div className="flex items-center gap-2 mb-2">
                            <ClockIcon className="h-3 w-3 text-orange-500" />
                            <h4 className="font-semibold text-xs">Time Details</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-xs">
                            <div>
                                <span className="text-gray-600">Start:</span>
                                <div className="font-medium">{formatTime(bookingData.startTime)}</div>
                            </div>
                            <div>
                                <span className="text-gray-600">End:</span>
                                <div className="font-medium">{formatTime(bookingData.endTime)}</div>
                            </div>
                            <div>
                                <span className="text-gray-600">Duration:</span>
                                <div className="font-medium">{calculateDuration(bookingData.startTime, bookingData.endTime)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Room Info (if available) */}
                    {bookingData.unit && (
                        <div className="bg-base-200 p-3 rounded">
                            <div className="flex items-center gap-2 mb-2">
                                <BuildingOfficeIcon className="h-3 w-3 text-purple-500" />
                                <h4 className="font-semibold text-xs">Room Details</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                                <div>
                                    <span className="text-gray-600">Room:</span>
                                    <div className="font-medium">{bookingData.unit.room?.name || 'N/A'}</div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Unit:</span>
                                    <div className="font-medium">{bookingData.unit.name || 'N/A'}</div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Max Visitors:</span>
                                    <div className="font-medium">{bookingData.unit.max_visitors || 'N/A'}</div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Price:</span>
                                    <div className="font-medium">{formatCurrency(parseFloat(bookingData.unit.price || 0))}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* F&B Items (if available) */}
                    {bookingData.fnbs && bookingData.fnbs.length > 0 && (
                        <div className="bg-base-200 p-3 rounded">
                            <div className="flex items-center gap-2 mb-2">
                                <ShoppingBagIcon className="h-3 w-3 text-red-500" />
                                <h4 className="font-semibold text-xs">Food & Beverage</h4>
                            </div>
                            <div className="space-y-1">
                                {bookingData.fnbs.map((fnb, index) => (
                                    <div key={index} className="flex items-center justify-between p-1 bg-base-100 rounded text-xs">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{fnb.name}</div>
                                            <div className="text-gray-500 truncate">{fnb.description}</div>
                                        </div>
                                        <div className="text-right ml-2">
                                            <div className="font-medium">{fnb.pivot?.quantity || 1}x</div>
                                            <div className="text-gray-500">{formatCurrency(parseFloat(fnb.pivot?.price || fnb.price || 0))}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Payment Info (if available) */}
                    {bookingData.transactions && bookingData.transactions.length > 0 && (
                        <div className="bg-base-200 p-3 rounded">
                            <div className="flex items-center gap-2 mb-2">
                                <CreditCardIcon className="h-3 w-3 text-green-500" />
                                <h4 className="font-semibold text-xs">Payment</h4>
                            </div>
                            {bookingData.transactions.map((transaction, index) => (
                                <div key={index} className="space-y-1">
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                                        <div>
                                            <span className="text-gray-600">Method:</span>
                                            <div className="font-medium capitalize">{transaction.payment_method || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Status:</span>
                                            <span className={`badge badge-xs ${transaction.status === 'success' ? 'badge-success' : 'badge-error'}`}>
                                                {transaction.status}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Amount:</span>
                                            <div className="font-medium">{formatCurrency(parseFloat(transaction.amount || 0))}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Transaction ID:</span>
                                            <div className="font-medium font-mono text-xs truncate">{transaction.gateway_transaction_id || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Total Amount */}
                    <div className="bg-success/10 p-3 rounded border border-success/20">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-xs">Total Amount</h4>
                            <div className="text-right">
                                <div className="text-lg font-bold text-success">
                                    {formatCurrency(bookingData.totalPrice)}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Tax: {formatCurrency(bookingData.taxAmount)} |
                                    Service Fee: {formatCurrency(bookingData.serviceFeeAmount)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Actions */}
                <div className="modal-action">
                    <button className="btn btn-outline btn-sm" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailModal; 