// @vitest-environment node
// Execute the actual PostgreSQL migration in WASM; do not mock RLS predicates.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
let db: PGlite;
const orgA = "10000000-0000-4000-8000-000000000001",
  orgB = "10000000-0000-4000-8000-000000000002";
const admin = "20000000-0000-4000-8000-000000000001",
  outsider = "20000000-0000-4000-8000-000000000002",
  agent = "20000000-0000-4000-8000-000000000003";
let leadA: string, leadB: string;
async function actor(id: string) {
  await db.exec(`reset role; set request.jwt.claim.sub='${id}'; set role authenticated;`);
}
beforeAll(async () => {
  db = await PGlite.create();
  await db.exec(
    `create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;`,
  );
  for (const file of readdirSync("supabase/migrations")
    .filter((f) => f.endsWith(".sql"))
    .sort())
    await db.exec(readFileSync("supabase/migrations/" + file, "utf8"));
  await db.exec(
    `insert into auth.users values('${admin}'),('${outsider}'),('${agent}'); insert into profiles values('${admin}','Administrador',now()),('${outsider}','Outro cliente',now()),('${agent}','Atendente',now()); insert into organizations(id,name) values('${orgA}','Organização A'),('${orgB}','Organização B'); insert into organization_members(organization_id,user_id,role) values('${orgA}','${admin}','admin'),('${orgB}','${outsider}','admin'),('${orgA}','${agent}','agent');`,
  );
  await actor(admin);
  const a = await db.query<{ id: string }>(
    `select crm_command($1,'lead_create',null,$2::jsonb) id`,
    [orgA, JSON.stringify({ name: "Síndico A", company: "Condomínio A", phone: "21999990000" })],
  );
  leadA = a.rows[0]!.id;
  await actor(outsider);
  const b = await db.query<{ id: string }>(
    `select crm_command($1,'lead_create',null,$2::jsonb) id`,
    [orgB, JSON.stringify({ name: "Síndico B", company: "Condomínio B", phone: "21999990001" })],
  );
  leadB = b.rows[0]!.id;
}, 30000);
afterAll(async () => {
  await db?.close();
});
describe("production tenant isolation", () => {
  it("only exposes records in the authenticated organization", async () => {
    await actor(admin);
    const r = await db.query<{ id: string }>("select id from leads");
    expect(r.rows.map((x) => x.id)).toEqual([leadA]);
  });
  it("rejects cross-tenant commands and foreign-key references", async () => {
    await actor(admin);
    await expect(
      db.query(`select crm_command($1,'comment_add',$2,'{"text":"Invasão"}')`, [orgB, leadB]),
    ).rejects.toThrow();
    await expect(
      db.query(`insert into notes(organization_id,lead_id,text) values($1,$2,'Invasão')`, [
        orgA,
        leadB,
      ]),
    ).rejects.toThrow();
    expect((await db.query("select * from notes")).rows).toHaveLength(0);
  });
  it("prevents membership escalation and unauthenticated reads", async () => {
    await actor(agent);
    await expect(
      db.query(`update organization_members set role='admin' where user_id=$1`, [agent]),
    ).rejects.toThrow();
    await db.exec("reset role; set role anon");
    await expect(db.query("select * from leads")).rejects.toThrow();
  });
  it("limits attendants to their assigned leads", async () => {
    await actor(agent);
    expect((await db.query("select * from leads")).rows).toHaveLength(0);
    await expect(
      db.query(`select crm_command($1,'stage_move',$2,'{"stage":"fechado"}')`, [orgA, leadA]),
    ).rejects.toThrow();
  });
  it("requires reason for disqualification and rolls back invalid mutations", async () => {
    await actor(admin);
    await expect(
      db.query(`select crm_command($1,'stage_move',$2,'{"stage":"desqualificado"}')`, [
        orgA,
        leadA,
      ]),
    ).rejects.toThrow();
    expect(
      (await db.query<{ stage: string }>("select stage from leads where id=$1", [leadA])).rows[0]
        ?.stage,
    ).toBe("novo");
  });
  it("moves pipeline, proposal and follow-up atomically", async () => {
    await actor(admin);
    await db.query(`select crm_command($1,'stage_move',$2,'{"stage":"proposta_enviada"}')`, [
      orgA,
      leadA,
    ]);
    expect(
      (
        await db.query<{ status: string; sent_at: string }>(
          "select status,sent_at from proposals where lead_id=$1",
          [leadA],
        )
      ).rows[0],
    ).toMatchObject({ status: "enviada" });
    await db.query(
      `select crm_command($1,'proposal_save',$2,'{"value":25000,"nextFollowUp":"2026-11-01T12:00:00Z"}')`,
      [orgA, leadA],
    );
    const r = await db.query<{ value: string; next_activity: Date; next_follow_up: Date }>(
      `select l.value,l.next_activity,p.next_follow_up from leads l join proposals p on p.lead_id=l.id where l.id=$1`,
      [leadA],
    );
    expect(Number(r.rows[0]?.value)).toBe(25000);
    expect(r.rows[0]?.next_activity).toEqual(r.rows[0]?.next_follow_up);
  });
  it("allows only administrators to manage roles and preserves the last admin", async () => {
    await actor(agent);
    await expect(
      db.query(`select set_member_role($1,$2,'admin')`, [orgA, agent]),
    ).rejects.toThrow();
    await actor(admin);
    await expect(
      db.query(`select set_member_role($1,$2,'agent')`, [orgA, admin]),
    ).rejects.toThrow();
    await expect(
      db.query(`select set_member_role($1,$2,'admin')`, [orgB, outsider]),
    ).rejects.toThrow();
    await db.query(`select set_member_role($1,$2,'manager')`, [orgA, agent]);
    const r = await db.query<{ role: string }>(
      "select role from organization_members where user_id=$1",
      [agent],
    );
    expect(r.rows[0]?.role).toBe("manager");
  });
  it("rejects forged audit authors and tenant identity changes", async () => {
    await actor(admin);
    await expect(
      db.query(
        `insert into notes(organization_id,lead_id,text,actor_id) values($1,$2,'Autoria falsa',$3)`,
        [orgA, leadA, outsider],
      ),
    ).rejects.toThrow();
    await expect(
      db.query(`update leads set organization_id=$1 where id=$2`, [orgB, leadA]),
    ).rejects.toThrow();
  });
  it("enables RLS on every production table", async () => {
    await db.exec("reset role");
    const r = await db.query<{ relname: string }>(
      `select relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity`,
    );
    expect(r.rows).toEqual([]);
  });
  it("deduplicates incoming WhatsApp events and keeps origin unknown without evidence", async () => {
    await db.exec("reset role; set request.jwt.claim.sub=''; set role service_role");
    const call = () =>
      db.query<{ id: string }>(
        `select ingest_whatsapp_message($1,'wamid.inbound.1','5521999990011','Olá, preciso de orçamento',now()) id`,
        [orgA],
      );
    const first = await call(),
      second = await call();
    expect(first.rows[0]?.id).toBe(second.rows[0]?.id);
    const r = await db.query<{ source: string; unread: number }>(
      `select l.source,c.unread from leads l join conversations c on c.lead_id=l.id where l.phone='5521999990011'`,
    );
    expect(r.rows[0]).toEqual({ source: "unknown", unread: 1 });
    await actor(admin);
    await expect(call()).rejects.toThrow();
  });
  it("deduplicates website captures and preserves first-touch origin", async () => {
    await db.exec("reset role; set request.jwt.claim.sub=''; set role service_role");
    const payload = {
      name: "Contato do site",
      company: "Condomínio Site",
      phone: "5521999990022",
      source: "google_ads",
      attribution: {
        channel: "Google Ads",
        firstTouch: "2026-10-17T12:00:00Z",
        lastTouch: "2026-10-17T12:00:00Z",
        method: "UTM capturada",
        evidence: "utm_source=google&utm_medium=cpc",
        confidence: "media",
      },
    };
    const call = (id: string) =>
      db.query<{ id: string }>(`select ingest_site_lead($1,$2,$3::jsonb) id`, [
        orgA,
        id,
        JSON.stringify(payload),
      ]);
    const a = await call("capture-1"),
      b = await call("capture-1");
    expect(a.rows[0]?.id).toBe(b.rows[0]?.id);
    payload.source = "instagram";
    await call("capture-2");
    const r = await db.query<{ source: string }>(`select source from leads where id=$1`, [
      a.rows[0]!.id,
    ]);
    expect(r.rows[0]?.source).toBe("google_ads");
  });
  it("audits relevant mutations without copying personal message content", async () => {
    await actor(admin);
    await db.query(`select crm_command($1,'comment_add',$2,'{"text":"Comentário confidencial"}')`, [
      orgA,
      leadA,
    ]);
    const audit = await db.query("select * from audit_logs");
    expect(audit.rows.length).toBeGreaterThan(0);
    expect(JSON.stringify(audit.rows)).not.toContain("Comentário confidencial");
  });
});
