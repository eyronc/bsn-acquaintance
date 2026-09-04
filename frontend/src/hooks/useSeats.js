import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';

// Table distribution matching STAGE.png
export const STAGE_TABLE_CONFIG = [
  { row: 'A', maxTables: 19, society: 'Society A', label: 'Row A (Front Stage)' },
  { row: 'B', maxTables: 22, society: 'Society B', label: 'Row B (Instructors & NSBO Front)' },
  { row: 'C', maxTables: 22, society: 'Society C', label: 'Row C (Hall Mid-Front)' },
  { row: 'D', maxTables: 22, society: 'Society D', label: 'Row D (Hall Center)' },
  { row: 'E', maxTables: 24, society: 'Society E', label: 'Row E (Working Area Mid-Back)' },
  { row: 'F', maxTables: 24, society: 'Society F', label: 'Row F (Hall Back)' },
  { row: 'G', maxTables: 16, society: 'Society G', label: 'Row G (Near Food Stations)' },
];

// Helper to format table code (e.g. "A-01", "B-12")
export function formatTableCode(rowLetter, number) {
  return `${rowLetter}-${String(number).padStart(2, '0')}`;
}

// Seat ID generator (e.g. "table-A-01-seat-01")
export function formatSeatId(tableCode, seatNumber) {
  const sPad = String(seatNumber).padStart(2, '0');
  return `table-${tableCode}-seat-${sPad}`;
}

// Generate base seats for all tables defined in STAGE.png (10 seats per table)
export function createFreshBaseSeats() {
  const mockSeats = [];
  
  STAGE_TABLE_CONFIG.forEach(({ row, maxTables, society }) => {
    for (let t = 1; t <= maxTables; t++) {
      const tableCode = formatTableCode(row, t);
      for (let s = 1; s <= 10; s++) {
        mockSeats.push({
          id: formatSeatId(tableCode, s),
          table_code: tableCode,
          table_number: t,
          seat_number: s,
          society,
          row_letter: row,
          attendee_id: null,
          status: 'available',
          confirmed_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }
  });

  return mockSeats;
}

function saveMockSeats(seatsData) {
  try {
    localStorage.setItem('bsn_mock_seats_stage_v1', JSON.stringify(seatsData));
  } catch (e) {}
}

export function useSeats() {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSeats = useCallback(async () => {
    try {
      setError(null);
      let baseSeats = createFreshBaseSeats();

      // 1. Fetch from seats table in Supabase
      const { data: seatsData, error: seatsErr } = await supabase
        .from('seats')
        .select('*')
        .order('table_code', { ascending: true })
        .order('seat_number', { ascending: true });

      if (!seatsErr && seatsData && seatsData.length > 0) {
        const dbSeatsMap = new Map();
        seatsData.forEach((s) => {
          const key = `${s.table_code || ('T-' + s.table_number)}-S${s.seat_number}`;
          dbSeatsMap.set(key, s);
        });

        baseSeats = baseSeats.map((seat) => {
          const key = `${seat.table_code}-S${seat.seat_number}`;
          const dbSeat = dbSeatsMap.get(key);
          if (dbSeat) {
            return {
              ...seat,
              id: dbSeat.id || seat.id,
              attendee_id: dbSeat.attendee_id,
              status: dbSeat.status || 'available',
              confirmed_at: dbSeat.confirmed_at,
              society: dbSeat.society || seat.society,
            };
          }
          return seat;
        });
      }

      // 2. Fetch active confirmed attendees from Supabase attendees table
      const { data: attendeesData, error: attendeesError } = await supabase
        .from('attendees')
        .select('id, seat_confirmed, table_code, table_number, seat_number, seat_confirmed_at, society')
        .eq('seat_confirmed', true);

      const confirmedMap = new Map();
      if (!attendeesError && attendeesData) {
        attendeesData.forEach((att) => {
          const code = att.table_code || (att.table_number ? `A-${String(att.table_number).padStart(2, '0')}` : null);
          if (code && att.seat_number) {
            confirmedMap.set(`${code}-S${att.seat_number}`, att);
          }
        });
      }

      // Check localStorage for offline / fallback bookings
      try {
        const localAttendees = JSON.parse(localStorage.getItem('bsn_mock_attendees') || '[]');
        localAttendees.forEach((att) => {
          if (att.seat_confirmed && (att.table_code || att.table_number) && att.seat_number) {
            const code = att.table_code || `A-${String(att.table_number).padStart(2, '0')}`;
            const key = `${code}-S${att.seat_number}`;
            if (!confirmedMap.has(key)) {
              confirmedMap.set(key, att);
            }
          }
        });
      } catch (e) {}

      // Synchronize baseSeats strictly with actual confirmed attendees
      const orphanedSeatsToReset = [];
      baseSeats = baseSeats.map((s) => {
        const key = `${s.table_code}-S${s.seat_number}`;
        const att = confirmedMap.get(key);
        if (att) {
          return {
            ...s,
            attendee_id: att.id,
            status: 'confirmed',
            confirmed_at: att.seat_confirmed_at || s.confirmed_at,
          };
        } else {
          if (s.status === 'confirmed' || s.attendee_id) {
            orphanedSeatsToReset.push(s);
          }
          return {
            ...s,
            attendee_id: null,
            status: 'available',
            confirmed_at: null,
          };
        }
      });

      // Async cleanup orphaned seats in Supabase if any found
      if (orphanedSeatsToReset.length > 0) {
        for (const orphan of orphanedSeatsToReset) {
          supabase
            .from('seats')
            .update({ attendee_id: null, status: 'available', confirmed_at: null })
            .eq('table_code', orphan.table_code)
            .eq('seat_number', orphan.seat_number)
            .then(() => {});
        }
      }

      setSeats(baseSeats);
      saveMockSeats(baseSeats);
    } catch (err) {
      console.warn('fetchSeats notice:', err.message);
      setSeats(createFreshBaseSeats());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeats();

    // Listen to REALTIME changes in Supabase
    let attendeesChannel;
    let seatsChannel;

    try {
      attendeesChannel = supabase
        .channel('realtime_attendees_sync_v2')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'attendees' }, () => {
          fetchSeats();
        })
        .subscribe();

      seatsChannel = supabase
        .channel('realtime_seats_sync_v2')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'seats' }, () => {
          fetchSeats();
        })
        .subscribe();
    } catch (e) {}

    return () => {
      if (attendeesChannel) supabase.removeChannel(attendeesChannel);
      if (seatsChannel) supabase.removeChannel(seatsChannel);
    };
  }, [fetchSeats]);

  const getUserSeat = useCallback(async (attendeeId) => {
    if (!attendeeId) return null;

    try {
      const { data: attendeeData } = await supabase
        .from('attendees')
        .select('*')
        .eq('id', attendeeId)
        .single();

      if (attendeeData && attendeeData.seat_confirmed) {
        const tableCode = attendeeData.table_code || `A-${String(attendeeData.table_number || 1).padStart(2, '0')}`;
        return {
          id: formatSeatId(tableCode, attendeeData.seat_number),
          table_code: tableCode,
          table_number: attendeeData.table_number,
          seat_number: attendeeData.seat_number,
          society: attendeeData.society,
          attendee_id: attendeeId,
          status: 'confirmed',
          confirmed_at: attendeeData.seat_confirmed_at,
        };
      }
    } catch (e) {}

    // Fallback to local storage
    try {
      const localAttendees = JSON.parse(localStorage.getItem('bsn_mock_attendees') || '[]');
      const localAtt = localAttendees.find((a) => a.id === attendeeId);
      if (localAtt && localAtt.seat_confirmed) {
        const tableCode = localAtt.table_code || `A-${String(localAtt.table_number || 1).padStart(2, '0')}`;
        return {
          id: formatSeatId(tableCode, localAtt.seat_number),
          table_code: tableCode,
          table_number: localAtt.table_number,
          seat_number: localAtt.seat_number,
          society: localAtt.society,
          attendee_id: attendeeId,
          status: 'confirmed',
          confirmed_at: localAtt.seat_confirmed_at,
        };
      }
    } catch (e) {}

    return null;
  }, []);

  const reserveSeat = useCallback(async (seatId, attendeeId) => {
    setSeats((prev) => {
      const updated = prev.map((s) =>
        s.id === seatId ? { ...s, attendee_id: attendeeId, status: 'reserved' } : s
      );
      saveMockSeats(updated);
      return updated;
    });

    const seatRecord = seats.find((s) => s.id === seatId);
    if (seatRecord) {
      try {
        await supabase
          .from('seats')
          .update({ attendee_id: attendeeId, status: 'reserved' })
          .eq('table_code', seatRecord.table_code)
          .eq('seat_number', seatRecord.seat_number);
      } catch (err) {}
    }
    return true;
  }, [seats]);

  const confirmSeatWithAttendee = useCallback(
    async (seatId, attendeeId) => {
      if (!seatId || !attendeeId) {
        throw new Error('Missing seatId or attendeeId');
      }

      const seatRecord = seats.find((s) => s.id === seatId);
      let tableCode = seatRecord?.table_code;
      let seatNumber = seatRecord?.seat_number;
      let tableNumber = seatRecord?.table_number;
      let society = seatRecord?.society;

      if (!tableCode || !seatNumber) {
        const parts = String(seatId).split('-');
        // table-A-01-seat-01
        tableCode = `${parts[1]}-${parts[2]}`;
        seatNumber = parseInt(parts[4]) || 1;
        tableNumber = parseInt(parts[2]) || 1;
      }

      const nowIso = new Date().toISOString();

      // 1. UPDATE attendees table in Supabase
      try {
        await supabase
          .from('attendees')
          .update({
            seat_confirmed: true,
            table_code: tableCode,
            table_number: tableNumber,
            seat_number: seatNumber,
            seat_confirmed_at: nowIso,
          })
          .eq('id', attendeeId);
      } catch (err) {
        console.error('[Supabase Attendees Exception]:', err.message);
      }

      // 2. UPDATE seats table in Supabase
      try {
        await supabase
          .from('seats')
          .update({
            attendee_id: attendeeId,
            status: 'confirmed',
            confirmed_at: nowIso,
          })
          .eq('table_code', tableCode)
          .eq('seat_number', seatNumber);
      } catch (err) {
        console.error('[Supabase Seats Exception]:', err.message);
      }

      // 3. Update localStorage fallback
      try {
        const local = JSON.parse(localStorage.getItem('bsn_mock_attendees') || '[]');
        const updatedLocal = local.map((a) => {
          if (a.id === attendeeId) {
            return {
              ...a,
              seat_confirmed: true,
              table_code: tableCode,
              table_number: tableNumber,
              seat_number: seatNumber,
              seat_confirmed_at: nowIso,
            };
          }
          return a;
        });
        localStorage.setItem('bsn_mock_attendees', JSON.stringify(updatedLocal));
      } catch (e) {}

      await fetchSeats();
      return true;
    },
    [seats, fetchSeats]
  );

  const clearSeat = useCallback(async (seatId) => {
    setSeats((prev) => {
      const updated = prev.map((s) =>
        s.id === seatId ? { ...s, attendee_id: null, status: 'available' } : s
      );
      saveMockSeats(updated);
      return updated;
    });

    const seatRecord = seats.find((s) => s.id === seatId);
    if (seatRecord) {
      try {
        await supabase
          .from('seats')
          .update({ attendee_id: null, status: 'available', confirmed_at: null })
          .eq('table_code', seatRecord.table_code)
          .eq('seat_number', seatRecord.seat_number);
      } catch (err) {}
    }
    return true;
  }, [seats]);

  return {
    seats,
    loading,
    error,
    isFallbackMode: false,
    fetchSeats,
    getUserSeat,
    reserveSeat,
    confirmSeatWithAttendee,
    clearSeat,
  };
}