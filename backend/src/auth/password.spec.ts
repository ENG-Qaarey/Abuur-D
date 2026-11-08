import { getDummyHash, hashPassword, verifyPassword } from './password.js';

describe('password hashing', () => {
  it('verifies the right password and rejects a wrong one', async () => {
    const hash = await hashPassword('abuur@1234');
    expect(hash).toMatch(/^scrypt\$16384\$8\$1\$/);
    expect(hash).not.toContain('abuur@1234');
    await expect(verifyPassword('abuur@1234', hash)).resolves.toBe(true);
    await expect(verifyPassword('abuur@12345', hash)).resolves.toBe(false);
    await expect(verifyPassword('', hash)).resolves.toBe(false);
  });

  it('salts every hash, so equal passwords give different hashes', async () => {
    const [a, b] = await Promise.all([hashPassword('same'), hashPassword('same')]);
    expect(a).not.toBe(b);
  });

  it('treats missing or malformed hashes as a failed login, not a crash', async () => {
    for (const stored of [null, undefined, '', 'plaintext', 'scrypt$1$2$3', 'bcrypt$a$b$c$d$e']) {
      await expect(verifyPassword('x', stored)).resolves.toBe(false);
    }
  });

  it('has a dummy hash for timing-safe unknown-email checks', async () => {
    const dummy = await getDummyHash();
    await expect(verifyPassword('abuur@1234', dummy)).resolves.toBe(false);
    expect(await getDummyHash()).toBe(dummy);
  });
});
