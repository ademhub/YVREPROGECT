// Charge le client Supabase (CDN)
// Ajoute dans ton HTML :
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>


if (!window._supabaseAlreadyDeclared) {
  window._supabaseAlreadyDeclared = true;
  const SUPABASE_URL = 'https://tfgqzzugfcqwitadqgsu.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ3F6enVnZmNxd2l0YWRxZ3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2OTA5NjksImV4cCI6MjA5MTI2Njk2OX0.244shaPDNmP0YAglLe89cfh61qqvxZ-VUO0NWUdaFZ4';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // Fonctions utilitaires
  async function fetchTracks() {
    const { data, error } = await supabase.from('tracks').select('*').order('title');
    if (error) throw error;
    return data;
  }

  async function addTrack(track) {
    const { data, error } = await supabase.from('tracks').insert([track]);
    if (error) throw error;
    return data;
  }

  async function deleteTrack(id) {
    const { error } = await supabase.from('tracks').delete().eq('id', id);
    if (error) throw error;
  }

  // Upload un fichier dans Supabase Storage et retourne l'URL publique
  async function uploadFileToStorage(file, folder) {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from(folder).upload(fileName, file, { upsert: false });
    if (error) throw error;
    // Récupère l'URL publique
    const { data: publicUrlData } = supabase.storage.from(folder).getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  }

  window.supabaseApi = { fetchTracks, addTrack, deleteTrack };
  window.supabaseApi.uploadFileToStorage = uploadFileToStorage;
}

// Fonctions utilitaires
async function fetchTracks() {
  const { data, error } = await supabase.from('tracks').select('*').order('title');
  if (error) throw error;
  return data;
}

async function addTrack(track) {
  const { data, error } = await supabase.from('tracks').insert([track]);
  if (error) throw error;
  return data;
}

async function deleteTrack(id) {
  const { error } = await supabase.from('tracks').delete().eq('id', id);
  if (error) throw error;
}

// Upload un fichier dans Supabase Storage et retourne l'URL publique
async function uploadFileToStorage(file, folder) {
  const fileName = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from(folder).upload(fileName, file, { upsert: false });
  if (error) throw error;
  // Récupère l'URL publique
  const { data: publicUrlData } = supabase.storage.from(folder).getPublicUrl(fileName);
  return publicUrlData.publicUrl;
}

window.supabaseApi = { fetchTracks, addTrack, deleteTrack };
window.supabaseApi.uploadFileToStorage = uploadFileToStorage;
