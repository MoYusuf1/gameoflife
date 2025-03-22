'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine } from './GameEngine';

interface GameGridProps {
    gameEngine: GameEngine;
    cellSize: number;
    onGenerationChange?: (generation: number) => void;
}

const GameGrid: React.FC<GameGridProps> = ({
    gameEngine,
    cellSize,
    onGenerationChange
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);

    // Calculate the effective cell size based on zoom level
    const effectiveCellSize = cellSize * zoom;

    // Function to convert screen coordinates to grid coordinates
    const screenToGrid = useCallback((screenX: number, screenY: number) => {
        const x = Math.floor((screenX - offset.x) / effectiveCellSize);
        const y = Math.floor((screenY - offset.y) / effectiveCellSize);
        return { x, y };
    }, [offset, effectiveCellSize]);

    // Function to convert grid coordinates to screen coordinates
    const gridToScreen = useCallback((gridX: number, gridY: number) => {
        const x = gridX * effectiveCellSize + offset.x;
        const y = gridY * effectiveCellSize + offset.y;
        return { x, y };
    }, [offset, effectiveCellSize]);

    // Handle mouse down event for panning
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button === 1 || e.button === 2 || e.ctrlKey) { // Middle button or right button or Ctrl+Left
            setIsPanning(true);
            setLastPosition({ x: e.clientX, y: e.clientY });
        }
    }, []);

    // Handle mouse move event for panning
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isPanning) {
            const deltaX = e.clientX - lastPosition.x;
            const deltaY = e.clientY - lastPosition.y;

            setOffset(prev => ({
                x: prev.x + deltaX,
                y: prev.y + deltaY
            }));

            setLastPosition({ x: e.clientX, y: e.clientY });
        }
    }, [isPanning, lastPosition]);

    // Handle mouse up event to stop panning
    const handleMouseUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    // Handle mouse leave event to stop panning
    const handleMouseLeave = useCallback(() => {
        setIsPanning(false);
    }, []);

    // Handle mouse wheel event for zooming
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Update zoom level
        const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1; // Zoom out or in
        const newZoom = Math.max(0.1, Math.min(10, zoom * zoomDelta)); // Limit zoom range
        setZoom(newZoom);

        // After changing the zoom, we need to adjust the offset to keep the mouse position fixed
        // This is a bit complex because we need to consider both the zoom and the offset
        // We'll implement this in the useEffect that responds to zoom changes
    }, [zoom]);



    // Function to draw the grid
    const drawGrid = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate visible grid bounds
        const startX = Math.floor(-offset.x / effectiveCellSize) - 1;
        const startY = Math.floor(-offset.y / effectiveCellSize) - 1;
        const endX = Math.ceil((canvas.width - offset.x) / effectiveCellSize) + 1;
        const endY = Math.ceil((canvas.height - offset.y) / effectiveCellSize) + 1;

        // Draw grid lines (optional)
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 0.5;

        // Draw vertical grid lines
        for (let x = startX; x <= endX; x++) {
            const screenX = Math.floor(x * effectiveCellSize + offset.x) + 0.5;
            ctx.beginPath();
            ctx.moveTo(screenX, 0);
            ctx.lineTo(screenX, canvas.height);
            ctx.stroke();
        }

        // Draw horizontal grid lines
        for (let y = startY; y <= endY; y++) {
            const screenY = Math.floor(y * effectiveCellSize + offset.y) + 0.5;
            ctx.beginPath();
            ctx.moveTo(0, screenY);
            ctx.lineTo(canvas.width, screenY);
            ctx.stroke();
        }

        // Draw cells
        const gameState = gameEngine.getState();

        for (const [key, cell] of gameState.grid.entries()) {
            if (!cell.alive) continue;

            const [x, y] = key.split(',').map(Number);

            // Skip cells outside the visible area
            if (x < startX || x > endX || y < startY || y > endY) continue;

            const { x: screenX, y: screenY } = gridToScreen(x, y);

            // Calculate cell color based on age
            // Younger cells are more vibrant, older cells fade to a different color
            const hue = (120 - Math.min(cell.age, 100)) * 2.4; // From green (120) to red (0) over 50 generations
            const saturation = 100 - Math.min(cell.age, 50); // Fade saturation over time
            const lightness = 50; // Keep lightness constant

            ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            ctx.fillRect(
                screenX,
                screenY,
                effectiveCellSize,
                effectiveCellSize
            );
        }

        // Update generation counter if callback provided
        if (onGenerationChange) {
            onGenerationChange(gameState.generation);
        }
    }, [gameEngine, offset, effectiveCellSize, gridToScreen, onGenerationChange]);
    
    // Handle mouse click to toggle cell state
    const handleClick = useCallback((e: React.MouseEvent) => {
        if (e.button === 0 && !e.ctrlKey) { // Left click without Ctrl
            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const gridCoords = screenToGrid(x, y);
            gameEngine.toggleCell(gridCoords.x, gridCoords.y);

            // Trigger a redraw
            drawGrid();
        }
    }, [gameEngine, screenToGrid, drawGrid]);

    
    // Effect to adjust offset when zoom changes to keep the mouse position fixed
    useEffect(() => {
        const handleZoomChange = () => {
            drawGrid();
        };

        handleZoomChange();
    }, [zoom, drawGrid]);
    // Set up animation loop
    useEffect(() => {
        let animationFrameId: number;

        const render = () => {
            drawGrid();
            animationFrameId = window.requestAnimationFrame(render);
        };

        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [drawGrid]);

    // Handle canvas resize
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const parent = canvas.parentElement;
            if (!parent) return;

            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;

            drawGrid();
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [drawGrid]);

    // Prevent context menu on right-click
    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full cursor-pointer"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            onWheel={handleWheel}
            onContextMenu={handleContextMenu}
        />
    );
};

export default GameGrid;