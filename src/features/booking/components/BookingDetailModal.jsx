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
        } catch {
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
        } catch {
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
            <div className="modal-box w-11/12 max-w-7xl h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div>
                        <h3 className="text-2xl font-bold text-base-content">Booking Details</h3>
                        <p className="text-sm text-base-content/70 mt-1">Invoice: {bookingData.invoiceNumber}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-md btn-circle hover:bg-base-300"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Status & Type */}
                <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                    <span className={getStatusBadge(bookingData.status)}>
                        {bookingData.status}
                    </span>
                    <span className="badge badge-outline badge-lg">{bookingData.type}</span>
                </div>

                {/* Flex Layout */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1 overflow-y-auto">
                    {/* Left Column */}
                    <div className="space-y-2">
                        {/* Customer Info */}
                        <div className="bg-base-200 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <UserIcon className="h-5 w-5 text-primary" />
                                <h4 className="font-semibold text-base">Customer Info</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-sm">
                                <div>
                                    <span className="text-base-content/70 text-sm font-medium">Name:</span>
                                    <div className="font-semibold text-base truncate">{bookingData.bookable?.name || '-'}</div>
                                </div>
                                <div>
                                    <span className="text-base-content/70 text-sm font-medium">Username:</span>
                                    <div className="font-semibold text-base">{bookingData.bookable?.username || '-'}</div>
                                </div>
                                <div>
                                    <span className="text-base-content/70 text-sm font-medium">Phone:</span>
                                    <div className="font-semibold text-base">{bookingData.bookable?.phone || '-'}</div>
                                </div>
                                <div>
                                    <span className="text-base-content/70 text-sm font-medium">Role:</span>
                                    <div className="font-semibold text-base">{bookingData.bookable?.role || '-'}</div>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-base-content/70 text-sm font-medium">Email:</span>
                                    <div className="font-semibold text-base truncate">{bookingData.bookable?.email || '-'}</div>
                                </div>
                                <div>
                                    <span className="text-base-content/70 text-sm font-medium">Points:</span>
                                    <div className="font-semibold text-base">{bookingData.bookable?.total_points || 0} pts</div>
                                </div>
                                <div>
                                    <span className="text-base-content/70 text-sm font-medium">Total Spend:</span>
                                    <div className="font-semibold text-base">{formatCurrency(parseFloat(bookingData.bookable?.total_spend || 0))}</div>
                                </div>
                                <div>
                                    <span className="text-base-content/70 text-sm font-medium">Booking Hours:</span>
                                    <div className="font-semibold text-base">{bookingData.bookable?.total_booking_hours || 0} hours</div>
                                </div>
                            </div>
                        </div>

                        {/* Booking Info */}
                        <div className="bg-base-200 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <CalendarIcon className="h-5 w-5 text-primary" />
                                <h4 className="font-semibold text-base">Booking Info</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-sm">
                                <div>
                                    <span className="text-base-content/70 text-sm font-medium">Booking ID:</span>
                                    <div className="font-semibold text-base">{bookingData.id}</div>
                                </div>
                                <div>
                                    <span className="text-base-content/70 text-sm font-medium">Invoice:</span>
                                    <div className="font-semibold text-base font-mono">{bookingData.invoiceNumber}</div>
                                </div>
                                <div>
                                    <span className="text-base-content/70 text-sm font-medium">Created:</span>
                                    <div className="font-semibold text-base">{formatDate(bookingData.createdAt)}</div>
                                </div>
                                <div>
                                    <span className="text-base-content/70 text-sm font-medium">Updated:</span>
                                    <div className="font-semibold text-base">{formatDate(bookingData.updatedAt)}</div>
                                </div>
                                <div>
                                    <span className="text-base-content/70 text-sm font-medium">Visitors:</span>
                                    <div className="font-semibold text-base">{bookingData.totalVisitors || 1}</div>
                                </div>
                                <div>
                                    <span className="text-base-content/70 text-sm font-medium">Booking Type:</span>
                                    <div className="font-semibold text-base">{bookingData.bookableType?.includes('Guest') ? 'OTS' : 'Online'}</div>
                                </div>
                                <div>
                                    <span className="text-base-content/70 text-sm font-medium">Created By:</span>
                                    <div className="font-semibold text-base">{bookingData.createdByAdmin?.name || 'System'}</div>
                                </div>
                                <div>
                                    <span className="text-base-content/70 text-sm font-medium">Start Time:</span>
                                    <div className="font-semibold text-base">{formatDate(bookingData.startTime)}</div>
                                </div>
                                <div>
                                    <span className="text-base-content/70 text-sm font-medium">End Time:</span>
                                    <div className="font-semibold text-base">{formatDate(bookingData.endTime)}</div>
                                </div>
                                <div>
                                    <span className="text-base-content/70 text-sm font-medium">Duration:</span>
                                    <div className="font-semibold text-base">{calculateDuration(bookingData.startTime, bookingData.endTime)}</div>
                                </div>
                                <div>
                                    <span className="text-base-content/70 text-sm font-medium">Event ID:</span>
                                    <div className="font-semibold text-base">{bookingData.eventId || '-'}</div>
                                </div>
                                {bookingData.notes && (
                                    <div className="col-span-2">
                                        <span className="text-base-content/70 text-sm font-medium">Notes:</span>
                                        <div className="font-semibold text-base">{bookingData.notes}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-2">

                        {/* Room Info (if available) */}
                        {bookingData.unit && (
                            <div className="bg-base-200 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <BuildingOfficeIcon className="h-5 w-5 text-primary" />
                                    <h4 className="font-semibold text-base">Room Details</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-sm">
                                    <div>
                                        <span className="text-base-content/70 text-sm font-medium">Unit ID:</span>
                                        <div className="font-semibold text-base">{bookingData.unit.id}</div>
                                    </div>
                                    <div>
                                        <span className="text-base-content/70 text-sm font-medium">Room ID:</span>
                                        <div className="font-semibold text-base">{bookingData.unit.room_id}</div>
                                    </div>
                                    <div>
                                        <span className="text-base-content/70 text-sm font-medium">Room:</span>
                                        <div className="font-semibold text-base">{bookingData.unit.room?.name || '-'}</div>
                                    </div>
                                    <div>
                                        <span className="text-base-content/70 text-sm font-medium">Unit:</span>
                                        <div className="font-semibold text-base">{bookingData.unit.name || '-'}</div>
                                    </div>
                                    <div>
                                        <span className="text-base-content/70 text-sm font-medium">Description:</span>
                                        <div className="font-semibold text-base">{bookingData.unit.description || '-'}</div>
                                    </div>
                                    <div>
                                        <span className="text-base-content/70 text-sm font-medium">Max Visitors:</span>
                                        <div className="font-semibold text-base">{bookingData.unit.max_visitors || '-'}</div>
                                    </div>
                                    <div>
                                        <span className="text-base-content/70 text-sm font-medium">Price/Hour:</span>
                                        <div className="font-semibold text-base">{formatCurrency(parseFloat(bookingData.unit.price || 0))}</div>
                                    </div>
                                    <div>
                                        <span className="text-base-content/70 text-sm font-medium">Points/Hour:</span>
                                        <div className="font-semibold text-base">{bookingData.unit.points_per_hour || 0} pts</div>
                                    </div>
                                </div>

                                {/* Selected Game Info */}
                                {bookingData.game && (
                                    <div className="mt-3 pt-3 border-t border-base-300">
                                        <div className="text-sm text-base-content/70 font-medium mb-2">Selected Game:</div>
                                        <div className="font-semibold text-base">{bookingData.game.title}</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* F&B Items (if available) */}
                        {bookingData.fnbs && bookingData.fnbs.length > 0 && (
                            <div className="bg-base-200 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShoppingBagIcon className="h-5 w-5 text-primary" />
                                    <h4 className="font-semibold text-base">Food & Beverage</h4>
                                </div>
                                <div className="space-y-2">
                                    {bookingData.fnbs.map((fnb, index) => (
                                        <div key={index} className="flex items-center justify-between p-1 bg-base-100 rounded text-xs">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-base truncate">{fnb.name}</div>
                                                <div className="text-gray-500 truncate">{fnb.description}</div>
                                            </div>
                                            <div className="text-right ml-2">
                                                <div className="font-semibold text-base">{fnb.pivot?.quantity || 1}x</div>
                                                <div className="text-gray-500">{formatCurrency(parseFloat(fnb.pivot?.price || fnb.price || 0))}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Payment Info (if available) */}
                        {bookingData.transactions && bookingData.transactions.length > 0 && (
                            <div className="bg-base-200 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <CreditCardIcon className="h-5 w-5 text-primary" />
                                    <h4 className="font-semibold text-base">Payment</h4>
                                </div>
                                {bookingData.transactions.map((transaction, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-sm">
                                            <div>
                                                <span className="text-base-content/70 text-sm font-medium">Method:</span>
                                                <div className="font-semibold text-base capitalize">{transaction.payment_method || '-'}</div>
                                            </div>
                                            <div className='flex flex-col'>
                                                <span className="text-base-content/70 text-sm font-medium">Status:</span>
                                                <span className={`badge badge-xs ${transaction.status === 'success' ? 'badge-success' : 'badge-error'}`}>
                                                    {transaction.status}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-base-content/70 text-sm font-medium">Amount:</span>
                                                <div className="font-semibold text-base">{formatCurrency(parseFloat(transaction.amount || 0))}</div>
                                            </div>
                                            <div>
                                                <span className="text-base-content/70 text-sm font-medium">Type:</span>
                                                <div className="font-semibold text-base capitalize">{transaction.type || '-'}</div>
                                            </div>
                                        </div>


                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Total Amount */}
                        <div className="bg-success/10 p-3 rounded-lg border border-success/20">
                            <div className="flex items-center gap-2 mb-2">
                                <CurrencyDollarIcon className="h-5 w-5 text-success" />
                                <h4 className="font-semibold text-base">Total Amount</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-sm">
                                <div>
                                    <span className="text-base-content/70 text-sm font-medium">Total Price:</span>
                                    <div className="font-semibold text-lg text-success">{formatCurrency(bookingData.totalPrice)}</div>
                                </div>
                                <div>
                                    <span className="text-base-content/70 text-sm font-medium">Tax:</span>
                                    <div className="font-semibold text-base">{formatCurrency(bookingData.taxAmount)}</div>
                                </div>
                                <div>
                                    <span className="text-base-content/70 text-sm font-medium">Service Fee:</span>
                                    <div className="font-semibold text-base">{formatCurrency(bookingData.serviceFeeAmount)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Actions */}
                <div className="modal-action mt-4 flex-shrink-0">
                    <button className="btn btn-primary btn-md" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailModal; 