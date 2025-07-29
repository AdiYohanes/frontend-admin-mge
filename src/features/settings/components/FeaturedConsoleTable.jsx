import React from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

const FeaturedConsoleTable = ({ consoles, isLoading, onEdit, onDelete }) => {
  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-lg"></span>
      </div>
    );

  return (
    <div className="overflow-x-auto w-full bg-base-100 rounded-lg shadow">
      <table className="table">
        <thead className="bg-base-200">
          <tr>
            <th>No</th>
            <th>Image</th>
            <th>Title</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(!consoles || consoles.length === 0) ? (
            <tr>
              <td colSpan="4" className="text-center py-8 text-base-content/60">
                Tidak ada data console yang ditemukan.
              </td>
            </tr>
          ) : (
            consoles.map((console, index) => (
              <tr key={console.id} className="hover">
                <th>{index + 1}</th>
                <td>
                  <div className="avatar">
                    <div className="mask mask-squircle w-16 h-16">
                      <img src={console.imageUrl} alt={console.title} />
                    </div>
                  </div>
                </td>
                <td className="font-bold">{console.title}</td>
                <td className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onEdit(console)}
                      className="btn btn-ghost btn-sm"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(console)}
                      className="btn btn-ghost btn-sm text-error"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
export default FeaturedConsoleTable;
