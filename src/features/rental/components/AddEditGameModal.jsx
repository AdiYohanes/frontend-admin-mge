import React, { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import {
  FiUpload,
  FiX,
  FiMonitor,
  FiTag,
  FiChevronDown,
  FiX as FiXMark
} from "react-icons/fi";

import {
  useAddGameMutation,
  useUpdateGameMutation,
  useGetGenresQuery,
  useGetConsolesQuery,
} from "../api/rentalApiSlice";

// Skema validasi yang lebih fleksibel
const gameSchema = z.object({
  title: z.string().min(3, "Judul game minimal 3 karakter"),
  genre_ids: z.array(z.number()).min(1, "Minimal satu genre harus dipilih").max(3, "Maksimal 3 genre yang dapat dipilih"),
  consoles: z.array(z.number()).min(1, "Minimal satu console harus dipilih"),
  description: z.string().optional().or(z.literal("")),
  image: z.any().optional(), // Lebih fleksibel untuk image
});

const AddEditGameModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);
  const [preview, setPreview] = useState(null);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isGenreDropdownOpen && !event.target.closest('.genre-dropdown')) {
        setIsGenreDropdownOpen(false);
      }
    };

    if (isGenreDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isGenreDropdownOpen]);

  const [addGame, { isLoading: isAdding }] = useAddGameMutation();
  const [updateGame, { isLoading: isUpdating }] = useUpdateGameMutation();
  const isLoading = isAdding || isUpdating;

  // Fetch genres from API
  const { data: genresData, isLoading: isLoadingGenres } = useGetGenresQuery({
    page: 1,
    limit: 100, // Get all genres
    search: "",
  });

  // Fetch consoles from API
  const { data: consolesData, isLoading: isLoadingConsoles, error: consolesError } = useGetConsolesQuery({
    page: 1,
    limit: 9999,
    search: "",
  });


  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      title: "",
      genre_ids: [],
      consoles: [],
      description: "",
      image: null,
    },
  });

  const selectedGenres = watch("genre_ids");

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles?.[0]) {
        setValue("image", acceptedFiles, { shouldValidate: true });
        setPreview(URL.createObjectURL(acceptedFiles[0]));
      }
    },
    [setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/png": [], "image/jpeg": [], "image/jpg": [] },
    maxFiles: 1,
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        // Handle genre data - now support multiple genres
        let genreValues = [];
        if (editingData.genres && editingData.genres.length > 0) {
          genreValues = editingData.genres.map(genre => {
            if (typeof genre === 'string') {
              // If it's a string, find the genre ID by name
              const selectedGenre = genresData?.genres?.find(g => g.name === genre);
              return selectedGenre ? selectedGenre.id : null;
            } else if (genre && typeof genre === 'object' && genre.id) {
              return genre.id;
            } else if (typeof genre === 'number') {
              return genre;
            }
            return null;
          }).filter(Boolean); // Remove null values
        } else if (editingData.genre) {
          // Handle single genre (backward compatibility)
          if (typeof editingData.genre === 'string') {
            const selectedGenre = genresData?.genres?.find(g => g.name === editingData.genre);
            genreValues = selectedGenre ? [selectedGenre.id] : [];
          } else if (typeof editingData.genre === 'number') {
            genreValues = [editingData.genre];
          }
        }

        // Handle console data - now support multiple consoles
        let consoleValues = [];
        if (editingData.consoles && editingData.consoles.length > 0) {
          consoleValues = editingData.consoles.map(console => {
            if (typeof console === 'string') {
              // If it's a string, find the console ID by name
              const selectedConsole = consolesData?.consoles?.find(c => c.name === console);
              return selectedConsole ? selectedConsole.id : null;
            } else if (console && typeof console === 'object' && console.id) {
              return console.id;
            } else if (typeof console === 'number') {
              return console;
            }
            return null;
          }).filter(Boolean); // Remove null values
        }

        reset({
          title: editingData.name || editingData.title || "",
          genre_ids: genreValues, // This will be the genre IDs array
          consoles: consoleValues, // This will be the console IDs array
          description: editingData.description || "",
          image: null,
        });
        setPreview(editingData.imageUrl);
      } else {
        reset({
          title: "",
          genre_ids: [],
          consoles: [],
          description: "",
          image: null,
        });
        setPreview(null);
      }
    }
  }, [isOpen, isEditMode, editingData, reset, genresData, consolesData]);

  const handleRemoveImage = () => {
    setPreview(null);
    setValue("image", null);
  };


  const handleGenreToggle = (field, genreId) => {
    const currentSelection = field.value || [];
    const isSelected = currentSelection.includes(genreId);

    if (isSelected) {
      // Remove genre
      field.onChange(currentSelection.filter(id => id !== genreId));
    } else {
      // Add genre (max 3)
      if (currentSelection.length < 3) {
        field.onChange([...currentSelection, genreId]);
      } else {
        toast.error("Maksimal 3 genre yang dapat dipilih");
      }
    }
    setIsGenreDropdownOpen(false);
  };

  const onSubmit = async (formData) => {
    try {
      // Validate genre and console selection
      if (!formData.genre_ids || formData.genre_ids.length === 0) {
        toast.error("Minimal satu genre harus dipilih!");
        return;
      }
      if (!formData.consoles || formData.consoles.length === 0) {
        toast.error("Minimal satu console harus dipilih!");
        return;
      }

      // Create FormData for file upload
      const submitData = new FormData();

      // Add basic fields
      submitData.append('title', formData.title);
      submitData.append('description', formData.description || '');

      // Add genre_ids as array
      formData.genre_ids.forEach(id => {
        submitData.append('genre_id[]', id);
      });

      // Add console_ids as array
      formData.consoles.forEach(id => {
        submitData.append('console_ids[]', id);
      });

      // Add image if present
      if (formData.image && formData.image[0]) {
        submitData.append('image', formData.image[0]);
      }

      if (isEditMode) {
        // For edit mode, we need to add the ID to FormData
        submitData.append('_method', 'POST');
        await updateGame({ id: editingData.id, formData: submitData }).unwrap();
        toast.success("Game berhasil diperbarui!");
      } else {
        await addGame(submitData).unwrap();
        toast.success("Game baru berhasil ditambahkan!");
      }
      onClose();
    } catch (err) {
      console.error("Error details:", err);
      console.error("Error data:", err.data);
      console.error("Error message:", err.message);
      toast.error(err.data?.message || "Gagal memproses data game.");
    }
  };

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-base-300">
          <div className="flex items-center gap-2">
            <FiMonitor className="h-6 w-6 text-brand-gold" />
            <h3 className="text-xl font-bold">
              {isEditMode ? "Edit Game" : "Add Game"}
            </h3>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Game Image <span className="text-error">*</span>
              </span>
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${isDragActive
                ? "border-brand-gold bg-brand-gold/5"
                : preview
                  ? "border-brand-gold bg-base-100"
                  : "border-base-300 hover:border-brand-gold hover:bg-base-50"
                }`}
            >
              <input {...getInputProps()} />

              {preview ? (
                // Preview Image Mode
                <div className="relative w-full h-48 flex items-center justify-center">
                  <img
                    src={preview}
                    alt="Game Preview"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 rounded-lg flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-medium text-gray-700">
                          Click to change image
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          or drag and drop
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    className="btn btn-sm btn-circle bg-red-500 hover:bg-red-600 text-white absolute top-2 right-2 shadow-lg"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                // Upload Mode
                <div className="flex flex-col items-center justify-center gap-3 py-8">
                  <div className="p-4 bg-brand-gold/10 rounded-full">
                    <FiUpload className="h-8 w-8 text-brand-gold" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-base-content">
                      {isDragActive ? "Drop the image here" : "Drop files here or click to upload"}
                    </p>
                    <p className="text-xs text-base-content/60 mt-1">
                      PNG, JPG, JPEG (Maks. 2MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
            {errors.image && (
              <span className="text-xs text-error mt-2">
                {errors.image.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Game Name <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                {...register("title")}
                placeholder="Enter game name..."
                className={`input input-bordered ${errors.title ? "input-error" : ""
                  }`}
              />
              {errors.title && (
                <span className="text-xs text-error mt-1">
                  {errors.title.message}
                </span>
              )}
            </div>

            <div className="form-control">
              <Controller
                name="genre_ids"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="label">
                      <span className="label-text font-medium">
                        Genres <span className="text-error">*</span>
                        <span className="text-xs text-gray-500 ml-2">(Max 3)</span>
                      </span>
                    </label>

                    {/* Dropdown Trigger */}
                    <div className="relative genre-dropdown">
                      <button
                        type="button"
                        onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
                        className="w-full btn btn-outline justify-between text-left font-normal border-base-300 hover:border-brand-gold hover:bg-brand-gold/5"
                        disabled={isLoadingGenres}
                      >
                        <span className="flex items-center gap-2">
                          <FiTag className="h-4 w-4 text-brand-gold" />
                          {isLoadingGenres
                            ? "Loading genres..."
                            : field.value && field.value.length > 0
                              ? `${field.value.length} genre${field.value.length > 1 ? 's' : ''} selected`
                              : 'Select genres...'
                          }
                        </span>
                        <FiChevronDown className={`h-4 w-4 transition-transform ${isGenreDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {isGenreDropdownOpen && !isLoadingGenres && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                          {genresData?.genres?.map(genre => (
                            <label
                              key={genre.id}
                              className="flex items-center justify-between px-4 py-2 hover:bg-base-200 cursor-pointer border-b border-base-200 last:border-b-0"
                            >
                              <span className="font-medium">{genre.name}</span>
                              <input
                                type="checkbox"
                                className="checkbox checkbox-sm checkbox-primary"
                                checked={field.value?.includes(genre.id) || false}
                                onChange={() => handleGenreToggle(field, genre.id)}
                                disabled={!field.value?.includes(genre.id) && field.value?.length >= 3}
                              />
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selected Items Display */}
                    {field.value && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {field.value.map(genreId => {
                          const genre = genresData?.genres?.find(g => g.id === genreId);
                          return genre ? (
                            <div key={genreId} className="badge badge-sm badge-outline gap-1 border-brand-gold text-brand-gold">
                              <FiTag className="h-3 w-3" />
                              {genre.name}
                              <button
                                type="button"
                                className="btn btn-xs btn-circle btn-ghost hover:bg-red-500 hover:text-white -ml-1"
                                onClick={() => handleGenreToggle(field, genreId)}
                              >
                                <FiXMark className="h-3 w-3" />
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}

                    {errors.genre_ids && (
                      <span className="text-xs text-error mt-1">
                        {errors.genre_ids.message}
                      </span>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          <div className="form-control flex flex-col">
            <Controller
              name="consoles"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <div className="space-y-2">
                  <label className="label">
                    <span className="label-text font-medium">
                      Consoles <span className="text-error">*</span>
                    </span>
                  </label>

                  {isLoadingConsoles ? (
                    <div className="flex items-center gap-2">
                      <span className="loading loading-spinner loading-sm"></span>
                      <span className="text-sm">Loading consoles...</span>
                    </div>
                  ) : consolesError ? (
                    <span className="text-xs text-error">
                      Error loading consoles: {consolesError?.data?.message || consolesError?.message || 'Unknown error'}
                    </span>
                  ) : !consolesData?.consoles || consolesData.consoles.length === 0 ? (
                    <span className="text-xs text-warning">
                      No consoles available
                    </span>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-base-300 rounded-lg p-3">
                      {consolesData.consoles.map((console) => (
                        <label key={console.id} className="flex items-center gap-2 cursor-pointer hover:bg-base-100 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={field.value?.includes(console.id) || false}
                            onChange={(e) => {
                              const currentConsoles = field.value || [];
                              if (e.target.checked) {
                                field.onChange([...currentConsoles, console.id]);
                              } else {
                                field.onChange(currentConsoles.filter(id => id !== console.id));
                              }
                            }}
                            className="checkbox checkbox-sm"
                          />
                          <span className="text-sm">{console.name}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {errors.consoles && (
                    <span className="text-xs text-error mt-1">
                      {errors.consoles.message}
                    </span>
                  )}
                </div>
              )}
            />
          </div>

          <div className="form-control flex flex-col">
            <label className="label">
              <span className="label-text font-medium">Description</span>
            </label>
            <textarea
              {...register("description")}
              placeholder="Enter game description..."
              className="textarea textarea-bordered h-24"
            ></textarea>
            {errors.description && (
              <span className="text-xs text-error mt-1">
                {errors.description.message}
              </span>
            )}
          </div>

          <div className="modal-action pt-4 border-t border-base-300">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn bg-brand-gold hover:bg-amber-600 text-white"
              disabled={isLoading}
            >
              {isLoading && <span className="loading loading-spinner"></span>}
              {isEditMode ? "Save Changes" : "Add Game"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditGameModal;
