import { apiSlice } from "../../../store/api/apiSlice";

// --- TIDAK ADA LAGI MOCK DATA DI SINI ---
// Semua data sekarang 100% diambil dari backend.

export const rentalApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // === Console Endpoints (Terhubung ke Backend) ===
    getConsoles: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) => ({
        url: "/api/public/consoles",
        params: { page, per_page: limit, search },
      }),
      transformResponse: (response) => ({
        consoles: response.data.map((console) => ({
          ...console,
          imageUrl: console.image
            ? `${import.meta.env.VITE_IMAGE_BASE_URL}/${console.image}`
            : `https://placehold.co/60x60/EEE/31343C?text=${console.name.charAt(
              0
            )}`,
        })),
        totalPages: response.last_page,
        currentPage: response.current_page,
      }),
      providesTags: (result) =>
        result
          ? [
            { type: "Console", id: "LIST" },
            ...result.consoles.map(({ id }) => ({ type: "Console", id })),
          ]
          : [{ type: "Console", id: "LIST" }],
    }),
    addConsole: builder.mutation({
      query: (newConsole) => {
        const formData = new FormData();
        formData.append("name", newConsole.name);
        formData.append("description", newConsole.description);
        if (newConsole.image && newConsole.image.length > 0) {
          formData.append("image", newConsole.image[0]);
        }
        return { url: "/api/admin/consoles", method: "POST", body: formData };
      },
      invalidatesTags: [{ type: "Console", id: "LIST" }],
    }),
    updateConsole: builder.mutation({
      query: ({ id, ...patch }) => {
        const formData = new FormData();
        formData.append("name", patch.name);
        formData.append("description", patch.description);
        if (patch.image && patch.image.length > 0) {
          formData.append("image", patch.image[0]);
        }
        formData.append("_method", "POST");
        return {
          url: `/api/admin/consoles/${id}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (r, e, arg) => [
        { type: "Console", id: "LIST" },
        { type: "Console", id: arg.id },
      ],
    }),
    deleteConsole: builder.mutation({
      query: (id) => ({ url: `/api/admin/consoles/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Console", id: "LIST" }],
    }),

    // === Room Endpoints (Terhubung ke Backend) ===
    getRooms: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) => ({
        url: "/api/public/rooms",
        params: { page, per_page: limit, search },
      }),
      transformResponse: (response) => ({
        rooms: response.data.map((room) => ({
          ...room,
          imageUrl: room.image
            ? `${import.meta.env.VITE_IMAGE_BASE_URL}/${room.image}`
            : `https://placehold.co/60x60/EEE/31343C?text=${room.name.charAt(
              0
            )}`,
        })),
        totalPages: response.last_page,
        currentPage: response.current_page,
      }),
      providesTags: (result) =>
        result
          ? [
            { type: "Room", id: "LIST" },
            ...result.rooms.map(({ id }) => ({ type: "Room", id })),
          ]
          : [{ type: "Room", id: "LIST" }],
    }),
    addRoom: builder.mutation({
      query: (newRoom) => {
        const formData = new FormData();
        formData.append("name", newRoom.name);
        formData.append("description", newRoom.description);
        formData.append("max_visitors", newRoom.max_visitors);
        if (newRoom.image && newRoom.image.length > 0) {
          formData.append("image", newRoom.image[0]);
        }
        return { url: "/api/admin/rooms", method: "POST", body: formData };
      },
      invalidatesTags: [{ type: "Room", id: "LIST" }],
    }),
    updateRoom: builder.mutation({
      query: ({ id, ...patch }) => {
        const formData = new FormData();
        if (patch.name) formData.append("name", patch.name);
        if (patch.description)
          formData.append("description", patch.description);
        if (patch.max_visitors)
          formData.append("max_visitors", patch.max_visitors);
        if (patch.image && patch.image[0] instanceof File) {
          formData.append("image", patch.image[0]);
        }
        if (patch.is_available !== undefined) {
          formData.append("is_available", patch.is_available ? 1 : 0);
        }
        formData.append("_method", "POST"); // BENAR: Gunakan 'POST'
        return {
          url: `/api/admin/rooms/${id}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (r, e, arg) => [
        { type: "Room", id: "LIST" },
        { type: "Room", id: arg.id },
      ],
    }),
    deleteRoom: builder.mutation({
      query: (id) => ({ url: `/api/admin/rooms/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Room", id: "LIST" }],
    }),

    // === Unit Endpoints (Terhubung ke Backend) ===
    getUnits: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) => ({
        url: "/api/public/units",
        params: { page, per_page: limit, search },
      }),
      transformResponse: (response) => ({
        units: response.data.map((unit) => ({
          ...unit,
          roomName: unit.room?.name || "-",
          consoleNames: unit.consoles?.map((c) => c.name).join(", ") || "N/A",
          games: unit.games?.map((g) => g.title) || [],
          rentPrice: parseFloat(unit.price) || 0,
          console_ids: unit.consoles?.map((c) => c.id) || [],
          game_ids: unit.games?.map((g) => g.id) || [],
          // New fields from updated response
          pointName: unit.point?.name || "-",
          pointsPerHour: unit.point?.points_per_hour || 0,
          maxVisitors: unit.max_visitors || 0,
          status: unit.status || "unknown",
          // Enhanced console and game data
          consoleDetails: unit.consoles?.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            image: c.image,
            amount: c.amount,
            isActive: c.is_active
          })) || [],
          gameDetails: unit.games?.map((g) => ({
            id: g.id,
            title: g.title,
            description: g.description,
            image: g.image,
            genreId: g.genre_id,
            isActive: g.is_active
          })) || []
        })),
        totalPages: response.last_page,
        currentPage: response.current_page,
      }),
      providesTags: (result) =>
        result
          ? [
            { type: "Unit", id: "LIST" },
            ...result.units.map(({ id }) => ({ type: "Unit", id })),
          ]
          : [{ type: "Unit", id: "LIST" }],
    }),
    addUnit: builder.mutation({
      query: (newUnit) => ({
        url: "/api/admin/units",
        method: "POST",
        body: newUnit,
      }),
      invalidatesTags: [{ type: "Unit", id: "LIST" }],
    }),
    updateUnit: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/api/admin/units/${id}`,
        method: "POST",
        body: { ...patch, _method: "POST" },
      }),
      invalidatesTags: (r, e, arg) => [
        { type: "Unit", id: "LIST" },
        { type: "Unit", id: arg.id },
      ],
    }),
    deleteUnit: builder.mutation({
      query: (id) => ({ url: `/api/admin/units/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Unit", id: "LIST" }],
    }),

    // Reorder games in unit
    reorderGames: builder.mutation({
      query: ({ unitId, gameIds }) => ({
        url: `/api/admin/units/${unitId}/games/reorder`,
        method: "POST",
        body: { game_ids: gameIds },
      }),
      invalidatesTags: [{ type: "Unit", id: "LIST" }],
    }),

    // === Game Endpoints (Terhubung ke Backend) ===
    getGameList: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) => ({
        url: "/api/admin/games", // Changed to admin endpoint for consistency
        params: { page, per_page: limit, search },
      }),
      transformResponse: (response) => {
        return {
          games: response.data.map((game) => {
            // Handle genre properly - check multiple possible formats
            let genreValue = "Unknown";
            if (game.genre) {
              if (typeof game.genre === 'string' && game.genre.trim() !== '') {
                genreValue = game.genre;
              } else if (typeof game.genre === 'object' && game.genre.name) {
                genreValue = game.genre.name;
              } else if (typeof game.genre === 'object' && game.genre.title) {
                genreValue = game.genre.title;
              }
            } else if (game.genre_id) {
              // If genre_id exists, we need to get the genre name
              // For now, we'll use the ID as fallback
              genreValue = `Genre ID: ${game.genre_id}`;
            }

            return {
              ...game,
              name: game.title,
              console: game.consoles?.map((c) => c.name).join(", ") || "N/A",
              genre: genreValue,
              imageUrl: game.image
                ? `${import.meta.env.VITE_IMAGE_BASE_URL}/${game.image}`
                : `https://placehold.co/60x60/EEE/31343C?text=${game.title.charAt(
                  0
                )}`,
              availableAt: 0,
            };
          }),
          totalPages: response.last_page,
          currentPage: response.current_page,
        };
      },
      providesTags: (result) =>
        result
          ? [
            { type: "Game", id: "LIST" },
            ...result.games.map(({ id }) => ({ type: "Game", id })),
          ]
          : [{ type: "Game", id: "LIST" }],
    }),
    getAllGames: builder.query({
      query: () => "/api/public/games?per_page=9999",
      transformResponse: (response) =>
        response.data.map((game) => ({
          ...game,
          name: game.title,
          // Handle genre properly - extract name if it's an object
          genre: game.genre && typeof game.genre === 'object' && game.genre.name
            ? game.genre.name
            : (typeof game.genre === 'string' ? game.genre : 'Unknown'),
        })),
      providesTags: ["Game"],
    }),
    getAllConsoles: builder.query({
      query: () => "/api/public/consoles?per_page=9999",
      transformResponse: (response) => response.data,
    }),
    getAllRooms: builder.query({
      query: () => "/api/public/rooms?per_page=9999",
      transformResponse: (response) => response.data,
    }),
    addGame: builder.mutation({
      query: (newGame) => {
        const formData = new FormData();
        formData.append("title", newGame.title);
        formData.append("genre_id", parseInt(newGame.genre) || newGame.genre); // Ensure it's a number
        formData.append("description", newGame.description || "");
        if (newGame.image && newGame.image.length > 0) {
          formData.append("image", newGame.image[0]);
        }

        return { url: "/api/admin/games", method: "POST", body: formData };
      },
      invalidatesTags: [{ type: "Game", id: "LIST" }],
    }),
    updateGame: builder.mutation({
      query: ({ id, ...patch }) => {
        const formData = new FormData();
        formData.append("title", patch.title);
        formData.append("genre_id", parseInt(patch.genre) || patch.genre); // Ensure it's a number
        formData.append("description", patch.description || "");
        if (patch.image && patch.image.length > 0) {
          formData.append("image", patch.image[0]);
        }
        formData.append("_method", "POST");

        return {
          url: `/api/admin/games/${id}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (result, error, arg) => [
        { type: "Game", id: "LIST" },
        { type: "Game", id: arg.id },
        "Game", // Invalidate all game queries
      ],
    }),
    deleteGame: builder.mutation({
      query: (id) => ({ url: `/api/admin/games/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Game", id: "LIST" }],
    }),

    // === Genre Endpoints (Terhubung ke Backend) ===
    getGenres: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) => ({
        url: "/api/admin/genres",
        params: { page, per_page: limit, search },
      }),
      transformResponse: (response) => {
        // Handle both paginated and direct array response
        if (Array.isArray(response)) {
          // Direct array response (no pagination)
          return {
            genres: response,
            totalPages: 1,
            currentPage: 1,
          };
        } else {
          // Paginated response
          return {
            genres: response.data || [],
            totalPages: response.last_page || 1,
            currentPage: response.current_page || 1,
          };
        }
      },
      providesTags: (result) =>
        result
          ? [
            { type: "Genre", id: "LIST" },
            ...(result.genres || []).map(({ id }) => ({ type: "Genre", id })),
          ]
          : [{ type: "Genre", id: "LIST" }],
    }),
    addGenre: builder.mutation({
      query: (newGenre) => ({
        url: "/api/admin/genres",
        method: "POST",
        body: newGenre,
      }),
      invalidatesTags: [{ type: "Genre", id: "LIST" }],
    }),
    updateGenre: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/api/admin/genres/${id}`,
        method: "POST",
        body: { ...patch, _method: "POST" },
      }),
      invalidatesTags: (r, e, arg) => [
        { type: "Genre", id: "LIST" },
        { type: "Genre", id: arg.id },
      ],
    }),
    deleteGenre: builder.mutation({
      query: (id) => ({ url: `/api/admin/genres/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Genre", id: "LIST" }],
    }),
  }),
});

export const {
  useGetConsolesQuery,
  useAddConsoleMutation,
  useUpdateConsoleMutation,
  useDeleteConsoleMutation,
  useGetRoomsQuery,
  useAddRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useGetUnitsQuery,
  useAddUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
  useReorderGamesMutation,
  useGetGameListQuery,
  useGetAllGamesQuery,
  useAddGameMutation,
  useUpdateGameMutation,
  useDeleteGameMutation,
  useGetAllRoomsQuery,
  useGetAllConsolesQuery,
  useGetGenresQuery,
  useAddGenreMutation,
  useUpdateGenreMutation,
  useDeleteGenreMutation,
} = rentalApiSlice;
