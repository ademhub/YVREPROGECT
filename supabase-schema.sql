-- Table pour les morceaux
create table if not exists tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  album text not null,
  duration text,
  totalSecs integer,
  cover text, -- URL ou base64
  src text    -- URL ou base64
);
