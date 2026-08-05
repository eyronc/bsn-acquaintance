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

export function useSeats() {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFallbackMode, setIsFallbackMode] = useState(isTableMissingInSupabase);

  const fetchSeats = useCallback(async () => {
    if (isTableMissingInSupabase) {
      setSeats(generateMockSeats());
      setIsFallbackMode(true);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .order('table_number', { ascending: true })
        .order('seat_number', { ascending: true });

      if (error) throw error;
      
      // If table is empty in Supabase, fallback to generated seats
      if (!data || data.length === 0) {
        console.info('Supabase seats table is empty. Using fallback seats.');
        setSeats(generateMockSeats());
        setIsFallbackMode(true);
      } else {
        setSeats(data);
        setIsFallbackMode(false);
      }
    } catch (err) {
      isTableMissingInSupabase = true;
      setSeats(generateMockSeats());
      setIsFallbackMode(true);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeats();

    let channel;
    if (!isTableMissingInSupabase) {
      try {
        channel = supabase
          .channel('seats_channel')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'seats' },
            (payload) => {
              setSeats((prevSeats) => {
                if (payload.eventType === 'INSERT') {
                  return [...prevSeats, payload.new];
                } else if (payload.eventType === 'UPDATE') {
                  return prevSeats.map((seat) =>
                    seat.id === payload.new.id ? payload.new : seat
                  );
                } else if (payload.eventType === 'DELETE') {
                  return prevSeats.filter((seat) => seat.id !== payload.old.id);
                }
                return prevSeats;
              });
            }
          )
          .subscribe();
      } catch (e) {}
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchSeats]);

  const getUserSeat = useCallback(async (attendeeId) => {
    if (isTableMissingInSupabase || isFallbackMode) {
      const currentSeats = generateMockSeats();
      return currentSeats.find((s) => s.attendee_id === attendeeId) || null;
    }

    try {
      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .eq('attendee_id', attendeeId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (err) {
      const currentSeats = generateMockSeats();
      return currentSeats.find((s) => s.attendee_id === attendeeId) || null;
    }
  }, [isFallbackMode]);

  const reserveSeat = useCallback(async (seatId, attendeeId) => {
    if (isTableMissingInSupabase || isFallbackMode) {
      setSeats((prev) => {
        const updated = prev.map((s) =>
          s.id === seatId ? { ...s, attendee_id: attendeeId, status: 'reserved' } : s
        );
        saveMockSeats(updated);
        return updated;
      });
      return true;
    }

    try {
      const { error } = await supabase
        .from('seats')
        .update({ attendee_id: attendeeId, status: 'reserved' })
        .eq('id', seatId);

      if (error) throw error;
      return true;
    } catch (err) {
      setSeats((prev) => {
        const updated = prev.map((s) =>
          s.id === seatId ? { ...s, attendee_id: attendeeId, status: 'reserved' } : s
        );
        saveMockSeats(updated);
        return updated;
      });
      return true;
    }
  }, [isFallbackMode]);

  const confirmSeat = useCallback(async (seatId) => {
    if (isTableMissingInSupabase || isFallbackMode) {
      setSeats((prev) => {
        const updated = prev.map((s) =>
          s.id === seatId ? { ...s, status: 'confirmed', confirmed_at: new Date().toISOString() } : s
        );
        saveMockSeats(updated);
        return updated;
      });
      return true;
    }

    try {
      const { error } = await supabase
        .from('seats')
        .update({ status: 'confirmed', confirmed_at: new Date() })
        .eq('id', seatId);

      if (error) throw error;
      return true;
    } catch (err) {
      setSeats((prev) => {
        const updated = prev.map((s) =>
          s.id === seatId ? { ...s, status: 'confirmed', confirmed_at: new Date().toISOString() } : s
        );
        saveMockSeats(updated);
        return updated;
      });
      return true;
    }
  }, [isFallbackMode]);

  const clearSeat = useCallback(async (seatId) => {
    if (isTableMissingInSupabase || isFallbackMode) {
      setSeats((prev) => {
        const updated = prev.map((s) =>
          s.id === seatId ? { ...s, attendee_id: null, status: 'available' } : s
        );
        saveMockSeats(updated);
        return updated;
      });
      return true;
    }

    try {
      const { error } = await supabase
        .from('seats')
        .update({ attendee_id: null, status: 'available' })
        .eq('id', seatId);

      if (error) throw error;
      return true;
    } catch (err) {
      setSeats((prev) => {
        const updated = prev.map((s) =>
          s.id === seatId ? { ...s, attendee_id: null, status: 'available' } : s
        );
        saveMockSeats(updated);
        return updated;
      });
      return true;
    }
  }, [isFallbackMode]);

  return {
    seats,
    loading,
    error,
    isFallbackMode: isTableMissingInSupabase || isFallbackMode,
    fetchSeats,
    getUserSeat,
    reserveSeat,
    confirmSeat,
    clearSeat,
  };
}
