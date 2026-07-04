import bcrypt from "bcrypt";

import prisma from "../../prisma/prisma";
import { AppError } from "../../common/errors";

import { RegisterDto } from "./auth.validation";

export async function register(data: RegisterDto) {
  // 1. Cari role Cashier
  const cashierRole = await prisma.role.findUnique({
    where: {
      name: "Cashier",
    },
  });

  if (!cashierRole) {
    throw new AppError(
      "Default role 'Cashier' not found.",
      500
    );
  }

  // 2. Cek email
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new AppError(
      "Email is already registered.",
      409
    );
  }

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(
    data.password,
    10
  );

  // 4. Simpan user
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      roleId: cashierRole.id,
    },
    include: {
      role: true,
    },
  });

  // 5. Return tanpa password
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
    role: user.role.name,
    createdAt: user.createdAt,
  };
}