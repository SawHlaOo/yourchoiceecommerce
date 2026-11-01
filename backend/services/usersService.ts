import bcrypt from "bcrypt";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { usersRepository } from "../repositories/usersRepository.js";

const sanitizeUser = (user: Record<string, unknown>) => {
  const { password, ...rest } = user;
  return rest;
};

const isArgon2Hash = (hash: string) => typeof hash === "string" && hash.startsWith("$argon2id$");

const verifyPassword = async (candidate: string, storedHash: string) => {
  if (isArgon2Hash(storedHash)) {
    if (candidate === storedHash) {
      return true;
    }

    return await argon2.verify(storedHash, candidate);
  }

  return await bcrypt.compare(candidate, storedHash);
};

export const usersService = {
  async verify(id: number) {
    const user = await usersRepository.findById(id);
    if (!user) {
      return null;
    }

    return sanitizeUser(user as Record<string, unknown>);
  },

  async login(input: { username: string; password: string }) {
    const user = await usersRepository.findByIdentifier(input.username);

    if (user && (await verifyPassword(input.password, user.password))) {
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
      return {
        user: sanitizeUser(user as Record<string, unknown>),
        token,
      };
    }

    return null;
  },

  async register(input: {
    name: string;
    username: string;
    email: string;
    password: string;
    bio?: string;
    role: "USER" | "ADMIN";
  }) {
    const existing = await usersRepository.findByUsernameOrEmail(input.username, input.email);
    if (existing) {
      return null;
    }

    const user = await usersRepository.create({
      name: input.name,
      username: input.username,
      email: input.email,
      bio: input.bio,
      role: input.role,
      password: await bcrypt.hash(input.password, 10),
    });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: "7d" });

    return {
      user: sanitizeUser(user as Record<string, unknown>),
      token,
    };
  },

  async deleteUser(id: number) {
    const existing = await usersRepository.findById(id);
    if (!existing) {
      return false;
    }

    await usersRepository.deleteById(id);
    return true;
  },
};
