document.addEventListener('DOMContentLoaded', () => {
    const tiles = document.querySelectorAll('.tile');
    const grids = document.querySelectorAll('.grid');
    const SNAP_THRESHOLD = 50; // The distance threshold to trigger snapping

    // Function to generate a random position ensuring the tile stays within screen bounds
    function getRandomPosition(tileWidth, tileHeight) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Generate random coordinates ensuring the tile is fully visible within the screen
        const x = Math.random() * (screenWidth - tileWidth);
        const y = Math.random() * (screenHeight - tileHeight);

        return { x, y };
    }

    // Place tiles in random positions within the screen bounds
    tiles.forEach(tile => {
        const tileWidth = tile.offsetWidth;
        const tileHeight = tile.offsetHeight;
        const { x, y } = getRandomPosition(tileWidth, tileHeight);

        tile.style.position = 'absolute';
        tile.style.left = `${x}px`;
        tile.style.top = `${y}px`;
    });

    // Function to get the nearest unoccupied grid within snapping distance
    function getNearestGrid(tile) {
        let nearestGrid = null;
        let nearestDistance = Infinity;
        const tileRect = tile.getBoundingClientRect();

        grids.forEach(grid => {
            // Skip occupied grids
            if (grid.getAttribute('data-occupied') === 'true') return;

            const gridRect = grid.getBoundingClientRect();
            const dx = tileRect.left - gridRect.left;
            const dy = tileRect.top - gridRect.top;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < nearestDistance && distance < SNAP_THRESHOLD) {
                nearestDistance = distance;
                nearestGrid = grid;
            }
        });

        return nearestGrid;
    }

    // Make the tiles movable with touch and snap to grid if near
    tiles.forEach(tile => {
        let offsetX, offsetY;
        let currentlyOccupiedGrid = null; // Keep track of the grid the tile is currently on

        tile.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            offsetX = touch.clientX - tile.getBoundingClientRect().left;
            offsetY = touch.clientY - tile.getBoundingClientRect().top;
        
            tile.style.zIndex = 10; // Bring the touched tile to the top
        
            // If the tile is currently snapped to a grid, free that grid
            if (currentlyOccupiedGrid) {
                currentlyOccupiedGrid.setAttribute('data-occupied', 'false');
                tile.style.zIndex = 10; // Reset z-index to 10 when moved away
                currentlyOccupiedGrid = null;
            }
        });

        tile.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];

            let x = touch.clientX - offsetX;
            let y = touch.clientY - offsetY;

            // Ensure the tile doesn't go off-screen by adjusting its position if necessary
            const tileWidth = tile.offsetWidth;
            const tileHeight = tile.offsetHeight;

            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            // Check and adjust for the left, right, top, and bottom boundaries
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x + tileWidth > screenWidth) x = screenWidth - tileWidth;
            if (y + tileHeight > screenHeight) y = screenHeight - tileHeight;

            tile.style.left = `${x}px`;
            tile.style.top = `${y}px`;
        });

        tile.addEventListener('touchend', () => {
            const nearestGrid = getNearestGrid(tile);
        
            if (nearestGrid) {
                // Snap tile to the nearest grid if within threshold
                const gridRect = nearestGrid.getBoundingClientRect();
                tile.style.left = `${gridRect.left}px`;
                tile.style.top = `${gridRect.top}px`;
        
                // Mark the grid as occupied and set tile z-index to 5
                nearestGrid.setAttribute('data-occupied', 'true');
                currentlyOccupiedGrid = nearestGrid; // Track the grid the tile snapped to
                tile.style.zIndex = 5; // Set z-index to 5 after snapping
            }
        });
    });
});
