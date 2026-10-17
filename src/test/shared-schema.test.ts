// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
it("installs the optional isolated schema without changing existing public data, policies or grants", async () => {
  const db = await PGlite.create();
  try {
    await db.exec(
      `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth to authenticated;create table public.existing_product(id int primary key,content text);insert into public.existing_product values(1,'Conteúdo existente');alter table public.existing_product enable row level security;create policy existing_read on public.existing_product for select to authenticated using(true);grant select on public.existing_product to authenticated;`,
    );
    const before = await db.query(
      `select relacl::text from pg_class where oid='public.existing_product'::regclass`,
    );
    await db.exec(readFileSync("supabase/isolated-schema.sql", "utf8"));
    const after = await db.query(
      `select relacl::text from pg_class where oid='public.existing_product'::regclass`,
    );
    expect(after.rows).toEqual(before.rows);
    expect((await db.query("select * from public.existing_product")).rows).toEqual([
      { id: 1, content: "Conteúdo existente" },
    ]);
    expect(
      (
        await db.query(
          `select policyname from pg_policies where schemaname='public' and tablename='existing_product'`,
        )
      ).rows,
    ).toEqual([{ policyname: "existing_read" }]);
    const org = "10000000-0000-4000-8000-000000000001",
      user = "20000000-0000-4000-8000-000000000001";
    await db.exec(
      `insert into auth.users values('${user}');insert into leadtrace.profiles(id,display_name) values('${user}','Admin LeadTrace');insert into leadtrace.organizations(id,name) values('${org}','Organização LeadTrace');insert into leadtrace.organization_members(organization_id,user_id,role) values('${org}','${user}','admin');set request.jwt.claim.sub='${user}';set role authenticated;`,
    );
    await db.query(
      `select leadtrace.crm_command($1,'lead_create',null,'{"name":"Contato piloto","company":"Condomínio piloto","phone":"21999990000"}')`,
      [org],
    );
    expect((await db.query("select name from leadtrace.leads")).rows).toEqual([
      { name: "Contato piloto" },
    ]);
    expect((await db.query("select * from public.existing_product")).rows).toHaveLength(1);
    await expect(
      db.query(`insert into public.existing_product values(2,'Não permitido')`),
    ).rejects.toThrow();
  } finally {
    await db.close();
  }
}, 30000);
