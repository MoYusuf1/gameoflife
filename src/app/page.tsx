'use client';

import { useState } from 'react';
import { GameEngine } from './components/engine/GameEngine';
import GameGrid from './components/engine/GameGrid';
import ControlPanel from './components/controls/ControlPanel';

export default function Home() {
  // Create a game engine instance
  const [gameEngine] = useState(() => new GameEngine());
  const [cellSize] = useState(10); // Default cell size
  
  // Handle speed change from control panel
  const handleSpeedChange = () => {
    // Speed is handled directly by the GameEngine
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          Conway&apos;s Game of Life
        </h1>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col md:flex-row p-4 gap-4">
        {/* Game grid container */}
        <div className="flex-grow bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-[60vh] md:h-auto">
          <GameGrid 
            gameEngine={gameEngine} 
            cellSize={cellSize} 
          />
        </div>

        {/* Controls sidebar */}
        <div className="w-full md:w-80">
          <ControlPanel 
            gameEngine={gameEngine} 
            onSpeedChange={handleSpeedChange} 
          />
          
          {/* Game info */}
          <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2 dark:text-white">About Game of Life</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Conway&apos;s Game of Life is a cellular automaton devised by mathematician John Conway in 1970.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              The game evolves based on four simple rules:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>Any live cell with fewer than two live neighbors dies (underpopulation)</li>
              <li>Any live cell with two or three live neighbors lives on</li>
              <li>Any live cell with more than three live neighbors dies (overpopulation)</li>
              <li>Any dead cell with exactly three live neighbors becomes alive (reproduction)</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Created with Next.js and TypeScript</p>
      </footer>
    </div>
  );
}
