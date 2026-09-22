-- PharmaTrace operational schema (PostgreSQL / Supabase)
-- Source of truth for organizations, medicines, batches, custody, and audit.

create extension if not exists pgcrypto;

do $$ begin
  create type public.organization_type as enum ('MANUFACTURER', 'DISTRIBUTOR', 'RETAILER', 'REGULATOR');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.organization_status as enum ('PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.app_role as enum ('MANUFACTURER', 'DISTRIBUTOR', 'RETAILER', 'ADMIN');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.batch_status as enum (
    'CREATED', 'IN_TRANSIT', 'RECEIVED', 'INVENTORY', 'SOLD', 'SUSPICIOUS', 'RECALLED', 'EXPIRED'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.blockchain_status as enum (
    'NOT_SUBMITTED', 'SUBMITTING', 'PENDING', 'CONFIRMING', 'CONFIRMED',
    'REVERTED', 'TIMEOUT', 'RECONCILING', 'FAILED'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.shipment_status as enum (
    'CREATED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'RECEIVED', 'FLAGGED'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.invoice_status as enum ('DRAFT', 'ISSUED', 'PAID');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.alert_severity as enum ('info', 'warning', 'danger');
exception when duplicate_object then null;
end $$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  code text not null unique,
  type public.organization_type not null,
  status public.organization_status not null default 'ACTIVE',
  wallet_address text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  role public.app_role not null,
  organization_id uuid not null references public.organizations (id),
  created_at timestamptz not null default now()
);

create index if not exists profiles_organization_id_idx on public.profiles (organization_id);

create table if not exists public.medicines (
  id uuid primary key default gen_random_uuid(),
  manufacturer_org_id uuid not null references public.organizations (id),
  name text not null,
  generic_name text not null,
  dosage_form text not null,
  strength text not null,
  packaging text not null,
  storage_requirements text not null,
  regulatory_reference text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
  created_at timestamptz not null default now()
);

create index if not exists medicines_manufacturer_org_id_idx on public.medicines (manufacturer_org_id);

create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  public_verification_id text not null unique default gen_random_uuid()::text,
  batch_number text not null,
  medicine_id uuid not null references public.medicines (id),
  manufacturer_org_id uuid not null references public.organizations (id),
  current_owner_org_id uuid not null references public.organizations (id),
  manufacturing_date date not null,
  expiry_date date not null,
  quantity integer not null check (quantity > 0),
  unit text not null,
  status public.batch_status not null default 'CREATED',
  blockchain_hash text,
  blockchain_status public.blockchain_status not null default 'PENDING',
  blockchain_block_number bigint,
  blockchain_submitted_at timestamptz,
  blockchain_confirmed_at timestamptz,
  blockchain_event text not null default 'BatchCreated',
  blockchain_from_wallet text,
  blockchain_to_wallet text,
  created_at timestamptz not null default now(),
  unique (manufacturer_org_id, batch_number),
  check (expiry_date > manufacturing_date)
);

create index if not exists batches_manufacturer_org_id_idx on public.batches (manufacturer_org_id);
create index if not exists batches_current_owner_org_id_idx on public.batches (current_owner_org_id);
create index if not exists batches_status_idx on public.batches (status);
create index if not exists batches_public_verification_id_idx on public.batches (public_verification_id);

create table if not exists public.blockchain_transactions (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches (id) on delete cascade,
  hash text,
  status public.blockchain_status not null default 'PENDING',
  block_number bigint,
  submitted_at timestamptz,
  confirmed_at timestamptz,
  event text not null,
  from_wallet text,
  to_wallet text,
  created_at timestamptz not null default now()
);

create index if not exists blockchain_transactions_batch_id_idx on public.blockchain_transactions (batch_id);

create table if not exists public.batch_events (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches (id) on delete cascade,
  type text not null,
  label text not null,
  occurred_at timestamptz not null default now(),
  organization_name text not null,
  detail text,
  blockchain_transaction_id uuid references public.blockchain_transactions (id),
  created_at timestamptz not null default now()
);

create index if not exists batch_events_batch_id_idx on public.batch_events (batch_id);

create table if not exists public.batch_transfers (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches (id),
  from_org_id uuid not null references public.organizations (id),
  to_org_id uuid not null references public.organizations (id),
  quantity integer not null check (quantity > 0),
  status public.blockchain_status not null default 'PENDING',
  created_at timestamptz not null default now()
);

create index if not exists batch_transfers_batch_id_idx on public.batch_transfers (batch_id);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  batch_id uuid not null references public.batches (id),
  origin_org_id uuid not null references public.organizations (id),
  destination_org_id uuid not null references public.organizations (id),
  quantity integer not null check (quantity > 0),
  status public.shipment_status not null default 'IN_TRANSIT',
  dispatched_at timestamptz,
  expected_arrival timestamptz,
  received_at timestamptz,
  transfer_id uuid references public.batch_transfers (id),
  created_at timestamptz not null default now()
);

create index if not exists shipments_destination_org_id_idx on public.shipments (destination_org_id);
create index if not exists shipments_origin_org_id_idx on public.shipments (origin_org_id);

create table if not exists public.inventory_balances (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  batch_id uuid not null references public.batches (id),
  quantity_on_hand integer not null default 0 check (quantity_on_hand >= 0),
  quantity_pending integer not null default 0 check (quantity_pending >= 0),
  unique (organization_id, batch_id)
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  seller_org_id uuid not null references public.organizations (id),
  buyer_org_id uuid not null references public.organizations (id),
  batch_id uuid not null references public.batches (id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 4) not null check (unit_price >= 0),
  total numeric(12, 2) not null check (total >= 0),
  status public.invoice_status not null default 'ISSUED',
  issued_at timestamptz not null default now(),
  document_hash text
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  severity public.alert_severity not null,
  category text not null,
  title text not null,
  description text not null,
  batch_id uuid references public.batches (id),
  organization_id uuid references public.organizations (id),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  actor_email text not null,
  organization_name text not null,
  organization_id uuid references public.organizations (id),
  target text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.verification_events (
  id uuid primary key default gen_random_uuid(),
  public_id text not null,
  batch_id uuid references public.batches (id),
  outcome text not null,
  created_at timestamptz not null default now()
);

create or replace function public.current_profile()
returns public.profiles
language sql
stable
security invoker
set search_path = public
as $$
  select *
  from public.profiles
  where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'ADMIN'
  )
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  org_id uuid;
  org_type public.organization_type;
  mapped_role public.app_role;
begin
  org_id := nullif(new.raw_user_meta_data->>'organization_id', '')::uuid;
  if org_id is null then
    return new;
  end if;

  select type into org_type from public.organizations where id = org_id;
  if org_type is null then
    return new;
  end if;

  mapped_role := case
    when org_type = 'REGULATOR' then 'ADMIN'::public.app_role
    else org_type::text::public.app_role
  end;

  insert into public.profiles (id, email, full_name, role, organization_id)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    mapped_role,
    org_id
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.write_audit(
  p_action text,
  p_target text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  profile public.profiles;
  org_name text;
begin
  select * into profile from public.profiles where id = auth.uid();
  if profile.id is null then
    return;
  end if;
  select legal_name into org_name from public.organizations where id = profile.organization_id;
  insert into public.audit_logs (action, actor_email, organization_name, organization_id, target)
  values (p_action, profile.email, coalesce(org_name, 'Unknown'), profile.organization_id, p_target);
end;
$$;

create or replace function public.create_medicine(
  p_name text,
  p_generic_name text,
  p_dosage_form text,
  p_strength text,
  p_packaging text,
  p_storage_requirements text,
  p_regulatory_reference text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  profile public.profiles;
  new_id uuid;
begin
  select * into profile from public.profiles where id = auth.uid();
  if profile.id is null or profile.role <> 'MANUFACTURER' then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  insert into public.medicines (
    manufacturer_org_id, name, generic_name, dosage_form, strength,
    packaging, storage_requirements, regulatory_reference
  ) values (
    profile.organization_id, p_name, p_generic_name, p_dosage_form, p_strength,
    p_packaging, p_storage_requirements, p_regulatory_reference
  ) returning id into new_id;

  perform public.write_audit('MEDICINE_CREATED', p_name);
  return new_id;
end;
$$;

create or replace function public.create_batch(
  p_medicine_id uuid,
  p_batch_number text,
  p_manufacturing_date date,
  p_expiry_date date,
  p_quantity integer,
  p_unit text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  profile public.profiles;
  med public.medicines;
  org public.organizations;
  new_id uuid;
  tx_id uuid;
begin
  select * into profile from public.profiles where id = auth.uid();
  if profile.id is null or profile.role <> 'MANUFACTURER' then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  select * into med from public.medicines where id = p_medicine_id;
  if med.id is null or med.manufacturer_org_id <> profile.organization_id then
    raise exception 'Medicine is not owned by this organization' using errcode = '42501';
  end if;

  if p_expiry_date <= p_manufacturing_date then
    raise exception 'Expiry date must be after manufacturing date' using errcode = '22000';
  end if;

  select * into org from public.organizations where id = profile.organization_id;

  insert into public.batches (
    batch_number, medicine_id, manufacturer_org_id, current_owner_org_id,
    manufacturing_date, expiry_date, quantity, unit, status,
    blockchain_status, blockchain_submitted_at, blockchain_event, blockchain_to_wallet
  ) values (
    p_batch_number, p_medicine_id, profile.organization_id, profile.organization_id,
    p_manufacturing_date, p_expiry_date, p_quantity, p_unit, 'CREATED',
    'PENDING', now(), 'BatchCreated', org.wallet_address
  ) returning id into new_id;

  insert into public.inventory_balances (organization_id, batch_id, quantity_on_hand)
  values (profile.organization_id, new_id, p_quantity);

  insert into public.blockchain_transactions (
    batch_id, status, submitted_at, event, to_wallet
  ) values (
    new_id, 'PENDING', now(), 'BatchCreated', org.wallet_address
  ) returning id into tx_id;

  insert into public.batch_events (batch_id, type, label, organization_name, occurred_at)
  values (new_id, 'MANUFACTURED', 'Manufactured', org.legal_name, now());

  insert into public.batch_events (
    batch_id, type, label, organization_name, detail, blockchain_transaction_id, occurred_at
  ) values (
    new_id, 'CREATED_ON_BLOCKCHAIN', 'Blockchain submission pending',
    org.legal_name, 'Awaiting confirmation on Polygon Amoy', tx_id, now()
  );

  insert into public.alerts (severity, category, title, description, batch_id, organization_id)
  values (
    'info', 'MISMATCH',
    'Blockchain confirmation pending for ' || p_batch_number,
    'Batch created in the database; blockchain provenance is awaiting confirmation.',
    new_id, profile.organization_id
  );

  perform public.write_audit('BATCH_CREATED', p_batch_number);
  return new_id;
end;
$$;

create or replace function public.transfer_batch(
  p_batch_id uuid,
  p_to_org_id uuid,
  p_quantity integer
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  profile public.profiles;
  batch public.batches;
  from_org public.organizations;
  to_org public.organizations;
  transfer_id uuid;
  shipment_id uuid;
  tx_id uuid;
  seq int;
begin
  select * into profile from public.profiles where id = auth.uid();
  if profile.id is null or profile.role not in ('MANUFACTURER', 'DISTRIBUTOR') then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  select * into batch from public.batches where id = p_batch_id for update;
  if batch.id is null then
    raise exception 'NOT_FOUND' using errcode = 'P0002';
  end if;
  if batch.current_owner_org_id <> profile.organization_id then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  if batch.status not in ('CREATED', 'RECEIVED', 'INVENTORY') then
    raise exception 'Batch cannot be transferred in its current state' using errcode = 'P0001';
  end if;
  if p_quantity <> batch.quantity then
    raise exception 'V1 transfers must move the full batch quantity' using errcode = 'P0001';
  end if;
  if p_to_org_id = profile.organization_id then
    raise exception 'Destination must be a different organization' using errcode = 'P0001';
  end if;

  select * into from_org from public.organizations where id = profile.organization_id;
  select * into to_org from public.organizations where id = p_to_org_id;
  if to_org.id is null or to_org.status <> 'ACTIVE' then
    raise exception 'Destination organization is not active' using errcode = 'P0001';
  end if;
  if to_org.type not in ('DISTRIBUTOR', 'RETAILER') then
    raise exception 'Destination must be a distributor or retailer' using errcode = 'P0001';
  end if;

  update public.inventory_balances
    set quantity_on_hand = quantity_on_hand - p_quantity,
        quantity_pending = quantity_pending + p_quantity
  where organization_id = profile.organization_id and batch_id = p_batch_id;

  insert into public.batch_transfers (batch_id, from_org_id, to_org_id, quantity, status)
  values (p_batch_id, profile.organization_id, p_to_org_id, p_quantity, 'PENDING')
  returning id into transfer_id;

  select count(*) + 1 into seq from public.shipments;
  insert into public.shipments (
    reference, batch_id, origin_org_id, destination_org_id, quantity,
    status, dispatched_at, expected_arrival, transfer_id
  ) values (
    'SHP-' || to_char(now(), 'YYYY') || '-' || lpad(seq::text, 4, '0'),
    p_batch_id, profile.organization_id, p_to_org_id, p_quantity,
    'IN_TRANSIT', now(), now() + interval '3 days', transfer_id
  ) returning id into shipment_id;

  insert into public.blockchain_transactions (
    batch_id, status, submitted_at, event, from_wallet, to_wallet
  ) values (
    p_batch_id, 'PENDING', now(), 'BatchTransferred', from_org.wallet_address, to_org.wallet_address
  ) returning id into tx_id;

  update public.batches
    set status = 'IN_TRANSIT',
        blockchain_status = 'PENDING',
        blockchain_submitted_at = now(),
        blockchain_event = 'BatchTransferred',
        blockchain_from_wallet = from_org.wallet_address,
        blockchain_to_wallet = to_org.wallet_address
  where id = p_batch_id;

  insert into public.batch_events (
    batch_id, type, label, organization_name, detail, blockchain_transaction_id
  ) values (
    p_batch_id, 'TRANSFERRED', 'Transferred',
    from_org.legal_name, 'To: ' || to_org.legal_name || ' — in transit', tx_id
  );

  perform public.write_audit('BATCH_TRANSFERRED', batch.batch_number || ' → ' || to_org.legal_name);
  return shipment_id;
end;
$$;

create or replace function public.receive_shipment(p_shipment_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  profile public.profiles;
  shipment public.shipments;
  batch public.batches;
  dest public.organizations;
  tx_id uuid;
begin
  select * into profile from public.profiles where id = auth.uid();
  if profile.id is null or profile.role not in ('DISTRIBUTOR', 'RETAILER') then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  select * into shipment from public.shipments where id = p_shipment_id for update;
  if shipment.id is null then
    raise exception 'NOT_FOUND' using errcode = 'P0002';
  end if;
  if shipment.destination_org_id <> profile.organization_id then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  if shipment.status = 'RECEIVED' then
    raise exception 'Shipment already received' using errcode = 'P0001';
  end if;

  select * into batch from public.batches where id = shipment.batch_id for update;
  select * into dest from public.organizations where id = profile.organization_id;

  update public.inventory_balances
    set quantity_pending = greatest(quantity_pending - shipment.quantity, 0)
  where organization_id = shipment.origin_org_id and batch_id = shipment.batch_id;

  insert into public.inventory_balances (organization_id, batch_id, quantity_on_hand)
  values (profile.organization_id, shipment.batch_id, shipment.quantity)
  on conflict (organization_id, batch_id)
  do update set quantity_on_hand = public.inventory_balances.quantity_on_hand + excluded.quantity_on_hand;

  update public.shipments
    set status = 'RECEIVED', received_at = now()
  where id = p_shipment_id;

  update public.batch_transfers
    set status = 'PENDING'
  where id = shipment.transfer_id;

  insert into public.blockchain_transactions (
    batch_id, status, submitted_at, event, to_wallet
  ) values (
    batch.id, 'PENDING', now(), 'BatchReceived', dest.wallet_address
  ) returning id into tx_id;

  update public.batches
    set status = 'INVENTORY',
        current_owner_org_id = profile.organization_id,
        blockchain_status = 'PENDING',
        blockchain_submitted_at = now(),
        blockchain_event = 'BatchReceived',
        blockchain_to_wallet = dest.wallet_address
  where id = batch.id;

  insert into public.batch_events (
    batch_id, type, label, organization_name, blockchain_transaction_id
  ) values (
    batch.id, 'RECEIVED', 'Received', dest.legal_name, tx_id
  );

  perform public.write_audit('BATCH_RECEIVED', batch.batch_number);
  return batch.id;
end;
$$;

create or replace function public.recall_batch(p_batch_id uuid, p_reason text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  profile public.profiles;
  batch public.batches;
  org public.organizations;
  tx_id uuid;
begin
  select * into profile from public.profiles where id = auth.uid();
  if profile.id is null or profile.role <> 'ADMIN' then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  select * into batch from public.batches where id = p_batch_id for update;
  if batch.id is null then
    raise exception 'NOT_FOUND' using errcode = 'P0002';
  end if;

  select * into org from public.organizations where id = profile.organization_id;

  insert into public.blockchain_transactions (
    batch_id, status, submitted_at, event
  ) values (
    p_batch_id, 'PENDING', now(), 'BatchRecalled'
  ) returning id into tx_id;

  update public.batches
    set status = 'RECALLED',
        blockchain_status = 'PENDING',
        blockchain_event = 'BatchRecalled',
        blockchain_submitted_at = now()
  where id = p_batch_id;

  insert into public.batch_events (
    batch_id, type, label, organization_name, detail, blockchain_transaction_id
  ) values (
    p_batch_id, 'RECALLED', 'Recalled', org.legal_name, p_reason, tx_id
  );

  insert into public.alerts (severity, category, title, description, batch_id, organization_id)
  values (
    'danger', 'RECALLED',
    'Batch ' || batch.batch_number || ' recalled',
    p_reason, p_batch_id, profile.organization_id
  );

  perform public.write_audit('BATCH_RECALLED', batch.batch_number);
  return p_batch_id;
end;
$$;

create or replace function public.log_verification_event(
  p_public_id text,
  p_batch_id uuid,
  p_outcome text
) returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  insert into public.verification_events (public_id, batch_id, outcome)
  values (p_public_id, p_batch_id, p_outcome);
end;
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.medicines enable row level security;
alter table public.batches enable row level security;
alter table public.blockchain_transactions enable row level security;
alter table public.batch_events enable row level security;
alter table public.batch_transfers enable row level security;
alter table public.shipments enable row level security;
alter table public.inventory_balances enable row level security;
alter table public.invoices enable row level security;
alter table public.alerts enable row level security;
alter table public.audit_logs enable row level security;
alter table public.verification_events enable row level security;

-- Public verification may read provenance facts without a session.
create policy organizations_select on public.organizations
  for select using (true);

create policy medicines_select on public.medicines
  for select using (true);

create policy batches_select on public.batches
  for select using (true);

create policy batch_events_select on public.batch_events
  for select using (true);

create policy blockchain_transactions_select on public.blockchain_transactions
  for select using (true);

create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy medicines_write_own on public.medicines
  for insert to authenticated
  with check (
    manufacturer_org_id = (select organization_id from public.profiles where id = auth.uid())
    and (select role from public.profiles where id = auth.uid()) = 'MANUFACTURER'
  );

create policy batches_insert_own on public.batches
  for insert to authenticated
  with check (
    manufacturer_org_id = (select organization_id from public.profiles where id = auth.uid())
    and current_owner_org_id = (select organization_id from public.profiles where id = auth.uid())
    and (select role from public.profiles where id = auth.uid()) = 'MANUFACTURER'
  );

create policy batches_update_related on public.batches
  for update to authenticated
  using (
    public.is_admin()
    or current_owner_org_id = (select organization_id from public.profiles where id = auth.uid())
    or manufacturer_org_id = (select organization_id from public.profiles where id = auth.uid())
  );

create policy inventory_select on public.inventory_balances
  for select to authenticated
  using (
    public.is_admin()
    or organization_id = (select organization_id from public.profiles where id = auth.uid())
  );

create policy inventory_write on public.inventory_balances
  for all to authenticated
  using (
    public.is_admin()
    or organization_id = (select organization_id from public.profiles where id = auth.uid())
  )
  with check (
    public.is_admin()
    or organization_id = (select organization_id from public.profiles where id = auth.uid())
  );

create policy shipments_select on public.shipments
  for select to authenticated
  using (
    public.is_admin()
    or origin_org_id = (select organization_id from public.profiles where id = auth.uid())
    or destination_org_id = (select organization_id from public.profiles where id = auth.uid())
  );

create policy shipments_write on public.shipments
  for all to authenticated
  using (
    public.is_admin()
    or origin_org_id = (select organization_id from public.profiles where id = auth.uid())
    or destination_org_id = (select organization_id from public.profiles where id = auth.uid())
  )
  with check (
    public.is_admin()
    or origin_org_id = (select organization_id from public.profiles where id = auth.uid())
    or destination_org_id = (select organization_id from public.profiles where id = auth.uid())
  );

create policy transfers_select on public.batch_transfers
  for select to authenticated
  using (
    public.is_admin()
    or from_org_id = (select organization_id from public.profiles where id = auth.uid())
    or to_org_id = (select organization_id from public.profiles where id = auth.uid())
  );

create policy transfers_write on public.batch_transfers
  for all to authenticated
  using (
    public.is_admin()
    or from_org_id = (select organization_id from public.profiles where id = auth.uid())
    or to_org_id = (select organization_id from public.profiles where id = auth.uid())
  )
  with check (
    public.is_admin()
    or from_org_id = (select organization_id from public.profiles where id = auth.uid())
    or to_org_id = (select organization_id from public.profiles where id = auth.uid())
  );

create policy invoices_select on public.invoices
  for select to authenticated
  using (
    public.is_admin()
    or seller_org_id = (select organization_id from public.profiles where id = auth.uid())
    or buyer_org_id = (select organization_id from public.profiles where id = auth.uid())
  );

create policy alerts_select on public.alerts
  for select to authenticated
  using (
    public.is_admin()
    or organization_id is null
    or organization_id = (select organization_id from public.profiles where id = auth.uid())
  );

create policy alerts_insert on public.alerts
  for insert to authenticated
  with check (true);

create policy audit_select on public.audit_logs
  for select to authenticated
  using (public.is_admin());

create policy audit_insert on public.audit_logs
  for insert to authenticated
  with check (true);

create policy batch_events_insert on public.batch_events
  for insert to authenticated
  with check (true);

create policy blockchain_insert on public.blockchain_transactions
  for insert to authenticated
  with check (true);

create policy verification_events_insert on public.verification_events
  for insert to anon, authenticated
  with check (true);

create policy verification_events_select on public.verification_events
  for select to authenticated
  using (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.organizations, public.medicines, public.batches, public.batch_events, public.blockchain_transactions to anon, authenticated;
grant select, insert, update on public.profiles, public.medicines, public.batches, public.batch_events, public.blockchain_transactions, public.batch_transfers, public.shipments, public.inventory_balances, public.invoices, public.alerts, public.audit_logs to authenticated;
grant insert on public.verification_events to anon, authenticated;
grant select on public.verification_events to authenticated;

grant execute on function public.create_medicine(text, text, text, text, text, text, text) to authenticated;
grant execute on function public.create_batch(uuid, text, date, date, integer, text) to authenticated;
grant execute on function public.transfer_batch(uuid, uuid, integer) to authenticated;
grant execute on function public.receive_shipment(uuid) to authenticated;
grant execute on function public.recall_batch(uuid, text) to authenticated;
grant execute on function public.log_verification_event(text, uuid, text) to anon, authenticated;

-- Seed organizations (auth users are created separately by scripts/seed-demo-users.mjs)
insert into public.organizations (id, legal_name, code, type, status, wallet_address)
values
  ('11111111-1111-4111-8111-111111111111', 'Acme Pharmaceuticals Ltd.', 'ACME-MFG', 'MANUFACTURER', 'ACTIVE', '0x8a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f90'),
  ('22222222-2222-4222-8222-222222222222', 'MediLink Distribution', 'MEDILINK-DIST', 'DISTRIBUTOR', 'ACTIVE', '0x1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d'),
  ('33333333-3333-4333-8333-333333333333', 'CarePlus Pharmacy', 'CAREPLUS-RTL', 'RETAILER', 'ACTIVE', '0xab12cd34ef56ab78cd90ef12ab34cd56ef78ab90'),
  ('44444444-4444-4444-8444-444444444444', 'National Drug Regulatory Authority', 'NDRA-REG', 'REGULATOR', 'ACTIVE', '0xdead000000000000000000000000000000beef00')
on conflict (id) do nothing;

insert into public.medicines (
  id, manufacturer_org_id, name, generic_name, dosage_form, strength, packaging, storage_requirements, regulatory_reference
) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'Paracetamol', 'Acetaminophen', 'Tablet', '500 mg', 'Blister pack of 10 · 100 packs per carton', 'Store below 25°C, protect from moisture', 'REG-PCM-500-2025'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '11111111-1111-4111-8111-111111111111', 'Amoxicillin', 'Amoxicillin trihydrate', 'Capsule', '250 mg', 'Bottle of 100 capsules', 'Store below 25°C', 'REG-AMX-250-2025'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '11111111-1111-4111-8111-111111111111', 'Insulin Glargine', 'Insulin glargine', 'Injection', '100 IU/mL', '5 pre-filled pens per carton', 'Cold chain 2–8°C, do not freeze', 'REG-INS-100-2025')
on conflict (id) do nothing;

insert into public.batches (
  id, public_verification_id, batch_number, medicine_id, manufacturer_org_id, current_owner_org_id,
  manufacturing_date, expiry_date, quantity, unit, status,
  blockchain_hash, blockchain_status, blockchain_block_number,
  blockchain_submitted_at, blockchain_confirmed_at, blockchain_event, blockchain_to_wallet
) values (
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'pcm-2026-001-verify',
  'PCM-2026-001',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '11111111-1111-4111-8111-111111111111',
  '33333333-3333-4333-8333-333333333333',
  '2026-09-22',
  '2028-09-21',
  10000,
  'tablets',
  'INVENTORY',
  '0x8a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f9021d4c7a1f3b8e5c2d0a91dc',
  'CONFIRMED',
  9821334,
  '2026-09-22T11:02:00Z',
  '2026-09-22T11:02:18Z',
  'BatchCreated',
  '0x8a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f90'
) on conflict (id) do nothing;

insert into public.inventory_balances (organization_id, batch_id, quantity_on_hand)
values ('33333333-3333-4333-8333-333333333333', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', 10000)
on conflict (organization_id, batch_id) do nothing;

insert into public.batch_events (batch_id, type, label, occurred_at, organization_name, detail)
values
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'MANUFACTURED', 'Manufactured', '2026-09-22T09:00:00Z', 'Acme Pharmaceuticals Ltd.', null),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'CREATED_ON_BLOCKCHAIN', 'Created on blockchain', '2026-09-22T11:02:18Z', 'Acme Pharmaceuticals Ltd.', 'Provenance record confirmed on Polygon Amoy'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'TRANSFERRED', 'Transferred to distributor', '2026-09-23T08:30:00Z', 'Acme Pharmaceuticals Ltd.', 'To: MediLink Distribution'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'RECEIVED', 'Received by distributor', '2026-09-24T10:15:00Z', 'MediLink Distribution', null),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'TRANSFERRED', 'Transferred to retailer', '2026-09-25T09:00:00Z', 'MediLink Distribution', 'To: CarePlus Pharmacy'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'RECEIVED', 'Received by retailer', '2026-09-26T11:40:00Z', 'CarePlus Pharmacy', null);
