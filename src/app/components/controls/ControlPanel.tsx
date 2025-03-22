'use client';

import React, { useState } from 'react';
import { GameEngine } from '../engine/GameEngine';

interface ControlPanelProps {
    gameEngine: GameEngine;
    onSpeedChange: (speed: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ gameEngine, onSpeedChange }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [speedSetting, setSpeedSetting] = useState<string>('medium'); // Default speed setting
    const speedOptions = ['very slow', 'slow', 'medium', 'fast', 'very fast'];
    const [generation, setGeneration] = useState(0);

    // Toggle simulation running state
    const toggleSimulation = () => {
        if (isRunning) {
            gameEngine.stop();
            setIsRunning(false);
        } else {
            // Update generation count before starting
            setGeneration(gameEngine.getGeneration());
            
            // Start the simulation with a callback that updates the generation count
            gameEngine.start(() => {
                // Update generation count when callback is triggered
                setGeneration(gameEngine.getGeneration());
            });
            setIsRunning(true);
        }
    };

    // Handle speed change
    const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const index = parseInt(e.target.value);
        const newSpeedSetting = speedOptions[index];
        setSpeedSetting(newSpeedSetting);
        onSpeedChange(newSpeedSetting);
        gameEngine.setSpeed(newSpeedSetting);
    };
    
    // Get the index of the current speed setting
    const getSpeedIndex = (speed: string): number => {
        return speedOptions.indexOf(speed);
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
                            : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                    >
                        {isRunning ? 'Stop' : 'Start'}
                    </button>
                    
                    <button 
                        onClick={nextGen}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium text-sm"
                        disabled={isRunning}
                    >
                        Next Gen
                    </button>
                    
                    <button 
                        onClick={clearGrid}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium text-sm col-span-2"
                    >
                        Clear Grid
                   
                    </button>
                </div>
                
                <div className="space-y-2">
                    <div className="block text-sm font-medium dark:text-white">
                        <div className="flex justify-between items-center">
                            <span>Speed:</span>
                            <span className="text-xs font-medium">{speedSetting}</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="4" 
                            step="1"
                            value={getSpeedIndex(speedSetting)}
                            onChange={handleSpeedChange}
                            className="mt-1 block w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                        <div className="flex justify-between text-xs mt-1 dark:text-gray-400">
                            <span>Very Slow</span>
                            <span>Very Fast</span>
                        </div>
                    </div>
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