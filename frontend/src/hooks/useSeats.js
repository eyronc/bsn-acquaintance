import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { normalizeSocietyName } from '../utils/societyTheme';

// 12 Official Societies configuration matching stage-final-layout.png
export const STAGE_TABLE_CONFIG = [
  // LEFT SIDE
  { code: 'MH', row: 'MH', maxTables: 13, society: 'Mental Health Society', side: 'Left', label: 'Left Wing • Tables MH-01 to MH-13' },
  { code: 'MC', row: 'MC', maxTables: 13, society: 'Maternal and Child Society', side: 'Left', label: 'Left Wing • Tables MC-01 to MC-13' },
  { code: 'HL', row: 'HL', maxTables: 13, society: 'Healthy Lung Society', side: 'Left', label: 'Left Wing • Tables HL-01 to HL-13' },
  { code: 'G',  row: 'G',  maxTables: 13, society: 'Gerontology Society', side: 'Left', label: 'Left Wing • Tables G-01 to G-13' },
  { code: 'DN', row: 'DN', maxTables: 13, society: 'Disaster Nursing Society', side: 'Left', label: 'Left Wing • Tables DN-01 to DN-13' },
  { code: 'D',  row: 'D',  maxTables: 12, society: 'Diabetology Society', side: 'Left', label: 'Left Wing • Tables D-01 to D-12' },

  // RIGHT SIDE
  { code: 'TH', row: 'TH', maxTables: 12, society: 'Traditional Hilot Society', side: 'Right', label: 'Right Wing • Tables TH-01 to TH-12' },
  { code: 'PH', row: 'PH', maxTables: 12, society: 'Public Health Nursing Society', side: 'Right', label: 'Right Wing • Tables PH-01 to PH-12' },
  { code: 'I',  row: 'I',  maxTables: 13, society: 'Nursing Informatics Society', side: 'Right', label: 'Right Wing • Tables I-01 to I-13' },
  { code: 'H',  row: 'H',  maxTables: 13, society: 'Nurses Against Hypertension Society', side: 'Right', label: 'Right Wing • Tables H-01 to H-13' },
  { code: 'O',  row: 'O',  maxTables: 13, society: 'Oncology Nursing Society', side: 'Right', label: 'Right Wing • Tables O-01 to O-13' },
  { code: 'R',  row: 'R',  maxTables: 12, society: 'Renal Nursing Society', side: 'Right', label: 'Right Wing • Tables R-01 to R-12' },
];

// Shared decimal tables configuration: 8 shared physical tables (10 seats each)
export const SHARED_TABLES_CONFIG = [
  // Right Side Shared Tables
  {
    tableCode: 'I-13.1 / H-01.9',
    soc1: 'Nursing Informatics Society',
    tableNumber1: 13,
    slots1: 1, // Seats 1..1
    soc2: 'Nurses Against Hypertension Society',
    tableNumber2: 1,
    slots2: 9, // Seats 2..10
  },
  {
    tableCode: 'H-13.2 / O-01.8',
    soc1: 'Nurses Against Hypertension Society',
    tableNumber1: 13,
    slots1: 2, // Seats 1..2
    soc2: 'Oncology Nursing Society',
    tableNumber2: 1,
    slots2: 8, // Seats 3..10
  },
  {
    tableCode: 'O-13.3 / R-01.7',
    soc1: 'Oncology Nursing Society',
    tableNumber1: 13,
    slots1: 3, // Seats 1..3
    soc2: 'Renal Nursing Society',
    tableNumber2: 1,
    slots2: 7, // Seats 4..10
  },

  // Left Side Shared Tables
  {
    tableCode: 'MH-13.2 / MC-01.8',
    soc1: 'Mental Health Society',
    tableNumber1: 13,
    slots1: 2, // Seats 1..2
    soc2: 'Maternal and Child Society',
    tableNumber2: 1,
    slots2: 8, // Seats 3..10
  },
  {
    tableCode: 'MC-13.4 / HL-01.6',
    soc1: 'Maternal and Child Society',
    tableNumber1: 13,
    slots1: 4, // Seats 1..4
    soc2: 'Healthy Lung Society',
    tableNumber2: 1,
    slots2: 6, // Seats 5..10
  },
  {
    tableCode: 'HL-13.5 / G-01.5',
    soc1: 'Healthy Lung Society',
    tableNumber1: 13,
    slots1: 5, // Seats 1..5
    soc2: 'Gerontology Society',
    tableNumber2: 1,
    slots2: 5, // Seats 6..10
  },
  {
    tableCode: 'G-13.6 / DN-01.4',
    soc1: 'Gerontology Society',
    tableNumber1: 13,
    slots1: 6, // Seats 1..6
    soc2: 'Disaster Nursing Society',
    tableNumber2: 1,
    slots2: 4, // Seats 7..10
  },
  {
    tableCode: 'DN-13.7 / D-01.3',
    soc1: 'Disaster Nursing Society',
    tableNumber1: 13,
    slots1: 7, // Seats 1..7
    soc2: 'Diabetology Society',
    tableNumber2: 1,
    slots2: 3, // Seats 8..10
  },
];

// Helper to format table code (e.g. "TH-01", "I-02")
export function formatTableCode(rowLetter, number) {
  return `${rowLetter}-${String(number).padStart(2, '0')}`;
}

// Seat ID generator (e.g. "table-I-02-seat-06" or "table-I-13.1 / H-01.9-seat-01")
export const formatSeatId = (tableCode, seatNumber) => {
  const sPad = String(seatNumber).padStart(2, '0');
  return `table-${tableCode}-seat-${sPad}`;
};

export const getEffectiveTableCode = (att) => {
  if (!att) return 'I-01';
  if (att.table_code) return att.table_code;
  const socName = att.society || 'Nursing Informatics Society';
  const conf = STAGE_TABLE_CONFIG.find(
    (c) => normalizeSocietyName(c.society) === normalizeSocietyName(socName)
  );
  const prefix = conf ? conf.code : 'I';
  return `${prefix}-${String(att.table_number || 1).padStart(2, '0')}`;
};

// Generate base seats for all 144 tables (1,440 seats) matching stage-final-layout.png
export function createFreshBaseSeats() {
  const mockSeats = [];
  const sharedTableCodes = new Set(SHARED_TABLES_CONFIG.map((s) => s.tableCode));

  // 1. Generate standalone non-shared tables
  // TH: 1 to 12
  for (let t = 1; t <= 12; t++) {
    const code = formatTableCode('TH', t);
    for (let s = 1; s <= 10; s++) {
      mockSeats.push({
        id: formatSeatId(code, s),
        table_code: code,
        table_number: t,
        seat_number: s,
        society: 'Traditional Hilot Society',
        row_letter: 'TH',
        attendee_id: null,
        status: 'available',
        confirmed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  // PH: 1 to 12
  for (let t = 1; t <= 12; t++) {
    const code = formatTableCode('PH', t);
    for (let s = 1; s <= 10; s++) {
      mockSeats.push({
        id: formatSeatId(code, s),
        table_code: code,
        table_number: t,
        seat_number: s,
        society: 'Public Health Nursing Society',
        row_letter: 'PH',
        attendee_id: null,
        status: 'available',
        confirmed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  // I: 1 to 12 (Table 13 is shared)
  for (let t = 1; t <= 12; t++) {
    const code = formatTableCode('I', t);
    for (let s = 1; s <= 10; s++) {
      mockSeats.push({
        id: formatSeatId(code, s),
        table_code: code,
        table_number: t,
        seat_number: s,
        society: 'Nursing Informatics Society',
        row_letter: 'I',
        attendee_id: null,
        status: 'available',
        confirmed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  // H: 2 to 12 (Table 1 & Table 13 are shared)
  for (let t = 2; t <= 12; t++) {
    const code = formatTableCode('H', t);
    for (let s = 1; s <= 10; s++) {
      mockSeats.push({
        id: formatSeatId(code, s),
        table_code: code,
        table_number: t,
        seat_number: s,
        society: 'Nurses Against Hypertension Society',
        row_letter: 'H',
        attendee_id: null,
        status: 'available',
        confirmed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  // O: 2 to 12 (Table 1 & Table 13 are shared)
  for (let t = 2; t <= 12; t++) {
    const code = formatTableCode('O', t);
    for (let s = 1; s <= 10; s++) {
      mockSeats.push({
        id: formatSeatId(code, s),
        table_code: code,
        table_number: t,
        seat_number: s,
        society: 'Oncology Nursing Society',
        row_letter: 'O',
        attendee_id: null,
        status: 'available',
        confirmed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  // R: 2 to 12 (Table 1 is shared)
  for (let t = 2; t <= 12; t++) {
    const code = formatTableCode('R', t);
    for (let s = 1; s <= 10; s++) {
      mockSeats.push({
        id: formatSeatId(code, s),
        table_code: code,
        table_number: t,
        seat_number: s,
        society: 'Renal Nursing Society',
        row_letter: 'R',
        attendee_id: null,
        status: 'available',
        confirmed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  // MH: 1 to 12 (Table 13 is shared)
  for (let t = 1; t <= 12; t++) {
    const code = formatTableCode('MH', t);
    for (let s = 1; s <= 10; s++) {
      mockSeats.push({
        id: formatSeatId(code, s),
        table_code: code,
        table_number: t,
        seat_number: s,
        society: 'Mental Health Society',
        row_letter: 'MH',
        attendee_id: null,
        status: 'available',
        confirmed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  // MC: 2 to 12 (Table 1 & Table 13 are shared)
  for (let t = 2; t <= 12; t++) {
    const code = formatTableCode('MC', t);
    for (let s = 1; s <= 10; s++) {
      mockSeats.push({
        id: formatSeatId(code, s),
        table_code: code,
        table_number: t,
        seat_number: s,
        society: 'Maternal and Child Society',
        row_letter: 'MC',
        attendee_id: null,
        status: 'available',
        confirmed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  // HL: 2 to 12 (Table 1 & Table 13 are shared)
  for (let t = 2; t <= 12; t++) {
    const code = formatTableCode('HL', t);
    for (let s = 1; s <= 10; s++) {
      mockSeats.push({
        id: formatSeatId(code, s),
        table_code: code,
        table_number: t,
        seat_number: s,
        society: 'Healthy Lung Society',
        row_letter: 'HL',
        attendee_id: null,
        status: 'available',
        confirmed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  // G: 2 to 12 (Table 1 & Table 13 are shared)
  for (let t = 2; t <= 12; t++) {
    const code = formatTableCode('G', t);
    for (let s = 1; s <= 10; s++) {
      mockSeats.push({
        id: formatSeatId(code, s),
        table_code: code,
        table_number: t,
        seat_number: s,
        society: 'Gerontology Society',
        row_letter: 'G',
        attendee_id: null,
        status: 'available',
        confirmed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  // DN: 2 to 12 (Table 1 & Table 13 are shared)
  for (let t = 2; t <= 12; t++) {
    const code = formatTableCode('DN', t);
    for (let s = 1; s <= 10; s++) {
      mockSeats.push({
        id: formatSeatId(code, s),
        table_code: code,
        table_number: t,
        seat_number: s,
        society: 'Disaster Nursing Society',
        row_letter: 'DN',
        attendee_id: null,
        status: 'available',
        confirmed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  // D: 2 to 12 (Table 1 is shared)
  for (let t = 2; t <= 12; t++) {
    const code = formatTableCode('D', t);
    for (let s = 1; s <= 10; s++) {
      mockSeats.push({
        id: formatSeatId(code, s),
        table_code: code,
        table_number: t,
        seat_number: s,
        society: 'Diabetology Society',
        row_letter: 'D',
        attendee_id: null,
        status: 'available',
        confirmed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  // 2. Generate the 8 Shared Decimal Tables (10 seats each)
  SHARED_TABLES_CONFIG.forEach((cfg) => {
    for (let s = 1; s <= 10; s++) {
      const isSoc1 = s <= cfg.slots1;
      const soc = isSoc1 ? cfg.soc1 : cfg.soc2;
      const tNum = isSoc1 ? cfg.tableNumber1 : cfg.tableNumber2;
      const row = isSoc1 ? cfg.tableCode.split('-')[0] : cfg.tableCode.split('/ ')[1].split('-')[0];

      mockSeats.push({
        id: formatSeatId(cfg.tableCode, s),
        table_code: cfg.tableCode,
        table_number: tNum,
        seat_number: s,
        society: soc,
        row_letter: row,
        attendee_id: null,
        status: 'available',
        confirmed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  });

  return mockSeats;
}

function saveMockSeats(seatsData) {
  try {
    localStorage.setItem('bsn_mock_seats_stage_v2', JSON.stringify(seatsData));
  } catch (e) {}
}

const RESERVATION_TTL_MS = 20 * 60 * 1000;

export function useSeats() {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSeats = useCallback(async () => {
    try {
      setError(null);
      let baseSeats = createFreshBaseSeats();

      // 1. Fetch from seats table in Supabase in 2 parallel batches (bypassing the 1000 postgrest limit)
      const [batch1, batch2] = await Promise.all([
        supabase
          .from('seats')
          .select('*')
          .range(0, 999)
          .order('table_code', { ascending: true })
          .order('seat_number', { ascending: true }),
        supabase
          .from('seats')
          .select('*')
          .range(1000, 1999)
          .order('table_code', { ascending: true })
          .order('seat_number', { ascending: true }),
      ]);

      const seatsData = [...(batch1.data || []), ...(batch2.data || [])];

      if (seatsData && seatsData.length > 0) {
        const dbSeatsMap = new Map();
        seatsData.forEach((s) => {
          const key = `${s.table_code}-S${s.seat_number}`;
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
          const code = getEffectiveTableCode(att);
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
            const code = getEffectiveTableCode(att);
            const key = `${code}-S${att.seat_number}`;
            if (!confirmedMap.has(key)) {
              confirmedMap.set(key, att);
            }
          }
        });
      } catch (e) {}

      // Synchronize baseSeats with confirmed attendees
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
        }
        // Held reservation (not yet confirmed)
        if (s.status === 'reserved' && s.attendee_id) {
          const reservedAt = s.confirmed_at ? new Date(s.confirmed_at).getTime() : 0;
          if (reservedAt && Date.now() - reservedAt < RESERVATION_TTL_MS) {
            return s;
          }
          orphanedSeatsToReset.push(s);
          return { ...s, attendee_id: null, status: 'available', confirmed_at: null };
        }
        // Genuine orphan: status says confirmed or has attendee_id but no matching attendee
        if (s.status === 'confirmed' || s.attendee_id) {
          orphanedSeatsToReset.push(s);
        }
        return {
          ...s,
          attendee_id: null,
          status: 'available',
          confirmed_at: null,
        };
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
        .channel('realtime_attendees_sync_v3')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'attendees' }, () => {
          fetchSeats();
        })
        .subscribe();

      seatsChannel = supabase
        .channel('realtime_seats_sync_v3')
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
        .maybeSingle();

      if (attendeeData && attendeeData.seat_confirmed) {
        const tableCode = getEffectiveTableCode(attendeeData);
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
        const tableCode = getEffectiveTableCode(localAtt);
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
    const seatRecord = seats.find((s) => s.id === seatId);

    // Optimistic local update
    setSeats((prev) => {
      const updated = prev.map((s) =>
        s.id === seatId ? { ...s, attendee_id: attendeeId, status: 'reserved' } : s
      );
      saveMockSeats(updated);
      return updated;
    });

    if (!seatRecord) return true;

    const revert = () => {
      setSeats((prev) => {
        const reverted = prev.map((s) =>
          s.id === seatId ? { ...s, attendee_id: null, status: 'available' } : s
        );
        saveMockSeats(reverted);
        return reverted;
      });
    };

    try {
      const { data, error } = await supabase
        .from('seats')
        .update({ attendee_id: attendeeId, status: 'reserved', confirmed_at: new Date().toISOString() })
        .eq('table_code', seatRecord.table_code)
        .eq('seat_number', seatRecord.seat_number)
        .eq('status', 'available')
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        revert();
        throw new Error('That seat was just taken. Please choose another.');
      }
    } catch (err) {
      if (err?.message?.includes('just taken')) throw err;
      console.warn('[reserveSeat] could not verify with DB, kept optimistic hold:', err?.message);
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
        // table-CODE-seat-NUM
        tableCode = parts.slice(1, -2).join('-');
        seatNumber = parseInt(parts[parts.length - 1], 10) || 1;
        tableNumber = 1;
      }

      const nowIso = new Date().toISOString();

      // 0. Guard: has another attendee already confirmed this exact seat?
      try {
        const { data: clash } = await supabase
          .from('attendees')
          .select('id')
          .eq('seat_confirmed', true)
          .eq('table_code', tableCode)
          .eq('seat_number', seatNumber)
          .neq('id', attendeeId)
          .limit(1);
        if (clash && clash.length > 0) {
          throw new Error('That seat was just confirmed by someone else. Please choose another.');
        }
      } catch (err) {
        if (err?.message?.includes('just confirmed')) throw err;
      }

      // 1. UPDATE attendees table in Supabase
      let dbConfirmed = false;
      try {
        const { error: attErr } = await supabase
          .from('attendees')
          .update({
            seat_confirmed: true,
            table_code: tableCode,
            table_number: tableNumber,
            seat_number: seatNumber,
            seat_confirmed_at: nowIso,
          })
          .eq('id', attendeeId);
        if (attErr) throw new Error(attErr.message);
        dbConfirmed = true;
      } catch (err) {
        console.error('[confirm] attendees update failed:', err?.message);
      }

      // 2. UPDATE seats table in Supabase
      try {
        const { error: seatErr } = await supabase
          .from('seats')
          .update({
            attendee_id: attendeeId,
            status: 'confirmed',
            confirmed_at: nowIso,
          })
          .eq('table_code', tableCode)
          .eq('seat_number', seatNumber);
        if (seatErr) console.warn('[confirm] seats mirror update failed:', seatErr.message);
      } catch (err) {
        console.warn('[confirm] seats mirror update threw:', err?.message);
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

      if (!dbConfirmed) {
        let localConfirmed = false;
        try {
          const local = JSON.parse(localStorage.getItem('bsn_mock_attendees') || '[]');
          localConfirmed = local.some((a) => a.id === attendeeId && a.seat_confirmed);
        } catch (e) {}
        if (!localConfirmed) {
          throw new Error('We could not save your seat. Please check your connection and try again.');
        }
      }

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