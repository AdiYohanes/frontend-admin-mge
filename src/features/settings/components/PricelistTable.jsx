import React from 'react';
import { useGetPricelistsQuery } from '../api/settingsApiSlice';
import {
    CurrencyDollarIcon,
    UsersIcon,
    HomeIcon
} from '@heroicons/react/24/outline';

const PricelistTable = () => {
    const { data: pricelistsData, isLoading, error } = useGetPricelistsQuery();

    // Debug logging
    console.log('PricelistTable - pricelistsData:', pricelistsData);
    console.log('PricelistTable - isLoading:', isLoading);
    console.log('PricelistTable - error:', error);

    // Flatten the data structure for table display
    const flattenedData = [];

    // Process the data - it should be a direct array based on the API response
    if (pricelistsData && Array.isArray(pricelistsData)) {
        console.log('PricelistTable - processing direct array:', pricelistsData);
        pricelistsData.forEach((room, roomIndex) => {
            if (room.units && room.units.length > 0) {
                room.units.forEach((unit, unitIndex) => {
                    flattenedData.push({
                        roomIndex,
                        unitIndex,
                        roomName: room.room_name,
                        maxVisitors: room.max_visitors,
                        unitName: unit.unit_name,
                        pricePerHour: unit.price_per_hour, // Already formatted string
                        isFirstUnitInRoom: unitIndex === 0,
                        unitsInRoom: room.units.length
                    });
                });
            }
        });
    }

    console.log('PricelistTable - flattenedData:', flattenedData);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-64">
                <div className="text-error mb-2">
                    <HomeIcon className="h-12 w-12 mx-auto mb-2" />
                </div>
                <h3 className="text-lg font-medium text-error mb-2">
                    Error loading pricelist
                </h3>
                <p className="text-base-content/70 text-center">
                    {error?.data?.message || error?.message || 'Failed to fetch pricing data'}
                </p>
                <p className="text-xs text-base-content/50 mt-2">
                    Check console for more details
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Pricelist Management</h3>
                <div className="text-sm text-base-content/70">
                    Real-time pricing information
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                    <thead>
                        <tr>
                            <th className="text-center">NO</th>
                            <th>ROOM NAME</th>
                            <th>MAX VISITORS</th>
                            <th>UNIT NAME</th>
                            <th>PRICE PER HOUR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flattenedData.map((item, index) => (
                            <tr key={`${item.roomIndex}-${item.unitIndex}`}>
                                <td className="text-center font-medium">
                                    {index + 1}
                                </td>
                                <td>
                                    {item.isFirstUnitInRoom ? (
                                        <div className="flex items-center gap-2">
                                            <HomeIcon className="h-5 w-5 text-brand-gold" />
                                            <span className="font-semibold text-base-content">
                                                {item.roomName}
                                            </span>
                                            {item.unitsInRoom > 1 && (
                                                <span className="badge badge-sm bg-brand-gold/20 text-brand-gold">
                                                    {item.unitsInRoom} units
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="pl-7 text-base-content/50">
                                            ↳ {item.roomName}
                                        </div>
                                    )}
                                </td>
                                <td>
                                    {item.isFirstUnitInRoom ? (
                                        <div className="flex items-center gap-2">
                                            <UsersIcon className="h-4 w-4 text-info" />
                                            <span className="font-medium text-info">
                                                {item.maxVisitors} visitors
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="pl-6 text-base-content/50">
                                            {item.maxVisitors}
                                        </div>
                                    )}
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-brand-gold rounded-full"></div>
                                        <span className="font-medium">
                                            {item.unitName}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <CurrencyDollarIcon className="h-4 w-4 text-success" />
                                        <span className="font-semibold text-success">
                                            {item.pricePerHour}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Empty State */}
            {flattenedData.length === 0 && (
                <div className="text-center py-12">
                    <HomeIcon className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-base-content/70 mb-2">
                        No pricing information available
                    </h3>
                    <p className="text-base-content/50">
                        Pricing data will be displayed here when available
                    </p>
                </div>
            )}
        </div>
    );
};

export default PricelistTable;