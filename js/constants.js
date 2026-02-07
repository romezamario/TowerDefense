export const path = [
    { x: 0, y: 200 },
    { x: 200, y: 200 },
    { x: 200, y: 400 },
    { x: 400, y: 400 },
    { x: 400, y: 100 },
    { x: 600, y: 100 },
    { x: 600, y: 300 },
    { x: 800, y: 300 }
];

export const towerTypes = [
    {
        name: 'Láser',
        cost: 100,
        damage: 15,
        range: 120,
        fireRate: 500,
        color: '#00fff5',
        projectileSpeed: 8
    },
    {
        name: 'Cañón',
        cost: 150,
        damage: 40,
        range: 150,
        fireRate: 1200,
        color: '#ff006e',
        projectileSpeed: 5
    },
    {
        name: 'Pulso',
        cost: 200,
        damage: 25,
        range: 100,
        fireRate: 800,
        color: '#8338ec',
        projectileSpeed: 6,
        aoe: 80
    }
];
