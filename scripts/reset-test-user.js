// Simple script to reset test@test.com password to test123
// Run with: node scripts/reset-test-user.js

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

// Direct database URL - replace with your actual database URL
// Format: "postgresql://username:password@host:port/database"
// Examples:
// - Local: "postgresql://postgres:password@localhost:5432/dr_welnes"
// - Remote: "postgresql://user:pass@host.railway.app:5432/railway"
const DATABASE_URL = "postgresql://username:password@localhost:5432/database_name";

async function resetTestUser() {
  console.log("Resetting password for test@test.com...");

  const prisma = new PrismaClient({
    url: DATABASE_URL,
  });

  try {
    const email = "test@test.com";
    const newPassword = "test123";

    // Hash the new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    console.log("Attempting to find user...");

    // Try to update existing user
    try {
      const updatedUser = await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { passwordHash },
      });

      console.log("Password reset successfully!");
      console.log("Email:", email);
      console.log("New password:", newPassword);
      console.log("User ID:", updatedUser.id);
      console.log("User name:", updatedUser.name || "No name");
    } catch (updateError) {
      if (updateError.code === "P2025") {
        console.log("User not found. Creating new user...");

        // Create user if not found
        const newUser = await prisma.user.create({
          data: {
            email: "test@test.com",
            passwordHash,
            name: "Test User",
            role: "CLIENT",
          },
        });

        console.log("New user created!");
        console.log("Email:", "test@test.com");
        console.log("Password:", "test123");
        console.log("User ID:", newUser.id);
      } else {
        throw updateError;
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
    console.log("\nTo fix this:");
    console.log("1. Update DATABASE_URL in this script with your actual database URL");
    console.log("2. Make sure your database is running");
    console.log("3. Check database permissions");
  } finally {
    await prisma.$disconnect();
  }
}

resetTestUser();
