import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="max-w-xl w-full px-8 text-center space-y-8">
        <div className="space-y-4">
          <svg width="400" height="80" viewBox="0 0 400 80" className="mx-auto">
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
          <p className="text-xl text-gray-600">Web Madenciliği Projesi</p>
        </div>

        <nav className="flex flex-col gap-4">
          <Link 
            href="/web-mining"
            className="flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-full text-blue-600 group-hover:bg-blue-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Arama Motoru</h3>
                <p className="text-sm text-gray-500">Gelişmiş web arama motorunu kullanın</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-blue-500 transition-colors">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </Link>
        </nav>

        <footer className="pt-8 text-sm text-gray-500">
          <p>&copy; 2024 dln-finder. Tüm hakları saklıdır.</p>
        </footer>
      </div>
    </div>
  )
}
