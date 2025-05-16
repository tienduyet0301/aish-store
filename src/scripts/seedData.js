import clientPromise from '../lib/mongodb';

const seedBanners = async (db) => {
  const banners = [
    {
      imageUrl: "/images/banner1.jpg",
      title: "Banner 1",
      description: "Summer Collection",
      link: "/collections/summer",
      order: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      imageUrl: "/images/banner2.jpg",
      title: "Banner 2",
      description: "New Arrivals",
      link: "/collections/new-arrivals",
      order: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  try {
    await db.collection("banners").deleteMany({});
    const result = await db.collection("banners").insertMany(banners);
    console.log(`Seeded ${result.insertedCount} banners`);
  } catch (error) {
    console.error("Error seeding banners:", error);
  }
};

const seedProducts = async (db) => {
  const products = [
    {
      name: "Product 1",
      price: 350000,
      description: "Product 1 description",
      images: ["/images/product1.jpg"],
      category: "Category 1",
      sizes: ["S", "M", "L"],
      colors: ["Black", "White"],
      stock: 100,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Product 2",
      price: 450000,
      description: "Product 2 description",
      images: ["/images/product2.jpg"],
      category: "Category 2",
      sizes: ["S", "M", "L"],
      colors: ["Red", "Blue"],
      stock: 50,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  try {
    await db.collection("products").deleteMany({});
    const result = await db.collection("products").insertMany(products);
    console.log(`Seeded ${result.insertedCount} products`);
  } catch (error) {
    console.error("Error seeding products:", error);
  }
};

const seedData = async () => {
  try {
    const client = await clientPromise;
    const db = client.db("aishh");

    await seedBanners(db);
    await seedProducts(db);

    console.log("Seeding completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData(); 