export default function Login() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 rounded-xl p-8 w-80 space-y-4">
        <h1 className="text-white text-xl font-bold text-center">RP Lounge Manager</h1>
        <input type="email" placeholder="Email"
          className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="password" placeholder="密碼"
          className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded text-sm transition-colors">
          登入
        </button>
      </div>
    </div>
  )
}
