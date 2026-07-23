const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

let supabaseInstance = null;
let useSupabase = false;

function getSupabase() {
  if (supabaseInstance) return supabaseInstance;

  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    throw new Error('Supabase database client is not configured.');
  }

  supabaseInstance = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
  return supabaseInstance;
}

const defaultData = {
  adminPasskey: 'ADMIN123',
  stations: [
    {
      id: 1,
      name: 'Taj West End Charging Hub',
      passkey: 'TAJ123',
      lat: 12.9786,
      lng: 77.5843,
      slots: [
        { id: 101, status: 'empty', type: 'DC Fast', power: '150kW' },
        { id: 102, status: 'empty', type: 'DC Fast', power: '150kW' },
        { id: 103, status: 'full', type: 'AC Type-2', power: '22kW' },
        { id: 104, status: 'empty', type: 'AC Type-2', power: '22kW' },
        { id: 105, status: 'empty', type: 'AC Type-2', power: '7.4kW' }
      ]
    },
    {
      id: 2,
      name: 'BESCOM KR Circle Station',
      passkey: 'BESCOM456',
      lat: 12.9748,
      lng: 77.5855,
      slots: [
        { id: 201, status: 'empty', type: 'DC Fast', power: '50kW' },
        { id: 202, status: 'empty', type: 'DC Fast', power: '50kW' },
        { id: 203, status: 'empty', type: 'AC Type-2', power: '22kW' },
        { id: 204, status: 'full', type: 'AC Type-2', power: '22kW' },
        { id: 205, status: 'empty', type: 'AC Type-2', power: '7.4kW' }
      ]
    },
    {
      id: 3,
      name: 'UB City Charging Point',
      passkey: 'UBCITY789',
      lat: 12.9722,
      lng: 77.5958,
      slots: [
        { id: 301, status: 'empty', type: 'DC Fast', power: '100kW' },
        { id: 302, status: 'empty', type: 'DC Fast', power: '100kW' },
        { id: 303, status: 'empty', type: 'DC Fast', power: '100kW' },
        { id: 304, status: 'full', type: 'AC Type-2', power: '22kW' },
        { id: 305, status: 'empty', type: 'AC Type-2', power: '22kW' }
      ]
    },
    {
      id: 4,
      name: 'Croma Koramangala Station',
      passkey: 'CROMA000',
      lat: 12.9344,
      lng: 77.6200,
      slots: [
        { id: 401, status: 'empty', type: 'DC Fast', power: '60kW' },
        { id: 402, status: 'empty', type: 'DC Fast', power: '60kW' },
        { id: 403, status: 'empty', type: 'AC Type-2', power: '22kW' },
        { id: 404, status: 'empty', type: 'AC Type-2', power: '7.4kW' },
        { id: 405, status: 'empty', type: 'AC Type-2', power: '7.4kW' }
      ]
    },
    {
      id: 5,
      name: 'Phoenix Marketcity Station',
      passkey: 'PHOENIX555',
      lat: 12.9958,
      lng: 77.6963,
      slots: [
        { id: 501, status: 'empty', type: 'DC Fast', power: '120kW' },
        { id: 502, status: 'empty', type: 'DC Fast', power: '120kW' },
        { id: 503, status: 'empty', type: 'AC Type-2', power: '22kW' },
        { id: 504, status: 'empty', type: 'AC Type-2', power: '22kW' },
        { id: 505, status: 'full', type: 'AC Type-2', power: '7.4kW' }
      ]
    },
    {
      id: 6,
      name: 'Electronic City EZ Charge',
      passkey: 'ECITY888',
      lat: 12.8468,
      lng: 77.6766,
      slots: [
        { id: 601, status: 'empty', type: 'DC Fast', power: '150kW' },
        { id: 602, status: 'empty', type: 'DC Fast', power: '150kW' },
        { id: 603, status: 'empty', type: 'DC Fast', power: '150kW' },
        { id: 604, status: 'empty', type: 'AC Type-2', power: '22kW' },
        { id: 605, status: 'empty', type: 'AC Type-2', power: '22kW' }
      ]
    },
    {
      id: 7,
      name: 'Jayanagar 4th Block Node',
      passkey: 'JAYANAGAR222',
      lat: 12.9290,
      lng: 77.5828,
      slots: [
        { id: 701, status: 'empty', type: 'DC Fast', power: '50kW' },
        { id: 702, status: 'empty', type: 'AC Type-2', power: '22kW' },
        { id: 703, status: 'empty', type: 'AC Type-2', power: '22kW' },
        { id: 704, status: 'empty', type: 'AC Type-2', power: '7.4kW' },
        { id: 705, status: 'empty', type: 'AC Type-2', power: '7.4kW' }
      ]
    },
    {
      id: 8,
      name: 'Shell Recharge Station',
      passkey: 'SHELL111',
      lat: 13.1043,
      lng: 77.6045,
      slots: [
        { id: 801, status: 'empty', type: 'DC Fast', power: '60kW' },
        { id: 802, status: 'empty', type: 'DC Fast', power: '60kW' },
        { id: 803, status: 'empty', type: 'AC Type-2', power: '22kW' },
        { id: 804, status: 'empty', type: 'AC Type-2', power: '22kW' },
        { id: 805, status: 'full', type: 'AC Type-2', power: '7.4kW' }
      ]
    },
    {
      id: 9,
      name: 'GLIDA Mandovi Motors Station',
      passkey: 'GLIDA222',
      lat: 13.1008,
      lng: 77.5963,
      slots: [
        { id: 901, status: 'empty', type: 'DC Fast', power: '50kW' },
        { id: 902, status: 'empty', type: 'DC Fast', power: '50kW' },
        { id: 903, status: 'empty', type: 'AC Type-2', power: '22kW' },
        { id: 904, status: 'empty', type: 'AC Type-2', power: '22kW' },
        { id: 905, status: 'empty', type: 'AC Type-2', power: '22kW' }
      ]
    }
  ]
};

const fallbackStations = JSON.parse(JSON.stringify(defaultData.stations));

async function initDb() {
  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    console.warn('WARNING: Supabase URL is not configured. Using in-memory fallback data.');
    useSupabase = false;
    return;
  }

  try {
    const supabase = getSupabase();

    const { data: adminKeyRow, error: adminErr } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'adminPasskey')
      .maybeSingle();

    if (adminErr) {
      console.warn('Could not query settings table. Using in-memory fallback data:', adminErr.message);
      useSupabase = false;
      return;
    }

    if (!adminKeyRow) {
      await supabase
        .from('settings')
        .insert([{ key: 'adminPasskey', value: defaultData.adminPasskey }]);
    }

    const { data: stations, error: stationsErr } = await supabase
      .from('stations')
      .select('id');

    if (stationsErr) {
      console.warn('Could not query stations table. Using in-memory fallback data:', stationsErr.message);
      useSupabase = false;
      return;
    }

    if (stations && stations.length === 0) {
      console.log('Seeding Supabase database with default stations...');
      for (const station of defaultData.stations) {
        await supabase
          .from('stations')
          .insert([{
            id: station.id,
            name: station.name,
            passkey: station.passkey,
            lat: station.lat,
            lng: station.lng
          }]);

        const slotsToInsert = station.slots.map(slot => ({
          station_id: station.id,
          slot_index: slot.id,
          status: slot.status,
          type: slot.type,
          power: slot.power
        }));

        await supabase
          .from('slots')
          .insert(slotsToInsert);
      }
      console.log('Supabase seeding complete.');
    }

    useSupabase = true;
    console.log('Connected to Supabase successfully.');
  } catch (err) {
    console.warn('Supabase connection failed, using in-memory fallback data:', err.message);
    useSupabase = false;
  }
}

async function getAdminPasskey() {
  if (!useSupabase) return defaultData.adminPasskey;

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'adminPasskey')
      .maybeSingle();

    if (error || !data) return defaultData.adminPasskey;
    return data.value || defaultData.adminPasskey;
  } catch (err) {
    return defaultData.adminPasskey;
  }
}

async function getAllStations() {
  if (!useSupabase) {
    return JSON.parse(JSON.stringify(fallbackStations));
  }

  try {
    const supabase = getSupabase();

    const { data: stations, error: stationsErr } = await supabase
      .from('stations')
      .select('*')
      .order('id', { ascending: true });

    const { data: slots, error: slotsErr } = await supabase
      .from('slots')
      .select('*')
      .order('slot_index', { ascending: true });

    if (stationsErr || slotsErr || !stations) {
      console.warn('Supabase fetch error, using in-memory fallback stations:', stationsErr?.message || slotsErr?.message);
      useSupabase = false;
      return JSON.parse(JSON.stringify(fallbackStations));
    }

    return stations.map(station => {
      const stationSlots = (slots || [])
        .filter(s => String(s.station_id) === String(station.id))
        .map(s => ({
          id: Number(s.slot_index),
          status: s.status,
          type: s.type,
          power: s.power
        }));

      return {
        id: Number(station.id),
        name: station.name,
        passkey: station.passkey,
        lat: Number(station.lat),
        lng: Number(station.lng),
        slots: stationSlots
      };
    });
  } catch (err) {
    console.warn('Supabase query failed, using in-memory fallback stations:', err.message);
    useSupabase = false;
    return JSON.parse(JSON.stringify(fallbackStations));
  }
}

async function getStationById(id) {
  const numericId = Number(id);
  if (!useSupabase) {
    return fallbackStations.find(s => Number(s.id) === numericId) || null;
  }

  try {
    const supabase = getSupabase();

    const { data: station, error: stationErr } = await supabase
      .from('stations')
      .select('*')
      .eq('id', numericId)
      .maybeSingle();

    if (stationErr || !station) {
      return fallbackStations.find(s => Number(s.id) === numericId) || null;
    }

    const { data: slots } = await supabase
      .from('slots')
      .select('*')
      .eq('station_id', numericId);

    const stationSlots = (slots || []).map(s => ({
      id: Number(s.slot_index),
      status: s.status,
      type: s.type,
      power: s.power
    }));

    return {
      id: Number(station.id),
      name: station.name,
      passkey: station.passkey,
      lat: Number(station.lat),
      lng: Number(station.lng),
      slots: stationSlots
    };
  } catch (err) {
    console.warn('Supabase getStationById failed, using fallback:', err.message);
    return fallbackStations.find(s => Number(s.id) === numericId) || null;
  }
}

async function addStation(name, passkey, lat, lng, slots) {
  const id = Date.now();
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  const newStation = {
    id,
    name,
    passkey,
    lat: parsedLat,
    lng: parsedLng,
    slots: slots.map(slot => ({
      id: Number(slot.id || Math.floor(Math.random() * 1000)),
      status: slot.status || 'empty',
      type: slot.type || 'DC Fast',
      power: slot.power || '100kW'
    }))
  };

  fallbackStations.push(newStation);

  if (!useSupabase) {
    return JSON.parse(JSON.stringify(newStation));
  }

  try {
    const supabase = getSupabase();
    const { error: stationErr } = await supabase
      .from('stations')
      .insert([{ id, name, passkey, lat: parsedLat, lng: parsedLng }]);

    if (stationErr) {
      console.warn('Supabase addStation error:', stationErr.message);
      return JSON.parse(JSON.stringify(newStation));
    }

    const slotsToInsert = slots.map(slot => ({
      station_id: id,
      slot_index: Number(slot.id || Math.floor(Math.random() * 1000)),
      status: slot.status || 'empty',
      type: slot.type || 'DC Fast',
      power: slot.power || '100kW'
    }));

    const { error: slotsErr } = await supabase
      .from('slots')
      .insert(slotsToInsert);

    if (slotsErr) {
      console.warn('Supabase addStation slots insert error:', slotsErr.message);
    }
  } catch (err) {
    console.warn('Supabase addStation failed, saved to fallback:', err.message);
  }

  return JSON.parse(JSON.stringify(newStation));
}

async function updateStationPasskey(stationId, newPasskey) {
  const numericId = Number(stationId);
  const localStation = fallbackStations.find(s => Number(s.id) === numericId);
  if (localStation) {
    localStation.passkey = newPasskey;
  }

  if (!useSupabase) return;

  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('stations')
      .update({ passkey: newPasskey })
      .eq('id', numericId);

    if (error) console.warn('Supabase updateStationPasskey error:', error.message);
  } catch (err) {
    console.warn('Supabase updateStationPasskey failed:', err.message);
  }
}

async function updateSlotStatus(stationId, slotId, status) {
  const numericStationId = Number(stationId);
  const numericSlotId = Number(slotId);

  const localStation = fallbackStations.find(s => Number(s.id) === numericStationId);
  if (localStation) {
    const localSlot = localStation.slots.find(s => Number(s.id) === numericSlotId);
    if (localSlot) {
      localSlot.status = status;
    }
  }

  if (!useSupabase) return;

  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('slots')
      .update({ status: status })
      .eq('station_id', numericStationId)
      .eq('slot_index', numericSlotId);

    if (error) console.warn('Supabase updateSlotStatus error:', error.message);
  } catch (err) {
    console.warn('Supabase updateSlotStatus failed:', err.message);
  }
}

module.exports = {
  initDb,
  getAdminPasskey,
  getAllStations,
  getStationById,
  addStation,
  updateStationPasskey,
  updateSlotStatus
};
