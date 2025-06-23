import { apiSlice } from "../../../store/api/apiSlice";

// --- BAGIAN MOCK DATA ---

const createMockConsole = (id, name, amount, imageUrl) => ({
  id,
  name,
  amount,
  imageUrl,
});
let mockConsoles = [
  createMockConsole(
    1,
    "PlayStation 5 Disc Edition",
    15,
    "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&q=80"
  ),
  createMockConsole(
    2,
    "PlayStation 5 Digital Edition",
    10,
    "https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=500&q=80"
  ),
  createMockConsole(
    3,
    "PlayStation 4 Pro",
    25,
    "https://images.unsplash.com/photo-1507427663323-642512a14348?w=500&q=80"
  ),
  createMockConsole(
    4,
    "PlayStation 4 Slim",
    30,
    "https://images.unsplash.com/photo-1592203922334-0545a56e3573?w=500&q=80"
  ),
];

const createMockRoom = (id, name, description, imageUrl) => ({
  id,
  name,
  description,
  imageUrl,
});
let mockRooms = [
  createMockRoom(
    1,
    "Ruang VIP 1",
    "Ruangan private dengan sofa, AC, dan TV 65 inch.",
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&q=80"
  ),
  createMockRoom(
    2,
    "Ruang VIP 2",
    "Ruangan private dengan sofa, AC, dan TV 65 inch.",
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=500&q=80"
  ),
];

let mockMasterGames = [
  {
    id: 101,
    name: "EA FC 24",
    console: "PS5",
    genre: "Sports",
    imageUrl:
      "https://images.unsplash.com/photo-1700942542988-29219a37a151?w=500&q=80",
  },
  {
    id: 102,
    name: "GTA V",
    console: "PS4/PS5",
    genre: "Action",
    imageUrl:
      "https://images.unsplash.com/photo-1552820728-8b8314178654?w=500&q=80",
  },
  {
    id: 103,
    name: "Elden Ring",
    console: "PS5",
    genre: "RPG",
    imageUrl:
      "https://images.unsplash.com/photo-1678813352932-f355041b3a53?w=500&q=80",
  },
  {
    id: 104,
    name: "Spider-Man 2",
    console: "PS5",
    genre: "Action",
    imageUrl:
      "https://images.unsplash.com/photo-1698220955743-36b8e39f5979?w=500&q=80",
  },
];

const createMockUnit = (i) => {
  const unitGames =
    i % 2 === 0 ? [mockMasterGames[0].name] : [mockMasterGames[1].name];
  return {
    id: i + 1,
    name: `Unit ${String.fromCharCode(65 + i)}`,
    room: "Ruang VIP 1",
    console: "PlayStation 5 Disc Edition",
    addons: ["Extra Stik"],
    rentPrice: 25000,
    status: "Available",
    games: unitGames,
  };
};
let mockUnits = Array.from({ length: 10 }, (_, i) => createMockUnit(i));

// --- BAGIAN ENDPOINTS DENGAN TAG YANG KONSISTEN & BENAR ---
export const rentalApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Console Endpoints
    getConsoles: builder.query({
      queryFn: async (arg) => {
        const { page = 1, limit = 10, search = "" } = arg;
        let d = mockConsoles.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase())
        );
        const p = d.slice((page - 1) * limit, page * limit);
        await new Promise((r) => setTimeout(r, 300));
        return {
          data: {
            consoles: p,
            totalPages: Math.ceil(d.length / limit),
            currentPage: page,
          },
        };
      },
      providesTags: (result) =>
        result
          ? [
              { type: "Console", id: "LIST" },
              ...result.consoles.map(({ id }) => ({ type: "Console", id })),
            ]
          : [{ type: "Console", id: "LIST" }],
    }),
    addConsole: builder.mutation({
      queryFn: async (n) => {
        const i = { ...n, id: Date.now() };
        mockConsoles.unshift(i);
        return { data: i };
      },
      invalidatesTags: [{ type: "Console", id: "LIST" }],
    }),
    updateConsole: builder.mutation({
      queryFn: async (i) => {
        const x = mockConsoles.findIndex((c) => c.id === i.id);
        if (x !== -1) mockConsoles[x] = { ...mockConsoles[x], ...i };
        return { data: i };
      },
      invalidatesTags: (r, e, arg) => [
        { type: "Console", id: "LIST" },
        { type: "Console", id: arg.id },
      ],
    }),
    deleteConsole: builder.mutation({
      queryFn: async (id) => {
        mockConsoles = mockConsoles.filter((c) => c.id !== id);
        return { data: id };
      },
      invalidatesTags: [{ type: "Console", id: "LIST" }],
    }),

    // Room Endpoints
    getRooms: builder.query({
      queryFn: async (arg) => {
        const { page = 1, limit = 10, search = "" } = arg;
        let d = mockRooms.filter((r) =>
          r.name.toLowerCase().includes(search.toLowerCase())
        );
        const p = d.slice((page - 1) * limit, page * limit);
        await new Promise((r) => setTimeout(r, 300));
        return {
          data: {
            rooms: p,
            totalPages: Math.ceil(d.length / limit),
            currentPage: page,
          },
        };
      },
      providesTags: (result) =>
        result
          ? [
              { type: "Room", id: "LIST" },
              ...result.rooms.map(({ id }) => ({ type: "Room", id })),
            ]
          : [{ type: "Room", id: "LIST" }],
    }),
    addRoom: builder.mutation({
      queryFn: async (i) => {
        const n = { ...i, id: Date.now() };
        mockRooms.unshift(n);
        return { data: n };
      },
      invalidatesTags: [{ type: "Room", id: "LIST" }],
    }),
    updateRoom: builder.mutation({
      queryFn: async (i) => {
        const x = mockRooms.findIndex((r) => r.id === i.id);
        if (x !== -1) mockRooms[x] = { ...mockRooms[x], ...i };
        return { data: i };
      },
      invalidatesTags: (r, e, arg) => [
        { type: "Room", id: "LIST" },
        { type: "Room", id: arg.id },
      ],
    }),
    deleteRoom: builder.mutation({
      queryFn: async (id) => {
        mockRooms = mockRooms.filter((r) => r.id !== id);
        return { data: id };
      },
      invalidatesTags: [{ type: "Room", id: "LIST" }],
    }),

    // Unit Endpoints
    getUnits: builder.query({
      queryFn: async (arg) => {
        const { page = 1, limit = 10, search = "" } = arg;
        let d = mockUnits.filter((u) =>
          u.name.toLowerCase().includes(search.toLowerCase())
        );
        const p = d.slice((page - 1) * limit, page * limit);
        await new Promise((r) => setTimeout(r, 300));
        return {
          data: {
            units: p,
            totalPages: Math.ceil(d.length / limit),
            currentPage: page,
          },
        };
      },
      providesTags: (result) =>
        result
          ? [
              { type: "Unit", id: "LIST" },
              ...result.units.map(({ id }) => ({ type: "Unit", id })),
            ]
          : [{ type: "Unit", id: "LIST" }],
    }),
    addUnit: builder.mutation({
      queryFn: async (i) => {
        const n = { ...i, id: Date.now() };
        mockUnits.unshift(n);
        return { data: n };
      },
      invalidatesTags: [{ type: "Unit", id: "LIST" }],
    }),
    updateUnit: builder.mutation({
      queryFn: async (i) => {
        const x = mockUnits.findIndex((u) => u.id === i.id);
        if (x !== -1) mockUnits[x] = { ...mockUnits[x], ...i };
        return { data: i };
      },
      invalidatesTags: (r, e, arg) => [
        { type: "Unit", id: "LIST" },
        { type: "Unit", id: arg.id },
      ],
    }),
    deleteUnit: builder.mutation({
      queryFn: async (id) => {
        mockUnits = mockUnits.filter((u) => u.id !== id);
        return { data: id };
      },
      invalidatesTags: [{ type: "Unit", id: "LIST" }],
    }),

    // Game Endpoints (Sudah Diperbaiki)
    getGameList: builder.query({
      queryFn: async (arg) => {
        const { page = 1, limit = 10, search = "" } = arg;
        let filteredData = mockMasterGames.filter((g) =>
          g.name.toLowerCase().includes(search.toLowerCase())
        );
        const dataWithUnitCount = filteredData.map((game) => ({
          ...game,
          availableAt: mockUnits.filter((unit) =>
            unit.games.includes(game.name)
          ).length,
        }));
        const paginatedData = dataWithUnitCount.slice(
          (page - 1) * limit,
          page * limit
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          data: {
            games: paginatedData,
            totalPages: Math.ceil(dataWithUnitCount.length / limit),
            currentPage: page,
          },
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
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return { data: mockMasterGames };
      },
      providesTags: ["Game"],
    }),
    addGame: builder.mutation({
      queryFn: async (i) => {
        const n = { ...i, id: Date.now() };
        mockMasterGames.unshift(n);
        return { data: n };
      },
      invalidatesTags: [{ type: "Game", id: "LIST" }],
    }),
    updateGame: builder.mutation({
      queryFn: async (i) => {
        const x = mockMasterGames.findIndex((g) => g.id === i.id);
        if (x !== -1) mockMasterGames[x] = { ...mockMasterGames[x], ...i };
        return { data: i };
      },
      invalidatesTags: (r, e, arg) => [
        { type: "Game", id: "LIST" },
        { type: "Game", id: arg.id },
      ],
    }),
    deleteGame: builder.mutation({
      queryFn: async (id) => {
        mockMasterGames = mockMasterGames.filter((g) => g.id !== id);
        return { data: id };
      },
      invalidatesTags: [{ type: "Game", id: "LIST" }],
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
  useGetGameListQuery,
  useGetAllGamesQuery,
  useAddGameMutation,
  useUpdateGameMutation,
  useDeleteGameMutation,
} = rentalApiSlice;
