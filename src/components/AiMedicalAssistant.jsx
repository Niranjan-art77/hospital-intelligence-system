import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Activity, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';

export default function AiMedicalAssistant({ patientData, compact = false }) {
  const [isThinking, setIsThinking] = useState(false);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    if (patientData) {
      setIsThinking(true);
      // Simulate AI processing
      const timer = setTimeout(() => {
        const mockInsights = [
          {
            id: 1,
            type: 'risk',
            title: 'Cardiovascular Risk',
            description: 'Elevated systolic pressure trend detected over last 72 hours.',
            confidence: 94,
            priority: 'high'
          },
          {
            id: 2,
            type: 'suggestion',
            title: 'Medication Adjustment',
            description: 'Consider increasing Metformin dosage to 1000mg based on glucose spikes.',
            confidence: 88,
            priority: 'medium'
          },
          {
            id: 3,
            type: 'prediction',
            title: 'Recovery Outlook',
            description: '85% probability of full recovery within 14 days if protocol is maintained.',
            confidence: 91,
            priority: 'low'
          }
        ];
        setInsights(mockInsights);
        setIsThinking(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [patientData]);

  return (
    <div className={`glass-card p-6 relative overflow-hidden ${compact ? 'max-w-md' : 'w-full'}`}>
      <div className="hud-corner top-left" />
      <div className="hud-corner top-right" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 relative">
            <Brain className={`w-6 h-6 text-blue-400 ${isThinking ? 'animate-pulse' : ''}`} />
            {isThinking && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-t-2 border-blue-400 rounded-full"
              />
            )}
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              NOVA <span className="text-blue-400">AI</span> ASSISTANT
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Neural Diagnostic Engine v4.2</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="status-indicator status-online" />
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Active</span>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {isThinking ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 flex flex-col items-center justify-center gap-4 opacity-50"
            >
              <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
              <p className="text-xs font-mono tracking-widest uppercase animate-pulse">Analyzing physiological data streams...</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {insights.map((insight) => (
                <div 
                  key={insight.id}
                  className={`p-4 rounded-2xl border transition-all hover:translate-x-1 cursor-pointer ${
                    insight.priority === 'high' 
                      ? 'bg-rose-500/5 border-rose-500/20' 
                      : insight.priority === 'medium'
                      ? 'bg-amber-500/5 border-amber-500/20'
                      : 'bg-emerald-500/5 border-emerald-500/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {insight.type === 'risk' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                      {insight.type === 'suggestion' && <ShieldCheck className="w-4 h-4 text-amber-400" />}
                      {insight.type === 'prediction' && <Activity className="w-4 h-4 text-emerald-400" />}
                      <span className="text-xs font-black uppercase tracking-widest text-white">{insight.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{insight.confidence}% confidence</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{insight.description}</p>
                </div>
              ))}
              
              {!compact && (
                <button className="w-full mt-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  View Full Clinical Analysis <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
