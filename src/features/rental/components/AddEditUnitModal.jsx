import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useAddUnitMutation,
  useUpdateUnitMutation,
  useGetAllRoomsQuery,
  useGetAllConsolesQuery
} from '../api/rentalApiSlice';
import { toast } from 'react-hot-toast';
import {
  ChevronDownIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

// Skema validasi disederhanakan, 'game_ids' dihapus
const unitSchema = z.object({
  name: z.string().min(3, 'Nama unit minimal 3 karakter'),
  room_id: z.coerce.number().min(1, "Ruangan harus dipilih"),
  description: z.string().optional(),
  status: z.string().nonempty("Status harus dipilih"),
  max_visitors: z.coerce.number().min(1, "Kapasitas minimal 1 orang"),
  price: z.coerce.number().min(1000, "Harga sewa minimal 1000"),
  console_ids: z.array(z.number()).nonempty("Pilih minimal satu konsol"),
});

const AddEditUnitModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: roomsData } = useGetAllRoomsQuery();
  const { data: consolesData } = useGetAllConsolesQuery();

  const [addUnit, { isLoading: isAdding }] = useAddUnitMutation();
  const [updateUnit, { isLoading: isUpdating }] = useUpdateUnitMutation();
  const isLoading = isAdding || isUpdating;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(unitSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        // Reset form tanpa data game
        reset({
          name: editingData.name,
          room_id: editingData.room_id,
          description: editingData.description,
          status: editingData.status,
          max_visitors: editingData.max_visitors,
          price: editingData.rentPrice,
          console_ids: editingData.console_ids || [],
        });
      } else {
        // Reset form tambah baru tanpa data game
        reset({ name: '', room_id: '', description: '', status: 'available', max_visitors: 0, price: 0, console_ids: [] });
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        await updateUnit({ id: editingData.id, ...formData }).unwrap();
        toast.success('Unit berhasil diperbarui!');
      } else {
        // Saat menambah, 'game_ids' dikirim sebagai array kosong
        await addUnit({ ...formData, game_ids: [] }).unwrap();
        toast.success('Unit baru berhasil ditambahkan!');
      }
      onClose();
    } catch (err) {
      toast.error(err.data?.message || 'Gagal memproses data unit.');
    }
  };

  const handleConsoleToggle = (field, consoleId) => {
    const currentSelection = field.value || [];
    const isSelected = currentSelection.includes(consoleId);

    const newSelection = isSelected
      ? currentSelection.filter(id => id !== consoleId)
      : [...currentSelection, consoleId];

    field.onChange(newSelection);

    // Close dropdown after selection
    setIsDropdownOpen(false);
  };

  const renderConsoleSelector = (field) => {
    const selectedConsoles = field.value || [];

    return (
      <div className={`form-control flex flex-col transition-all duration-300 ${isDropdownOpen ? 'flex-1' : 'flex-shrink-0'}`}>
        <label className="label">
          <span className="label-text font-medium">
            Consoles <span className="text-error">*</span>
          </span>
        </label>

        {/* Dropdown Trigger */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full btn btn-outline justify-between text-left font-normal border-base-300 hover:border-brand-gold hover:bg-brand-gold/5"
          >
            <span className="flex items-center gap-2">
              <CpuChipIcon className="h-4 w-4 text-brand-gold" />
              {selectedConsoles.length > 0
                ? `${selectedConsoles.length} console${selectedConsoles.length > 1 ? 's' : ''} selected`
                : 'Select consoles...'
              }
            </span>
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu - Dynamic Height */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg z-50 h-48 overflow-y-auto">
              {consolesData?.map(console => (
                <label
                  key={console.id}
                  className="flex items-center justify-between px-4 py-2 hover:bg-base-200 cursor-pointer border-b border-base-200 last:border-b-0"
                >
                  <span className="font-medium">{console.name}</span>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-primary"
                    checked={selectedConsoles.includes(console.id)}
                    onChange={() => handleConsoleToggle(field, console.id)}
                  />
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Selected Items Display - Dynamic Space */}
        <div className={`mt-2 transition-all duration-300 ${isDropdownOpen ? 'flex-1 overflow-y-auto' : 'flex-shrink-0'}`}>
          {selectedConsoles.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedConsoles.map(consoleId => {
                const console = consolesData?.find(c => c.id === consoleId);
                return console ? (
                  <div key={consoleId} className="badge badge-sm badge-outline gap-1 border-brand-gold text-brand-gold">
                    <CpuChipIcon className="h-3 w-3" />
                    {console.name}
                    <button
                      type="button"
                      className="btn btn-xs btn-circle btn-ghost hover:bg-red-500 hover:text-white -ml-1"
                      onClick={() => handleConsoleToggle(field, consoleId)}
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>

        {errors.console_ids && (
          <span className="text-xs text-error mt-1 flex-shrink-0">
            {errors.console_ids.message}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className={`modal-box w-11/12 max-w-xl flex flex-col p-0 transition-all duration-300 ${isDropdownOpen ? 'h-[85vh]' : 'h-auto max-h-[70vh]'}`}>
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 pb-3 border-b border-base-300 flex-shrink-0">
          <div className="flex items-center gap-2">
            <BuildingOfficeIcon className="h-5 w-5 text-brand-gold" />
            <h3 className="text-lg font-bold">
              {isEditMode ? 'Edit Unit' : 'Add Unit'}
            </h3>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Form Content - Dynamic Layout */}
        <div className={`p-4 transition-all duration-300 ${isDropdownOpen ? 'flex-1 overflow-hidden' : 'flex-shrink-0'}`}>
          <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col transition-all duration-300 ${isDropdownOpen ? 'h-full' : 'h-auto'}`}>
            {/* Fixed Form Fields */}
            <div className="space-y-4 flex-shrink-0">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Name <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    placeholder="Unit name"
                    className={`input input-bordered input-sm ${errors.name ? 'input-error' : ''}`}
                  />
                  {errors.name && (
                    <span className="text-xs text-error mt-1">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Room <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    {...register('room_id')}
                    className={`select select-bordered select-sm ${errors.room_id ? 'select-error' : ''}`}
                  >
                    <option value="">Select room...</option>
                    {roomsData?.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  {errors.room_id && (
                    <span className="text-xs text-error mt-1">
                      {errors.room_id.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Capacity & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Max Visitors <span className="text-error">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <UsersIcon className="h-4 w-4 text-gray-400" />
                    </span>
                    <input
                      type="number"
                      {...register('max_visitors')}
                      placeholder="0"
                      min="0"
                      className={`input input-bordered input-sm w-full ${errors.max_visitors ? 'input-error' : ''}`}
                    />
                  </div>
                  {errors.max_visitors && (
                    <span className="text-xs text-error mt-1">
                      {errors.max_visitors.message}
                    </span>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Price/Hour <span className="text-error">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                    </span>
                    <input
                      type="number"
                      {...register('price')}
                      placeholder="0"
                      min="0"
                      className={`input input-bordered input-sm w-full ${errors.price ? 'input-error' : ''}`}
                    />
                  </div>
                  {errors.price && (
                    <span className="text-xs text-error mt-1">
                      {errors.price.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Status & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Status <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    {...register('status')}
                    className={`select select-bordered select-sm ${errors.status ? 'select-error' : ''}`}
                  >
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  {errors.status && (
                    <span className="text-xs text-error mt-1">
                      {errors.status.message}
                    </span>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Description</span>
                  </label>
                  <textarea
                    {...register('description')}
                    placeholder="Unit description..."
                    className="textarea textarea-bordered textarea-sm h-16"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Console Selector - Dynamic Space */}
            <div className={`transition-all duration-300 ${isDropdownOpen ? 'flex-1' : 'flex-shrink-0'}`}>
              <Controller
                name="console_ids"
                control={control}
                defaultValue={[]}
                render={({ field }) => renderConsoleSelector(field)}
              />
            </div>

            {/* Footer - Always at Bottom */}
            <div className="pt-2 border-t border-base-300 bg-base-100 flex-shrink-0">
              <div className="flex justify-end gap-2">
                <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm bg-brand-gold hover:bg-amber-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading && <span className="loading loading-spinner loading-xs"></span>}
                  {isEditMode ? 'Save' : 'Add'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEditUnitModal;
