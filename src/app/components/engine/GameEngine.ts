// Game of Life Engine

export interface Cell {
    alive: boolean;
    age: number;
}

export interface GameState {
    grid: Map<string, Cell>;
    generation: number;
}

export class GameEngine {
    private grid: Map<string, Cell> = new Map();
    private nextGrid: Map<string, Cell> = new Map();
    private generation: number = 0;
    private isRunning: boolean = false;
    private intervalId: NodeJS.Timeout | null = null;
    private speed: number = 100; // ms between generations

    constructor() {
        this.reset();
    }

    // Reset the game state
    public reset(): void {
        this.grid.clear();
        this.nextGrid.clear();
        this.generation = 0;
        this.stop();
    }

    // Get current game state
    public getState(): GameState {
        return {
            grid: new Map(this.grid),
            generation: this.generation,
        };
    }

    // Set a cell state at specific coordinates
    public setCell(x: number, y: number, alive: boolean): void {
        const key = `${x},${y}`;
        if (alive) {
            this.grid.set(key, { alive: true, age: 0 });
        } else {
            this.grid.delete(key);
        }
    }

    // Toggle a cell state at specific coordinates
    public toggleCell(x: number, y: number): void {
        const key = `${x},${y}`;
        const cell = this.grid.get(key);
        if (cell) {
            this.grid.delete(key);
        } else {
            this.grid.set(key, { alive: true, age: 0 });
        }
    }

    // Get a cell state at specific coordinates
    public getCell(x: number, y: number): Cell | undefined {
        const key = `${x},${y}`;
        return this.grid.get(key);
    }

    // Start the game simulation
    public start(callback?: () => void): void {
        if (this.isRunning) return;

        this.isRunning = true;
        this.intervalId = setInterval(() => {
            this.nextGeneration();
            if (callback) callback();
        }, this.speed);
    }

    // Stop the game simulation
    public stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
    }

    // Set simulation speed
    public setSpeed(speed: number): void {
        this.speed = speed;
        if (this.isRunning) {
            this.stop();
            this.start();
        }
    }

    // Check if simulation is running
    public isSimulationRunning(): boolean {
        return this.isRunning;
    }

    // Calculate the next generation based on Conway's Game of Life rules
    public nextGeneration(): void {
        this.nextGrid.clear();
        const cellsToCheck = new Set<string>();

        // Add all live cells and their neighbors to the cells to check
        for (const [key] of this.grid) {
            cellsToCheck.add(key);
            const [x, y] = key.split(',').map(Number);

            // Add all neighbors to check
            for (let nx = x - 1; nx <= x + 1; nx++) {
                for (let ny = y - 1; ny <= y + 1; ny++) {
                    if (nx === x && ny === y) continue;
                    cellsToCheck.add(`${nx},${ny}`);
                }
            }
        }

        // Apply Game of Life rules to each cell
        for (const key of cellsToCheck) {
            const [x, y] = key.split(',').map(Number);
            const liveNeighbors = this.countLiveNeighbors(x, y);
            const currentCell = this.grid.get(key);

            // Apply Conway's Game of Life rules
            if (currentCell && currentCell.alive) {
                // Rule 1: Any live cell with fewer than two live neighbors dies (underpopulation)
                // Rule 2: Any live cell with two or three live neighbors lives on
                // Rule 3: Any live cell with more than three live neighbors dies (overpopulation)
                if (liveNeighbors === 2 || liveNeighbors === 3) {
                    this.nextGrid.set(key, {
                        alive: true,
                        age: currentCell.age + 1
                    });
                }
            } else {
                // Rule 4: Any dead cell with exactly three live neighbors becomes alive (reproduction)
                if (liveNeighbors === 3) {
                    this.nextGrid.set(key, { alive: true, age: 0 });
                }
            }
        }

        // Update the grid with the next generation
        this.grid = new Map(this.nextGrid);
        this.generation++;
    }

    // Count live neighbors for a cell
    private countLiveNeighbors(x: number, y: number): number {
        let count = 0;

        for (let nx = x - 1; nx <= x + 1; nx++) {
            for (let ny = y - 1; ny <= y + 1; ny++) {
                if (nx === x && ny === y) continue;

                const key = `${nx},${ny}`;
                const cell = this.grid.get(key);

                if (cell && cell.alive) {
                    count++;
                }
            }
        }

        return count;
    }

    // Clear the grid
    public clear(): void {
        this.grid.clear();
        this.generation = 0;
    }

    // Get current generation count
    public getGeneration(): number {
        return this.generation;
    }

    // Add a predefined pattern at specific coordinates
    public addPattern(pattern: number[][], offsetX: number, offsetY: number): void {
        pattern.forEach(([x, y]) => {
            this.setCell(x + offsetX, y + offsetY, true);
        });
    }
}

// Predefined patterns
export const PATTERNS = {
    GLIDER: [
        [0, 0],
        [1, 1],
        [2, -1],
        [2, 0],
        [2, 1]
    ],
    BLINKER: [
        [0, 0],
        [1, 0],
        [2, 0]
    ],
    PULSAR: [
        [2, 0], [3, 0], [4, 0], [8, 0], [9, 0], [10, 0],
        [0, 2], [5, 2], [7, 2], [12, 2],
        [0, 3], [5, 3], [7, 3], [12, 3],
        [0, 4], [5, 4], [7, 4], [12, 4],
        [2, 5], [3, 5], [4, 5], [8, 5], [9, 5], [10, 5],
        [2, 7], [3, 7], [4, 7], [8, 7], [9, 7], [10, 7],
        [0, 8], [5, 8], [7, 8], [12, 8],
        [0, 9], [5, 9], [7, 9], [12, 9],
        [0, 10], [5, 10], [7, 10], [12, 10],
        [2, 12], [3, 12], [4, 12], [8, 12], [9, 12], [10, 12]
    ],
    GOSPER_GLIDER_GUN: [
        [24, 0],
        [22, 1], [24, 1],
        [12, 2], [13, 2], [20, 2], [21, 2], [34, 2], [35, 2],
        [11, 3], [15, 3], [20, 3], [21, 3], [34, 3], [35, 3],
        [0, 4], [1, 4], [10, 4], [16, 4], [20, 4], [21, 4],
        [0, 5], [1, 5], [10, 5], [14, 5], [16, 5], [17, 5], [22, 5], [24, 5],
        [10, 6], [16, 6], [24, 6],
        [11, 7], [15, 7],
        [12, 8], [13, 8]
    ]
};