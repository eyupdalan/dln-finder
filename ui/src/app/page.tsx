'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

type SearchResult = {
  doc_id: number
  score: number
  title: string
  url: string
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [alpha, setAlpha] = useState(0.6)
  const [beta, setBeta] = useState(0.3)
  const [gamma, setGamma] = useState(0.1)
  const [results, setResults] = useState<SearchResult[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (page = 1) => {
    if (Math.abs(alpha + beta + gamma - 1.0) > 1e-5) {
      setError('α + β + γ toplamı 1 olmalıdır.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await axios.get('http://localhost:3001/search', {
        params: { query, alpha, beta, gamma, page }
      })

      setResults(res.data.results)
      setCurrentPage(res.data.pagination.current_page)
      setTotalPages(res.data.pagination.total_pages)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Bir hata oluştu')
      setResults([])
    }
    setLoading(false)
  }

  const handleNext = () => {
    if (currentPage < totalPages) handleSearch(currentPage + 1)
  }

  const handlePrev = () => {
    if (currentPage > 1) handleSearch(currentPage - 1)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-3xl w-full mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-center">dln finder</h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Arama sorgusu"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold">α (BM25)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={alpha}
                onChange={(e) => setAlpha(parseFloat(e.target.value))}
                className="w-full p-1 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">β (PageRank)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={beta}
                onChange={(e) => setBeta(parseFloat(e.target.value))}
                className="w-full p-1 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">γ (HITS)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={gamma}
                onChange={(e) => setGamma(parseFloat(e.target.value))}
                className="w-full p-1 border rounded"
              />
            </div>
          </div>

          <button
            onClick={() => handleSearch(1)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? 'Aranıyor...' : 'Ara'}
          </button>

          {error && <p className="text-red-500">{error}</p>}
        </div>

        <div className="space-y-3">
          {results.map((result) => (
            <div key={result.doc_id} className="p-4 border rounded hover:shadow">
              <p className="text-sm text-gray-500">Skor: {result.score.toFixed(4)}</p>
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-blue-700 hover:underline"
              >
                {result.title || result.url}
              </a>
            </div>
          ))}
        </div>

        {results.length > 0 && (
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              ⬅️ Önceki
            </button>
            <span className="text-sm text-gray-600">
              Sayfa {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Sonraki ➡️
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
