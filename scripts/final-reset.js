// Final simple reset script - just update the DATABASE_URL line below
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

async function resetPassword() {
  console.log("=== Password Reset for test@test.com ===");

  // IMPORTANT: Update this line with your actual DATABASE_URL
  // Examples:
  // const DATABASE_URL = "postgresql://postgres:password@localhost:5432/dr_welnes";
  // const DATABASE_URL = "postgresql://postgres:password@containers.railway.app:5432/railway";
  const DATABASE_URL = "postgresql://drwelnes:drwelnes@localhost:5432/drwelnes?schema=public";

  if (DATABASE_URL.includes("username:password")) {
    console.log("ERROR: Please update DATABASE_URL in this script first!");
    console.log("Edit line 8 and replace with your actual database URL");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
  });

  try {
    const email = "test@test.com";
    const newPassword = "test123";

    console.log("Connecting to database...");
    console.log("Hashing new password...");

    const passwordHash = await bcrypt.hash(newPassword, 12);

    console.log("Looking for user:", email);

    // Try to update existing user
    try {
      const updatedUser = await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { passwordHash },
      });

      console.log("SUCCESS! Password reset!");
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

        console.log("SUCCESS! New user created!");
        console.log("Email:", "test@test.com");
        console.log("Password:", "test123");
        console.log("User ID:", newUser.id);
      } else {
        throw updateError;
      }
    }

    console.log("\n=== LOGIN DETAILS ===");
    console.log("Email: test@test.com");
    console.log("Password: test123");
    console.log("===================");
  } catch (error) {
    console.error("ERROR:", error.message);
    console.log("\nTroubleshooting:");
    console.log("1. Check DATABASE_URL is correct");
    console.log("2. Make sure database is running");
    console.log("3. Verify database permissions");
    console.log("4. Check network connectivity");
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
