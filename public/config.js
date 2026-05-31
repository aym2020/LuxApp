// Configuration Supabase (frontend).
// Remplace les deux valeurs par celles de ton projet Supabase
// (Project Settings > API). N'utilise JAMAIS la service_role key ici.
//
// Tant que SUPABASE_URL contient "xxxx", l'application reste en mode local
// uniquement (aucun appel cloud). La clé anon peut être exposée ici car la
// Row Level Security (RLS) protège les données de chaque utilisateur.

window.APP_CONFIG = {
  SUPABASE_URL: "https://xxxx.supabase.co",
  SUPABASE_ANON_KEY: "xxxx"
};
