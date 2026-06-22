const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize database
db.initDb()
  .then(() => {
    console.log('Database initialized and seeded successfully.');
  })
  .catch((err) => {
    console.error('Failed to initialize SQLite database:', err);
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

  if (!passkey) {
    return res.status(400).json({ error: 'Access key is required' });
  }

  try {
    const adminPasskey = await db.getAdminPasskey();
    const trimmedKey = passkey.trim();

    if (trimmedKey === adminPasskey) {
      return res.json({ authorizedStationId: 'ALL' });
    }

    const stations = await db.getAllStations();
    const matchedStation = stations.find(s => s.passkey === trimmedKey);

    if (!matchedStation) {
      return res.status(401).json({ error: 'Invalid access key' });
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
    const allowed = authKey === adminPasskey || authKey === station.passkey;
    if (!allowed) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await db.updateStationPasskey(parseInt(stationId), newPasskey);
    res.json({ message: 'Passkey updated' });
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

    const slot = station.slots.find(s => s.id === parseInt(slotId));
    if (!slot) return res.status(404).json({ error: 'Slot not found' });

    await db.updateSlotStatus(parseInt(stationId), parseInt(slotId), status);
    
    slot.status = status;
    res.json({ message: 'Status updated', slot });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status: ' + err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  const { stationId, slotId, userId } = req.body;

  try {
    const station = await db.getStationById(parseInt(stationId));
    if (!station) return res.status(404).json({ error: 'Station not found' });

    const slot = station.slots.find(s => s.id === parseInt(slotId));
    if (!slot || slot.status === 'full') {
      return res.status(400).json({ error: 'Slot unavailable' });
    }

    await db.updateSlotStatus(parseInt(stationId), parseInt(slotId), 'full');
    res.json({ message: 'Booking successful', bookingId: Math.random().toString(36).substr(2, 9) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to book slot: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
