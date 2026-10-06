import { DatabaseSync } from 'node:sqlite';

/** Le schéma, écrit à un seul endroit. Des colonnes plates, en snake_case : la base ne connaît ni classe ni règle. */
const SCHEMA = `
  create table if not exists users (
    id         text primary key,
    name       text not null,
    email      text not null,
    rider_type text not null
  );

  create table if not exists stations (
    id    text primary key,
    docks integer not null
  );

  create table if not exists station_bikes (
    station_id text not null references stations (id),
    bike_id    text not null,
    position   integer not null,
    broken     integer not null default 0,
    primary key (station_id, bike_id)
  );

  create table if not exists station_followers (
    station_id text not null references stations (id),
    user_id    text not null references users (id),
    primary key (station_id, user_id)
  );

  -- L'historique des départs : une ligne par trajet, jamais écrasée. Le trajet en cours d'un usager est son dernier départ.
  create table if not exists rides (
    user_id         text not null,
    from_station_id text not null,
    started_at      text not null,
    primary key (user_id, started_at)
  );
`;

/** Ouvre la base de la ville et s'assure que ses tables existent. Sans chemin : une base en mémoire, jetable, pour les tests. */
export function openDatabase(location = ':memory:'): DatabaseSync {
  const database = new DatabaseSync(location);
  database.exec(SCHEMA);
  // Migration additive : les anciens départs et le rapport US12 sont conservés.
  const columns = database.prepare('pragma table_info(rides)').all().map((row) => row.name);
  if (!columns.includes('bike_id')) database.exec('alter table rides add column bike_id text');
  if (!columns.includes('ended_at')) database.exec('alter table rides add column ended_at text');
  return database;
}

/** Exécute plusieurs écritures comme une seule : tout passe, ou rien ne change. */
export function inTransaction(database: DatabaseSync, write: () => void): void {
  database.exec('begin');
  try {
    write();
    database.exec('commit');
  } catch (error) {
    database.exec('rollback');
    throw error;
  }
}
