import React, { useState, useEffect, useRef } from "react";
import {
    useGetGenresQuery,
    useDeleteGenreMutation,
} from "../api/rentalApiSlice";
import useDebounce from "../../../hooks/useDebounce";
import { toast } from "react-hot-toast";

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";

import TableControls from "../../../components/common/TableControls";
import Pagination from "../../../components/common/Pagination";
import GenreTable from "../components/GenreTable";
import AddEditGenreModal from "../components/AddEditGenreModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const GenreListPage = () => {
    // --- STATE MANAGEMENT ---
    // State untuk paginasi dan filter
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // State untuk mengontrol modal Tambah/Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingData, setEditingData] = useState(null);

    // State dan Ref untuk mengontrol modal konfirmasi Hapus
    const [genreToDelete, setGenreToDelete] = useState(null);
    const deleteModalRef = useRef(null);

    // State untuk urutan data (untuk drag-and-drop)
    const [orderedGenres, setOrderedGenres] = useState([]);

    // --- RTK QUERY HOOKS ---
    const { data, isLoading, isFetching } = useGetGenresQuery({
        page: currentPage,
        limit,
        search: debouncedSearchTerm,
    });

    const [deleteGenre, { isLoading: isDeleting }] = useDeleteGenreMutation();

    // Sinkronkan urutan lokal dengan data dari API
    useEffect(() => {
        if (data?.genres) {
            setOrderedGenres(data.genres);
        }
    }, [data?.genres]);

    // --- DRAG & DROP LOGIC ---
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Mulai drag setelah mouse bergerak 8px
            },
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setOrderedGenres((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // --- HANDLER FUNCTIONS ---
    const handleAddGenre = () => {
        setEditingData(null);
        setIsModalOpen(true);
    };

    const handleEditGenre = (genreData) => {
        setEditingData(genreData);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingData(null);
    };

    const handleDeleteGenre = (genreData) => {
        setGenreToDelete(genreData);
        deleteModalRef.current?.showModal();
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteGenre(genreToDelete.id).unwrap();
            toast.success("Genre berhasil dihapus!");
            deleteModalRef.current?.close();
        } catch (err) {
            if (
                err.data?.message &&
                err.data.message.includes("foreign key constraint")
            ) {
                toast.error("Gagal: Genre ini masih digunakan di data game lain.");
            } else {
                toast.error("Gagal menghapus genre.");
            }
            console.error("Delete genre error:", err);
        }
    };

    return (
        <>
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="avatar placeholder">
                            <div className="bg-brand-gold/10 text-brand-gold rounded-full w-12 h-12 flex items-center justify-center">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h2 className="card-title text-2xl">Genre Management</h2>
                            <p className="text-sm text-base-content/60">
                                Kelola kategori genre untuk game yang tersedia
                            </p>
                        </div>
                    </div>

                    <TableControls
                        limit={limit}
                        setLimit={setLimit}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        onAddClick={handleAddGenre}
                        addButtonText="Add Genre"
                        showMonthFilter={false}
                    />

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={orderedGenres}
                            strategy={verticalListSortingStrategy}
                        >
                            <GenreTable
                                genres={orderedGenres}
                                isLoading={isLoading || isFetching}
                                page={currentPage}
                                limit={limit}
                                onEdit={handleEditGenre}
                                onDelete={handleDeleteGenre}
                            />
                        </SortableContext>
                    </DndContext>

                    <Pagination
                        currentPage={data?.currentPage}
                        totalPages={data?.totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            <AddEditGenreModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editingData={editingData}
            />

            <ConfirmationModal
                ref={deleteModalRef}
                title="Konfirmasi Hapus Genre"
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
            >
                <p>
                    Apakah Anda yakin ingin menghapus genre{" "}
                    <span className="font-bold">{genreToDelete?.name}</span>?
                </p>
                <p className="text-sm text-base-content/60 mt-2">
                    Genre yang masih digunakan oleh game tidak dapat dihapus.
                </p>
            </ConfirmationModal>
        </>
    );
};

export default GenreListPage; 