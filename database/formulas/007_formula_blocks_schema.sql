create table if not exists public.balance_formula_blocks (
  id uuid not null default gen_random_uuid (),
  scope_key text not null,
  category text not null,
  label text not null,
  token text not null,
  helper_text text null,
  sort_order bigint not null default 0,
  created_at timestamp with time zone not null default now(),
  constraint balance_formula_blocks_pkey primary key (id),
  constraint balance_formula_blocks_scope_token_key unique (scope_key, token)
) tablespace pg_default;
