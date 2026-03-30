import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, Activity, Droplets, Thermometer, Brain,
    TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
    Clock, Calendar, Download, Share2, Settings,
    RefreshCw, Zap, Target, Shield, Bell,
    Play, Pause, Plus, Edit2, Save, X,
    BarChart3, LineChart, PieChart, Monitor,
    Smartphone, Watch, Scale, Footprints
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import SocketService from '../services/socket';

export default function HealthMonitoringDashboard() {
    const { user } = useAuth();
    const { addToast } = useToast();
    
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [vitals, setVitals] = useState({
        heartRate: 72,
        bloodPressure: { systolic: 120, diastolic: 80 },
        oxygenSaturation: 98,
        temperature: 98.6,
        stress: 25,
        sleep: { duration: 7.5, quality: 85 },
        weight: 70,
        steps: 8500,
        calories: 2100
    });
    
    const [vitalsHistory, setVitalsHistory] = useState([]);
    const [healthScore, setHealthScore] = useState(85);
    const [alerts, setAlerts] = useState([]);
    const [connectedDevices, setConnectedDevices] = useState([]);
    const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
    const [notifications, setNotifications] = useState([]);
    const [goals, setGoals] = useState({
        steps: 10000,
        sleep: 8,
        water: 8,
        exercise: 30
    });
    
    const monitoringInterval = useRef(null);

    useEffect(() => {
        fetchInitialData();
        setupSocketListeners();
        return () => {
            if (monitoringInterval.current) {
                clearInterval(monitoringInterval.current);
            }
        };
    }, []);

    const fetchInitialData = async () => {
        try {
            const [
                vitalsResponse,
                historyResponse,
                devicesResponse,
                goalsResponse
            ] = await Promise.all([
                API.get(`/vitals/patient/${user?.id}/latest`),
                API.get(`/vitals/patient/${user?.id}/history?range=${selectedTimeRange}`),
                API.get(`/devices/patient/${user?.id}`),
                API.get(`/goals/patient/${user?.id}`)
            ]);

            if (vitalsResponse.data) {
                setVitals(vitalsResponse.data);
            }
            setVitalsHistory(historyResponse.data || []);
            setConnectedDevices(devicesResponse.data || []);
            if (goalsResponse.data) {
                setGoals(goalsResponse.data);
            }
            
            calculateHealthScore();
            
        } catch (error) {
            console.error('Failed to fetch initial data:', error);
        }
    };

    const setupSocketListeners = () => {
        SocketService.connect(user?.token);
        
        SocketService.on('vital-update', (data) => {
            if (data.patientId === user?.id) {
                setVitals(prev => ({ ...prev, ...data.vitals }));
                checkForAlerts(data.vitals);
            }
        });

        SocketService.on('health-alert', (data) => {
            if (data.patientId === user?.id) {
                setAlerts(prev => [data.alert, ...prev]);
                addToast({
                    type: data.alert.severity === 'high' ? 'error' : 'warning',
                    title: 'Health Alert',
                    message: data.alert.message
                });
            }
        });
    };

    const startMonitoring = () => {
        setIsMonitoring(true);
        
        // Simulate real-time monitoring
        monitoringInterval.current = setInterval(() => {
            setVitals(prev => {
                const newVitals = {
                    ...prev,
                    heartRate: Math.max(60, Math.min(100, prev.heartRate + (Math.random() - 0.5) * 5)),
                    oxygenSaturation: Math.max(95, Math.min(100, prev.oxygenSaturation + (Math.random() - 0.5) * 2)),
                    stress: Math.max(0, Math.min(100, prev.stress + (Math.random() - 0.5) * 3)),
                    steps: prev.steps + Math.floor(Math.random() * 10),
                    calories: prev.calories + Math.floor(Math.random() * 5)
                };
                
                // Update history
                setVitalsHistory(history => [
                    ...history.slice(-100),
                    {
                        timestamp: new Date(),
                        ...newVitals
                    }
                ]);
                
                checkForAlerts(newVitals);
                calculateHealthScore();
                
                return newVitals;
            });
        }, 5000); // Update every 5 seconds
    };

    const stopMonitoring = () => {
        setIsMonitoring(false);
        if (monitoringInterval.current) {
            clearInterval(monitoringInterval.current);
        }
    };

    const checkForAlerts = (currentVitals) => {
        const newAlerts = [];
        
        if (currentVitals.heartRate > 100 || currentVitals.heartRate < 60) {
            newAlerts.push({
                id: Date.now(),
                type: 'heart_rate',
                severity: 'medium',
                message: `Heart rate is ${currentVitals.heartRate} bpm. Normal range is 60-100 bpm.`,
                timestamp: new Date()
            });
        }
        
        if (currentVitals.oxygenSaturation < 95) {
            newAlerts.push({
                id: Date.now() + 1,
                type: 'oxygen',
                severity: 'high',
                message: `Oxygen saturation is ${currentVitals.oxygenSaturation}%. Seek medical attention.`,
                timestamp: new Date()
            });
        }
        
        if (currentVitals.stress > 80) {
            newAlerts.push({
                id: Date.now() + 2,
                type: 'stress',
                severity: 'medium',
                message: `Stress level is high (${currentVitals.stress}%). Consider relaxation techniques.`,
                timestamp: new Date()
            });
        }
        
        if (newAlerts.length > 0) {
            setAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
        }
    };

    const calculateHealthScore = () => {
        let score = 100;
        
        // Heart rate scoring
        if (vitals.heartRate < 60 || vitals.heartRate > 100) {
            score -= 15;
        }
        
        // Oxygen saturation scoring
        if (vitals.oxygenSaturation < 95) {
            score -= 20;
        }
        
        // Stress scoring
        if (vitals.stress > 70) {
            score -= 10;
        }
        
        // Sleep scoring
        if (vitals.sleep.duration < 7) {
            score -= 10;
        }
        
        // Activity scoring
        const stepsProgress = (vitals.steps / goals.steps) * 100;
        if (stepsProgress < 50) {
            score -= 15;
        } else if (stepsProgress < 80) {
            score -= 5;
        }
        
        setHealthScore(Math.max(0, Math.min(100, score)));
    };

    const addManualVitals = async (manualVitals) => {
        try {
            await API.post(`/vitals/patient/${user?.id}`, {
                ...manualVitals,
                timestamp: new Date(),
                source: 'manual'
            });
            
            setVitals(prev => ({ ...prev, ...manualVitals }));
            
            addToast({
                type: 'success',
                title: 'Vitals Updated',
                message: 'Your vitals have been recorded successfully'
            });
            
        } catch (error) {
            console.error('Failed to add manual vitals:', error);
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to update vitals'
            });
        }
    };

    const connectDevice = async (deviceType) => {
        try {
            const response = await API.post(`/devices/patient/${user?.id}/connect`, {
                type: deviceType,
                name: `${deviceType} Device`
            });
            
            setConnectedDevices(prev => [...prev, response.data]);
            
            addToast({
                type: 'success',
                title: 'Device Connected',
                message: `${deviceType} device connected successfully`
            });
            
        } catch (error) {
            console.error('Failed to connect device:', error);
            addToast({
                type: 'error',
                title: 'Connection Failed',
                message: 'Unable to connect device'
            });
        }
    };

    const exportHealthData = () => {
        const exportData = {
            patient: user?.name,
            exportDate: new Date().toISOString(),
            timeRange: selectedTimeRange,
            currentVitals: vitals,
            healthScore: healthScore,
            vitalsHistory: vitalsHistory,
            goals: goals
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `health-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getVitalStatus = (vital, normalRange) => {
        if (vital < normalRange.min || vital > normalRange.max) {
            return 'abnormal';
        }
        return 'normal';
    };

    const getProgressPercentage = (current, goal) => {
        return Math.min(100, Math.max(0, (current / goal) * 100));
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <Monitor className="w-10 h-10 text-blue-500" />
                    Health Monitoring
                </h1>
                <p className="text-slate-400">Real-time health metrics and insights</p>
            </div>

            {/* Control Panel */}
            <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={isMonitoring ? stopMonitoring : startMonitoring}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                                isMonitoring
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                        >
                            {isMonitoring ? (
                                <>
                                    <Pause className="w-4 h-4" />
                                    Stop Monitoring
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4" />
                                    Start Monitoring
                                </>
                            )}
                        </button>
                        
                        <select
                            value={selectedTimeRange}
                            onChange={(e) => setSelectedTimeRange(e.target.value)}
                            className="px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="1h">Last Hour</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={exportHealthData}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                            title="Export Data"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        <button
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                            title="Settings"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <button
                            onClick={fetchInitialData}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                
                {isMonitoring && (
                    <div className="mt-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-400 text-sm">Live monitoring active</span>
                    </div>
                )}
            </div>

            {/* Health Score */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Health Score</h2>
                        <div className="flex items-center gap-4">
                            <div className="text-6xl font-bold">{healthScore}</div>
                            <div>
                                <p className={`text-xl font-semibold ${
                                    healthScore >= 80 ? 'text-green-300' :
                                    healthScore >= 60 ? 'text-yellow-300' :
                                    'text-red-300'
                                }`}>
                                    {healthScore >= 80 ? 'Excellent' :
                                     healthScore >= 60 ? 'Good' :
                                     'Needs Attention'}
                                </p>
                                <p className="text-blue-100">Based on your current vitals</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="w-32 h-32 relative">
                            <svg className="transform -rotate-90 w-32 h-32">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth="12"
                                    fill="none"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="white"
                                    strokeWidth="12"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 56}`}
                                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - healthScore / 100)}`}
                                    className="transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold">{healthScore}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Heart Rate */}
                <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Heart className="w-6 h-6 text-red-400" />
                            <span className="text-slate-300">Heart Rate</span>
                        </div>
                        <span className={`w-2 h-2 rounded-full ${
                            getVitalStatus(vitals.heartRate, { min: 60, max: 100 }) === 'normal'
                                ? 'bg-green-400'
                                : 'bg-red-400'
                        }`}></span>
                    </div>
                    <div className="text-3xl font-bold mb-2">{vitals.heartRate}</div>
                    <p className="text-slate-400 text-sm mb-3">bpm</p>
                    <div className="text-xs text-slate-500">
                        Normal: 60-100 bpm
                    </div>
                </div>

                {/* Blood Pressure */}
                <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Activity className="w-6 h-6 text-blue-400" />
                            <span className="text-slate-300">Blood Pressure</span>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    </div>
                    <div className="text-3xl font-bold mb-2">
                        {vitals.bloodPressure.systolic}/{vitals.bloodPressure.diastolic}
                    </div>
                    <p className="text-slate-400 text-sm mb-3">mmHg</p>
                    <div className="text-xs text-slate-500">
                        Normal: 120/80 mmHg
                    </div>
                </div>

                {/* Oxygen Saturation */}
                <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Droplets className="w-6 h-6 text-cyan-400" />
                            <span className="text-slate-300">Oxygen</span>
                        </div>
                        <span className={`w-2 h-2 rounded-full ${
                            getVitalStatus(vitals.oxygenSaturation, { min: 95, max: 100 }) === 'normal'
                                ? 'bg-green-400'
                                : 'bg-red-400'
                        }`}></span>
                    </div>
                    <div className="text-3xl font-bold mb-2">{vitals.oxygenSaturation}</div>
                    <p className="text-slate-400 text-sm mb-3">SpO2%</p>
                    <div className="text-xs text-slate-500">
                        Normal: 95-100%
                    </div>
                </div>

                {/* Temperature */}
                <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Thermometer className="w-6 h-6 text-yellow-400" />
                            <span className="text-slate-300">Temperature</span>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    </div>
                    <div className="text-3xl font-bold mb-2">{vitals.temperature}</div>
                    <p className="text-slate-400 text-sm mb-3">°F</p>
                    <div className="text-xs text-slate-500">
                        Normal: 97-99°F
                    </div>
                </div>
            </div>

            {/* Activity Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-400" />
                        Daily Goals
                    </h2>
                    
                    <div className="space-y-4">
                        {/* Steps */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Footprints className="w-4 h-4 text-blue-400" />
                                    <span className="text-slate-300">Steps</span>
                                </div>
                                <span className="text-sm text-slate-400">
                                    {vitals.steps.toLocaleString()} / {goals.steps.toLocaleString()}
                                </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${getProgressPercentage(vitals.steps, goals.steps)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Sleep */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-purple-400" />
                                    <span className="text-slate-300">Sleep</span>
                                </div>
                                <span className="text-sm text-slate-400">
                                    {vitals.sleep.duration}h / {goals.sleep}h
                                </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div
                                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${getProgressPercentage(vitals.sleep.duration, goals.sleep)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Calories */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-yellow-400" />
                                    <span className="text-slate-300">Calories</span>
                                </div>
                                <span className="text-sm text-slate-400">
                                    {vitals.calories} / 2500
                                </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div
                                    className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${getProgressPercentage(vitals.calories, 2500)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Stress */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Brain className="w-4 h-4 text-red-400" />
                                    <span className="text-slate-300">Stress Level</span>
                                </div>
                                <span className="text-sm text-slate-400">{vitals.stress}%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                        vitals.stress > 70 ? 'bg-red-500' :
                                        vitals.stress > 40 ? 'bg-yellow-500' :
                                        'bg-green-500'
                                    }`}
                                    style={{ width: `${vitals.stress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Connected Devices */}
                <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-green-400" />
                        Connected Devices
                    </h2>
                    
                    <div className="space-y-3 mb-6">
                        {connectedDevices.length > 0 ? (
                            connectedDevices.map((device, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                            <Watch className="w-4 h-4 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{device.name}</p>
                                            <p className="text-slate-400 text-sm">{device.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span className="text-sm text-green-400">Connected</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <Smartphone className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400">No devices connected</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => connectDevice('Smart Watch')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                            <Watch className="w-4 h-4 inline mr-2" />
                            Smart Watch
                        </button>
                        <button
                            onClick={() => connectDevice('Fitness Tracker')}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                            <Activity className="w-4 h-4 inline mr-2" />
                            Fitness Tracker
                        </button>
                        <button
                            onClick={() => connectDevice('Blood Pressure Monitor')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                            <Heart className="w-4 h-4 inline mr-2" />
                            BP Monitor
                        </button>
                        <button
                            onClick={() => connectDevice('Smart Scale')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                            <Scale className="w-4 h-4 inline mr-2" />
                            Smart Scale
                        </button>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        Health Alerts
                    </h2>
                    
                    <div className="space-y-3">
                        {alerts.slice(0, 5).map((alert) => (
                            <div
                                key={alert.id}
                                className={`p-4 rounded-lg border ${
                                    alert.severity === 'high'
                                        ? 'bg-red-500/10 border-red-500/30'
                                        : 'bg-yellow-500/10 border-yellow-500/30'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                                        alert.severity === 'high' ? 'text-red-400' : 'text-yellow-400'
                                    }`} />
                                    <div className="flex-1">
                                        <p className="text-white font-medium">{alert.message}</p>
                                        <p className="text-slate-400 text-sm mt-1">
                                            {new Date(alert.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
