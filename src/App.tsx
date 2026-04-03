import { useState } from 'react';
import { Brain, Loader2 } from 'lucide-react';

function App() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeText = async () => {
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Error from server');
      }

      const prediction = data.prediction === 1 ? 'Stressed 😟' : 'Not Stressed 😊';
      setResult(prediction);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
        <Brain /> Stress Analyzer
      </h1>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text..."
        className="border p-3 w-full max-w-md rounded"
        rows={4}
      />

      <button
        onClick={analyzeText}
        disabled={loading}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded flex items-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" /> Processing...
          </>
        ) : (
          'Analyze'
        )}
      </button>

      {error && <p className="text-red-500 mt-3">{error}</p>}

      {result && (
        <p className="mt-4 text-lg font-semibold">Result: {result}</p>
      )}
    </div>
  );
}

export default App;
