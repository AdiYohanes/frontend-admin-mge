import React from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

const UserAdminTable = ({ users, isLoading, onEdit, onDelete }) => {
  // Menampilkan state loading saat data pertama kali diambil
  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-lg"></span>
      </div>
    );
  }

  // Menampilkan pesan jika tidak ada data sama sekali
  if (!users || users.length === 0) {
    return (
      <div className="text-center p-10">
        Tidak ada data user admin yang ditemukan.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full bg-base-100 rounded-lg shadow">
      <table className="table table-sm">
        {/* Kepala Tabel */}
        <thead className="bg-base-200">
          <tr>
            <th>No</th>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>

        {/* Isi Tabel */}
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id} className="hover">
              <th>{index + 1}</th>
              <td className="font-bold">{user.name}</td>
              <td className="text-sm opacity-70">@{user.username}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>
                {/* Logika kondisional untuk warna badge berdasarkan role */}
                {user.role === "Superadmin" ? (
                  <span className="badge badge-error text-white font-semibold">
                    {user.role}
                  </span>
                ) : (
                  <span className="badge badge-info text-white font-semibold">
                    {user.role}
                  </span>
                )}
              </td>
              <td className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <div className="tooltip" data-tip="Edit">
                    <button
                      onClick={() => onEdit(user)}
                      className="btn btn-ghost btn-xs"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="tooltip tooltip-error" data-tip="Hapus">
                    <button
                      onClick={() => onDelete(user)}
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
  );
};

export default UserAdminTable;
