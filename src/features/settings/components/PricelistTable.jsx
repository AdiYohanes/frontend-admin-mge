import React, { useState } from 'react';
import { useGetPricelistsQuery, useDeletePricelistMutation, useUpdatePricelistMutation } from '../api/settingsApiSlice';
import { toast } from 'react-hot-toast';
import {
    PencilIcon,
    TrashIcon,
    DocumentIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import AddEditPricelistModal from './AddEditPricelistModal';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import Pagination from '../../../components/common/Pagination';

const PricelistTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { data: pricelistsData, isLoading } = useGetPricelistsQuery({
        page: currentPage,
        limit: 10,
    });

    const [deletePricelist, { isLoading: isDeleting }] = useDeletePricelistMutation();
    const [updatePricelist] = useUpdatePricelistMutation();

    const handleAdd = () => {
        setEditingData(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingData(item);
        setIsModalOpen(true);
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deletePricelist(itemToDelete.id).unwrap();
            toast.success('Pricelist berhasil dihapus!');
            setDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (err) {
            toast.error(err.data?.message || 'Gagal menghapus pricelist.');
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingData(null);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleToggleStatus = async (item) => {
        try {
            const newStatus = !item.is_active;
            await updatePricelist({
                id: item.id,
                data: {
                    title: item.title,
                    is_active: newStatus
                }
            }).unwrap();
            toast.success(`Pricelist ${newStatus ? 'activated' : 'deactivated'} successfully!`);
        } catch {
            toast.error('Failed to update pricelist status.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Add Button */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Pricelist Management</h3>
                <button
                    onClick={handleAdd}
                    className="btn btn-sm bg-brand-gold hover:bg-brand- text-white"
                >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Pricelist
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                    <thead>
                        <tr>
                            <th className="text-center">NO</th>
                            <th>TITLE</th>
                            <th>FILE</th>
                            <th>ACTIVATION</th>
                            <th className="text-center">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pricelistsData?.data?.map((item, index) => (
                            <tr key={item.id}>
                                <td className="text-center">
                                    {(currentPage - 1) * 10 + index + 1}
                                </td>
                                <td className="font-medium">{item.title}</td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <DocumentIcon className="h-5 w-5 text-brand-gold" />
                                        <span className="text-sm text-base-content/70">
                                            {item.file ? (
                                                <a
                                                    href={`http://lg84oss0kw4gc80kk8skk8c8.168.231.84.221.sslip.io/${item.file}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-brand-gold hover:text-amber-600 underline"
                                                >
                                                    {item.file.split('/').pop()}
                                                </a>
                                            ) : (
                                                'No file'
                                            )}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            className={`toggle toggle-sm ${item.is_active ? 'toggle-success' : 'toggle-error'}`}
                                            checked={item.is_active}
                                            onChange={() => handleToggleStatus(item)}
                                        />
                                        <span className={`text-sm ${item.is_active ? 'text-success' : 'text-error'}`}>
                                            {item.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="btn btn-sm btn-ghost text-warning hover:bg-warning/10"
                                            title="Edit"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item)}
                                            className="btn btn-sm btn-ghost text-error hover:bg-error/10"
                                            title="Delete"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pricelistsData?.data?.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={pricelistsData?.last_page || 1}
                    onPageChange={handlePageChange}
                />
            )}

            {/* Empty State */}
            {pricelistsData?.data?.length === 0 && (
                <div className="text-center py-8">
                    <DocumentIcon className="h-12 w-12 text-base-content/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-base-content/70 mb-2">
                        No pricelist found
                    </h3>
                    <p className="text-base-content/50 mb-4">
                        Start by adding your first pricelist
                    </p>
                    <button
                        onClick={handleAdd}
                        className="btn btn-sm bg-brand-gold hover:bg-amber-600 text-white"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Pricelist
                    </button>
                </div>
            )}

            {/* Add/Edit Modal */}
            <AddEditPricelistModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                editingData={editingData}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Pricelist"
                message={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default PricelistTable; 