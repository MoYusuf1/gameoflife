'use client';

import React, { useState } from 'react';
import { GameEngine, PATTERNS } from '../engine/GameEngine';

interface ControlPanelProps {
    gameEngine: GameEngine;
    onSpeedChange: (speed: number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ gameEngine, onSpeedChange }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [speed, setSpeed] = useState(100); // Default speed in ms
    const [selectedPattern, setSelectedPattern] = useState<string>('GLIDER');
    const [generation, setGeneration] = useState(0);

    // Toggle simulation running state
    const toggleSimulation = () => {
        if (isRunning) {
            gameEngine.stop();
            setIsRunning(false);
        } else {
            gameEngine.start(() => {
                // Update generation count when callback is triggered
                setGeneration(gameEngine.getGeneration());
            });
            setIsRunning(true);
        }
    };

    // Handle speed change
    const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSpeed = parseInt(e.target.value);
        setSpeed(newSpeed);
        onSpeedChange(newSpeed);
        gameEngine.setSpeed(newSpeed);
    };

    // Clear the grid
    const clearGrid = () => {
        gameEngine.clear();
        setGeneration(0);
        if (isRunning) {
            gameEngine.stop();
            setIsRunning(false);
        }
    };

    // Add selected pattern to the grid
    const addPattern = () => {
        // Add pattern at the center of the visible area (approximate)
        const pattern = PATTERNS[selectedPattern as keyof typeof PATTERNS];
        if (pattern) {
            gameEngine.addPattern(pattern, 10, 10); // Add at position 10,10 for now
            setGeneration(gameEngine.getGeneration());
        }
    };

    // Handle pattern selection change
    const handlePatternChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPattern(e.target.value);
    };

    // Generate next generation manually
    const nextGen = () => {
        gameEngine.nextGeneration();
        setGeneration(gameEngine.getGeneration());
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold dark:text-white">Game Controls</h2>
                    <div className="text-sm font-mono dark:text-white">Generation: {generation}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={toggleSimulation}
                        className={`px-4 py-2 rounded-md font-medium text-sm ${isRunning 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'bg-green-500 hover:bg-green-600 text-white'}`}
                    >
                        {isRunning ? 'Stop' : 'Start'}
                    </button>
                    
                    <button 
                        onClick={nextGen}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium text-sm"
                        disabled={isRunning}
                    >
                        Next Gen
                    </button>
                    
                    <button 
                        onClick={clearGrid}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium text-sm"
                    >
                        Clear Grid
                    </button>
                    
                    <button 
                        onClick={addPattern}
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md font-medium text-sm"
                    >
                        Add Pattern
                    </button>
                </div>
                
                <div className="space-y-2">
                    <label className="block text-sm font-medium dark:text-white">
                        Pattern:
                        <select 
                            value={selectedPattern}
                            onChange={handlePatternChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            {Object.keys(PATTERNS).map((pattern) => (
                                <option key={pattern} value={pattern}>
                                    {pattern.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </label>
                    
                    <label className="block text-sm font-medium dark:text-white">
                        Speed: {speed}ms
                        <input 
                            type="range" 
                            min="10" 
                            max="500" 
                            step="10"
                            value={speed}
                            onChange={handleSpeedChange}
                            className="mt-1 block w-full"
                        />
                    </label>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    <p>Click on the grid to toggle cells</p>
                    <p>Use mouse wheel to zoom in/out</p>
                    <p>Right-click or middle-click to pan</p>
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;