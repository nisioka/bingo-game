import React from 'react';
import './App.css';
import BingoGame from './components/BingoGame';

function App() {
  return (
    <div className="App min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4">
      <header className="mb-6">
        <h1 className="text-4xl font-bold text-blue-600">ビンゴゲーム</h1>
      </header>
      <main className="w-full max-w-lg">
        <BingoGame />
      </main>
      <footer className="mt-8 text-sm text-gray-500">
        <p>© {new Date().getFullYear()} ビンゴゲーム - 幼児向けアプリ</p>
      </footer>
    </div>
  );
}

export default App;