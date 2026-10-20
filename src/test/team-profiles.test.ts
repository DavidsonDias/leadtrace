// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, expect, it } from "vitest";

let db: PGlite;
const first = "30000000-0000-4000-8000-000000000001";
const second = "30000000-0000-4000-8000-000000000002";
beforeAll(async () => {
  db = await PGlite.create();
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY, raw_user_meta_data jsonb DEFAULT '{}');
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    GRANT USAGE ON SCHEMA auth TO authenticated;
    GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;
  `);
  await db.exec(readFileSync("drizzle/migrations/0000_create_team_profiles.sql", "utf8"));
}, 30000);
afterAll(async () => { await db?.close(); });

it("creates the approved profile with the supplied display name", async () => {
  await db.query("INSERT INTO auth.users(id,raw_user_meta_data) VALUES($1,$2)", [first, { display_name: "Maria Silva" }]);
  expect((await db.query("SELECT display_name FROM public.profiles WHERE id=$1", [first])).rows).toEqual([{ display_name: "Maria Silva" }]);
});
it("creates a valid profile even when signup metadata is absent", async () => {
  await db.query("INSERT INTO auth.users(id) VALUES($1)", [second]);
  expect((await db.query("SELECT display_name FROM public.profiles WHERE id=$1", [second])).rows).toEqual([{ display_name: "Membro da equipe" }]);
});
it("keeps profile reads and updates scoped to the signed-in user", async () => {
  await db.exec(`SET request.jwt.claim.sub='${first}'; SET ROLE authenticated;`);
  expect((await db.query("SELECT id FROM public.profiles")).rows).toEqual([{ id: first }]);
  expect((await db.query("UPDATE public.profiles SET display_name='Nome indevido' WHERE id=$1 RETURNING id", [second])).rows).toEqual([]);
  await expect(db.query("INSERT INTO public.profiles(id,display_name) VALUES(gen_random_uuid(),'Intruso')")).rejects.toThrow();
  await db.exec("RESET ROLE; SET ROLE anon;");
  await expect(db.query("SELECT * FROM public.profiles")).rejects.toThrow();
  await db.exec("RESET ROLE;");
});