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
      const res = await axios.get('http://localhost:3001/advanced-search', {
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
    <div className="min-h-screen flex flex-col">
      {results.length > 0 && (
        <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center space-x-4">
              <a href="/" className="flex-shrink-0">
                <svg width="120" height="30" viewBox="0 0 400 80" className="h-8">
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-xl font-bold tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                    <tspan fill="#4285F4" style={{ fontWeight: '500' }}>d</tspan>
                    <tspan fill="#EA4335" style={{ fontWeight: '500' }}>l</tspan>
                    <tspan fill="#FBBC05" style={{ fontWeight: '500' }}>n</tspan>
                    <tspan> </tspan>
                    <tspan fill="#4285F4" style={{ fontWeight: '500' }}>f</tspan>
                    <tspan fill="#EA4335" style={{ fontWeight: '500' }}>i</tspan>
                    <tspan fill="#FBBC05" style={{ fontWeight: '500' }}>n</tspan>
                    <tspan fill="#4285F4" style={{ fontWeight: '500' }}>d</tspan>
                    <tspan fill="#EA4335" style={{ fontWeight: '500' }}>e</tspan>
                    <tspan fill="#FBBC05" style={{ fontWeight: '500' }}>r</tspan>
                  </text>
                </svg>
              </a>
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Arama sorgusu"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full p-2 pr-12 text-base border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(1)}
                  />
                  <button
                    onClick={() => handleSearch(1)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full hover:bg-blue-700 text-sm"
                  >
                    {loading ? 'Aranıyor...' : 'Ara'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {results.length === 0 && (
          <div className="py-12">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <svg width="400" height="80" viewBox="0 0 400 80" className="mb-2">
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-5xl font-bold tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                    <tspan fill="#4285F4" style={{ fontWeight: '500' }}>d</tspan>
                    <tspan fill="#EA4335" style={{ fontWeight: '500' }}>l</tspan>
                    <tspan fill="#FBBC05" style={{ fontWeight: '500' }}>n</tspan>
                    <tspan> </tspan>
                    <tspan fill="#4285F4" style={{ fontWeight: '500' }}>f</tspan>
                    <tspan fill="#EA4335" style={{ fontWeight: '500' }}>i</tspan>
                    <tspan fill="#FBBC05" style={{ fontWeight: '500' }}>n</tspan>
                    <tspan fill="#4285F4" style={{ fontWeight: '500' }}>d</tspan>
                    <tspan fill="#EA4335" style={{ fontWeight: '500' }}>e</tspan>
                    <tspan fill="#FBBC05" style={{ fontWeight: '500' }}>r</tspan>
                  </text>
                </svg>
              </div>
              <p className="text-gray-600 text-sm tracking-wide">Web Madenciliği Projesi</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
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

              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Arama Ağırlıkları</h2>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">α (BM25)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={alpha}
                      onChange={(e) => setAlpha(parseFloat(e.target.value))}
                      className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">β (PageRank)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={beta}
                      onChange={(e) => setBeta(parseFloat(e.target.value))}
                      className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">γ (HITS)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={gamma}
                      onChange={(e) => setGamma(parseFloat(e.target.value))}
                      className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
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
          </div>
        )}

        {results.length > 0 && (
          <div className="py-6">
            <div className="max-w-5xl mx-auto">
              <div className="space-y-4">
                {results.map((result) => (
                  <div key={result.doc_id} className="p-4 hover:bg-gray-50 rounded-lg">
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
                      <p className="text-sm text-gray-500">
                        Doküman ID: {result.doc_id}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center py-6">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-gray-100"
                >
                  ⬅️ Önceki
                </button>
                <span className="text-sm text-gray-600">
                  Sayfa {currentPage} / {totalPages}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-gray-100"
                >
                  Sonraki ➡️
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
