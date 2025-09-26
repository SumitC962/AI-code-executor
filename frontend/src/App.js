import React, { useState } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Code, 
  Terminal, 
  Download,
  Loader2
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [maxAttempts, setMaxAttempts] = useState(5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/execute`, {
        prompt: prompt.trim(),
        max_attempts: maxAttempts
      });

      setResult(response.data);
    } catch (error) {
      console.error('Error executing prompt:', error);
      setResult({
        success: false,
        error: error.response?.data?.detail || 'Failed to execute prompt',
        attempts: 0,
        execution_time: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportResults = () => {
    if (!result) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      prompt,
      result: {
        success: result.success,
        code: result.code,
        output: result.output,
        error: result.error,
        attempts: result.attempts,
        execution_time: result.execution_time
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-executor-result-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Code className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Recursive AI Executor
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Max Attempts: {maxAttempts}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Prompt Input Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Enter Your Programming Task
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                Prompt
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Generate code to calculate factorial of a number"
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label htmlFor="maxAttempts" className="text-sm font-medium text-gray-700">
                  Max Attempts:
                </label>
                <select
                  id="maxAttempts"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(parseInt(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={isLoading}
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                </select>
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Status Indicator */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {result.success ? (
                    <CheckCircle className="h-6 w-6 text-success-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-error-500" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {result.success ? 'Execution Successful' : 'Execution Failed'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Attempts: {result.attempts} • Time: {result.execution_time.toFixed(2)}s
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={exportResults}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* Generated Code */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Code className="h-5 w-5 mr-2" />
                  Generated Code
                </h3>
              </div>
              <div className="p-6">
                <SyntaxHighlighter
                  language="python"
                  style={tomorrow}
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.375rem',
                    fontSize: '14px'
                  }}
                >
                  {result.code || 'No code generated'}
                </SyntaxHighlighter>
              </div>
            </div>

            {/* Execution Output */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Terminal className="h-5 w-5 mr-2" />
                  Execution Output
                </h3>
              </div>
              <div className="p-6">
                {result.success ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <pre className="text-green-800 whitespace-pre-wrap font-mono text-sm">
                      {result.output || 'No output'}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <pre className="text-red-800 whitespace-pre-wrap font-mono text-sm">
                      {result.error || 'Unknown error occurred'}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
