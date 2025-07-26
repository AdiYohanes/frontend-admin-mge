import React from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

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

  const getStatusBadge = (status) => {
    const baseClasses = "badge font-semibold";
    switch (status) {
      case "Confirmed":
        return `${baseClasses} badge-success`;
      case "Pending":
        return `${baseClasses} badge-warning`;
      case "Cancelled":
        return `${baseClasses} badge-error`;
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
              <th>Event Details</th>
              <th>Rental Info</th>
              <th>Schedule</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, index) => (
              <tr key={event.id} className="hover">
                <th>{(page - 1) * limit + index + 1}</th>
                <td>
                  <div className="font-bold">{event.eventName}</div>
                  <div className="text-xs opacity-70 max-w-xs truncate">
                    {event.eventDescription}
                  </div>
                  <div className="font-mono text-xs opacity-60 mt-1">
                    {event.noTransaction}
                  </div>
                </td>
                <td>
                  <ul className="list-disc list-inside text-sm">
                    <li>
                      <span className="font-semibold">Unit:</span> {event.unit}
                    </li>
                    <li>
                      <span className="font-semibold">Total Person:</span> {event.totalPerson} orang
                    </li>
                    <li>
                      <span className="font-semibold">Customer:</span> {event.bookable?.name || "N/A"}
                    </li>
                  </ul>
                </td>
                <td>
                  <div className="font-semibold">
                    {formatDate(event.tanggalBooking)}
                  </div>
                  <div className="text-xs opacity-70">
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </div>
                  <div className="text-xs">
                    Duration: {event.duration} jam
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
                    <div className="tooltip tooltip-error" data-tip="Hapus">
                      <button
                        onClick={() => onDelete(event)}
                        className="btn btn-ghost btn-xs text-error"
                      >
                        <TrashIcon className="h-5 w-5" />
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
                  <strong>Jadwal:</strong> {formatDate(event.tanggalBooking)},{" "}
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </div>
                <div>
                  <strong>Unit:</strong> {event.unit}
                </div>
                <div>
                  <strong>Peserta:</strong> {event.totalPerson} orang
                </div>
                <div>
                  <strong>Customer:</strong> {event.bookable?.name || "N/A"}
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
                  className="btn btn-ghost btn-sm text-error"
                >
                  <TrashIcon className="h-5 w-5 mr-1" /> Delete
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
