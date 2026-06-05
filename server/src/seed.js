require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const User = require('./models/User');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');

const seed = async () => {
  await connectDB();

  console.log('🌱 Seeding database...');

  // Clear existing data
  await Promise.all([
    User.deleteMany(),
    Category.deleteMany(),
    MenuItem.deleteMany(),
  ]);

  // ── Users ──────────────────────────────────────────────────
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@ceylonbar.com',
    password: 'admin123',
    role: 'admin',
    phone: '+94 11 234 5678',
  });

  await User.create({
    name: 'John Perera',
    email: 'john@example.com',
    password: 'user123',
    role: 'user',
    phone: '+94 77 123 4567',
  });

  console.log('✅ Users created');

  // ── Categories ─────────────────────────────────────────────
  const categories = await Category.insertMany([
    { name: 'Small Plates', description: 'Perfect for sharing', displayOrder: 1 },
    { name: 'Mains', description: 'Hearty Sri Lankan mains', displayOrder: 2 },
    { name: 'Rice & Curry', description: 'Traditional rice & curry sets', displayOrder: 3 },
    { name: 'Seafood', description: 'Fresh catch of the day', displayOrder: 4 },
    { name: 'Desserts', description: 'Sweet Sri Lankan treats', displayOrder: 5 },
    { name: 'Cocktails', description: 'Signature cocktails with a Ceylon twist', displayOrder: 6 },
    { name: 'Mocktails', description: 'Refreshing non-alcoholic options', displayOrder: 7 },
    { name: 'Hot Beverages', description: 'Ceylon tea and coffee', displayOrder: 8 },
  ]);

  const catMap = {};
  categories.forEach(c => { catMap[c.name] = c._id; });

  console.log('✅ Categories created');

  // ── Menu Items ─────────────────────────────────────────────
  await MenuItem.insertMany([
    // Small Plates
    { name: 'Isso Vadai', description: 'Crispy lentil fritters topped with prawns and coconut chutney', price: 8.50, category: catMap['Small Plates'], dietaryTags: [], isFeatured: true, preparationTime: 10 },
    { name: 'Pol Sambol Bruschetta', description: 'Toasted bread with Sri Lankan coconut relish and chilli', price: 6.50, category: catMap['Small Plates'], dietaryTags: ['vegan'], isFeatured: false },
    { name: 'Chicken Kottu Bites', description: 'Mini kottu roti bites with spiced chicken filling', price: 9.00, category: catMap['Small Plates'], dietaryTags: [], isFeatured: true },
    { name: 'Mutton Rolls', description: 'Deep-fried pastry rolls filled with spiced mutton', price: 7.50, category: catMap['Small Plates'], dietaryTags: [], isFeatured: false },
    { name: 'Vegetable Cutlets', description: 'Golden fried veggie cutlets with mint chutney', price: 6.00, category: catMap['Small Plates'], dietaryTags: ['vegetarian', 'vegan'], isFeatured: false },

    // Mains
    { name: 'Chicken Kottu Roti', description: 'Classic shredded roti stir-fried with chicken, eggs and spices', price: 16.50, category: catMap['Mains'], dietaryTags: [], isFeatured: true, preparationTime: 20 },
    { name: 'Egg Kottu', description: 'Classic kottu roti with eggs and vegetables', price: 13.00, category: catMap['Mains'], dietaryTags: ['vegetarian'], isFeatured: false },
    { name: 'Jaffna Lamb Curry', description: 'Slow-cooked lamb in a rich Jaffna-style spice blend', price: 22.00, category: catMap['Mains'], dietaryTags: ['spicy'], isFeatured: true },
    { name: 'Hoppers with Curry', description: 'Bowl-shaped pancakes served with your choice of curry', price: 14.00, category: catMap['Mains'], dietaryTags: ['gluten-free'], isFeatured: false },

    // Rice & Curry
    { name: 'Traditional Rice & Curry', description: 'Steamed rice with 5 curries, papad and pol sambol', price: 18.00, category: catMap['Rice & Curry'], dietaryTags: [], isFeatured: true },
    { name: 'Vegetarian Rice & Curry', description: 'Steamed rice with 5 vegetable curries and condiments', price: 15.00, category: catMap['Rice & Curry'], dietaryTags: ['vegetarian', 'vegan'], isFeatured: false },
    { name: 'Biryani', description: 'Fragrant basmati rice with aromatic spices and your choice of protein', price: 19.00, category: catMap['Rice & Curry'], dietaryTags: [], isFeatured: true },

    // Seafood
    { name: 'Devilled Prawns', description: 'Jumbo prawns tossed in a spicy devilled sauce', price: 26.00, category: catMap['Seafood'], dietaryTags: ['spicy'], isFeatured: true },
    { name: 'Black Pepper Crab', description: 'Fresh crab cooked in a bold black pepper gravy', price: 32.00, category: catMap['Seafood'], dietaryTags: ['gluten-free'], isFeatured: true },
    { name: 'Ambul Thiyal', description: 'Traditional sour fish curry made with goraka', price: 21.00, category: catMap['Seafood'], dietaryTags: ['gluten-free'], isFeatured: false },

    // Desserts
    { name: 'Wattalapam', description: 'Traditional jaggery coconut custard pudding', price: 7.00, category: catMap['Desserts'], dietaryTags: ['gluten-free'], isFeatured: true },
    { name: 'Coconut Ice Cream', description: 'Homemade creamy coconut ice cream with palm sugar drizzle', price: 6.50, category: catMap['Desserts'], dietaryTags: ['gluten-free', 'vegetarian'], isFeatured: false },
    { name: 'Kiri Pani', description: 'Buffalo curd drizzled with dark treacle and kithul syrup', price: 5.50, category: catMap['Desserts'], dietaryTags: ['gluten-free', 'vegetarian'], isFeatured: false },

    // Cocktails
    { name: 'Ceylon Sunset', description: 'Arrack, passion fruit, lime and coconut water', price: 12.00, category: catMap['Cocktails'], dietaryTags: [], isFeatured: true },
    { name: 'Colombo Mule', description: 'Arrack, ginger beer, lime and mint', price: 11.00, category: catMap['Cocktails'], dietaryTags: [], isFeatured: false },
    { name: 'Pineapple Toddy', description: 'Traditional toddy spirit with pineapple and citrus', price: 10.00, category: catMap['Cocktails'], dietaryTags: [], isFeatured: false },

    // Mocktails
    { name: 'Thambili Breeze', description: 'Fresh king coconut water with mint and lime', price: 6.00, category: catMap['Mocktails'], dietaryTags: ['vegan', 'gluten-free'], isFeatured: true },
    { name: 'Mango Lassi', description: 'Chilled mango, yogurt and cardamom', price: 5.50, category: catMap['Mocktails'], dietaryTags: ['vegetarian'], isFeatured: false },

    // Hot Beverages
    { name: 'Ceylon Tea', description: 'Single-origin high-grown Ceylon tea served with milk', price: 4.00, category: catMap['Hot Beverages'], dietaryTags: ['vegan', 'gluten-free'], isFeatured: false },
    { name: 'Spiced Chai', description: 'Ceylon tea brewed with cardamom, cinnamon and ginger', price: 4.50, category: catMap['Hot Beverages'], dietaryTags: ['vegetarian'], isFeatured: false },
    { name: 'Filter Coffee', description: 'South Indian-style strong filter coffee', price: 3.50, category: catMap['Hot Beverages'], dietaryTags: ['vegan'], isFeatured: false },
  ]);

  console.log('✅ Menu items created');
  console.log('\n🎉 Database seeded successfully!\n');
  console.log('👤 Admin credentials:');
  console.log('   Email: admin@ceylonbar.com');
  console.log('   Password: admin123\n');

  mongoose.disconnect();
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
