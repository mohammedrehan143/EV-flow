const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

let supabaseInstance = null;

function getSupabase() {
  if (supabaseInstance) return supabaseInstance;

  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    throw new Error('Supabase database client is not configured. Please fill in SUPABASE_URL and SUPABASE_KEY in your .env file.');
  }

  supabaseInstance = createClient(supabaseUrl, supabaseKey);
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
    }
  ]
};

async function initDb() {
  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    console.warn('WARNING: Supabase URL is not configured. Server running, but database connection is waiting for environment variables to be filled in .env.');
    return;
  }

  try {
    const supabase = getSupabase();

    // 1. Seed admin key
    const { data: adminKeyRow, error: adminErr } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'adminPasskey')
      .maybeSingle();

    if (adminErr) {
      console.warn('Could not query settings table. Ensure tables are created using supabase_schema.sql.');
      return;
    }

    if (!adminKeyRow) {
      await supabase
        .from('settings')
        .insert([{ key: 'adminPasskey', value: defaultData.adminPasskey }]);
    }

    // 2. Seed default stations if table is empty
    const { data: stations, error: countErr } = await supabase
      .from('stations')
      .select('id');

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
  } catch (err) {
    console.error('Error seeding Supabase:', err.message);
  }
}

async function getAdminPasskey() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'adminPasskey')
      .maybeSingle();

    return data ? data.value : 'ADMIN123';
  } catch (err) {
    return 'ADMIN123';
  }
}

async function getAllStations() {
  const supabase = getSupabase();
  
  const { data: stations, error: stationsErr } = await supabase
    .from('stations')
    .select('*');

  const { data: slots, error: slotsErr } = await supabase
    .from('slots')
    .select('*');

  if (stationsErr || slotsErr) {
    throw new Error(stationsErr?.message || slotsErr?.message || 'Database fetch error');
  }

  return (stations || []).map(station => {
    const stationSlots = (slots || [])
      .filter(s => s.station_id === station.id)
      .map(s => ({
        id: s.slot_index,
        status: s.status,
        type: s.type,
        power: s.power
      }));

    return {
      id: station.id,
      name: station.name,
      passkey: station.passkey,
      lat: station.lat,
      lng: station.lng,
      slots: stationSlots
    };
  });
}

async function getStationById(id) {
  const supabase = getSupabase();

  const { data: station, error: stationErr } = await supabase
    .from('stations')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!station) return null;

  const { data: slots, error: slotsErr } = await supabase
    .from('slots')
    .select('*')
    .eq('station_id', id);

  const stationSlots = (slots || []).map(s => ({
    id: s.slot_index,
    status: s.status,
    type: s.type,
    power: s.power
  }));

  return {
    id: station.id,
    name: station.name,
    passkey: station.passkey,
    lat: station.lat,
    lng: station.lng,
    slots: stationSlots
  };
}

async function addStation(name, passkey, lat, lng, slots) {
  const supabase = getSupabase();
  const id = Date.now();
  
  const { error: stationErr } = await supabase
    .from('stations')
    .insert([{ id, name, passkey, lat, lng }]);

  if (stationErr) throw stationErr;

  const slotsToInsert = slots.map(slot => ({
    station_id: id,
    slot_index: slot.id || Math.floor(Math.random() * 1000),
    status: slot.status,
    type: slot.type,
    power: slot.power
  }));

  const { error: slotsErr } = await supabase
    .from('slots')
    .insert(slotsToInsert);

  if (slotsErr) throw slotsErr;

  return getStationById(id);
}

async function updateStationPasskey(stationId, newPasskey) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('stations')
    .update({ passkey: newPasskey })
    .eq('id', stationId);

  if (error) throw error;
}

async function updateSlotStatus(stationId, slotId, status) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('slots')
    .update({ status: status })
    .eq('station_id', stationId)
    .eq('slot_index', slotId);

  if (error) throw error;
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
