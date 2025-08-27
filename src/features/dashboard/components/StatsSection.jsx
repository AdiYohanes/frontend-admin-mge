import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import MostPopular from "./MostPopular";
import WhatsTrending from "./WhatsTrending";
import ConsoleStats from "./ConsoleStats";

const StatsSection = () => {
    const [sharedPeriod, setSharedPeriod] = useState("daily");

    const handlePeriodChange = (newPeriod) => {
        setSharedPeriod(newPeriod);
    };

    const periodOptions = [
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" },
    ];

    return (
        <div>
            {/* Header dengan filter */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Statistik Populer & Konsol</h2>

                {/* Period Filter Dropdown */}
                <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost btn-sm">
                        {periodOptions.find(opt => opt.value === sharedPeriod)?.label}
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                    </label>
                    <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32"
                    >
                        {periodOptions.map((option) => (
                            <li key={option.value}>
                                <a
                                    onClick={() => handlePeriodChange(option.value)}
                                    className={sharedPeriod === option.value ? "active" : ""}
                                >
                                    {option.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Grid komponen */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[350px]">
                <MostPopular
                    sharedPeriod={sharedPeriod}
                    onPeriodChange={handlePeriodChange}
                />
                <WhatsTrending
                    sharedPeriod={sharedPeriod}
                    onPeriodChange={handlePeriodChange}
                />
                <ConsoleStats
                    sharedPeriod={sharedPeriod}
                    onPeriodChange={handlePeriodChange}
                />
            </div>
        </div>
    );
};

export default StatsSection; 