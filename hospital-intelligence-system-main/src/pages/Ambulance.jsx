import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Leaflet Icon fix for default markers (though we use custom ones)
import "leaflet/dist/leaflet.css";

const HOSPITAL_POS = [17.3850, 78.4867];
const HYDERABAD_CENTER = [17.3850, 78.4867];

// Custom Icons
const createDivIcon = (emoji, color) => L.divIcon({
    html: `<div style="font-size: 24px; filter: drop-shadow(0 0 10px ${color}); text-shadow: 2px 2px 4px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">${emoji}</div>`,
    className: 'custom-div-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

const icons = {
    hospital: createDivIcon("🏥", "#0ea5e9"),
    ambulance: createDivIcon("🚑", "#ef4444"),
    patient: createDivIcon("🆘", "#f59e0b"),
};

// Simulated ambulance fleet with driver details
const initialAmbulances = [
    {
        id: 1, name: "AMS-01", status: "AVAILABLE", pos: [17.4000, 78.5000],
        driver: { name: "Ravi Kumar", exp: "8 yrs", phone: "+91 98765 00001", shift: "Morning", mission: "None" }
    },
    {
        id: 2, name: "AMS-02", status: "AVAILABLE", pos: [17.3600, 78.4500],
        driver: { name: "Suresh Rao", exp: "12 yrs", phone: "+91 98765 00002", shift: "Day", mission: "None" }
    },
    {
        id: 3, name: "AMS-03", status: "AVAILABLE", pos: [17.4200, 78.4800],
        driver: { name: "Mahesh K", exp: "5 yrs", phone: "+91 98765 00003", shift: "Night", mission: "None" }
    },
    {
        id: 4, name: "AMS-04", status: "AVAILABLE", pos: [17.3500, 78.5200],
        driver: { name: "Kiran P", exp: "10 yrs", phone: "+91 98765 00004", shift: "Morning", mission: "None" }
    },
];

const emergencyTypes = [
    "Cardiac Arrest", "Severe Chest Pain", "Stroke", "Road Accident",
    "Severe Burns", "Respiratory Failure", "Trauma", "Overdose"
];

const statusCfg = {
    AVAILABLE: { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Available", icon: "✅" },
    ON_DUTY: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "On Emergency Call", icon: "🚨" },
    RETURNING: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Returning to Hospital", icon: "🔄" },
    DISPATCHED: { color: "#a855f7", bg: "rgba(168,85,247,0.12)", label: "Dispatched", icon: "🚑" },
    ARRIVED: { color: "#38bdf8", bg: "rgba(56,189,248,0.12)", label: "At Patient Loc", icon: "📍" },
};

// Helper: Haversine distance
const getDistance = (p1, p2) => {
    const R = 6371; // km
    const dLat = (p2[0] - p1[0]) * Math.PI / 180;
    const dLon = (p2[1] - p1[1]) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Map View Controller
function MapController({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom, { animate: true });
    }, [center, zoom, map]);
    return null;
}

export default function AmbulanceTracker() {
    const [ambulances, setAmbulances] = useState(initialAmbulances);
    const [emergencies, setEmergencies] = useState([]);
    const [requestForm, setRequestForm] = useState({ patientName: "", address: "", phone: "", type: "Cardiac Arrest", notes: "" });
    const [showForm, setShowForm] = useState(false);
    const [dispatching, setDispatching] = useState(false);
    const [activeEmergency, setActiveEmergency] = useState(null);
    const [mapCenter, setMapCenter] = useState(HYDERABAD_CENTER);
    const [mapZoom, setMapZoom] = useState(13);

    // Simulated GPS Tracking Logic
    useEffect(() => {
        const interval = setInterval(() => {
            setAmbulances(prev => prev.map(amb => {
                if (amb.status === "AVAILABLE") {
                    // Slight random float
                    return { ...amb, pos: [amb.pos[0] + (Math.random() - 0.5) * 0.0001, amb.pos[1] + (Math.random() - 0.5) * 0.0001] };
                }
                if (amb.status === "DISPATCHED" && amb.target) {
                    // Move towards target
                    const dy = amb.target[0] - amb.pos[0];
                    const dx = amb.target[1] - amb.pos[1];
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 0.001) {
                        // Reached patient
                        if (activeEmergency && activeEmergency.ambulanceId === amb.id && activeEmergency.timeline.length < 3) {
                            updateTimeline(activeEmergency.id, "Ambulance reached patient");
                        }
                        return { ...amb, status: "ARRIVED", pos: amb.target };
                    }
                    const step = 0.001;
                    return { ...amb, pos: [amb.pos[0] + (dy / dist) * step, amb.pos[1] + (dx / dist) * step] };
                }
                if (amb.status === "RETURNING") {
                    // Move towards hospital
                    const dy = HOSPITAL_POS[0] - amb.pos[0];
                    const dx = HOSPITAL_POS[1] - amb.pos[1];
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 0.001) return { ...amb, status: "AVAILABLE", pos: HOSPITAL_POS, target: null };
                    const step = 0.0008;
                    return { ...amb, pos: [amb.pos[0] + (dy / dist) * step, amb.pos[1] + (dx / dist) * step] };
                }
                return amb;
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, [activeEmergency]);

    const updateTimeline = (emergencyId, text) => {
        setEmergencies(prev => prev.map(e => {
            if (e.id === emergencyId) {
                return { ...e, timeline: [...e.timeline, { text, time: new Date().toLocaleTimeString() }] };
            }
            return e;
        }));
        if (activeEmergency && activeEmergency.id === emergencyId) {
            setActiveEmergency(prev => ({ ...prev, timeline: [...prev.timeline, { text, time: new Date().toLocaleTimeString() }] }));
        }
    };

    const requestAmbulance = (e) => {
        e.preventDefault();
        setDispatching(true);

        // Find nearest available
        // Generate a random patient location near Hyderabad
        const patientLoc = [
            17.3850 + (Math.random() - 0.5) * 0.05,
            78.4867 + (Math.random() - 0.5) * 0.05
        ];

        setTimeout(() => {
            const sortedByDist = [...ambulances]
                .filter(a => a.status === "AVAILABLE")
                .sort((a, b) => getDistance(a.pos, patientLoc) - getDistance(b.pos, patientLoc));

            const nearest = sortedByDist[0];

            if (!nearest) {
                alert("No ambulances available. All are on duty.");
                setDispatching(false);
                return;
            }

            const dist = getDistance(nearest.pos, patientLoc);
            const etaMinutes = Math.ceil(dist * 3) + 2;

            const emergency = {
                id: Date.now(),
                ...requestForm,
                patientLoc,
                ambulanceId: nearest.id,
                ambulanceName: nearest.name,
                driver: nearest.driver,
                status: "DISPATCHED",
                eta: `${etaMinutes} min`,
                dist: dist.toFixed(1),
                time: new Date().toLocaleTimeString(),
                timeline: [{ text: "Emergency requested", time: new Date().toLocaleTimeString() }, { text: "Ambulance dispatched", time: new Date().toLocaleTimeString() }]
            };

            setEmergencies(prev => [emergency, ...prev]);
            setAmbulances(prev => prev.map(a =>
                a.id === nearest.id ? { ...a, status: "DISPATCHED", target: patientLoc, mission: emergency.type } : a
            ));
            setActiveEmergency(emergency);
            setMapCenter(patientLoc);
            setMapZoom(14);
            setShowForm(false);
            setRequestForm({ patientName: "", address: "", phone: "", type: "Cardiac Arrest", notes: "" });
            setDispatching(false);
        }, 1500);
    };

    const handlePatientTransport = (emergencyId) => {
        updateTimeline(emergencyId, "Patient being transported to hospital");
        const emer = emergencies.find(e => e.id === emergencyId);
        setAmbulances(prev => prev.map(a =>
            a.id === emer.ambulanceId ? { ...a, status: "RETURNING", target: HOSPITAL_POS } : a
        ));
    };

    const handlePatientArrived = (emergencyId) => {
        updateTimeline(emergencyId, "Patient arrived at hospital");
        const emer = emergencies.find(e => e.id === emergencyId);
        setAmbulances(prev => prev.map(a =>
            a.id === emer.ambulanceId ? { ...a, status: "AVAILABLE", pos: HOSPITAL_POS, target: null } : a
        ));
        setActiveEmergency(null);
    };

    return (
        <motion.div className="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "20px" }}>
            {/* Header */}
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "2.2rem", fontWeight: 800, background: "linear-gradient(135deg, #ef4444, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 4px" }}>
                    🚑 Smart Ambulance Command Center
                </h1>
                <p style={{ color: "#64748b", margin: 0 }}>Real-time GPS tracking, AI dispatch, and emergency response management</p>
            </div>

            {/* Top Row: Map and Dispatch Info */}
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "20px", marginBottom: "20px" }}>

                {/* Real geographic map */}
                <div style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "16px", height: "500px", overflow: "hidden", position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", position: "absolute", top: "25px", left: "25px", right: "25px", zIndex: 1000, pointerEvents: "none" }}>
                        <div style={{ background: "rgba(15,23,42,0.8)", padding: "8px 16px", borderRadius: "30px", border: "1px solid rgba(14,165,233,0.3)", backdropFilter: "blur(10px)", pointerEvents: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", animation: "ping 1.2s infinite" }} />
                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#e2f0ff" }}>GPS LIVE TRACKING</span>
                        </div>
                    </div>

                    <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%", borderRadius: "14px" }}>
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                        <MapController center={mapCenter} zoom={mapZoom} />

                        {/* Hospital */}
                        <Marker position={HOSPITAL_POS} icon={icons.hospital}>
                            <Popup>Nova Health Hospital (HQ)</Popup>
                        </Marker>

                        {/* Ambulances */}
                        {ambulances.map(amb => (
                            <Marker key={amb.id} position={amb.pos} icon={icons.ambulance}>
                                <Popup>
                                    <div style={{ minWidth: "150px" }}>
                                        <div style={{ fontWeight: 800, color: "#ef4444" }}>{amb.name}</div>
                                        <div style={{ fontSize: "0.75rem", margin: "4px 0" }}>Driver: <strong>{amb.driver.name}</strong></div>
                                        <div style={{ fontSize: "0.75rem" }}>Status: <span style={{ color: statusCfg[amb.status].color }}>{statusCfg[amb.status].label}</span></div>
                                        {amb.mission && <div style={{ fontSize: "0.7rem", color: "#94a3b8", borderTop: "1px solid #eee", marginTop: "4px", paddingTop: "4px" }}>Mission: {amb.mission}</div>}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {/* Active Emergency Patient */}
                        {activeEmergency && activeEmergency.patientLoc && (
                            <Marker position={activeEmergency.patientLoc} icon={icons.patient}>
                                <Popup>Emergency: {activeEmergency.patientName}</Popup>
                            </Marker>
                        )}

                        {/* Routes */}
                        {activeEmergency && activeEmergency.patientLoc && ambulances.find(a => a.id === activeEmergency.ambulanceId) && (
                            <Polyline
                                positions={[ambulances.find(a => a.id === activeEmergency.ambulanceId).pos, activeEmergency.patientLoc]}
                                color="#ef4444" weight={3} dashArray="10, 10"
                            />
                        )}
                        {activeEmergency && activeEmergency.patientLoc && (
                            <Polyline
                                positions={[activeEmergency.patientLoc, HOSPITAL_POS]}
                                color="#3b82f6" weight={2} opacity={0.3}
                            />
                        )}
                    </MapContainer>
                </div>

                {/* Right col: Stats & Emergency Dispatch */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                    {/* Request Form */}
                    <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "20px", padding: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#f87171" }}>🆘 Fast Dispatch</h3>
                                <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.8rem" }}>Request immediate ambulance response</p>
                            </div>
                            <button onClick={() => setShowForm(!showForm)}
                                style={{ padding: "8px 16px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2f0ff", cursor: "pointer", fontSize: "0.8rem" }}>
                                {showForm ? "Close" : "Open Form"}
                            </button>
                        </div>

                        {showForm ? (
                            <form onSubmit={requestAmbulance} style={{ display: "grid", gap: "10px" }}>
                                <input type="text" placeholder="Patient Name" required value={requestForm.patientName} onChange={e => setRequestForm({ ...requestForm, patientName: e.target.value })}
                                    style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", padding: "10px", borderRadius: "8px", color: "white", outline: "none" }} />
                                <input type="text" placeholder="Pickup Address" required value={requestForm.address} onChange={e => setRequestForm({ ...requestForm, address: e.target.value })}
                                    style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", padding: "10px", borderRadius: "8px", color: "white", outline: "none" }} />
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                    <select value={requestForm.type} onChange={e => setRequestForm({ ...requestForm, type: e.target.value })}
                                        style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", padding: "10px", borderRadius: "8px", color: "white", outline: "none" }}>
                                        {emergencyTypes.map(t => <option key={t} value={t} style={{ background: "#0f172a" }}>{t}</option>)}
                                    </select>
                                    <input type="text" placeholder="Contact No" required value={requestForm.phone} onChange={e => setRequestForm({ ...requestForm, phone: e.target.value })}
                                        style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", padding: "10px", borderRadius: "8px", color: "white", outline: "none" }} />
                                </div>
                                <button type="submit" disabled={dispatching}
                                    style={{ padding: "12px", background: "linear-gradient(135deg, #ef4444, #f43f5e)", border: "none", borderRadius: "10px", color: "white", fontWeight: 800, cursor: "pointer", marginTop: "10px" }}>
                                    {dispatching ? "DISPATCHING..." : "🚀 SOS DISPATCH"}
                                </button>
                            </form>
                        ) : (
                            <div style={{ padding: "24px", background: "rgba(239,68,68,0.1)", border: "2px dashed rgba(239,68,68,0.3)", borderRadius: "12px", textAlign: "center", cursor: "pointer" }} onClick={() => setShowForm(true)}>
                                <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>🚨</div>
                                <div style={{ fontWeight: 700, color: "#f87171" }}>Press to Start Dispatch Wizard</div>
                            </div>
                        )}
                    </div>

                    {/* Active Timeline */}
                    <div style={{ flex: 1, background: "rgba(15,23,42,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "20px" }}>
                        <h3 style={{ margin: "0 0 16px", fontSize: "1rem", fontWeight: 800 }}>📂 Emergency Timeline</h3>
                        {activeEmergency ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {activeEmergency.timeline.map((item, i) => (
                                    <div key={i} style={{ display: "flex", gap: "12px" }}>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", border: "2px solid #064e3b" }} />
                                            {i < activeEmergency.timeline.length - 1 && <div style={{ width: "1px", flex: 1, background: "#1e293b" }} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: "0.82rem", color: "#e2f0ff", fontWeight: 600 }}>{item.text}</div>
                                            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{item.time}</div>
                                        </div>
                                    </div>
                                ))}

                                <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                                    {activeEmergency.timeline.length < 3 && <button disabled style={{ flex: 1, padding: "8px", borderRadius: "8px", background: "#1e293b", color: "#4b5563", border: "none", fontSize: "0.75rem" }}>Waiting for Arrival...</button>}
                                    {activeEmergency.timeline.length === 3 && (
                                        <button onClick={() => handlePatientTransport(activeEmergency.id)}
                                            style={{ flex: 1, padding: "8px", borderRadius: "8px", background: "#f59e0b", color: "white", border: "none", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                                            🚑 Start Transport
                                        </button>
                                    )}
                                    {activeEmergency.timeline.length === 4 && (
                                        <button onClick={() => handlePatientArrived(activeEmergency.id)}
                                            style={{ flex: 1, padding: "8px", borderRadius: "8px", background: "#10b981", color: "white", border: "none", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                                            🏥 Arrived at Hospital
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: "center", color: "#475569", padding: "40px 0" }}>
                                <div style={{ fontSize: "1.5rem" }}>🕒</div>
                                <div style={{ fontSize: "0.8rem", marginTop: "8px" }}>No active missions</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Fleet Tracking */}
            <div style={{ background: "rgba(15,23,42,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "20px" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem", fontWeight: 800 }}>🚑 Active Fleet Status & GPS Coordinates</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                    {ambulances.map(amb => {
                        const cfg = statusCfg[amb.status];
                        const dist = activeEmergency && activeEmergency.ambulanceId === amb.id ? activeEmergency.dist : "---";
                        const eta = activeEmergency && activeEmergency.ambulanceId === amb.id ? activeEmergency.eta : "---";

                        return (
                            <motion.div key={amb.id} whileHover={{ y: -4 }}
                                style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${cfg.color}22`, borderRadius: "16px", padding: "16px", position: "relative" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${cfg.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>🚑</div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: "1rem" }}>{amb.name}</div>
                                            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>GPS: {amb.pos[0].toFixed(4)}, {amb.pos[1].toFixed(4)}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <span style={{ fontSize: "0.65rem", fontWeight: 800, padding: "3px 8px", borderRadius: "6px", background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                                    <div style={{ padding: "8px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                                        <div style={{ fontSize: "0.6rem", color: "#475569", textTransform: "uppercase" }}>Distance</div>
                                        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#e2f0ff" }}>{dist} km</div>
                                    </div>
                                    <div style={{ padding: "8px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                                        <div style={{ fontSize: "0.6rem", color: "#475569", textTransform: "uppercase" }}>ETA</div>
                                        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#f59e0b" }}>{eta}</div>
                                    </div>
                                </div>

                                <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "10px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{amb.driver.name}</div>
                                            <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{amb.driver.exp} Exp · {amb.driver.shift} Shift</div>
                                        </div>
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <button
                                                onClick={() => window.open(`tel:${amb.driver.phone}`)}
                                                style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", color: "#e2f0ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem" }}>
                                                📞
                                            </button>
                                            <button
                                                onClick={() => { setMapCenter(amb.pos); setMapZoom(15); }}
                                                style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#0ea5e9", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem" }}>
                                                🛰️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Pulse animation for dispatched ambulances */}
            <style>{`
                @keyframes pulse {
                    0% { transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -50%) scale(1.2); }
                    100% { transform: translate(-50%, -50%) scale(1); }
                }
                @keyframes ping {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(3); opacity: 0; }
                }
                .leaflet-container {
                    background: #0a1628 !important;
                }
                .custom-div-icon {
                    background: transparent !important;
                    border: none !important;
                }
            `}</style>
        </motion.div>
    );
}
