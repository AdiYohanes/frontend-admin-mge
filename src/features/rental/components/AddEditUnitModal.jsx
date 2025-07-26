import React, { useEffect } from 'react';
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
        reset({ name: '', room_id: '', description: '', status: 'available', max_visitors: 4, price: 25000, console_ids: [] });
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

  const renderMultiSelect = (name, field, options, placeholder, isLoading, key = 'id', labelKey = 'name') => (
    <>
      <div className="dropdown w-full">
        <label tabIndex={0} className="btn btn-outline justify-between w-full font-normal border-base-300 hover:border-brand-gold hover:bg-brand-gold/5">
          <span className="flex items-center gap-2">
            <CpuChipIcon className="h-4 w-4 text-brand-gold" />
            {placeholder} ({field.value?.length || 0} terpilih)
          </span>
          <ChevronDownIcon className="h-5 w-5" />
        </label>
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-full max-h-60 overflow-y-auto border border-base-300">
          {isLoading ? (
            <li className="p-4 text-center">
              <span className="loading loading-spinner text-brand-gold"></span>
            </li>
          ) : (
            options?.map(option => (
              <li key={option[key]}>
                <label className="label cursor-pointer hover:bg-base-200 rounded-lg p-2">
                  <span className="font-medium">{option[labelKey]}</span>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checked:bg-brand-gold checked:border-brand-gold"
                    checked={field.value?.includes(option[key])}
                    onChange={e => {
                      const sel = field.value || [];
                      const newSel = e.target.checked ? [...sel, option[key]] : sel.filter(id => id !== option[key]);
                      field.onChange(newSel);
                    }}
                  />
                </label>
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="mt-2 flex flex-wrap gap-1 min-h-[1.5rem]">
        {field.value?.map(id => {
          const selectedItem = options?.find(opt => opt[key] === id);
          return selectedItem ? (
            <div key={id} className="badge badge-sm badge-outline gap-1 border-brand-gold text-brand-gold">
              <CpuChipIcon className="h-3 w-3" />
              {selectedItem[labelKey]}
              <button
                type="button"
                className="btn btn-xs btn-circle btn-ghost hover:bg-red-500 hover:text-white -ml-1"
                onClick={() => {
                  const newSel = field.value.filter(val => val !== id);
                  field.onChange(newSel);
                }}
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          ) : null;
        })}
      </div>
    </>
  );

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-lg">
        <div className="flex items-center justify-between pb-3 border-b border-base-300">
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
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
                  placeholder="4"
                  className={`input input-bordered input-sm w-full pl-10 ${errors.max_visitors ? 'input-error' : ''}`}
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
                  placeholder="25000"
                  className={`input input-bordered input-sm w-full pl-10 ${errors.price ? 'input-error' : ''}`}
                />
              </div>
              {errors.price && (
                <span className="text-xs text-error mt-1">
                  {errors.price.message}
                </span>
              )}
            </div>
          </div>

          {/* Status */}
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

          {/* Description */}
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

          {/* Consoles */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Consoles <span className="text-error">*</span>
              </span>
            </label>
            <Controller
              name="console_ids"
              control={control}
              defaultValue={[]}
              render={({ field }) => renderMultiSelect(field.name, field, consolesData, "Select Consoles")}
            />
            {errors.console_ids && (
              <span className="text-xs text-error mt-1">
                {errors.console_ids.message}
              </span>
            )}
          </div>

          <div className="modal-action pt-3 border-t border-base-300">
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
        </form>
      </div>
    </div>
  );
};

export default AddEditUnitModal;
