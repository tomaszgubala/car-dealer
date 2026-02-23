'use client'

import { useState } from 'react'
import { PlayCircle, RefreshCw } from 'lucide-react'

function ImportPageContent() {
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<Array<{ connector: string; newCount: number; updatedCount: number; errorCount: number }> | null>(null)
  const [error, setError] = useState('')

  const run = async () => {
    setRunning(true)
    setError('')
    setResults(null)
    try {
      const res = await fetch('/api/import/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setResults(data.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Import zewnętrzny</h1>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900">Skonfigurowane connektory</h2>
          <p className="text-sm text-gray-400 mt-1">Uruchom import ręcznie lub poczekaj na automatyczny harmonogram (co 30 min).</p>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900">SampleExternalAPI</div>
            <div className="text-sm text-gray-400">Mock connector — przykład integracji</div>
          </div>
          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">Aktywny</span>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</div>
        )}

        {results && (
          <div className="space-y-2">
            {results.map((r) => (
              <div key={r.connector} className="bg-green-50 border border-green-100 rounded-xl p-4">
                <div className="font-medium text-green-900">{r.connector}</div>
                <div className="text-sm text-green-700">
                  +{r.newCount} nowe · ~{r.updatedCount} zaktualizowane · {r.errorCount} błędy
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={run}
          disabled={running}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
          {running ? 'Trwa import...' : 'Uruchom import teraz'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <h3 className="font-semibold text-blue-900 mb-2">Jak dodać nowy connector?</h3>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Utwórz plik w <code className="bg-blue-100 px-1 rounded">src/lib/connectors/your-connector.ts</code></li>
          <li>Zaimplementuj interfejs <code className="bg-blue-100 px-1 rounded">Connector</code></li>
          <li>Zmapuj dane zewnętrzne na <code className="bg-blue-100 px-1 rounded">ConnectorVehicle</code> używając <code className="bg-blue-100 px-1 rounded">validateConnectorVehicle()</code></li>
          <li>Zarejestruj go w <code className="bg-blue-100 px-1 rounded">src/lib/connectors/registry.ts</code></li>
        </ol>
      </div>
    </div>
  )
}

export default ImportPageContent
