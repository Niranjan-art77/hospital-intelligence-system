import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, X, ChevronRight, Clock, TrendingUp,
    User, Calendar, FileText, Pill, Stethoscope, Hospital,
    MapPin, Star, Heart, Brain, Activity, AlertTriangle,
    Zap, Target, BarChart3, Download, Share2, Mic, MicOff,
    Camera, Image, Link, Bookmark, Settings, RefreshCw,
    Hash, Tag, Folder, Archive, Trash2, Edit2, Eye,
    MessageCircle, Video, Phone, Mail, Globe, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';

export default function SmartSearch() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [trendingSearches, setTrendingSearches] = useState([]);
    const [filters, setFilters] = useState({
        type: 'all',
        dateRange: 'all',
        category: 'all',
        sortBy: 'relevance'
    });
    const [isSearching, setIsSearching] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const searchInputRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        fetchInitialData();
        initializeVoiceSearch();
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const fetchInitialData = async () => {
        try {
            const [trendingRes, recentRes, bookmarksRes] = await Promise.all([
                API.get(`/search/trending?userId=${user?.id}`),
                API.get(`/search/recent?userId=${user?.id}`),
                API.get(`/search/bookmarks?userId=${user?.id}`)
            ]);

            setTrendingSearches(trendingRes.data || generateMockTrendingSearches());
            setRecentSearches(recentRes.data || generateMockRecentSearches());
            setBookmarks(bookmarksRes.data || []);
        } catch (error) {
            console.error('Failed to fetch initial search data:', error);
            setTrendingSearches(generateMockTrendingSearches());
            setRecentSearches(generateMockRecentSearches());
        }
    };

    const generateMockTrendingSearches = () => [
        { query: 'blood pressure monitoring', count: 1234, trend: 'up' },
        { query: 'diabetes symptoms', count: 892, trend: 'up' },
        { query: 'heart healthy diet', count: 756, trend: 'stable' },
        { query: 'medication side effects', count: 645, trend: 'down' },
        { query: 'sleep quality tips', count: 523, trend: 'up' }
    ];

    const generateMockRecentSearches = () => [
        { query: 'Dr. Sarah Johnson cardiology', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
        { query: 'metformin dosage guidelines', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
        { query: 'blood pressure normal range', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
        { query: 'emergency contacts list', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() }
    ];

    const initializeVoiceSearch = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                setQuery(transcript);
                
                if (event.results[0].isFinal) {
                    handleSearch(transcript);
                    setIsListening(false);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                addToast({
                    type: 'error',
                    title: 'Voice Search Error',
                    message: 'Unable to process voice input. Please try again.'
                });
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    };

    const handleSearch = useCallback(async (searchQuery = query) => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setSuggestions([]);

        try {
            const searchData = {
                query: searchQuery,
                userId: user?.id,
                filters,
                timestamp: new Date().toISOString()
            };

            // Simulate API call with enhanced results
            const mockResults = generateSearchResults(searchQuery, filters);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            setResults(mockResults);
            
            // Update recent searches
            const newSearch = {
                query: searchQuery,
                timestamp: new Date().toISOString()
            };
            setRecentSearches(prev => [newSearch, ...prev.slice(0, 9)]);
            
            // Log search for analytics
            API.post('/search/log', searchData).catch(console.error);
            
        } catch (error) {
            console.error('Search failed:', error);
            addToast({
                type: 'error',
                title: 'Search Failed',
                message: 'Unable to perform search. Please try again.'
            });
        } finally {
            setIsSearching(false);
        }
    }, [query, filters, user?.id]);

    const generateSearchResults = (searchQuery, searchFilters) => {
        const allResults = [
            {
                id: 1,
                type: 'doctor',
                title: 'Dr. Sarah Johnson - Cardiology Specialist',
                description: 'Expert in interventional cardiology with 12 years of experience. Specializes in heart failure and arrhythmia treatment.',
                category: 'Healthcare Providers',
                url: '/patient/directory/dr-sarah-johnson',
                timestamp: new Date().toISOString(),
                relevance: 95,
                metadata: {
                    specialty: 'Cardiology',
                    experience: '12 years',
                    rating: 4.8,
                    location: 'City General Hospital',
                    availability: 'Available Today'
                },
                tags: ['cardiology', 'heart', 'specialist', 'experienced'],
                bookmarked: false
            },
            {
                id: 2,
                type: 'medication',
                title: 'Metformin - Complete Guide',
                description: 'Comprehensive information about Metformin dosage, side effects, interactions, and usage guidelines for diabetes management.',
                category: 'Medications',
                url: '/patient/prescriptions/metformin',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                relevance: 88,
                metadata: {
                    dosage: '500mg - 2000mg',
                    frequency: 'Twice daily',
                    commonSideEffects: ['Nausea', 'Diarrhea', 'Stomach upset'],
                    contraindications: ['Kidney disease', 'Severe infection']
                },
                tags: ['diabetes', 'medication', 'dosage', 'guidelines'],
                bookmarked: true
            },
            {
                id: 3,
                type: 'article',
                title: 'Understanding Blood Pressure Readings',
                description: 'Learn how to interpret blood pressure measurements, normal ranges, and what different readings mean for your health.',
                category: 'Health Education',
                url: '/patient/articles/blood-pressure-guide',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                relevance: 82,
                metadata: {
                    readTime: '5 minutes',
                    difficulty: 'Beginner',
                    author: 'Medical Content Team',
                    lastUpdated: '2024-01-10'
                },
                tags: ['blood pressure', 'vitals', 'health education', 'guide'],
                bookmarked: false
            },
            {
                id: 4,
                type: 'appointment',
                title: 'Upcoming Cardiology Consultation',
                description: 'Scheduled appointment with Dr. Sarah Johnson for heart health evaluation and treatment review.',
                category: 'Appointments',
                url: '/patient/appointments/12345',
                timestamp: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
                relevance: 75,
                metadata: {
                    date: '2024-01-16',
                    time: '3:00 PM',
                    location: 'City General Hospital',
                    type: 'In-Person Consultation',
                    status: 'Confirmed'
                },
                tags: ['appointment', 'cardiology', 'consultation', 'upcoming'],
                bookmarked: false
            },
            {
                id: 5,
                type: 'lab_result',
                title: 'Recent Blood Test Results',
                description: 'Complete blood count, metabolic panel, and lipid profile results from January 10, 2024.',
                category: 'Medical Records',
                url: '/patient/reports/blood-test-2024-01-10',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
                relevance: 70,
                metadata: {
                    testDate: '2024-01-10',
                    testType: 'Comprehensive Metabolic Panel',
                    results: 'Normal with slight elevation in cholesterol',
                    doctor: 'Dr. Emily Rodriguez'
                },
                tags: ['lab results', 'blood test', 'medical records', 'reports'],
                bookmarked: false
            }
        ];

        // Filter results based on search query and filters
        let filteredResults = allResults.filter(result => {
            const matchesQuery = searchQuery.toLowerCase().split(' ').every(term =>
                result.title.toLowerCase().includes(term) ||
                result.description.toLowerCase().includes(term) ||
                result.tags.some(tag => tag.toLowerCase().includes(term))
            );

            const matchesType = searchFilters.type === 'all' || result.type === searchFilters.type;
            const matchesCategory = searchFilters.category === 'all' || result.category === searchFilters.category;

            return matchesQuery && matchesType && matchesCategory;
        });

        // Sort results based on selected sort option
        filteredResults.sort((a, b) => {
            switch (searchFilters.sortBy) {
                case 'relevance':
                    return b.relevance - a.relevance;
                case 'date':
                    return new Date(b.timestamp) - new Date(a.timestamp);
                case 'alphabetical':
                    return a.title.localeCompare(b.title);
                default:
                    return b.relevance - a.relevance;
            }
        });

        return filteredResults;
    };

    const getSuggestions = useCallback(async (input) => {
        if (input.length < 2) {
            setSuggestions([]);
            return;
        }

        try {
            // Simulate API call for suggestions
            const mockSuggestions = [
                `${input} symptoms`,
                `${input} treatment`,
                `${input} specialist`,
                `best ${input} doctor near me`,
                `${input} medication side effects`,
                `${input} prevention tips`
            ].slice(0, 5);

            setSuggestions(mockSuggestions);
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
        }
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        getSuggestions(value);
    };

    const handleVoiceSearch = () => {
        if (!recognitionRef.current) {
            addToast({
                type: 'error',
                title: 'Voice Search Not Available',
                message: 'Your browser does not support voice search.'
            });
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        } else if (e.key === 'Escape') {
            setSuggestions([]);
        }
    };

    const selectSuggestion = (suggestion) => {
        setQuery(suggestion);
        setSuggestions([]);
        handleSearch(suggestion);
    };

    const toggleBookmark = async (resultId) => {
        setResults(prev => prev.map(result =>
            result.id === resultId ? { ...result, bookmarked: !result.bookmarked } : result
        ));

        const result = results.find(r => r.id === resultId);
        if (result.bookmarked) {
            setBookmarks(prev => prev.filter(b => b.id !== resultId));
            addToast({
                type: 'info',
                title: 'Bookmark Removed',
                message: 'Item has been removed from bookmarks.'
            });
        } else {
            setBookmarks(prev => [...prev, result]);
            addToast({
                type: 'success',
                title: 'Bookmarked',
                message: 'Item has been added to bookmarks.'
            });
        }
    };

    const shareResult = async (result) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: result.title,
                    text: result.description,
                    url: window.location.origin + result.url
                });
            } catch (error) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(`${result.title}\n${result.description}\n${window.location.origin + result.url}`);
            addToast({
                type: 'success',
                title: 'Link Copied',
                message: 'Search result link has been copied to clipboard.'
            });
        }
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setSuggestions([]);
        searchInputRef.current?.focus();
    };

    const getResultIcon = (type) => {
        switch (type) {
            case 'doctor': return <Stethoscope className="w-5 h-5" />;
            case 'medication': return <Pill className="w-5 h-5" />;
            case 'article': return <FileText className="w-5 h-5" />;
            case 'appointment': return <Calendar className="w-5 h-5" />;
            case 'lab_result': return <Activity className="w-5 h-5" />;
            case 'hospital': return <Hospital className="w-5 h-5" />;
            default: return <FileText className="w-5 h-5" />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'doctor': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
            case 'medication': return 'text-green-400 bg-green-400/10 border-green-400/30';
            case 'article': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
            case 'appointment': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
            case 'lab_result': return 'text-red-400 bg-red-400/10 border-red-400/30';
            case 'hospital': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="p-4 md:p-8 min-h-screen bg-[#020617] text-white font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl font-black text-white tracking-tight mb-4 flex items-center justify-center gap-4">
                        <Search className="w-12 h-12 text-blue-500" />
                        Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Search</span>
                    </h1>
                    <p className="text-slate-500 font-bold tracking-[0.3em] text-xs uppercase">
                        AI-POWERED HEALTH SEARCH • INTELLIGENT DISCOVERY
                    </p>
                </motion.div>

                {/* Search Bar */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="relative max-w-3xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={query}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                placeholder="Search doctors, medications, articles, appointments..."
                                className="w-full pl-14 pr-32 py-6 bg-slate-800/50 border border-white/10 rounded-2xl text-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                            />
                            
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                {query && (
                                    <button
                                        onClick={clearSearch}
                                        className="p-2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                                
                                <button
                                    onClick={handleVoiceSearch}
                                    className={`p-3 rounded-xl transition-all ${
                                        isListening 
                                            ? 'bg-red-500 text-white animate-pulse' 
                                            : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
                                    }`}
                                    title="Voice Search"
                                >
                                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                                
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-3 rounded-xl transition-all ${
                                        showFilters 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
                                    }`}
                                    title="Filters"
                                >
                                    <Filter className="w-5 h-5" />
                                </button>
                                
                                <button
                                    onClick={() => handleSearch()}
                                    disabled={isSearching || !query.trim()}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-black hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSearching ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Search className="w-5 h-5" />
                                    )}
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Suggestions Dropdown */}
                        <AnimatePresence>
                            {suggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                >
                                    {suggestions.map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => selectSuggestion(suggestion)}
                                            className="w-full px-6 py-4 text-left hover:bg-slate-800 transition-colors flex items-center gap-3"
                                        >
                                            <Search className="w-4 h-4 text-slate-400" />
                                            <span className="text-white">{suggestion}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Quick Filters */}
                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                        {['doctors', 'medications', 'articles', 'appointments'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => {
                                    setFilters({ ...filters, type: filter });
                                    handleSearch(filter);
                                }}
                                className="px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-sm font-black hover:bg-slate-800 transition-all capitalize"
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Advanced Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 bg-slate-800/30 border border-white/10 rounded-2xl p-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Type</label>
                                    <select
                                        value={filters.type}
                                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                        className="w-full p-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="doctor">Doctors</option>
                                        <option value="medication">Medications</option>
                                        <option value="article">Articles</option>
                                        <option value="appointment">Appointments</option>
                                        <option value="lab_result">Lab Results</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Date Range</label>
                                    <select
                                        value={filters.dateRange}
                                        onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                                        className="w-full p-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                        <option value="year">This Year</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Category</label>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                        className="w-full p-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none"
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="Healthcare Providers">Healthcare Providers</option>
                                        <option value="Medications">Medications</option>
                                        <option value="Health Education">Health Education</option>
                                        <option value="Appointments">Appointments</option>
                                        <option value="Medical Records">Medical Records</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Sort By</label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                        className="w-full p-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none"
                                    >
                                        <option value="relevance">Relevance</option>
                                        <option value="date">Date</option>
                                        <option value="alphabetical">Alphabetical</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Search Results */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Results */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3"
                    >
                        {results.length > 0 && (
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-black text-white">
                                    Found {results.length} results for "{query}"
                                </h2>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-slate-400 hover:text-white transition-colors">
                                        <Download className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-slate-400 hover:text-white transition-colors">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {results.map((result, idx) => (
                                <motion.div
                                    key={result.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-6 bg-slate-800/50 border border-white/10 rounded-2xl hover:bg-slate-800/70 transition-all group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${getTypeColor(result.type)}`}>
                                            {getResultIcon(result.type)}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors mb-1">
                                                        {result.title}
                                                    </h3>
                                                    <p className="text-slate-400 text-sm mb-3">
                                                        {result.description}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => toggleBookmark(result.id)}
                                                        className="p-2 text-slate-400 hover:text-yellow-400 transition-colors"
                                                    >
                                                        <Bookmark className={`w-4 h-4 ${result.bookmarked ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                                    </button>
                                                    <button
                                                        onClick={() => shareResult(result)}
                                                        className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                                                    >
                                                        <Share2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                                                <span className={`px-2 py-1 rounded-lg border ${getTypeColor(result.type)}`}>
                                                    {result.category}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTimestamp(result.timestamp)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Target className="w-3 h-3" />
                                                    {result.relevance}% match
                                                </span>
                                            </div>

                                            {result.tags && (
                                                <div className="flex flex-wrap gap-2">
                                                    {result.tags.map((tag, tagIdx) => (
                                                        <span
                                                            key={tagIdx}
                                                            className="px-2 py-1 bg-slate-700/50 rounded-lg text-xs text-slate-300"
                                                        >
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {isSearching && (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                                </div>
                            )}

                            {!isSearching && query && results.length === 0 && (
                                <div className="text-center py-12">
                                    <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-black text-white mb-2">No results found</h3>
                                    <p className="text-slate-400">Try different keywords or adjust your filters</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {/* Recent Searches */}
                        {recentSearches.length > 0 && (
                            <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                    Recent Searches
                                </h3>
                                <div className="space-y-3">
                                    {recentSearches.slice(0, 5).map((search, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setQuery(search.query);
                                                handleSearch(search.query);
                                            }}
                                            className="w-full text-left p-3 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-all group"
                                        >
                                            <div className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">
                                                {search.query}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {formatTimestamp(search.timestamp)}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Trending Searches */}
                        {trendingSearches.length > 0 && (
                            <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-green-400" />
                                    Trending Searches
                                </h3>
                                <div className="space-y-3">
                                    {trendingSearches.map((trend, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setQuery(trend.query);
                                                handleSearch(trend.query);
                                            }}
                                            className="w-full text-left p-3 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-all group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">
                                                    {trend.query}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-400">{trend.count}</span>
                                                    {trend.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
                                                    {trend.trend === 'down' && <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Bookmarks */}
                        {bookmarks.length > 0 && (
                            <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                                    <Bookmark className="w-5 h-5 text-yellow-400" />
                                    Bookmarks
                                </h3>
                                <div className="space-y-3">
                                    {bookmarks.slice(0, 3).map((bookmark, idx) => (
                                        <div key={idx} className="p-3 bg-slate-700/50 rounded-xl">
                                            <div className="text-sm font-black text-white mb-1">
                                                {bookmark.title}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {bookmark.category}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
