-- Execute only in the dedicated LeadTrace project, after creating/inviting the administrator in Auth.
-- Replace the email below. This script never creates a password or sends email.
do $$
declare account_id uuid; tenant_id uuid;
begin
  select id into account_id from auth.users where lower(email)=lower('SUBSTITUA_PELO_EMAIL_DO_ADMINISTRADOR');
  if account_id is null then raise exception 'Crie ou convide a conta no Auth e substitua o e-mail neste script antes de executar.'; end if;
  insert into public.profiles(id,display_name) values(account_id,'Administrador Resende Torres') on conflict(id) do nothing;
  select id into tenant_id from public.organizations where name='Resende Torres Engenharia' order by created_at limit 1;
  if tenant_id is null then
    insert into public.organizations(name,website) values('Resende Torres Engenharia','https://www.resendetorres.com/') returning id into tenant_id;
  end if;
  insert into public.organization_members(organization_id,user_id,role) values(tenant_id,account_id,'admin') on conflict(organization_id,user_id) do nothing;
  raise notice 'Organização configurada: %',tenant_id;
end $$;
