import { create } from 'zustand';

export type SeatStatus = 'AVAILABLE' | 'LOCKED' | 'SOLD';

export interface SeatData {
  id: number;
  eventId: number;
  zoneId: number;
  rowName: string;
  seatNumber: number;
  status: SeatStatus;
  lockedById: number | null;
  lockedAt: string | null;
  ticketCode: string | null;
  zone: {
    id: number;
    name: string;
    price: number;
    totalRows: number;
    seatsPerRow: number;
  };
}

interface SeatStore {
  
  seats: SeatData[];
  setSeats: (seats: SeatData[]) => void;
  updateSeats: (updates: Partial<SeatData>[]) => void;

  selectedIds: Set<number>;
  toggleSeat: (seatId: number) => void;
  clearSelection: () => void;
  isSeatSelected: (seatId: number) => boolean;

  loading: boolean;
  setLoading: (v: boolean) => void;
  error: string | null;
  setError: (msg: string | null) => void;

  currentUserId: number | null;
  setCurrentUserId: (id: number | null) => void;
}

export const useSeatStore = create<SeatStore>((set, get) => ({
  seats: [],
  setSeats: (seats) => set({ seats }),

  updateSeats: (updates) =>
    set((state) => {
      const map = new Map(state.seats.map((s) => [s.id, s]));
      for (const u of updates) {
        if (u.id != null && map.has(u.id)) {
          map.set(u.id, { ...map.get(u.id)!, ...u });
        }
      }
      return { seats: Array.from(map.values()) };
    }),

  selectedIds: new Set(),

  toggleSeat: (seatId) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(seatId)) {
        next.delete(seatId);
      } else {
        if (next.size >= 4) {
          return { error: 'You can only select a maximum of 4 seats per booking.' };
        }
        next.add(seatId);
      }
      return { selectedIds: next };
    }),

  clearSelection: () => set({ selectedIds: new Set() }),

  isSeatSelected: (seatId) => get().selectedIds.has(seatId),

  loading: false,
  setLoading: (v) => set({ loading: v }),

  error: null,
  setError: (msg) => set({ error: msg }),

  currentUserId: null,
  setCurrentUserId: (id) => set({ currentUserId: id }),
}));
