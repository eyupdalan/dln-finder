'use client'

import { useState } from 'react'
import axios from 'axios'
import Link from 'next/link'

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

  const Logo = ({ size = "normal" }: { size?: "normal" | "large" }) => (
    <div className={`font-bold tracking-tight select-none ${size === 'large' ? 'text-5xl mb-6' : 'text-2xl'}`}>
      <span className="text-blue-600">dln</span>
      <span className="text-gray-400 font-light mx-1">-</span>
      <span className="text-indigo-600">mining</span>
    </div>
  )

  return (
        <div className="min-h-screen flex flex-col bg-slate-50 relative selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 via-white to-blue-50 z-0 pointer-events-none" />

      {/* Sticky Header (Results View) */}
      {results.length > 0 && (
        <header className="sticky top-0 z-50 glass shadow-sm transition-all duration-300">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-6">
              <a href="/web-mining" onClick={(e) => { e.preventDefault(); setResults([]); setQuery(''); }} className="hover:opacity-80 transition-opacity">
                <Logo />
              </a>
              
              <div className="flex-1 max-w-3xl relative group">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="block w-full pl-5 pr-12 py-2.5 bg-white border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm hover:shadow-md"
                  placeholder="Gelişmiş arama..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(1)}
                />
                <button
                  onClick={() => handleSearch(1)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-all shadow-sm"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="hidden sm:block">
                 <Link href="/" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors px-3 py-2 rounded-lg hover:bg-indigo-50">
                   Ana Sayfa
                 </Link>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Search Form (Empty State) */}
        {results.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center -mt-10 animate-in fade-in zoom-in duration-500">
             <div className="absolute top-6 right-6">
              <Link href="/" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors px-4 py-2 rounded-full hover:bg-white/80 hover:shadow-sm">
                Ana Sayfa
              </Link>
            </div>

            <div className="w-full max-w-3xl px-4 flex flex-col items-center space-y-8">
              <div className="text-center">
                <Logo size="large" />
                <p className="text-gray-500 font-medium">Gelişmiş Web Madenciliği Modülü</p>
              </div>
              
              <div className="w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100/50">
                 <div className="relative mb-8 group">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="block w-full px-6 py-4 bg-slate-50 border border-gray-200 rounded-2xl text-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="Analiz edilecek terimleri girin..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch(1)}
                    />
                 </div>

                 <div className="grid grid-cols-3 gap-6 mb-8">
                   {[
                     { label: 'BM25 (α)', value: alpha, setter: setAlpha, color: 'blue' },
                     { label: 'PageRank (β)', value: beta, setter: setBeta, color: 'indigo' },
                     { label: 'HITS (γ)', value: gamma, setter: setGamma, color: 'violet' }
                   ].map((item, idx) => (
                     <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors">
                       <label className="block text-sm font-semibold text-gray-700 mb-2">{item.label}</label>
                       <input
                         type="number"
                         step="0.1"
                         min="0"
                         max="1"
                         value={item.value}
                         onChange={(e) => item.setter(parseFloat(e.target.value))}
                         className={`w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-${item.color}-500/20 focus:border-${item.color}-500 transition-all font-mono text-sm`}
                       />
                     </div>
                   ))}
                 </div>

                 <button
                    onClick={() => handleSearch(1)}
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    {loading ? (
                       <span>Analiz Ediliyor...</span>
                    ) : (
                       <span>Analizi Başlat</span>
                    )}
                  </button>

                  {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Results List */}
        {results.length > 0 && (
          <div className="py-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-4xl mx-auto space-y-6">
              {results.map((result) => (
                <div key={result.doc_id} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-200">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-3 text-sm mb-1">
                      <div className="bg-indigo-50 p-1.5 rounded-lg">
                         <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                         </svg>
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                         <span className="text-gray-900 font-medium truncate">{new URL(result.url).hostname}</span>
                         <span className="text-gray-300">/</span>
                         <span className="text-gray-500 truncate flex-1">{new URL(result.url).pathname}</span>
                      </div>
                      <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium tracking-wide">
                        SCORE: {result.score.toFixed(4)}
                      </span>
                    </div>
                    
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight block"
                    >
                      {result.title || "Adsız Doküman"}
                    </a>
                    
                    <div className="flex gap-4 text-xs text-gray-400 font-mono mt-2">
                       <span>DOC_ID: {result.doc_id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="max-w-4xl mx-auto mt-10 pb-20">
              <div className="flex justify-center items-center gap-2 bg-white p-2 rounded-full shadow-sm border border-gray-100 w-fit mx-auto">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="px-4 text-sm font-medium text-gray-600">
                  <span className="text-indigo-600">{currentPage}</span>
                  <span className="mx-1 text-gray-300">/</span>
                  <span>{totalPages}</span>
                </div>
                
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
