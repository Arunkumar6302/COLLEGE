const axios = require('axios');
const GPSLog = require('../models/GPSLog');

const driverCache = new Map(); // busId => { lat, lng, timestamp }
let globalTsValid = false;
let globalTsLat = null;
let globalTsLng = null;

// Expose a method to handle incoming Socket driver locations
exports.updateDriverLocation = (busId, lat, lng, io) => {
    if (!busId) return; // Prevent crash if driver emits without selecting a mission

    const idStr = busId.toString();
    driverCache.set(idStr, { lat, lng, timestamp: Date.now() });

    // Immediate passthrough for smooth driver tracking if IoT is offline!
    if (!globalTsValid) {
        GPSLog.create({ busId: idStr, latitude: lat, longitude: lng, source: 'driver' }).catch(()=>{});
        io.to(`bus_${idStr}`).emit('busLocationUpdate', {
            busId: idStr, latitude: lat, longitude: lng, source: 'driver'
        });
    }
};

// Main loop for priority resolution
exports.startService = (io) => {
    setInterval(async () => {
        if (driverCache.size === 0) return; // No active buses to track

        try {
            const channelId = process.env.THINGSPEAK_CHANNEL_ID;
            const readKey = process.env.THINGSPEAK_READ_API_KEY;
            
            let tsValid = false;
            let tsLat = null;
            let tsLng = null;

            // 1. Fetch GPS from ThingSpeak
            if (channelId && readKey) {
                const url = `https://api.thingspeak.com/channels/${channelId}/feeds/last.json?api_key=${readKey}`;
                const res = await axios.get(url).catch(() => null);
                
                if (res && res.data) {
                    const { field1, field2, created_at } = res.data;
                    
                    // 2. Validate ThingSpeak Data
                    if (field1 != null && field2 != null) {
                        const parsedLat = parseFloat(field1);
                        const parsedLng = parseFloat(field2);
                        
                        // Check valid numbers and recent timestamp (last 60 secs)
                        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
                            const tsTime = new Date(created_at).getTime();
                            const timeDiff = Date.now() - tsTime;
                            
                            if (timeDiff <= 60000) { // 60 seconds 
                                tsValid = true;
                                tsLat = parsedLat;
                                tsLng = parsedLng;
                            }
                        }
                    }
                }
            }

            // Sync globally to allow fast driver passthrough
            globalTsValid = tsValid;
            globalTsLat = tsLat;
            globalTsLng = tsLng;

            // Perform check for each active bus
            for (const [busId, driverData] of driverCache.entries()) {
                let finalSource = '';
                let finalLat = null;
                let finalLng = null;

                // 3. Priority Logic
                if (tsValid) {
                    finalSource = 'thingspeak';
                    finalLat = tsLat;
                    finalLng = tsLng;
                } else {
                    // Handled synchronously by immediate callback above!
                    continue;
                }

                if (finalLat !== null && finalLng !== null) {
                    // Save to MongoDB
                    await GPSLog.create({
                        busId,
                        latitude: finalLat,
                        longitude: finalLng,
                        source: finalSource
                    }).catch(err => console.error("GPSLog Save Error:", err));

                    // Emit Real-time Update
                    io.to(`bus_${busId}`).emit('busLocationUpdate', {
                        busId,
                        latitude: finalLat,
                        longitude: finalLng,
                        source: finalSource
                    });
                }
            }
        } catch (error) {
            console.error("GPS Manager Service Error:", error);
        }
    }, 15000); // 15 seconds polling to respect rate limit
};
