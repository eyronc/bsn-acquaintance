import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';

let isTableMissingInSupabase = false;

// Generate initial mock seats (6 tables × 10 seats)
function generateMockSeats() {
  const stored = localStorage.getItem('bsn_mock_seats');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {}
  }

  const mockSeats = [];
  for (let table = 1; table <= 6; table++) {
    for (let seat = 1; seat <= 10; seat++) {
      mockSeats.push({
        id: `table-${table}-seat-${seat}`,
        table_number: table,
        seat_number: seat,
        attendee_id: null,
        status: 'available',
        confirmed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }
  localStorage.setItem('bsn_mock_seats', JSON.stringify(mockSeats));
  return mockSeats;
}

function saveMockSeats(seatsData) {
  localStorage.setItem('bsn_mock_seats', JSON.stringify(seatsData));
}

function isValidUUID(str) {
  if (typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export function useSeats() {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSeats = useCallback(async () => {
    try {
      setError(null);
      let baseSeats = generateMockSeats();

      // 1. Fetch confirmed seats from attendees table in Supabase
      const { data: attendeesData, error: attendeesError } = await supabase
        .from('attendees')
        .select('id, seat_confirmed, table_number, seat_number, seat_confirmed_at')
        .eq('seat_confirmed', true);

      if (!attendeesError && attendeesData && attendeesData.length > 0) {
        attendeesData.forEach((att) => {
          if (att.table_number && att.seat_number) {
            baseSeats = baseSeats.map((s) => {
              if (s.table_number === att.table_number && s.seat_number === att.seat_number) {
                return {
                  ...s,
                  attendee_id: att.id,
                  status: 'confirmed',
                  confirmed_at: att.seat_confirmed_at || new Date().toISOString(),
                };
              }
              return s;
            });
          }
        });
      }

      // 2. Fetch from seats table if available
      if (!isTableMissingInSupabase) {
        const { data: seatsData, error: seatsErr } = await supabase
          .from('seats')
          .select('*')
          .order('table_number', { ascending: true })
          .order('seat_number', { ascending: true });

        if (!seatsErr && seatsData && seatsData.length > 0) {
          // Merge seats table data
          seatsData.forEach((dbSeat) => {
            baseSeats = baseSeats.map((s) => {
              if (s.table_number === dbSeat.table_number && s.seat_number === dbSeat.seat_number) {
                return {
                  ...s,
                  id: dbSeat.id || s.id,
                  attendee_id: dbSeat.attendee_id || s.attendee_id,
                  status: dbSeat.status || s.status,
                  confirmed_at: dbSeat.confirmed_at || s.confirmed_at,
                };
              }
              return s;
            });
          });
        }
      }

      setSeats(baseSeats);
      saveMockSeats(baseSeats);
    } catch (err) {
      console.warn('fetchSeats notice:', err.message);
      setSeats(generateMockSeats());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeats();

    let channel;
    try {
      channel = supabase
        .channel('attendees_channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'attendees' },
          () => {
            fetchSeats();
          }
        )
        .subscribe();
    } catch (e) {}

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchSeats]);

  const getUserSeat = useCallback(async (attendeeId) => {
    if (!attendeeId) return null;

    // Check Supabase attendees table first
    try {
      const { data: attendeeData } = await supabase
        .from('attendees')
        .select('*')
        .eq('id', attendeeId)
        .single();

      if (attendeeData && attendeeData.seat_confirmed && attendeeData.table_number) {
        return {
          id: `table-${attendeeData.table_number}-seat-${attendeeData.seat_number}`,
          table_number: attendeeData.table_number,
          seat_number: attendeeData.seat_number,
          attendee_id: attendeeId,
          status: 'confirmed',
          confirmed_at: attendeeData.seat_confirmed_at,
        };
      }
    } catch (e) {}

    // Fallback local check
    const currentSeats = generateMockSeats();
    return currentSeats.find((s) => s.attendee_id === attendeeId) || null;
  }, []);

  const reserveSeat = useCallback(async (seatId, attendeeId) => {
    setSeats((prev) => {
      const updated = prev.map((s) =>
        s.id === seatId ? { ...s, attendee_id: attendeeId, status: 'reserved' } : s
      );
      saveMockSeats(updated);
      return updated;
    });

    if (isValidUUID(seatId) && isValidUUID(attendeeId)) {
      try {
        await supabase
          .from('seats')
          .update({ attendee_id: attendeeId, status: 'reserved' })
          .eq('id', seatId);
      } catch (err) {}
    }
    return true;
  }, []);

  const confirmSeatWithAttendee = useCallback(
    async (seatId, attendeeId) => {
      if (!seatId || !attendeeId) {
        throw new Error('Missing seatId or attendeeId');
      }

      // Extract table_number and seat_number
      const seatRecord = seats.find((s) => s.id === seatId);
      let tableNumber = seatRecord?.table_number;
      let seatNumber = seatRecord?.seat_number;

      if (!tableNumber || !seatNumber) {
        const parts = String(seatId).split('-');
        tableNumber = parseInt(parts[1]) || 1;
        seatNumber = parseInt(parts[3]) || 1;
      }

      console.log(`[Supabase Sync] Updating attendee ${attendeeId} with Table ${tableNumber}, Seat ${seatNumber}`);

      // 1. ALWAYS update Supabase attendees table
      try {
        const nowIso = new Date().toISOString();
        
        let query = supabase
          .from('attendees')
          .update({
            seat_confirmed: true,
            table_number: tableNumber,
            seat_number: seatNumber,
            seat_confirmed_at: nowIso,
          });

        if (isValidUUID(attendeeId)) {
          query = query.eq('id', attendeeId);
        } else {
          query = query.eq('id', attendeeId);
        }

        const { data: updatedData, error: attendeeError } = await query.select();

        if (attendeeError) {
          console.error('[Supabase Sync Error] Failed to update attendees table:', attendeeError.message);
        } else {
          console.log('[Supabase Sync Success] Attendees table updated:', updatedData);
        }
      } catch (err) {
        console.error('[Supabase Sync Exception]:', err.message);
      }

      // 2. Also try updating seats table if UUID valid
      if (isValidUUID(seatId) && isValidUUID(attendeeId)) {
        try {
          await supabase
            .from('seats')
            .update({
              attendee_id: attendeeId,
              status: 'confirmed',
              confirmed_at: new Date().toISOString(),
            })
            .eq('id', seatId);
        } catch (e) {}
      }

      // 3. Update local state and mock seats
      setSeats((prev) => {
        const updated = prev.map((s) =>
          s.id === seatId
            ? {
                ...s,
                attendee_id: attendeeId,
                status: 'confirmed',
                confirmed_at: new Date().toISOString(),
              }
            : s
        );
        saveMockSeats(updated);
        return updated;
      });

      return true;
    },
    [seats]
  );

  const clearSeat = useCallback(async (seatId) => {
    setSeats((prev) => {
      const updated = prev.map((s) =>
        s.id === seatId ? { ...s, attendee_id: null, status: 'available' } : s
      );
      saveMockSeats(updated);
      return updated;
    });

    if (isValidUUID(seatId)) {
      try {
        await supabase
          .from('seats')
          .update({ attendee_id: null, status: 'available' })
          .eq('id', seatId);
      } catch (err) {}
    }
    return true;
  }, []);

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