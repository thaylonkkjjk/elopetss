import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";

describe("Supabase Integration", () => {
  it("should connect to Supabase with valid credentials", async () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(supabaseUrl).toBeDefined();
    expect(supabaseKey).toBeDefined();

    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Test connection by fetching auth status
    const { data, error } = await supabase.auth.getSession();

    // We expect either success or a specific error, but NOT a connection error
    if (error) {
      expect(error.message).not.toMatch(/Failed to fetch|Invalid URL/);
    }
    // Success case: data is null when no session exists (which is expected)
    expect(data).toBeDefined();
  });

  it("should have service role key available", () => {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(serviceRoleKey).toBeDefined();
    // Service role key can be either sb_ prefixed or JWT format
    expect(serviceRoleKey).toMatch(/^(sb_|eyJ)/);
  });
});
