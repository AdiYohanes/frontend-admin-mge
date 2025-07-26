import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useVerifyUserQuery, useRedeemPointsMutation } from "../api/userApiSlice";

const RedeemPointModal = ({ isOpen, onClose }) => {
    const [phone, setPhone] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [userData, setUserData] = useState(null);
    const [redeemPoints, setRedeemPoints] = useState(1);
    const [shouldVerify, setShouldVerify] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [redeemResult, setRedeemResult] = useState(null);
    const [showNotFound, setShowNotFound] = useState(false);

    const { data: verifyResult, isLoading: isVerifyingUser, error: verifyError } = useVerifyUserQuery(
        shouldVerify ? phone.trim() : null,
        { skip: !shouldVerify || !phone.trim() }
    );

    const [redeemPointsMutation, { isLoading: isRedeeming }] = useRedeemPointsMutation();

    const handleVerify = async () => {
        if (!phone.trim()) {
            toast.error("Phone number is required");
            return;
        }

        setShouldVerify(true);
        setShowNotFound(false); // Reset not found state
    };

    // Handle verify result
    React.useEffect(() => {
        if (shouldVerify && !isVerifyingUser) {
            if (verifyResult) {
                console.log('User found:', verifyResult);
                setUserData(verifyResult);
                setIsVerified(true);
                setRedeemPoints(1); // Reset to 1 when user is verified
                setShowNotFound(false);
                toast.success("Phone Number found!");
            } else if (verifyError) {
                console.error("Verification error details:", verifyError);

                // Handle specific error types
                if (verifyError.status === 404) {
                    setShowNotFound(true);
                    setIsVerified(false);
                    setUserData(null);
                } else if (verifyError.status === 401) {
                    toast.error("Unauthorized - please login again");
                    setIsVerified(false);
                    setUserData(null);
                } else if (verifyError.status === 403) {
                    toast.error("Access denied");
                    setIsVerified(false);
                    setUserData(null);
                } else if (verifyError.status === 500) {
                    toast.error("Server error - please try again later");
                    setIsVerified(false);
                    setUserData(null);
                } else {
                    toast.error("Failed to verify phone number");
                    setIsVerified(false);
                    setUserData(null);
                }
            } else {
                console.log('No user found');
                setShowNotFound(true);
                setIsVerified(false);
                setUserData(null);
            }
            setShouldVerify(false);
        }
    }, [shouldVerify, isVerifyingUser, verifyResult, verifyError]);

    const handleRedeem = async () => {
        if (!isVerified || !userData) {
            toast.error("Please verify phone number first");
            return;
        }

        if (redeemPoints > userData.total_points) {
            toast.error("Redeem points cannot exceed total points");
            return;
        }

        if (redeemPoints <= 0) {
            toast.error("Redeem points must be greater than 0");
            return;
        }

        // Debug: Log the payload being sent
        const payload = {
            user_id: userData.id,
            points_to_redeem: redeemPoints,
            description: "redeem point"
        };
        console.log('Redeem payload:', payload);
        console.log('Current redeemPoints state:', redeemPoints);
        console.log('User data:', userData);

        try {
            const result = await redeemPointsMutation(payload).unwrap();

            console.log('Redeem success response:', result);

            setRedeemResult(result);
            setShowSuccess(true);
        } catch (error) {
            console.error("Redeem error details:", error);
            toast.error("Failed to redeem points");
        }
    };

    const handleClose = () => {
        setPhone("");
        setIsVerified(false);
        setUserData(null);
        setRedeemPoints(1);
        setShouldVerify(false);
        setShowSuccess(false);
        setRedeemResult(null);
        setShowNotFound(false);
        onClose();
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !isVerified) {
            handleVerify();
        }
    };

    const handleIncrement = () => {
        if (userData && redeemPoints < userData.total_points) {
            setRedeemPoints(prev => prev + 1);
        }
    };

    const handleDecrement = () => {
        if (redeemPoints > 1) {
            setRedeemPoints(prev => prev - 1);
        }
    };

    const handleRedeemPointsChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        if (value >= 0 && value <= (userData?.total_points || 0)) {
            setRedeemPoints(value);
        }
    };

    // Success State UI
    if (showSuccess && redeemResult) {
        return (
            <div className={`modal ${isOpen ? "modal-open" : ""}`}>
                <div className="modal-box bg-base-100 p-0 max-w-md">
                    {/* Header */}
                    <div className="flex justify-between items-center bg-base-200 px-6 py-4 rounded-t-lg">
                        <h3 className="font-semibold text-lg text-gray-700">Redeem Point</h3>
                        <button
                            onClick={handleClose}
                            className="btn btn-ghost btn-sm btn-circle"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Success Content */}
                    <div className="p-6 text-center space-y-4">
                        {/* Success Icon */}
                        <div className="flex justify-center">
                            <img
                                src="/images/succes.png"
                                alt="Success"
                                className="w-16 h-16 rounded-full object-cover"
                                tabIndex={0}
                                aria-label="Success"
                            />
                        </div>

                        {/* Success Message */}
                        <div className="space-y-2">
                            <p className="text-gray-700 font-medium">
                                {redeemPoints} points has been redeemed
                            </p>
                            <p className="text-gray-700">
                                Total Points Left : <span className="font-bold text-lg">{redeemResult.new_point_balance}</span>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end px-6 pb-6">
                        <button
                            className="btn bg-brand-gold hover:bg-amber-600 text-white"
                            onClick={handleClose}
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Backdrop */}
                <div className="modal-backdrop" onClick={handleClose}></div>
            </div>
        );
    }

    // Not Found State UI
    if (showNotFound) {
        return (
            <div className={`modal ${isOpen ? "modal-open" : ""}`}>
                <div className="modal-box bg-base-100 p-0 max-w-md">
                    {/* Header */}
                    <div className="flex justify-between items-center bg-base-200 px-6 py-4 rounded-t-lg">
                        <h3 className="font-semibold text-lg text-gray-700">Redeem Point</h3>
                        <button
                            onClick={handleClose}
                            className="btn btn-ghost btn-sm btn-circle"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Not Found Content */}
                    <div className="p-6 text-center space-y-4">
                        {/* Error Icon */}
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                        </div>

                        {/* Not Found Message */}
                        <div className="space-y-2">
                            <p className="text-red-600 font-medium text-lg">
                                Phone Number Not Found
                            </p>
                            <p className="text-gray-600 text-sm">
                                The phone number <span className="font-semibold">{phone}</span> is not registered.
                            </p>

                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end px-6 pb-6">
                        <button
                            className="btn bg-brand-gold hover:bg-amber-600 text-white"
                            onClick={handleClose}
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Backdrop */}
                <div className="modal-backdrop" onClick={handleClose}></div>
            </div>
        );
    }

    return (
        <div className={`modal ${isOpen ? "modal-open" : ""}`}>
            <div className="modal-box bg-base-100 p-0 max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center bg-base-200 px-6 py-4 rounded-t-lg">
                    <h3 className="font-semibold text-lg text-gray-700">Redeem Point</h3>
                    <button
                        onClick={handleClose}
                        className="btn btn-ghost btn-sm btn-circle"
                        disabled={isVerifyingUser}
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* Phone Number Input */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-gray-700">
                                No. HP <span className="text-error">*</span>
                            </span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="tel"
                                className="input input-bordered flex-1"
                                placeholder="ex: 08xxxxxx"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isVerified || isVerifyingUser}
                            />
                            <button
                                className="btn bg-brand-gold hover:bg-amber-600 text-white"
                                onClick={handleVerify}
                                disabled={!phone.trim() || isVerifyingUser || isVerified}
                            >
                                {isVerifyingUser ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                    "Verify"
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Verification Success Message */}
                    {isVerified && userData && (
                        <div className="text-center space-y-1">
                            <p className="text-success font-medium text-base">Phone Number found!</p>
                            <p className="text-gray-700">
                                Total Points : <span className="font-bold text-lg">{userData.total_points || 0}</span>
                            </p>
                        </div>
                    )}

                    {/* Redeem Point Selection */}
                    {isVerified && userData && (
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium text-gray-700">
                                    Redeem Point
                                </span>
                            </label>
                            <div className="flex items-center justify-center gap-3">
                                <button
                                    className="btn btn-outline btn-lg border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white w-12 h-12"
                                    onClick={handleDecrement}
                                    disabled={redeemPoints <= 1}
                                >
                                    <span className="text-xl font-bold">-</span>
                                </button>
                                <input
                                    type="number"
                                    className="input input-bordered text-center w-20"
                                    value={redeemPoints}
                                    onChange={handleRedeemPointsChange}
                                    min="1"
                                    max={userData.total_points || 1}
                                />
                                <button
                                    className="btn btn-outline btn-lg border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white w-12 h-12"
                                    onClick={handleIncrement}
                                    disabled={redeemPoints >= (userData.total_points || 0)}
                                >
                                    <span className="text-xl font-bold">+</span>
                                </button>
                            </div>
                            {/* Debug info */}
                            <div className="text-center mt-2 text-xs text-gray-500">
                                Debug: Counter value = {redeemPoints}, User ID = {userData.id}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end px-6 pb-6">
                    <button
                        className="btn bg-brand-gold hover:bg-amber-600 text-white"
                        disabled={!isVerified || isRedeeming}
                        onClick={handleRedeem}
                    >
                        {isRedeeming ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Redeeming...
                            </>
                        ) : (
                            "Redeem Point"
                        )}
                    </button>
                </div>
            </div>

            {/* Backdrop */}
            <div className="modal-backdrop" onClick={handleClose}></div>
        </div>
    );
};

export default RedeemPointModal; 