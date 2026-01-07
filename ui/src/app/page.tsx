'use client'

import { useState } from 'react'
import axios from 'axios'

type SearchResult = {
  doc_id: number
  score: number
  title: string
  url: string
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (page = 1) => {
    if (!query.trim()) return

    setLoading(true)
    setError('')
    try {
      const res = await axios.get('http://localhost:3001/search', {
        params: { query, page }
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
    <div className="min-h-screen flex flex-col bg-white">
      {results.length > 0 && (
        <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-4">
              <a href="/" className="flex-shrink-0 cursor-pointer" onClick={(e) => { e.preventDefault(); setResults([]); setQuery(''); }}>
                <svg width="90" height="30" viewBox="0 0 400 80" className="h-8">
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
              <div className="flex-1 max-w-2xl flex items-center gap-4">
                <div className="relative flex-1">
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
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full hover:bg-blue-700 text-sm"
                  >
                    {loading ? '...' : 'Ara'}
                  </button>
                </div>
              </div>
              <div className="ml-auto">
                <a href="/web-mining" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                  Web Mining
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        {results.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center -mt-20">
            <div className="text-center mb-8">
              <div className="flex justify-end absolute top-4 right-4 sm:top-6 sm:right-6">
                 <a href="/web-mining" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                   Web Mining
                 </a>
              </div>
              <div className="flex items-center justify-center mb-6">
                <svg width="400" height="80" viewBox="0 0 400 80" className="mb-2">
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-6xl font-bold tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
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
            </div>

            <div className="w-full max-w-2xl space-y-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Web'de arayın..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full p-4 pr-24 text-lg border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(1)}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <button
                    onClick={() => handleSearch(1)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 font-medium transition-colors"
                    >
                    {loading ? '...' : 'Ara'}
                    </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative text-sm" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="py-6">
            <div className="max-w-4xl">
              <div className="space-y-6">
                {results.map((result) => (
                  <div key={result.doc_id} className="group">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <cite className="not-italic text-gray-700 truncate max-w-[300px]">{result.url}</cite>
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">Score: {result.score.toFixed(4)}</span>
                      </div>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl text-blue-800 group-hover:underline visited:text-purple-900 font-medium leading-tight"
                      >
                        {result.title || result.url}
                      </a>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {/* Description would go here if we had snippets */}
                        Bu sonuç {result.title} başlığına ve {result.url} adresine sahiptir. Arama skoruna göre sıralanmıştır.
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center items-center py-10 gap-4">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white text-sm font-medium"
                >
                  Önceki
                </button>
                <div className="text-sm text-gray-600 font-medium">
                  Sayfa {currentPage} / {totalPages}
                </div>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white text-sm font-medium"
                >
                  Sonraki
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
