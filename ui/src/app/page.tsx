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
    <div className="min-h-screen flex flex-col items-center justify-start pt-20">
      <div className="max-w-3xl w-full mx-auto p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-blue-600 mb-2">dln finder</h1>
          <p className="text-gray-600">Web Madenciliği Projesi</p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Arama sorgusu"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-4 pr-12 text-lg border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(1)}
            />
            <button
              onClick={() => handleSearch(1)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700"
            >
              {loading ? 'Aranıyor...' : 'Ara'}
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Arama Ağırlıkları</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">α (BM25)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={alpha}
                  onChange={(e) => setAlpha(parseFloat(e.target.value))}
                  className="mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">β (PageRank)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={beta}
                  onChange={(e) => setBeta(parseFloat(e.target.value))}
                  className="mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">γ (HITS)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={gamma}
                  onChange={(e) => setGamma(parseFloat(e.target.value))}
                  className="mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {results.map((result) => (
            <div key={result.doc_id} className="p-4 hover:bg-gray-50">
              <div className="flex flex-col space-y-1">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl text-blue-800 hover:underline"
                >
                  {result.title || result.url}
                </a>
                <p className="text-sm text-green-700 truncate">
                  {result.url}
                </p>
                <p className="text-sm text-gray-600">
                  Skor: {result.score.toFixed(4)}
                </p>
              </div>
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
