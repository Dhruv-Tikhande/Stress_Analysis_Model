import { useState } from 'react';
import { Brain, AlertCircle, Loader2, CheckCircle, AlertTriangle, Activity } from 'lucide-react';

// interface AnalysisResult { ... } // If using TypeScript, keep this. Since it's jsx, I'll remove the TS types for clean copy-paste, but you can leave them if you're using .tsx!

function App() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyzeText = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Unable to connect to the AI Engine. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getStressLevel = (probability) => {
    if (probability < 50) {
      return {
        level: 'Relaxed / Low Stress',
        cardBg: 'bg-emerald-50 border-emerald-200',
        textColor: 'text-emerald-900',
        iconColor: 'text-emerald-600',
        barColor: 'bg-emerald-500',
        icon: CheckCircle,
        message: 'No significant signs of stress detected. The text indicates a calm or neutral state of mind.',
      };
    } else if (probability <= 70) {
      return {
        level: 'Moderately Stressed',
        cardBg: 'bg-amber-50 border-amber-200',
        textColor: 'text-amber-900',
        iconColor: 'text-amber-600',
        barColor: 'bg-amber-500',
        icon: AlertTriangle,
        message: `Warning: User may be feeling overwhelmed. Moderate indicators of anxiety or stress detected.`,
      };
    } else {
      return {
        level: 'Highly Stressed',
        cardBg: 'bg-rose-50 border-rose-200',
        textColor: 'text-rose-900',
        iconColor: 'text-rose-600',
        barColor: 'bg-rose-600',
        icon: AlertCircle,
        message: `Alert: High indicators of psychological stress. Immediate signs of panic, anxiety, or crisis.`,
      };
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-slate-100 font-sans text-slate-800 selection:bg-blue-200">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        
        {/* Header Section */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6">
            <Brain className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            MindText <span className="text-blue-600">Analyzer</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
            Advanced NLP engine designed to detect linguistic patterns of psychological stress, burnout, and anxiety.
          </p>
        </header>

        {/* Input Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-blue-900/5 p-6 md:p-8 mb-8 border border-slate-200/60">
          <label htmlFor="text-input" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
            <Activity className="w-4 h-4 text-blue-500" />
            Enter Text for Analysis
          </label>
          <div className="relative">
            <textarea
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste a Reddit post, journal entry, or message here..."
              rows={6}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none resize-none text-slate-700 placeholder-slate-400 transition-all duration-300 shadow-inner text-base leading-relaxed"
            />
          </div>

          <button
            onClick={analyzeText}
            disabled={loading || !text.trim()}
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Processing Data...
              </>
            ) : (
              <>
                <Brain className="w-6 h-6" />
                Analyze Text
              </>
            )}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 mb-8 flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-2 bg-rose-100 rounded-full flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h4 className="font-semibold text-rose-900">Connection Error</h4>
              <p className="text-rose-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-8 border border-slate-200 animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Activity className="w-5 h-5 text-blue-600" />
              Diagnostic Results
            </h2>

            {(() => {
              const stress = getStressLevel(result.stress_probability);
              const Icon = stress.icon;
              return (
                <div className={`${stress.cardBg} border rounded-2xl p-6 md:p-8 mb-8 transition-colors duration-300 relative overflow-hidden`}>
                  {/* Decorative background circle */}
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                  
                  <div className="flex items-start gap-5 relative z-10">
                    <div className="p-3 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm flex-shrink-0">
                      <Icon className={`w-8 h-8 ${stress.iconColor}`} />
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-end mb-2">
                        <h3 className={`text-2xl font-bold ${stress.textColor}`}>
                          {stress.level}
                        </h3>
                        <span className={`text-xl font-extrabold ${stress.textColor}`}>
                          {result.stress_probability.toFixed(1)}%
                        </span>
                      </div>
                      
                      {/* Stress Meter (Progress Bar) */}
                      <div className="w-full bg-black/5 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
                        <div 
                          className={`h-3 rounded-full ${stress.barColor} transition-all duration-1000 ease-out`}
                          style={{ width: `${result.stress_probability}%` }}
                        ></div>
                      </div>

                      <p className={`${stress.textColor} leading-relaxed font-medium opacity-90`}>
                        {stress.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Text Analyzed</h4>
              <p className="text-slate-600 text-sm leading-relaxed italic border-l-4 border-slate-300 pl-4">
                "{result.original_text}"
              </p>
            </div>
          </div>
        )}

        <footer className="text-center mt-12 text-slate-400 text-sm font-medium">
          <p>Powered by Natural Language Processing & Machine Learning</p>
        </footer>
      </div>
    </div>
  );
}

export default App;