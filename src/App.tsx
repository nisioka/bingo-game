import React from 'react';
import './App.css';
import BingoGame from './components/BingoGame';

function App() {
  return (
    <div className="App min-h-screen bg-blue-50 flex flex-col items-center justify-center p-2">
      <header className="mb-2">
        <h1 className="text-3xl font-bold text-blue-600">ビンゴゲーム</h1>
      </header>
      <main className="w-full max-w-full px-2">
        <BingoGame />
      </main>
      <footer className="mt-2 text-xs text-gray-500">
        <p>© {new Date().getFullYear()} ビンゴゲーム</p>
      </footer>
    </div>
  );
}

export default App;
