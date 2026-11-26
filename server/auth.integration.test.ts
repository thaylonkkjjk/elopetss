import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedAdmin = {
  id: string;
  email: string;
  name?: string;
  is_active: boolean;
  created_at: string;
};

type AuthenticatedOng = {
  id: string;
  name: string;
  email: string;
  description: string;
  phone?: string;
  city: string;
  state: string;
  website?: string;
  instagram?: string;
  isActive: boolean;
  createdAt: string;
};

function createMockContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      cookies: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Authentication Integration", () => {
  it("should handle ONG registration", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ongs.register({
      name: "Test ONG",
      description: "A test organization for animal welfare",
      email: "test@ong.com",
      password: "TestPassword123",
      city: "São Paulo",
      state: "SP",
      phone: "11999999999",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("cadastrada com sucesso");
  });

  it("should list pending ONGs", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ongs.listPending({ status: "pending" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should handle ONG post creation", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ongs.createPost({
      ongId: "test-ong-id",
      type: "donation",
      title: "Donation Request",
      description: "We are requesting donations for animal food",
      items: "Dog food, cat food",
      isUrgent: false,
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("criado com sucesso");
  });

  it("should retrieve all approved ONGs", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ongs.getAllApproved();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should retrieve all posts", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ongs.getAllPosts();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should validate admin login structure", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // This should throw an error with invalid credentials
    try {
      await caller.adminAuth.login({
        email: "invalid@admin.com",
        password: "wrongpassword",
      });
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });

  it("should validate ONG login structure", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // This should throw an error with invalid credentials
    try {
      await caller.ongAuth.login({
        email: "invalid@ong.com",
        password: "wrongpassword",
      });
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });

  it("should validate admin me query", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adminAuth.me();
    expect(result).toBeNull();
  });

  it("should validate ONG me query", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ongAuth.me();
    expect(result).toBeNull();
  });
});
