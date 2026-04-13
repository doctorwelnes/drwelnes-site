const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

// Simple password reset script
async function resetPassword() {
  console.log("Resetting password for test@test.com...");
  
  // Set DATABASE_URL environment variable directly
  process.env.DATABASE_URL = "postgresql://username:password@localhost:5432/database_name";
  
  const prisma = new PrismaClient();

  try {
    const email = "test@test.com";
    const newPassword = "test123";
    
    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 12);
    
    console.log("Looking for user...");
    
    // Try to find and update user
    try {
      const updatedUser = await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { passwordHash }
      });
      
      console.log("Password reset successfully!");
      console.log("Email:", email);
      console.log("New password:", newPassword);
      console.log("User ID:", updatedUser.id);
      console.log("User name:", updatedUser.name || "No name");
      
    } catch (updateError) {
      if (updateError.code === 'P2025') {
        console.log("User not found. Creating new user...");
        
        // Create user if not found
        const newUser = await prisma.user.create({
          data: {
            email: 'test@test.com',
            passwordHash,
            name: 'Test User',
            role: 'CLIENT'
          }
        });
        
        console.log("New user created!");
        console.log("Email:", 'test@test.com');
        console.log("Password:", 'test123');
        console.log("User ID:", newUser.id);
      } else {
        throw updateError;
      }
    }
    
  } catch (error) {
    console.error("Error:", error.message);
    console.log("\nTo fix this:");
    console.log("1. Update the DATABASE_URL in this script (line 7)");
    console.log("2. Replace 'username:password@localhost:5432/database_name' with your actual database URL");
    console.log("3. Make sure your database is running and accessible");
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
