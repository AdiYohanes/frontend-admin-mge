import React from "react";
import DraggableGenreRow from "./DraggableGenreRow";

const GenreTable = ({
    genres,
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
    if (!genres || genres.length === 0) {
        return (
            <div className="text-center p-10">
                Tidak ada data genre yang ditemukan.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto w-full bg-base-100 rounded-lg shadow">
            <table className="table">
                {/* Kepala Tabel */}
                <thead className="bg-base-200">
                    <tr>
                        <th className="w-12"></th>
                        {/* Kolom untuk drag handle */}
                        <th>No</th>
                        <th>Genre Name</th>
                        <th>Created At</th>
                        <th className="text-center">Actions</th>
                    </tr>
                </thead>

                {/* Isi Tabel */}
                <tbody>
                    {genres.map((genre, index) => (
                        <DraggableGenreRow
                            key={genre.id}
                            genre={genre}
                            index={index}
                            page={page}
                            limit={limit}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default GenreTable; 