const productos = [
    {
        id: 'pan-masa-madre',
        nombre: 'Pan de Masa Madre',
        precio: 12,
        descripcion: 'Hogaza de fermentación lenta, corteza crujiente y miga aireada.',
        categoria: 'Panes',
        imagen: 'https://images.unsplash.com/photo-1767065887975-a09671b8d683?auto=format&fit=crop&w=900&q=80',
        destacado: true,
        ingredientes: ['Harina de trigo orgánico', 'Agua filtrada', 'Sal marina', 'Masa madre natural'],
        stock: 12
    },
    {
        id: 'baguette-artesanal',
        nombre: 'Baguette Artesanal',
        precio: 8.5,
        descripcion: 'Baguette dorada de corteza fina, ideal para desayunos y tablas.',
        categoria: 'Panes',
        imagen: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=900&q=80',
        ingredientes: ['Harina de trigo', 'Agua', 'Levadura fresca', 'Sal marina'],
        stock: 4
    },
    {
        id: 'croissant-mantequilla',
        nombre: 'Croissant de Mantequilla',
        precio: 7.5,
        descripcion: 'Hojaldre francés de capas ligeras elaborado con mantequilla pura.',
        categoria: 'Panes',
        imagen: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80',
        ingredientes: ['Harina de trigo', 'Mantequilla', 'Leche', 'Levadura'],
        stock: 15
    },
    {
        id: 'torta-selva-negra',
        nombre: 'Torta Selva Negra',
        precio: 65,
        descripcion: 'Bizcocho de chocolate, crema suave y cerezas seleccionadas.',
        categoria: 'Tortas',
        imagen: 'https://images.unsplash.com/photo-1469533667357-006056eaf780?auto=format&fit=crop&w=900&q=80',
        destacado: true,
        ingredientes: ['Chocolate amargo', 'Cerezas', 'Crema batida', 'Kirsch'],
        stock: 8
    },
    {
        id: 'torta-zanahoria',
        nombre: 'Torta de Zanahoria',
        precio: 58,
        descripcion: 'Torta húmeda con especias, nueces y frosting de queso crema.',
        categoria: 'Tortas',
        imagen: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80',
        ingredientes: ['Zanahoria fresca', 'Nueces', 'Canela', 'Queso crema'],
        stock: 3
    },
    {
        id: 'torta-red-velvet',
        nombre: 'Torta Red Velvet',
        precio: 68,
        descripcion: 'Capas aterciopeladas de cacao suave con crema de queso.',
        categoria: 'Tortas',
        imagen: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=900&q=80',
        ingredientes: ['Cacao', 'Buttermilk', 'Vainilla', 'Queso crema'],
        stock: 0
    },
    {
        id: 'brownie-chocolate',
        nombre: 'Brownie de Chocolate',
        precio: 9,
        descripcion: 'Brownie intenso de centro húmedo con nueces tostadas.',
        categoria: 'Postres',
        imagen: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80',
        destacado: true,
        ingredientes: ['Chocolate bitter', 'Mantequilla', 'Nueces', 'Cacao'],
        stock: 14
    },
    {
        id: 'galletas-chispas',
        nombre: 'Galletas con Chispas',
        precio: 6.5,
        descripcion: 'Galletas suaves al centro con abundantes chispas de chocolate.',
        categoria: 'Postres',
        imagen: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=80',
        ingredientes: ['Harina', 'Chocolate', 'Mantequilla', 'Azúcar rubia'],
        stock: 20
    },
    {
        id: 'tartaleta-limon',
        nombre: 'Tartaleta de Limón',
        precio: 14,
        descripcion: 'Base crocante, crema de limón fresca y merengue ligeramente dorado.',
        categoria: 'Postres',
        imagen: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=900&q=80',
        ingredientes: ['Limón', 'Huevos', 'Mantequilla', 'Merengue'],
        stock: 2
    },
    {
        id: 'rollo-canela',
        nombre: 'Rollo de Canela',
        precio: 10,
        descripcion: 'Masa suave con canela aromática y un delicado glaseado de vainilla.',
        categoria: 'Postres',
        imagen: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=900&q=80',
        destacado: false,
        ingredientes: ['Harina', 'Canela', 'Mantequilla', 'Glaseado de vainilla'],
        stock: 10
    }
];
