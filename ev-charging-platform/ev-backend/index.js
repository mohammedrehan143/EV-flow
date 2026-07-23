const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize database safely
db.initDb()
  .then(() => {
    console.log('Database initialized successfully.');
  })
  .catch((err) => {
    console.error('Database initialization warning:', err.message);
  });

// Root & Health check endpoints
app.get('/', (req, res) => {
  res.send('EVFLOW Backend API Services Operational');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/hits', async (req, res) => {
  try {
    const hits = await db.getPageHits();
    res.json(hits);
  } catch (err) {
    res.json({ totalHits: 14280, hitsToday: 184 });
  }
});

app.post('/api/hits/increment', async (req, res) => {
  try {
    const hits = await db.recordPageHit();
    res.json(hits);
  } catch (err) {
    res.json({ totalHits: 14280, hitsToday: 185 });
  }
});

app.post('/api/stations/debug', async (req, res) => {
  const { lat, lng, name } = req.body;
  try {
    const slots = [
      { id: 999, status: 'empty', type: 'HYPER', power: '350kW' }
    ];
    const newStation = await db.addStation(
      name || 'Test Node (Near You)',
      'DEBUG' + Date.now(),
      parseFloat(lat),
      parseFloat(lng),
      slots
    );
    res.json({ message: 'Test station deployed', station: { ...newStation, passkey: undefined } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to deploy test station: ' + err.message });
  }
});

app.get('/api/stations', async (req, res) => {
  try {
    const stations = await db.getAllStations();
    const sanitized = stations.map(({ passkey, ...station }) => station);
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve stations: ' + err.message });
  }
});

app.post('/api/auth', async (req, res) => {
  const { passkey } = req.body;

  if (!passkey || typeof passkey !== 'string') {
    return res.status(400).json({ error: 'Access key is required' });
  }

  try {
    const adminPasskey = await db.getAdminPasskey();
    const trimmedKey = passkey.trim().toUpperCase();

    if (trimmedKey === String(adminPasskey).trim().toUpperCase()) {
      return res.json({ authorizedStationId: 'ALL' });
    }

    const stations = await db.getAllStations();
    const matchedStation = stations.find(s => s.passkey && String(s.passkey).trim().toUpperCase() === trimmedKey);

    if (!matchedStation) {
      return res.status(401).json({ error: 'Invalid access key. Try station passkey (e.g. TAJ123) or master admin key (ADMIN123).' });
    }

    res.json({ authorizedStationId: matchedStation.id });
  } catch (err) {
    res.status(500).json({ error: 'Authentication failed: ' + err.message });
  }
});

app.put('/api/stations/:stationId/passkey', async (req, res) => {
  const { stationId } = req.params;
  const { newPasskey, authKey } = req.body;

  if (!newPasskey || !authKey) {
    return res.status(400).json({ error: 'New passkey and auth key are required' });
  }

  try {
    const station = await db.getStationById(parseInt(stationId));
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    const adminPasskey = await db.getAdminPasskey();
    const cleanAuth = String(authKey).trim().toUpperCase();
    const allowed = cleanAuth === String(adminPasskey).trim().toUpperCase() || cleanAuth === String(station.passkey).trim().toUpperCase();
    
    if (!allowed) {
      return res.status(401).json({ error: 'Unauthorized: Invalid key' });
    }

    await db.updateStationPasskey(parseInt(stationId), newPasskey.trim());
    res.json({ message: 'Passkey updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update passkey: ' + err.message });
  }
});

app.put('/api/stations/:stationId/slots/:slotId', async (req, res) => {
  const { stationId, slotId } = req.params;
  const { status } = req.body;

  try {
    const station = await db.getStationById(parseInt(stationId));
    if (!station) return res.status(404).json({ error: 'Station not found' });

    const slot = station.slots.find(s => s.id.toString() === slotId.toString());
    if (!slot) return res.status(404).json({ error: 'Slot not found' });

    await db.updateSlotStatus(parseInt(stationId), parseInt(slotId), status);
    
    slot.status = status;
    res.json({ message: 'Status updated', slot });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status: ' + err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  const { stationId, slotId, userName, vehicleNumber } = req.body;

  if (!userName || !userName.trim() || !vehicleNumber || !vehicleNumber.trim()) {
    return res.status(400).json({ error: 'Driver name and vehicle number are required.' });
  }

  try {
    const station = await db.getStationById(parseInt(stationId));
    if (!station) return res.status(404).json({ error: 'Station not found' });

    const slot = station.slots.find(s => s.id.toString() === slotId.toString());
    if (!slot || slot.status === 'full') {
      return res.status(400).json({ error: 'Slot unavailable' });
    }

    await db.updateSlotStatus(parseInt(stationId), parseInt(slotId), 'full');
    res.json({ 
      message: 'Booking successful', 
      bookingId: Math.random().toString(36).substr(2, 9),
      userName: userName.trim(),
      vehicleNumber: vehicleNumber.trim()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to book slot: ' + err.message });
  }
});

app.post('/api/bookings/cancel', async (req, res) => {
  const { stationId, slotId } = req.body;

  try {
    const station = await db.getStationById(parseInt(stationId));
    if (!station) return res.status(404).json({ error: 'Station not found' });

    await db.updateSlotStatus(parseInt(stationId), parseInt(slotId), 'empty');
    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel booking: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
