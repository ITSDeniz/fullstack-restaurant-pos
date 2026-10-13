import { PrismaClient, TableStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Tables
  console.log('Seeding restaurant tables...');
  const tablesCount = 12;
  for (let i = 1; i <= tablesCount; i++) {
    await prisma.table.upsert({
      where: { tableNumber: i },
      update: {},
      create: {
        tableNumber: i,
        status: TableStatus.AVAILABLE,
      },
    });
  }

  // 2. Seed Categories
  console.log('Seeding categories...');
  const categoriesData = [
    { name: 'Burgers' },
    { name: 'Pizzas' },
    { name: 'Starters & Sides' },
    { name: 'Beverages' },
    { name: 'Desserts' },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name },
    });
    categories[cat.name] = record.id;
  }

  // 3. Seed Products
  console.log('Seeding menu products...');
  const productsData = [
    // Burgers
    {
      name: 'Classic Smash Burger',
      price: 12.50,
      categoryId: categories['Burgers'],
    },
    {
      name: 'Double Truffle Burger',
      price: 16.90,
      categoryId: categories['Burgers'],
    },
    {
      name: 'Crispy BBQ Chicken Burger',
      price: 13.50,
      categoryId: categories['Burgers'],
    },
    {
      name: 'Beyond Vegan Cheeseburger',
      price: 14.50,
      categoryId: categories['Burgers'],
    },

    // Pizzas
    {
      name: 'Margherita DOC',
      price: 13.00,
      categoryId: categories['Pizzas'],
    },
    {
      name: 'Pepperoni & Hot Honey',
      price: 15.50,
      categoryId: categories['Pizzas'],
    },
    {
      name: 'Quattro Formaggi',
      price: 16.00,
      categoryId: categories['Pizzas'],
    },
    {
      name: 'Tartufo & Mushrooms',
      price: 17.50,
      categoryId: categories['Pizzas'],
    },

    // Starters & Sides
    {
      name: 'Loaded Truffle Fries',
      price: 7.50,
      categoryId: categories['Starters & Sides'],
    },
    {
      name: 'Buffalo Chicken Wings (8 pcs)',
      price: 9.90,
      categoryId: categories['Starters & Sides'],
    },
    {
      name: 'Mozzarella Sticks & Marinara',
      price: 8.00,
      categoryId: categories['Starters & Sides'],
    },
    {
      name: 'Crispy Onion Rings',
      price: 6.50,
      categoryId: categories['Starters & Sides'],
    },

    // Beverages
    {
      name: 'Craft Lemonade',
      price: 4.50,
      categoryId: categories['Beverages'],
    },
    {
      name: 'Iced Americano',
      price: 4.00,
      categoryId: categories['Beverages'],
    },
    {
      name: 'Sparkling Mineral Water (500ml)',
      price: 3.50,
      categoryId: categories['Beverages'],
    },
    {
      name: 'Fresh Orange Juice',
      price: 5.00,
      categoryId: categories['Beverages'],
    },

    // Desserts
    {
      name: 'Classic Tiramisu',
      price: 8.50,
      categoryId: categories['Desserts'],
    },
    {
      name: 'Warm Belgian Chocolate Lava Cake',
      price: 9.00,
      categoryId: categories['Desserts'],
    },
    {
      name: 'New York Cheesecake',
      price: 8.00,
      categoryId: categories['Desserts'],
    },
  ];

  for (const product of productsData) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          name: product.name,
          price: product.price,
          categoryId: product.categoryId,
          isActive: true,
        },
      });
    }
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
