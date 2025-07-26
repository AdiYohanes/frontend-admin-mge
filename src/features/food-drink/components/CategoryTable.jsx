import React from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

const CategoryTable = ({
  categories,
  isLoading,
  page,
  limit,
  onEdit,
  onDelete,
}) => {
  // Menampilkan state loading saat data pertama kali diambil
  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-lg"></span>
      </div>
    );
  }

  // Menampilkan pesan jika tidak ada data sama sekali
  if (!categories || categories.length === 0) {
    return (
      <div className="text-center p-10">
        Tidak ada data kategori yang ditemukan.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full bg-base-100 rounded-lg shadow">
      <table className="table">
        <thead className="bg-base-200">
          <tr>
            <th>No</th>
            <th>Category Name</th>
            <th>Type</th>
            <th>Total Items</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr key={category.id} className="hover">
              <th>{(page - 1) * limit + index + 1}</th>
              <td className="font-semibold">{category.name}</td>
              <td>
                <span
                  className={`badge ${
                    category.type === "Food" ? "badge-warning" : "badge-info"
                  }`}
                >
                  {category.type}
                </span>
              </td>
              <td>{category.totalItems} items</td>
              <td className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <div className="tooltip" data-tip="Edit">
                    <button
                      onClick={() => onEdit(category)}
                      className="btn btn-ghost btn-sm"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="tooltip tooltip-error" data-tip="Hapus">
                    <button
                      onClick={() => onDelete(category)}
                      className="btn btn-ghost btn-sm text-error"
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

export default CategoryTable;
