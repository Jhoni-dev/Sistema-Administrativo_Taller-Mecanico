import argon2 from "argon2";

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 3,
  parallelism: 1,
  hashLength: 32
};

export async function hashed(value: string): Promise<string> {
    return await argon2.hash(value, ARGON2_OPTIONS);
}

export async function verifyHash(hash: string, plainText: string): Promise<boolean> {
    return await argon2.verify(hash, plainText);
}