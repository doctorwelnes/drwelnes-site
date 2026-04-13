const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config({ path: "../.env.local" });

async function resetPassword() {
  // Check if DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not found in environment variables");
    console.error("Make sure .env.local file exists with DATABASE_URL");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    // Email and new password
    const email = "test@test.com";
    const newPassword = "test123";

    // Hash the new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { passwordHash },
    });

    console.log("Password reset successfully!");
    console.log("Email:", email);
    console.log("New password:", newPassword);
    console.log("User ID:", updatedUser.id);
    console.log("User name:", updatedUser.name || "No name");
  } catch (error) {
    console.error("Error resetting password:", error);

    if (error.code === "P2025") {
      console.log("User not found. Creating new user...");

      // Create user if not found
      const passwordHash = await bcrypt.hash("test123", 12);

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
    }
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
