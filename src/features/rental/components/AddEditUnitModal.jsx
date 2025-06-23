import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAddUnitMutation,
  useUpdateUnitMutation,
  useGetAllGamesQuery,
} from "../api/rentalApiSlice";
import { toast } from "react-hot-toast";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/solid";

// Skema validasi untuk memastikan data yang diinput benar
const unitSchema = z.object({
  name: z.string().min(3, "Nama unit minimal 3 karakter"),
  room: z.string().nonempty("Ruangan harus dipilih"),
  console: z.string().nonempty("Konsol harus dipilih"),
  rentPrice: z.number().min(1000, "Harga sewa minimal 1000"),
  addons: z.array(z.string()).optional(),
  status: z.string().nonempty("Status harus dipilih"),
  games: z.array(z.string()).optional(),
});

// Opsi untuk dropdown, di aplikasi nyata ini bisa dari API
const roomOptions = ["Ruang VIP 1", "Area Reguler Depan", "Area Smoking"];
const consoleOptions = ["PlayStation 5 Disc Edition", "PlayStation 4 Pro"];
const addonOptions = ["Extra Stik", "VR Headset", "Kamera"];

const AddEditUnitModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);

  // Mengambil daftar master game untuk pilihan dropdown
  const { data: masterGames, isLoading: isLoadingGames } =
    useGetAllGamesQuery();

  // Hooks untuk menambah dan memperbarui data
  const [addUnit, { isLoading: isAdding }] = useAddUnitMutation();
  const [updateUnit, { isLoading: isUpdating }] = useUpdateUnitMutation();
  const isLoading = isAdding || isUpdating;

  const {
    control, // Diperlukan untuk komponen kustom seperti dropdown game
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(unitSchema),
  });

  // Efek untuk mengisi form saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        // Mode Edit: isi form dengan data yang ada
        reset(editingData);
      } else {
        // Mode Tambah: reset ke form kosong dengan nilai default
        reset({
          name: "",
          room: "",
          console: "",
          rentPrice: 15000,
          addons: [],
          status: "Available",
          games: [],
        });
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  // Fungsi yang dijalankan saat form di-submit
  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        await updateUnit({ ...editingData, ...formData }).unwrap();
        toast.success("Unit berhasil diperbarui!");
      } else {
        await addUnit(formData).unwrap();
        toast.success("Unit baru berhasil ditambahkan!");
      }
      onClose(); // Tutup modal setelah sukses
    } catch (err) {
      toast.error("Gagal memproses data unit.");
      console.error("Error processing unit data:", err);
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
          {isEditMode ? "Edit Unit" : "Add New Unit"}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Unit Name</span>
              </label>
              <input
                type="text"
                {...register("name")}
                className="input input-bordered"
              />
              {errors.name && (
                <span className="text-xs text-error mt-1">
                  {errors.name.message}
                </span>
              )}
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Rent Price (per hour)</span>
              </label>
              <input
                type="number"
                {...register("rentPrice", { valueAsNumber: true })}
                className="input input-bordered"
              />
              {errors.rentPrice && (
                <span className="text-xs text-error mt-1">
                  {errors.rentPrice.message}
                </span>
              )}
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Room</span>
              </label>
              <select {...register("room")} className="select select-bordered">
                <option value="">Pilih Ruangan...</option>
                {roomOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              {errors.room && (
                <span className="text-xs text-error mt-1">
                  {errors.room.message}
                </span>
              )}
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Console</span>
              </label>
              <select
                {...register("console")}
                className="select select-bordered"
              >
                <option value="">Pilih Konsol...</option>
                {consoleOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              {errors.console && (
                <span className="text-xs text-error mt-1">
                  {errors.console.message}
                </span>
              )}
            </div>
            <div className="form-control col-span-1 md:col-span-2">
              <label className="label">
                <span className="label-text">Add-ons</span>
              </label>
              <div className="flex flex-wrap gap-4">
                {addonOptions.map((addon) => (
                  <label key={addon} className="label cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("addons")}
                      value={addon}
                      className="checkbox checkbox-primary"
                    />{" "}
                    <span className="label-text ml-2">{addon}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-control col-span-1 md:col-span-2">
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <select
                {...register("status")}
                className="select select-bordered"
              >
                <option>Available</option>
                <option>Booked</option>
                <option>Under Maintenance</option>
              </select>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Game List</span>
            </label>
            <Controller
              name="games"
              control={control}
              defaultValue={[]}
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
            <div className="mt-2 flex flex-wrap gap-2 min-h-[2rem]">
              <Controller
                name="games"
                control={control}
                render={({ field }) =>
                  field.value?.map((gameName) => (
                    <div
                      key={gameName}
                      className="badge badge-lg badge-outline gap-2"
                    >
                      <button
                        type="button"
                        className="btn btn-xs btn-circle btn-ghost -ml-1 mr-1"
                        onClick={() => {
                          const newSelection = field.value.filter(
                            (name) => name !== gameName
                          );
                          field.onChange(newSelection);
                        }}
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                      {gameName}
                    </div>
                  ))
                }
              />
            </div>
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
              {isEditMode ? "Save Changes" : "Add Unit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditUnitModal;
