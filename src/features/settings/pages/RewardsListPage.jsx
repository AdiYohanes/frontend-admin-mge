import React, { useMemo, useState } from "react";

import TableControls from "../../../components/common/TableControls";
import Pagination from "../../../components/common/Pagination";
import AddRewardModal from "../components/AddRewardModal";
import { useGetRewardsQuery } from "../api/settingsApiSlice";

// Server provides full list; we do client-side search/pagination for now

const RewardsListPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReward, setEditingReward] = useState(null);

    const { data, isLoading } = useGetRewardsQuery();

    const rows = useMemo(() => {
        const rewards = data?.rewards || [];
        return rewards.map((r) => ({
            id: r.id,
            image: r.imageUrl,
            name: r.name,
            description: r.description,
            rewardType: r.rewardType,
            pointsRequired: r.pointsRequired,
            raw: r,
        }));
    }, [data?.rewards]);

    const filtered = rows.filter((row) =>
        row.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const startIndex = (currentPage - 1) * limit;
    const pageRows = filtered.slice(startIndex, startIndex + limit);

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
                                <th>No</th>
                                <th>Points</th>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Reward Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8">
                                        <span className="loading loading-spinner"></span>
                                    </td>
                                </tr>
                            ) : pageRows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8">No rewards found.</td>
                                </tr>
                            ) : pageRows.map((row, idx) => (
                                <tr key={row.id}>
                                    <td>{startIndex + idx + 1}</td>
                                    <td>{row.pointsRequired}</td>
                                    <td>
                                        <div className="avatar">
                                            <div className="w-12 h-12 rounded">
                                                <img src={row.image} alt={row.name} />
                                            </div>
                                        </div>
                                    </td>
                                    <td>{row.name}</td>
                                    <td>
                                        <div className="max-w-xs whitespace-normal">
                                            {row.description}
                                        </div>
                                    </td>
                                    <td className="flex items-center gap-2">
                                        <span className="capitalize">{row.rewardType}</span>
                                        <button className="btn btn-xs" onClick={() => { setEditingReward(row.raw); setIsModalOpen(true); }}>Edit</button>
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
            </div>
        </div>
    );
};

export default RewardsListPage;


