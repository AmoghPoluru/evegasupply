import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";

const seedUsers = async () => {
  try {
    console.log("🌱 Starting users collection seeding...");
    const payload = await getPayload({ config });

    // Check if admin user already exists
    const existingUsers = await payload.find({
      collection: "users",
      where: {
        email: {
          equals: "admin@example.com",
        },
      },
      limit: 1,
    });

    if (existingUsers.docs.length > 0) {
      console.log("✓ Admin user already exists");
      return;
    }

    // Create admin user
    const adminUser = await (payload.create as any)({
      collection: "users",
      data: {
        email: "admin@example.com",
        password: "admin123",
        name: "Admin User",
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: admin123`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedUsers();
