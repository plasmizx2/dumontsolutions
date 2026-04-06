import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log("🔐 Creating Admin User\n");

  const email = await question("Admin Email: ");
  const password = await question("Admin Password: ");
  const confirmPassword = await question("Confirm Password: ");

  if (password !== confirmPassword) {
    console.error("❌ Passwords do not match!");
    process.exit(1);
  }

  if (!email || !password) {
    console.error("❌ Email and password are required!");
    process.exit(1);
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error("❌ User already exists!");
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        isAdmin: true,
      },
    });

    console.log("\n✅ Admin user created successfully!");
    console.log(`Email: ${user.email}`);
    console.log(`ID: ${user.id}\n`);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

main();
