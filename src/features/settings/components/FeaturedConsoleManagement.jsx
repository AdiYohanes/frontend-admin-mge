import React from "react";
import {
  useGetFeaturedConsolesQuery,
  useUpdateConsoleFeaturedStatusMutation,
} from "../api/settingsApiSlice";
import { toast } from "react-hot-toast";
import FeaturedConsoleTable from "./FeaturedConsoleTable";

const FeaturedConsoleManagement = () => {
  const { data, isLoading } = useGetFeaturedConsolesQuery();
  const [updateConsoleStatus] = useUpdateConsoleFeaturedStatusMutation();

  const handleToggleStatus = async (console) => {
    try {
      await updateConsoleStatus({
        id: console.id,
        isActive: !console.isActive
      }).unwrap();
      toast.success(`Console ${console.isActive ? 'unfeatured' : 'featured'} successfully!`);
    } catch {
      toast.error("Failed to update console status.");
    }
  };

  return (
    <FeaturedConsoleTable
      consoles={data?.consoles}
      isLoading={isLoading}
      onToggleStatus={handleToggleStatus}
    />
  );
};

export default FeaturedConsoleManagement;
