const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

async function resetPassword() {
  console.log("=== Password Reset for test@test.com ===");
  
  // Set environment variable directly
  process.env.DATABASE_URL = "postgresql://drwelnes:drwelnes@localhost:5432/drwelnes?schema=public";
  
  // Create PrismaClient with adapter (like in the main app)
  const { PrismaPg } = require("@prisma/adapter-pg");
  const { Pool } = require("pg");
  
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL 
  });
  const adapter = new PrismaPg(pool);
  
  const prisma = new PrismaClient({ adapter });

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
        data: { passwordHash }
      });
      
      console.log("SUCCESS! Password reset!");
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
        
        console.log("SUCCESS! New user created!");
        console.log("Email:", 'test@test.com');
        console.log("Password:", 'test123');
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
    console.log("1. Make sure PostgreSQL is running on localhost:5432");
    console.log("2. Check database 'drwelnes' exists");
    console.log("3. Verify user 'drwelnes' has permissions");
    console.log("4. Check schema 'public' exists");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

resetPassword();
