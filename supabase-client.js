// Charge le client Supabase (CDN)
// Ajoute dans ton HTML :
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>

const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_KEY = 'sb_publishable_V8E7G_3kvBhlemSmKpS_Vw_v9PyBXg2';
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
