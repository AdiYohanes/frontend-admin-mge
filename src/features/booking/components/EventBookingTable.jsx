import React from "react";
import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";

const EventBookingTable = ({
  events,
  isLoading,
  page,
  limit,
  onEdit,
  onDelete,
}) => {
  // Debug: Log the events data
  console.log('EventBookingTable - events:', events);
  console.log('EventBookingTable - isLoading:', isLoading);
  if (events && events.length > 0) {
    console.log('EventBookingTable - First event data:', events[0]);
    console.log('EventBookingTable - First event tanggalBooking:', events[0].tanggalBooking);
    console.log('EventBookingTable - First event startTime:', events[0].startTime);
  }

  const getStatusBadge = (status) => {
    const baseClasses = "badge font-semibold text-xs";
    switch (status?.toLowerCase()) {
      case "confirmed":
        return `${baseClasses} badge-success`;
      case "pending":
        return `${baseClasses} badge-warning`;
      case "cancelled":
        return `${baseClasses} badge-error`;
      case "berjalan":
        return `${baseClasses} badge-info`;
      case "selesai":
        return `${baseClasses} badge-accent`;
      case "berhasil":
        return `${baseClasses} badge-success`;
      case "menunggu payment":
        return `${baseClasses} badge-warning`;
      default:
        return `${baseClasses} badge-ghost`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return new Date(timeString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + " " + date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-lg"></span>
      </div>
    );
  if (!events || events.length === 0)
    return (
      <div className="text-center p-10">
        Tidak ada data event booking yang ditemukan.
      </div>
    );

  return (
    <div className="w-full">
      {/* Tampilan Desktop */}
      <div className="overflow-x-auto hidden md:block bg-base-100 rounded-lg shadow">
        <table className="table table-sm">
          <thead className="bg-base-200">
            <tr>
              <th>No</th>
              <th>No Transaction</th>
              <th>Event Name</th>
              <th>Event Description</th>
              <th>Room</th>
              <th>Unit</th>
              <th>Tanggal Booking</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Durasi</th>
              <th>Status Booking</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, index) => (
              <tr key={event.id} className="hover">
                <th>{(page - 1) * limit + index + 1}</th>
                <td>
                  <div className="font-mono text-xs">
                    {event.noTransaction}
                  </div>
                </td>
                <td>
                  <div className="font-bold text-sm">{event.eventName}</div>
                </td>
                <td>
                  <div className="text-xs opacity-70 max-w-xs truncate">
                    {event.eventDescription}
                  </div>
                </td>
                <td>
                  <div className="text-sm">{event.room || "Regular"}</div>
                </td>
                <td>
                  <div className="text-sm">
                    {event.bookingCount > 1 ? `${event.bookingCount} Units` : event.unit}
                  </div>
                </td>
                <td>
                  <div className="text-sm">
                    {formatDateTime(event.tanggalBooking)}
                  </div>
                </td>
                <td>
                  <div className="text-sm">
                    {formatTime(event.startTime)}
                  </div>
                </td>
                <td>
                  <div className="text-sm">
                    {formatTime(event.endTime)}
                  </div>
                </td>
                <td>
                  <div className="text-sm">
                    {event.duration} jam
                  </div>
                </td>
                <td>
                  <span className={getStatusBadge(event.statusBooking)}>
                    {event.statusBooking}
                  </span>
                </td>
                <td className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <div className="tooltip" data-tip="Edit">
                      <button
                        onClick={() => onEdit(event)}
                        className="btn btn-ghost btn-xs"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="tooltip tooltip-warning" data-tip="Cancel">
                      <button
                        onClick={() => onDelete(event)}
                        className="btn btn-ghost btn-xs text-warning"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tampilan Mobile */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {events.map((event) => (
          <div key={event.id} className="card bg-base-100 shadow-lg">
            <div className="card-body p-4">
              <div className="flex justify-between items-start">
                <h2 className="card-title text-base">{event.eventName}</h2>
                <span className={getStatusBadge(event.statusBooking)}>
                  {event.statusBooking}
                </span>
              </div>
              <p className="text-xs opacity-70 -mt-2">
                {event.eventDescription}
              </p>
              <div className="divider my-1"></div>
              <p className="text-xs font-mono">{event.noTransaction}</p>
              <div className="text-sm mt-2 space-y-1">
                <div>
                  <strong>No Transaction:</strong> {event.noTransaction}
                </div>
                <div>
                  <strong>Jadwal:</strong> {formatDateTime(event.tanggalBooking)} - {formatTime(event.endTime)}
                </div>
                <div>
                  <strong>Room:</strong> {event.room}
                </div>
                <div>
                  <strong>Unit:</strong> {event.bookingCount > 1 ? `${event.bookingCount} Units` : event.unit}
                </div>
                <div>
                  <strong>Durasi:</strong> {event.duration} jam
                </div>
              </div>
              <div className="card-actions justify-end mt-2">
                <button
                  onClick={() => onEdit(event)}
                  className="btn btn-ghost btn-sm"
                >
                  <PencilSquareIcon className="h-5 w-5 mr-1" /> Edit
                </button>
                <button
                  onClick={() => onDelete(event)}
                  className="btn btn-ghost btn-sm text-warning"
                >
                  <XMarkIcon className="h-5 w-5 mr-1" /> Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventBookingTable;
