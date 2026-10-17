-- Shared rate limits for sign-in, sign-up, event check-in, blog comments and the public certificate
-- endpoints. Every server instance counts in the same table, so spreading requests over instances
-- does not reset a limit.
--
-- The app stores SHA-256 hashes of the keys (IP addresses, emails, user ids), never the raw values,
-- and rows older than a day are removed. Only the service role (the app server) may use the table
-- or the function; signed-in members and anonymous visitors cannot read or change any counter.

create table if not exists public.rate_limits (
  bucket text not null,
  key_hash text not null,
  window_start timestamptz not null default now(),
  hits integer not null default 0,
  primary key (bucket, key_hash)
);

alter table public.rate_limits enable row level security;
revoke all on table public.rate_limits from anon, authenticated;

-- Counts one request in a fixed window and reports whether it is still within the limit.
create or replace function public.consume_rate_limit(
  p_bucket text,
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hits integer;
begin
  insert into public.rate_limits as r (bucket, key_hash, window_start, hits)
  values (p_bucket, p_key_hash, now(), 1)
  on conflict (bucket, key_hash) do update
    set hits = case
          when r.window_start <= now() - make_interval(secs => p_window_seconds) then 1
          else r.hits + 1
        end,
        window_start = case
          when r.window_start <= now() - make_interval(secs => p_window_seconds) then now()
          else r.window_start
        end
  returning hits into v_hits;

  -- Occasional cleanup keeps the table small without a scheduled job.
  if random() < 0.01 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;

  return v_hits <= p_limit;
end;
$$;

revoke all on function public.consume_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, text, integer, integer) to service_role;
