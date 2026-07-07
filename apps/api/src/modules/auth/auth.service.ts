import bcrypt from "bcrypt";

import prisma from "../../prisma/prisma";
import { AppError } from "../../common/errors";

import { RefreshTokenDto } from "./auth.validation";

import {
  RegisterDto,
  LoginDto,
  LogoutDto,
} from "./auth.validation";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "./auth.token";


// REGISTER 
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

// LOGIN
export async function login(data: LoginDto) {
  // 1. Cari user berdasarkan email
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
    include: {
      role: true,
    },
  });

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  // 2. Cek apakah user aktif
  if (!user.isActive) {
    throw new AppError("Your account has been deactivated.", 403);
  }

  // 3. Verifikasi password
  const passwordMatch = await bcrypt.compare(
    data.password,
    user.password
  );

  if (!passwordMatch) {
    throw new AppError("Invalid email or password.", 401);
  }

  // 4. Buat payload JWT
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role.name,
  };

  // 5. Generate token
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // 6. Simpan refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
      userId: user.id,
    },
  });

  // 7. Return response
  return {
    accessToken,
    refreshToken,

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      isActive: user.isActive,
    },
  };
}

// REFRESH TOKEN
export async function refresh(data: RefreshTokenDto) {
  // 1. Verifikasi JWT Refresh Token
  let payload;

  try {
    payload = verifyRefreshToken(data.refreshToken);
  } catch {
    throw new AppError("Invalid refresh token.", 401);
  }

  // 2. Pastikan token masih ada di database
  const storedToken = await prisma.refreshToken.findUnique({
    where: {
      token: data.refreshToken,
    },
  });

  if (!storedToken) {
    throw new AppError("Refresh token is no longer valid.", 401);
  }

  // 3. Ambil user beserta role
  const user = await prisma.user.findUnique({
    where: {
      id: payload.sub,
    },
    include: {
      role: true,
    },
  });

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  if (!user.isActive) {
    throw new AppError("Your account has been deactivated.", 403);
  }

  // 4. Hapus refresh token lama (Rotation)
  await prisma.refreshToken.delete({
    where: {
      id: storedToken.id,
    },
  });

  // 5. Payload baru
  const jwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role.name,
  };

  // 6. Generate token baru
  const accessToken = generateAccessToken(jwtPayload);
  const refreshToken = generateRefreshToken(jwtPayload);

  // 7. Simpan refresh token baru
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
      userId: user.id,
    },
  });

  // 8. Return token baru
  return {
    accessToken,
    refreshToken,
  };
}

export async function logout(data: LogoutDto) {
  const token = await prisma.refreshToken.findUnique({
    where: {
      token: data.refreshToken,
    },
  });

  if (!token) {
    return;
  }

  await prisma.refreshToken.delete({
    where: {
      id: token.id,
    },
  });
}