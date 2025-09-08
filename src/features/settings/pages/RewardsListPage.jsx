import React, { useMemo, useState, useRef } from "react";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

import TableControls from "../../../components/common/TableControls";
import Pagination from "../../../components/common/Pagination";
import AddRewardModal from "../components/AddRewardModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { useGetRewardsQuery, useDeleteRewardMutation, useUpdateRewardStatusMutation } from "../api/settingsApiSlice";
import { useGetFoodDrinkItemsQuery } from "../../food-drink/api/foodDrinkApiSlice";

// Server provides full list; we do client-side search/pagination for now

const RewardsListPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReward, setEditingReward] = useState(null);
    const [rewardToDelete, setRewardToDelete] = useState(null);
    const deleteModalRef = useRef(null);

    // Function to format reward type for display
    const formatRewardType = (rewardType) => {
        switch (rewardType?.toLowerCase()) {
            case 'free_fnb':
                return 'Food & Drink';
            case 'free_play':
                return 'Room';
            default:
                return rewardType || '-';
        }
    };

    const { data, isLoading } = useGetRewardsQuery();
    const { data: fnbItemsData } = useGetFoodDrinkItemsQuery({ page: 1, limit: 9999, search: "" });
    const [deleteReward, { isLoading: isDeleting }] = useDeleteRewardMutation();
    const [updateRewardStatus, { isLoading: isUpdatingStatus }] = useUpdateRewardStatusMutation();

    const rows = useMemo(() => {
        const rewards = data?.rewards || [];
        const fnbItems = fnbItemsData?.items || [];

        console.log("DEBUG: All FNB Items from API (fnbItemsData.items):", fnbItems);
        console.log("DEBUG: FNB Items Data structure:", fnbItemsData);

        return rewards.map((r) => {
            console.log(`DEBUG: Processing reward: ${r.name}`);
            console.log(`DEBUG: Reward effects:`, r.effects);
            console.log(`DEBUG: Reward FNB items:`, r.effects?.fnbs);

            // Process FNB items to include names
            const processedFnbItems = (r.effects?.fnbs || []).map(fnbItem => {
                console.log(`DEBUG: Processing fnbItem with fnb_id: ${fnbItem.fnb_id} for reward: ${r.name}`);
                console.log(`DEBUG: fnbItem structure:`, fnbItem);

                const matchedItem = fnbItems.find(item => {
                    console.log(`DEBUG: Comparing item.id (${item.id}, type: ${typeof item.id}) with fnbItem.fnb_id (${fnbItem.fnb_id}, type: ${typeof fnbItem.fnb_id})`);
                    return String(item.id) === String(fnbItem.fnb_id);
                });

                console.log(`DEBUG: Matched item for fnb_id ${fnbItem.fnb_id}:`, matchedItem);

                return {
                    ...fnbItem,
                    name: matchedItem?.name || `Item ${fnbItem.fnb_id}`,
                    category: matchedItem?.fnb_category?.type || matchedItem?.category?.type || 'unknown'
                };
            });

            return {
                id: r.id,
                image: r.imageUrl,
                name: r.name,
                description: r.description,
                rewardType: r.rewardType,
                pointsRequired: r.pointsRequired,
                isActive: r.isActive,
                unit: r.unit,
                durationHours: r.effects?.duration_hours,
                fnbItems: processedFnbItems,
                raw: r,
            };
        });
    }, [data?.rewards, fnbItemsData?.items]);

    const filtered = rows.filter((row) =>
        row.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const startIndex = (currentPage - 1) * limit;
    const pageRows = filtered.slice(startIndex, startIndex + limit);

    const handleDeleteClick = (reward) => {
        console.log("Delete clicked for reward:", reward);
        setRewardToDelete(reward);
        deleteModalRef.current?.showModal();
    };

    const handleDeleteConfirm = async () => {
        if (!rewardToDelete) return;

        try {
            await deleteReward(rewardToDelete.id).unwrap();
            toast.success("Reward berhasil dihapus!");
            deleteModalRef.current?.close();
            setRewardToDelete(null);
        } catch (error) {
            toast.error("Gagal menghapus reward. Silakan coba lagi.");
            console.error("Delete reward error:", error);
        }
    };

    const handleStatusToggle = async (reward) => {
        try {
            await updateRewardStatus({
                id: reward.id,
                isActive: !reward.isActive
            }).unwrap();
            toast.success(`Reward ${!reward.isActive ? 'diaktifkan' : 'dinonaktifkan'}!`);
        } catch (error) {
            toast.error("Gagal mengubah status reward. Silakan coba lagi.");
            console.error("Update reward status error:", error);
        }
    };

    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title text-2xl mb-4">Rewards</h2>

                <TableControls
                    limit={limit}
                    setLimit={(v) => {
                        setLimit(v);
                        setCurrentPage(1);
                    }}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onAddClick={() => setIsModalOpen(true)}
                    addButtonText="Add Rewards"
                    showMonthFilter={false}
                    searchPlaceholder="Search"
                />

                <div className="overflow-x-auto w-full bg-base-100 rounded-lg shadow">
                    <table className="table">
                        <thead className="bg-base-200">
                            <tr>
                                <th className="text-center">No</th>
                                <th className="text-center">Points</th>
                                <th className="text-center">Image</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Reward Type</th>
                                <th>Unit</th>
                                <th>Duration</th>
                                <th>FNB Items</th>
                                <th className="text-center">Activation</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={11} className="text-center py-8">
                                        <span className="loading loading-spinner"></span>
                                    </td>
                                </tr>
                            ) : pageRows.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="text-center py-8">No rewards found.</td>
                                </tr>
                            ) : pageRows.map((row, idx) => (
                                <tr key={row.id}>
                                    <td className="text-center">{startIndex + idx + 1}</td>
                                    <td className="text-center font-bold text-brand-gold">{row.pointsRequired}</td>
                                    <td className="text-center">
                                        <div className="avatar">
                                            <div className="w-16 h-16 rounded-lg">
                                                <img
                                                    src={row.image}
                                                    alt={row.name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                    onError={(e) => {
                                                        e.target.src = '/images/logo.png'; // Fallback image
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td>{row.name}</td>
                                    <td>
                                        <div className="max-w-xs whitespace-normal">
                                            {row.description}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="font-medium">{formatRewardType(row.rewardType)}</span>
                                    </td>
                                    <td>
                                        <div className="text-sm">
                                            {row.unit?.name || '-'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-sm">
                                            {row.durationHours ? `${row.durationHours} jam` : '-'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-sm max-w-xs">
                                            {row.fnbItems && row.fnbItems.length > 0 ? (
                                                <ul className="list-disc list-inside space-y-1">
                                                    {row.fnbItems.map((item, index) => (
                                                        <li key={index} className="text-xs">
                                                            {item.name} ({item.quantity})
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="text-gray-500">-</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            <label className="relative inline-flex cursor-pointer items-center">
                                                <input
                                                    id={`switch-${row.id}`}
                                                    type="checkbox"
                                                    className="peer sr-only"
                                                    checked={row.isActive}
                                                    onChange={() => handleStatusToggle(row)}
                                                    disabled={isUpdatingStatus}
                                                />
                                                <div className="peer h-5 w-9 rounded-full bg-gray-300 transition-colors duration-200 peer-checked:bg-green-500 peer-disabled:opacity-50">
                                                    <div className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-4"></div>
                                                </div>
                                            </label>
                                            <span className={`text-sm font-medium ${row.isActive ? 'text-green-600' : 'text-gray-500'
                                                }`}>
                                                {row.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                className="btn btn-ghost btn-xs text-primary hover:bg-primary/10"
                                                onClick={() => { setEditingReward(row.raw); setIsModalOpen(true); }}
                                                title="Edit reward"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    console.log("Button clicked, calling handleDeleteClick");
                                                    handleDeleteClick(row);
                                                }}
                                                disabled={isDeleting}
                                                title="Delete reward"
                                                type="button"
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

                <div className="mt-4 text-sm text-base-content/70">
                    Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + limit, totalItems)} of {totalItems} entries
                </div>

                <Pagination
                    currentPage={Math.min(currentPage, totalPages)}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
                <AddRewardModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingReward(null); }} editingData={editingReward} />

                <ConfirmationModal
                    ref={deleteModalRef}
                    title="Hapus Reward"
                    onConfirm={handleDeleteConfirm}
                    isLoading={isDeleting}
                >
                    <p>
                        Apakah Anda yakin ingin menghapus reward{" "}
                        <span className="font-bold">{rewardToDelete?.name}</span>?
                        Tindakan ini tidak dapat dibatalkan.
                    </p>
                </ConfirmationModal>
            </div>
        </div>
    );
};

export default RewardsListPage;


