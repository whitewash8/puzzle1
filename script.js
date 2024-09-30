document.addEventListener('DOMContentLoaded', () => {
    const tiles = document.querySelectorAll('.tile');
    const grids = document.querySelectorAll('.grid');
    const SNAP_THRESHOLD = 50;

    function getRandomPosition(tileWidth, tileHeight) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const x = Math.random() * (screenWidth - tileWidth);
        const y = Math.random() * (screenHeight - tileHeight);
        return { x, y };
    }

    tiles.forEach(tile => {
        const tileWidth = tile.offsetWidth;
        const tileHeight = tile.offsetHeight;
        const { x, y } = getRandomPosition(tileWidth, tileHeight);
        tile.style.position = 'absolute';
        tile.style.left = `${x}px`;
        tile.style.top = `${y}px`;
    });

    function getNearestGrid(tile) {
        let nearestGrid = null;
        let nearestDistance = Infinity;
        const tileRect = tile.getBoundingClientRect();

        grids.forEach(grid => {
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

    function checkCompletion() {
        let allOccupied = true;
        let allCorrect = true;

        grids.forEach((grid, index) => {
            const gridOccupied = grid.getAttribute('data-occupied') === 'true';
            allOccupied = allOccupied && gridOccupied;

            const correspondingTile = document.querySelector(`.tile-${index + 1}`);
            const gridRect = grid.getBoundingClientRect();
            const tileRect = correspondingTile.getBoundingClientRect();

            const isCorrectlyPlaced = Math.abs(tileRect.left - gridRect.left) < 5 && 
                                      Math.abs(tileRect.top - gridRect.top) < 5;

            allCorrect = allCorrect && isCorrectlyPlaced;
        });

        if (allOccupied && allCorrect) {
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 400]);
            }
            confetti({
                particleCount: 100,
                spread: 30,
                startVelocity: 90,
                angle: 90,
                scalar: 1,
                gravity: 5,
                origin: { y: 0.9 },
                tick: 1500,
            });
        }
    }

    function snapRemainingTiles() {
        let unoccupiedGrid, unoccupiedTile;
        grids.forEach((grid, index) => {
            if (grid.getAttribute('data-occupied') !== 'true') {
                unoccupiedGrid = grid;
            }
        });

        tiles.forEach(tile => {
            const tileRect = tile.getBoundingClientRect();
            const unoccupiedGridRect = unoccupiedGrid.getBoundingClientRect();
            const dx = tileRect.left - unoccupiedGridRect.left;
            const dy = tileRect.top - unoccupiedGridRect.top;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < SNAP_THRESHOLD) {
                const correctTile = document.querySelector(`.tile-${unoccupiedGrid.classList[1].split('-')[1]}`);
                const correctGridRect = unoccupiedGrid.getBoundingClientRect();
                correctTile.style.left = `${correctGridRect.left}px`;
                correctTile.style.top = `${correctGridRect.top}px`;
                unoccupiedGrid.setAttribute('data-occupied', 'true');
            }
        });
    }

    tiles.forEach(tile => {
        let offsetX, offsetY;
        let currentlyOccupiedGrid = null;

        tile.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            offsetX = touch.clientX - tile.getBoundingClientRect().left;
            offsetY = touch.clientY - tile.getBoundingClientRect().top;

            tile.style.zIndex = 10;

            if (currentlyOccupiedGrid) {
                currentlyOccupiedGrid.setAttribute('data-occupied', 'false');
                tile.style.zIndex = 10;
                currentlyOccupiedGrid = null;
            }
        });

        tile.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            let x = touch.clientX - offsetX;
            let y = touch.clientY - offsetY;

            const tileWidth = tile.offsetWidth;
            const tileHeight = tile.offsetHeight;
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

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
                const gridRect = nearestGrid.getBoundingClientRect();
                tile.style.left = `${gridRect.left}px`;
                tile.style.top = `${gridRect.top}px`;

                nearestGrid.setAttribute('data-occupied', 'true');
                currentlyOccupiedGrid = nearestGrid;
                tile.style.zIndex = 5;

                const occupiedGrids = Array.from(grids).filter(grid => grid.getAttribute('data-occupied') === 'true').length;

                if (occupiedGrids === 22 || occupiedGrids === 23) {
                    snapRemainingTiles();
                }

                checkCompletion();
            }
        });
    });
});
