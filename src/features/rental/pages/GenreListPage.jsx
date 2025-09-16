import React, { useState, useEffect, useRef, useMemo } from "react";
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
        search: "", // Always fetch all data for frontend filtering
    });

    const [deleteGenre, { isLoading: isDeleting }] = useDeleteGenreMutation();

    // Frontend pagination for filtered results
    const { paginatedGenres, paginationData } = useMemo(() => {
        const allGenres = data?.genres || [];

        // If no search term, use backend pagination but calculate from/to correctly
        if (!debouncedSearchTerm.trim()) {
            const total = data?.total || allGenres.length;
            const currentPageNum = data?.currentPage || currentPage;
            const totalPages = data?.totalPages || Math.ceil(total / limit);
            const from = ((currentPageNum - 1) * limit) + 1;
            const to = Math.min(currentPageNum * limit, total);

            return {
                paginatedGenres: allGenres,
                paginationData: {
                    currentPage: currentPageNum,
                    totalPages,
                    total,
                    perPage: limit,
                    from,
                    to
                }
            };
        }

        // Frontend filtering and pagination
        const filteredGenres = allGenres.filter(genre =>
            genre.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            genre.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );

        const totalPages = Math.ceil(filteredGenres.length / limit);
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedGenres = filteredGenres.slice(startIndex, endIndex);

        return {
            paginatedGenres,
            paginationData: {
                currentPage,
                totalPages,
                total: filteredGenres.length,
                perPage: limit,
                from: filteredGenres.length > 0 ? startIndex + 1 : 0,
                to: Math.min(endIndex, filteredGenres.length)
            }
        };
    }, [data, debouncedSearchTerm, currentPage, limit]);

    // Sinkronkan urutan lokal dengan data dari API
    useEffect(() => {
        if (paginatedGenres) {
            setOrderedGenres(paginatedGenres);
        }
    }, [paginatedGenres]);

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

    // Reset page when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

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

                    {/* Table Information */}
                    <div className="text-center mb-4">
                        <div className="text-sm text-base-content/70 mb-2">
                            {isLoading || isFetching ? (
                                <span>Loading...</span>
                            ) : (
                                <span>
                                    {debouncedSearchTerm.trim() ? (
                                        <>
                                            {paginationData.total} genre{paginationData.total !== 1 ? 's' : ''} matching "{debouncedSearchTerm}"
                                        </>
                                    ) : (
                                        <>
                                            Showing {paginationData.total} of {paginationData.total} genres
                                        </>
                                    )}
                                </span>
                            )}
                        </div>
                    </div>

                    <Pagination
                        currentPage={paginationData.currentPage}
                        totalPages={paginationData.totalPages}
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