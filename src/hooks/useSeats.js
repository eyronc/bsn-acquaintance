import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

export function useSeats() {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSeats = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .order('table_number', { ascending: true })
        .order('seat_number', { ascending: true });

      if (error) throw error;
      setSeats(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();

    const subscription = supabase
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

    return () => subscription.unsubscribe();
  }, []);

  const getUserSeat = async (attendeeId) => {
    try {
      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .eq('attendee_id', attendeeId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (err) {
      console.error('Error fetching user seat:', err);
      return null;
    }
  };

  const reserveSeat = async (seatId, attendeeId) => {
    try {
      const { error } = await supabase
        .from('seats')
        .update({ attendee_id: attendeeId, status: 'reserved' })
        .eq('id', seatId);

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const confirmSeat = async (seatId) => {
    try {
      const { error } = await supabase
        .from('seats')
        .update({ status: 'confirmed', confirmed_at: new Date() })
        .eq('id', seatId);

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const clearSeat = async (seatId) => {
    try {
      const { error } = await supabase
        .from('seats')
        .update({ attendee_id: null, status: 'available' })
        .eq('id', seatId);

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    seats,
    loading,
    error,
    fetchSeats,
    getUserSeat,
    reserveSeat,
    confirmSeat,
    clearSeat,
  };
}
