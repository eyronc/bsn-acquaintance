import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';

// Generate fresh 60 seats (6 tables × 10 seats) with status 'available'
function createFreshBaseSeats() {
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
  return mockSeats;
}

function saveMockSeats(seatsData) {
  localStorage.setItem('bsn_mock_seats', JSON.stringify(seatsData));
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
        .order('table_number', { ascending: true })
        .order('seat_number', { ascending: true });

      if (!seatsErr && seatsData && seatsData.length > 0) {
        seatsData.forEach((dbSeat) => {
          baseSeats = baseSeats.map((s) => {
            if (s.table_number === dbSeat.table_number && s.seat_number === dbSeat.seat_number) {
              return {
                ...s,
                id: dbSeat.id || s.id,
                attendee_id: dbSeat.attendee_id,
                status: dbSeat.status || 'available',
                confirmed_at: dbSeat.confirmed_at,
              };
            }
            return s;
          });
        });
      }

      // 2. Fetch active confirmed attendees from Supabase attendees table
      const { data: attendeesData, error: attendeesError } = await supabase
        .from('attendees')
        .select('id, seat_confirmed, table_number, seat_number, seat_confirmed_at')
        .eq('seat_confirmed', true);

      if (!attendeesError && attendeesData && attendeesData.length > 0) {
        const confirmedMap = new Map();
        attendeesData.forEach((att) => {
          if (att.table_number && att.seat_number) {
            confirmedMap.set(`T${att.table_number}-S${att.seat_number}`, att);
          }
        });

        baseSeats = baseSeats.map((s) => {
          const key = `T${s.table_number}-S${s.seat_number}`;
          const att = confirmedMap.get(key);
          if (att) {
            return {
              ...s,
              attendee_id: att.id,
              status: 'confirmed',
              confirmed_at: att.seat_confirmed_at || s.confirmed_at,
            };
          }
          return s;
        });
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

    // Listen to REALTIME changes in Supabase attendees and seats tables
    let attendeesChannel;
    let seatsChannel;

    try {
      attendeesChannel = supabase
        .channel('realtime_attendees_sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'attendees' },
          (payload) => {
            console.log('[Realtime] Attendees changed:', payload.eventType);
            fetchSeats();
          }
        )
        .subscribe();

      seatsChannel = supabase
        .channel('realtime_seats_sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'seats' },
          (payload) => {
            console.log('[Realtime] Seats changed:', payload.eventType);
            fetchSeats();
          }
        )
        .subscribe();
    } catch (e) {}

    return () => {
      if (attendeesChannel) supabase.removeChannel(attendeesChannel);
      if (seatsChannel) supabase.removeChannel(seatsChannel);
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
          .eq('table_number', seatRecord.table_number)
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

      // Extract table_number and seat_number
      const seatRecord = seats.find((s) => s.id === seatId);
      let tableNumber = seatRecord?.table_number;
      let seatNumber = seatRecord?.seat_number;

      if (!tableNumber || !seatNumber) {
        const parts = String(seatId).split('-');
        tableNumber = parseInt(parts[1]) || 1;
        seatNumber = parseInt(parts[3]) || 1;
      }

      console.log(`[Supabase Sync] Updating Table ${tableNumber}, Seat ${seatNumber} for attendee ${attendeeId}`);

      const nowIso = new Date().toISOString();

      // 1. UPDATE attendees table in Supabase
      try {
        const { data: attData, error: attError } = await supabase
          .from('attendees')
          .update({
            seat_confirmed: true,
            table_number: tableNumber,
            seat_number: seatNumber,
            seat_confirmed_at: nowIso,
          })
          .eq('id', attendeeId)
          .select();

        if (attError) {
          console.error('[Supabase Attendees Error]:', attError.message);
        } else {
          console.log('[Supabase Attendees Success]:', attData);
        }
      } catch (err) {
        console.error('[Supabase Attendees Exception]:', err.message);
      }

      // 2. UPDATE seats table in Supabase (by table_number & seat_number)
      try {
        const { data: seatData, error: seatError } = await supabase
          .from('seats')
          .update({
            attendee_id: attendeeId,
            status: 'confirmed',
            confirmed_at: nowIso,
          })
          .eq('table_number', tableNumber)
          .eq('seat_number', seatNumber)
          .select();

        if (seatError) {
          console.error('[Supabase Seats Error]:', seatError.message);
        } else {
          console.log('[Supabase Seats Success]:', seatData);
        }
      } catch (err) {
        console.error('[Supabase Seats Exception]:', err.message);
      }

      // Re-fetch to update all local states and trigger real-time broadcasts
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
          .update({ attendee_id: null, status: 'available' })
          .eq('table_number', seatRecord.table_number)
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