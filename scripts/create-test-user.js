const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

async function createTestUser() {
  console.log("=== Creating test@test.com user ===");
  
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
    
    console.log("Creating new user:", email);
    
    // Create user directly
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
    console.log("User name:", newUser.name);
    console.log("User role:", newUser.role);
    
    console.log("\n=== LOGIN DETAILS ===");
    console.log("Email: test@test.com");
    console.log("Password: test123");
    console.log("===================");
    
  } catch (error) {
    console.error("ERROR:", error.message);
    
    // If user already exists, try to update password
    if (error.code === 'P2002') {
      console.log("User already exists. Updating password...");
      
      const passwordHash = await bcrypt.hash("test123", 12);
      
      try {
        const updatedUser = await prisma.user.update({
          where: { email: "test@test.com" },
          data: { passwordHash }
        });
        
        console.log("SUCCESS! Password updated!");
        console.log("Email: test@test.com");
        console.log("Password: test123");
        
      } catch (updateError) {
        console.error("Failed to update password:", updateError.message);
      }
    } else {
      console.log("\nTroubleshooting:");
      console.log("1. Make sure PostgreSQL is running on localhost:5432");
      console.log("2. Check database 'drwelnes' exists");
      console.log("3. Verify user 'drwelnes' has permissions");
      console.log("4. Check schema 'public' exists");
      console.log("5. Run 'npx prisma db push' to create tables");
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

createTestUser();
