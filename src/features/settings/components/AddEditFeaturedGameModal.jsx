import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/solid";

import {
  useAddFeaturedGameMutation,
  useUpdateFeaturedGameMutation,
} from "../api/settingsApiSlice";
import { useGetAllGamesQuery } from "../../rental/api/rentalApiSlice";

const featuredGameSchema = z.object({
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  highlightedGames: z.array(z.string()).nonempty("Pilih minimal satu game"),
});

const AddEditFeaturedGameModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);
  const { data: masterGames, isLoading: isLoadingGames } =
    useGetAllGamesQuery();
  const [addGame, { isLoading: isAdding }] = useAddFeaturedGameMutation();
  const [updateGame, { isLoading: isUpdating }] =
    useUpdateFeaturedGameMutation();
  const isLoading = isAdding || isUpdating;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(featuredGameSchema),
    defaultValues: { highlightedGames: [] },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        reset(editingData);
      } else {
        reset({ description: "", highlightedGames: [] });
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        await updateGame({ ...editingData, ...formData }).unwrap();
        toast.success("Featured games berhasil diperbarui!");
      } else {
        await addGame({ ...formData, isActive: true }).unwrap();
        toast.success("Featured games baru berhasil ditambahkan!");
      }
      onClose();
    } catch (err) {
      toast.error("Gagal memproses data.");
      console.error("Failed to submit featured game:", err);
    }
  };

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-2xl">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="font-bold text-lg">
          {isEditMode ? "Edit Featured Games" : "Add New Featured Games"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              {...register("description")}
              className={`textarea textarea-bordered h-24 ${
                errors.description ? "textarea-error" : ""
              }`}
            ></textarea>
            {errors.description && (
              <span className="text-xs text-error mt-1">
                {errors.description.message}
              </span>
            )}
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Highlighted Games</span>
            </label>
            <Controller
              name="highlightedGames"
              control={control}
              render={({ field }) => (
                <div className="dropdown w-full">
                  <label
                    tabIndex={0}
                    className="btn btn-outline justify-between w-full font-normal"
                  >
                    <span>
                      Pilih Game ({field.value?.length || 0} terpilih)
                    </span>
                    <ChevronDownIcon className="h-5 w-5" />
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-full max-h-60 overflow-y-auto"
                  >
                    {isLoadingGames ? (
                      <li className="p-4 text-center">
                        <span className="loading loading-spinner"></span>
                      </li>
                    ) : (
                      masterGames?.map((game) => (
                        <li key={game.id}>
                          <label className="label cursor-pointer">
                            <span>{game.name}</span>
                            <input
                              type="checkbox"
                              className="checkbox"
                              checked={field.value?.includes(game.name)}
                              onChange={(e) => {
                                const newSelection = e.target.checked
                                  ? [...(field.value || []), game.name]
                                  : field.value.filter(
                                      (name) => name !== game.name
                                    );
                                field.onChange(newSelection);
                              }}
                            />
                          </label>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            />
            <div className="mt-2 flex flex-wrap gap-2 min-h-[2.5rem]">
              <Controller
                name="highlightedGames"
                control={control}
                render={({ field }) =>
                  field.value?.map((gameName) => (
                    <div
                      key={gameName}
                      className="badge badge-lg badge-outline gap-2"
                    >
                      <button
                        type="button"
                        className="btn btn-xs btn-circle btn-ghost -ml-1"
                        onClick={() => {
                          const newSelection = field.value.filter(
                            (name) => name !== gameName
                          );
                          field.onChange(newSelection);
                        }}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                      {gameName}
                    </div>
                  ))
                }
              />
            </div>
            {errors.highlightedGames && (
              <span className="text-xs text-error mt-1">
                {errors.highlightedGames.message}
              </span>
            )}
          </div>
          <div className="modal-action pt-4">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Batal
            </button>
            <button
              type="submit"
              className="btn bg-brand-gold hover:bg-amber-600 text-white"
              disabled={isLoading}
            >
              {isLoading && <span className="loading loading-spinner"></span>}
              {isEditMode ? "Save Changes" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddEditFeaturedGameModal;
