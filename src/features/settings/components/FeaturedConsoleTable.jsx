import React from "react";

const FeaturedConsoleTable = ({ consoles, isLoading, onToggleStatus }) => {
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
            <th>Name</th>
            <th>Status</th>
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
                      <img src={console.imageUrl} alt={console.name} />
                    </div>
                  </div>
                </td>
                <td className="font-bold">{console.name}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className={`toggle toggle-sm ${console.isActive ? 'toggle-success' : 'toggle-error'}`}
                      checked={console.isActive}
                      onChange={() => onToggleStatus(console)}
                    />
                    <span className={`text-sm ${console.isActive ? 'text-success' : 'text-error'}`}>
                      {console.isActive ? 'Featured' : 'Not Featured'}
                    </span>
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
