import React from "react";
import ThemeToggle from "../../../components/common/ThemeToggle";

const AppSettingsPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">App Settings</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ThemeToggle />

                {/* Additional settings can be added here */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h3 className="card-title text-lg mb-4">Other Settings</h3>
                        <p className="text-sm text-base-content/70">
                            More application settings will be available here in the future.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppSettingsPage; 