import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Heart, Brain, Droplets, Thermometer, TrendingUp,
    TrendingDown, Calendar, Clock, Target, Zap, Shield, BarChart3,
    LineChart, PieChart, Download, Share2, Settings, RefreshCw,
    AlertTriangle, CheckCircle2, Info, Filter, ChevronRight,
    Eye, EyeOff, Maximize2, Minimize2, FileText, Image,
    Smartphone, Watch, Scale, Footprints, Moon, Sun,
    Wind, Cloud, Battery, Wifi, Signal, Bell, BellOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';

export default function HealthAnalytics() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [timeRange, setTimeRange] = useState('week');
    const [selectedMetrics, setSelectedMetrics] = useState(['all']);
    const [healthData, setHealthData] = useState({
        vitals: {},
        activities: {},
        sleep: {},
        nutrition: {},
        trends: {}
    });
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [realTimeUpdates, setRealTimeUpdates] = useState(true);
    const [expandedSections, setExpandedSections] = useState(['vitals', 'trends']);
    const intervalRef = useRef(null);

    useEffect(() => {
        fetchHealthData();
        if (realTimeUpdates) {
            intervalRef.current = setInterval(fetchHealthData, 30000); // Update every 30 seconds
        }
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [timeRange, realTimeUpdates]);

    const fetchHealthData = async () => {
        try {
            setLoading(true);
            const response = await API.get(`/analytics/health?userId=${user?.id}&timeRange=${timeRange}`);
            setHealthData(response.data || generateMockHealthData());
        } catch (error) {
            console.error('Failed to fetch health data:', error);
            setHealthData(generateMockHealthData());
        } finally {
            setLoading(false);
        }
    };

    const generateMockHealthData = () => ({
        vitals: {
            heartRate: {
                current: 72,
                average: 68,
                min: 55,
                max: 95,
                trend: 'stable',
                unit: 'bpm',
                status: 'normal',
                data: generateTimeSeriesData('heartRate')
            },
            bloodPressure: {
                systolic: 120,
                diastolic: 80,
                average: { systolic: 118, diastolic: 78 },
                trend: 'decreasing',
                unit: 'mmHg',
                status: 'optimal',
                data: generateTimeSeriesData('bloodPressure')
            },
            temperature: {
                current: 98.6,
                average: 98.4,
                min: 97.8,
                max: 99.2,
                trend: 'stable',
                unit: '°F',
                status: 'normal',
                data: generateTimeSeriesData('temperature')
            },
            oxygenLevel: {
                current: 98,
                average: 97,
                min: 95,
                max: 99,
                trend: 'stable',
                unit: '%',
                status: 'excellent',
                data: generateTimeSeriesData('oxygenLevel')
            },
            stress: {
                current: 25,
                average: 30,
                min: 15,
                max: 65,
                trend: 'decreasing',
                unit: '%',
                status: 'low',
                data: generateTimeSeriesData('stress')
            }
        },
        activities: {
            steps: {
                today: 8432,
                goal: 10000,
                average: 7850,
                trend: 'increasing',
                unit: 'steps',
                data: generateTimeSeriesData('steps')
            },
            calories: {
                burned: 420,
                goal: 500,
                average: 380,
                trend: 'increasing',
                unit: 'kcal',
                data: generateTimeSeriesData('calories')
            },
            activeMinutes: {
                today: 45,
                goal: 60,
                average: 42,
                trend: 'stable',
                unit: 'minutes',
                data: generateTimeSeriesData('activeMinutes')
            },
            distance: {
                today: 3.2,
                goal: 5,
                average: 2.8,
                trend: 'increasing',
                unit: 'miles',
                data: generateTimeSeriesData('distance')
            }
        },
        sleep: {
            duration: {
                lastNight: 7.5,
                average: 7.2,
                goal: 8,
                trend: 'increasing',
                unit: 'hours',
                data: generateTimeSeriesData('sleepDuration')
            },
            quality: {
                score: 85,
                deepSleep: 1.8,
                remSleep: 1.5,
                lightSleep: 4.2,
                trend: 'stable',
                unit: '%',
                data: generateTimeSeriesData('sleepQuality')
            },
            consistency: {
                score: 78,
                bedtime: '10:30 PM',
                waketime: '6:00 AM',
                trend: 'stable',
                unit: '%'
            }
        },
        nutrition: {
            water: {
                intake: 64,
                goal: 80,
                unit: 'oz',
                trend: 'stable',
                data: generateTimeSeriesData('water')
            },
            calories: {
                consumed: 1850,
                goal: 2000,
                burned: 420,
                net: 1430,
                unit: 'kcal',
                data: generateTimeSeriesData('caloriesConsumed')
            },
            macros: {
                protein: { current: 85, goal: 100, unit: 'g' },
                carbs: { current: 220, goal: 250, unit: 'g' },
                fats: { current: 65, goal: 70, unit: 'g' }
            }
        },
        trends: {
            overallHealth: 92,
            keyInsights: [
                { type: 'positive', message: 'Heart rate variability has improved by 15%' },
                { type: 'positive', message: 'Sleep consistency has increased this week' },
                { type: 'warning', message: 'Water intake is below daily goal' },
                { type: 'info', message: 'Stress levels have decreased by 10%' }
            ],
            recommendations: [
                'Increase daily water intake by 16oz',
                'Maintain current sleep schedule',
                'Add 10 more minutes of moderate activity',
                'Consider evening meditation for stress reduction'
            ]
        }
    });

    const generateTimeSeriesData = (metric) => {
        const points = timeRange === 'day' ? 24 : timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 12;
        const data = [];
        
        for (let i = 0; i < points; i++) {
            const baseValue = getBaseValue(metric);
            const variation = (Math.random() - 0.5) * baseValue * 0.2;
            data.push({
                timestamp: new Date(Date.now() - (points - i) * getInterval()).toISOString(),
                value: Math.round((baseValue + variation) * 10) / 10
            });
        }
        
        return data;
    };

    const getBaseValue = (metric) => {
        const values = {
            heartRate: 70,
            bloodPressure: 120,
            temperature: 98.6,
            oxygenLevel: 97,
            stress: 30,
            steps: 8000,
            calories: 400,
            activeMinutes: 45,
            distance: 3,
            sleepDuration: 7.5,
            sleepQuality: 80,
            water: 60,
            caloriesConsumed: 2000
        };
        return values[metric] || 50;
    };

    const getInterval = () => {
        switch (timeRange) {
            case 'day': return 60 * 60 * 1000; // 1 hour
            case 'week': return 24 * 60 * 60 * 1000; // 1 day
            case 'month': return 24 * 60 * 60 * 1000; // 1 day
            case 'year': return 30 * 24 * 60 * 60 * 1000; // 1 month
            default: return 60 * 60 * 1000;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'excellent': return 'text-green-400 bg-green-400/10 border-green-400/30';
            case 'optimal': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
            case 'normal': return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
            case 'warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
            case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/30';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
        }
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'increasing': return <TrendingUp className="w-4 h-4 text-green-400" />;
            case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-400" />;
            case 'stable': return <Activity className="w-4 h-4 text-blue-400" />;
            default: return <Activity className="w-4 h-4 text-slate-400" />;
        }
    };

    const getMetricIcon = (metric) => {
        const icons = {
            heartRate: <Heart className="w-5 h-5" />,
            bloodPressure: <Activity className="w-5 h-5" />,
            temperature: <Thermometer className="w-5 h-5" />,
            oxygenLevel: <Droplets className="w-5 h-5" />,
            stress: <Brain className="w-5 h-5" />,
            steps: <Footprints className="w-5 h-5" />,
            calories: <Zap className="w-5 h-5" />,
            activeMinutes: <Clock className="w-5 h-5" />,
            distance: <Target className="w-5 h-5" />,
            sleepDuration: <Moon className="w-5 h-5" />,
            sleepQuality: <Brain className="w-5 h-5" />,
            water: <Droplets className="w-5 h-5" />
        };
        return icons[metric] || <Activity className="w-5 h-5" />;
    };

    const exportData = async () => {
        try {
            const dataStr = JSON.stringify(healthData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `health-analytics-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            addToast({
                type: 'success',
                title: 'Data Exported',
                message: 'Health analytics data has been downloaded'
            });
        } catch (error) {
            console.error('Export failed:', error);
            addToast({
                type: 'error',
                title: 'Export Failed',
                message: 'Unable to export data'
            });
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => 
            prev.includes(section) 
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    return (
        <div className="p-4 md:p-8 min-h-screen bg-[#020617] text-white font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl font-black text-white tracking-tight mb-4 flex items-center justify-center gap-4">
                        <BarChart3 className="w-12 h-12 text-blue-500" />
                        Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Analytics</span>
                    </h1>
                    <p className="text-slate-500 font-bold tracking-[0.3em] text-xs uppercase">
                        COMPREHENSIVE HEALTH INSIGHTS • REAL-TIME MONITORING
                    </p>
                </motion.div>

                {/* Controls */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap items-center justify-between gap-4 mb-8"
                >
                    <div className="flex items-center gap-3">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none"
                        >
                            <option value="day">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>

                        <button
                            onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                            className={`px-4 py-2 rounded-xl transition-all ${
                                realTimeUpdates 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                    : 'bg-slate-800/50 text-slate-400 border border-white/10'
                            }`}
                        >
                            <RefreshCw className={`w-4 h-4 inline mr-2 ${realTimeUpdates ? 'animate-spin' : ''}`} />
                            Real-time
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`p-3 rounded-xl transition-all ${
                                notifications 
                                    ? 'bg-blue-500/20 text-blue-400' 
                                    : 'bg-slate-800/50 text-slate-400'
                            }`}
                        >
                            {notifications ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                        </button>
                        
                        <button
                            onClick={exportData}
                            className="px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white hover:bg-slate-800 transition-all flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </motion.div>

                {/* Overall Health Score */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-8 mb-8 text-center"
                >
                    <h2 className="text-2xl font-black text-white mb-4">Overall Health Score</h2>
                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                        {healthData.trends.overallHealth}
                    </div>
                    <p className="text-slate-400">Excellent Health Status</p>
                </motion.div>

                {/* Key Insights */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                >
                    <div className="bg-slate-800/30 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-blue-400" />
                            Key Insights
                        </h3>
                        <div className="space-y-3">
                            {healthData.trends.keyInsights.map((insight, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className={`p-1 rounded-full mt-1 ${
                                        insight.type === 'positive' ? 'bg-green-500/20' :
                                        insight.type === 'warning' ? 'bg-yellow-500/20' :
                                        'bg-blue-500/20'
                                    }`}>
                                        {insight.type === 'positive' ? <TrendingUp className="w-3 h-3 text-green-400" /> :
                                         insight.type === 'warning' ? <AlertTriangle className="w-3 h-3 text-yellow-400" /> :
                                         <Info className="w-3 h-3 text-blue-400" />}
                                    </div>
                                    <p className="text-sm text-slate-300">{insight.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-800/30 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-400" />
                            Recommendations
                        </h3>
                        <div className="space-y-3">
                            {healthData.trends.recommendations.map((rec, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className="p-1 rounded-full bg-purple-500/20 mt-1">
                                        <CheckCircle2 className="w-3 h-3 text-purple-400" />
                                    </div>
                                    <p className="text-sm text-slate-300">{rec}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Vitals Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/30 border border-white/10 rounded-2xl p-6 mb-8"
                >
                    <div 
                        className="flex items-center justify-between mb-6 cursor-pointer"
                        onClick={() => toggleSection('vitals')}
                    >
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <Heart className="w-6 h-6 text-red-400" />
                            Vital Signs
                        </h2>
                        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${
                            expandedSections.includes('vitals') ? 'rotate-90' : ''
                        }`} />
                    </div>

                    <AnimatePresence>
                        {expandedSections.includes('vitals') && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {Object.entries(healthData.vitals).map(([key, vital]) => (
                                    <motion.div
                                        key={key}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-slate-800/50 border border-white/10 rounded-xl p-4"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                {getMetricIcon(key)}
                                                <span className="text-sm font-black text-slate-400 uppercase tracking-wider">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                            </div>
                                            {getTrendIcon(vital.trend)}
                                        </div>
                                        
                                        <div className="mb-3">
                                            <div className="text-2xl font-black text-white">
                                                {key === 'bloodPressure' ? `${vital.systolic}/${vital.diastolic}` : vital.current}
                                                <span className="text-sm font-normal text-slate-400 ml-1">{vital.unit}</span>
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Avg: {key === 'bloodPressure' ? `${vital.average.systolic}/${vital.average.diastolic}` : vital.average}
                                            </div>
                                        </div>

                                        <div className={`px-2 py-1 rounded-lg border text-xs font-black ${getStatusColor(vital.status)}`}>
                                            {vital.status.toUpperCase()}
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Activities Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/30 border border-white/10 rounded-2xl p-6 mb-8"
                >
                    <div 
                        className="flex items-center justify-between mb-6 cursor-pointer"
                        onClick={() => toggleSection('activities')}
                    >
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <Activity className="w-6 h-6 text-green-400" />
                            Physical Activity
                        </h2>
                        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${
                            expandedSections.includes('activities') ? 'rotate-90' : ''
                        }`} />
                    </div>

                    <AnimatePresence>
                        {expandedSections.includes('activities') && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                            >
                                {Object.entries(healthData.activities).map(([key, activity]) => (
                                    <motion.div
                                        key={key}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-slate-800/50 border border-white/10 rounded-xl p-4"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                {getMetricIcon(key)}
                                                <span className="text-sm font-black text-slate-400 uppercase tracking-wider">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                            </div>
                                            {getTrendIcon(activity.trend)}
                                        </div>
                                        
                                        <div className="mb-3">
                                            <div className="text-2xl font-black text-white">
                                                {activity.today}
                                                <span className="text-sm font-normal text-slate-400 ml-1">{activity.unit}</span>
                                            </div>
                                            <div className="w-full bg-slate-700/50 rounded-full h-2 mt-2">
                                                <div 
                                                    className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all"
                                                    style={{ width: `${Math.min((activity.today / activity.goal) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                Goal: {activity.goal} {activity.unit}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                )}
            </div>
        </div>
    );
}
