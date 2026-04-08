// =====================
// TRACK DATA
// =====================
const tracks = [];
let albumData = {
  name: 'Sound Collection',
  cover: ''
};

// =====================
// STATE
// =====================
let currentTrackIndex = 0;
let isPlaying         = false;
let currentSecs       = 0;
let progressInterval  = null;
let activeScreenId    = 'screen-login';
let audio             = null;
let searchQuery       = '';
let accountType       = localStorage.getItem('yvre-account') || 'listener';
let isAuthenticated   = false;

const screenOrder = ['screen-login', 'screen-home', 'screen-tracklist', 'screen-player'];
const defaultAlbum  = 'Tracklist Vol. 1';
const ADMIN_PASSWORD = 'beat';

// =====================
// UTILITIES
// =====================
function fmt(s) {
  const m   = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function updateTracklistActive() {
  document.querySelectorAll('.track-item').forEach((el, i) => {
    el.classList.toggle('active', i === currentTrackIndex);
  });
}

function updateTracklistMeta() {
  const visibleTracks = getVisibleTracks();
  const countEl = document.querySelector('.tl-count');
  if (countEl) {
    countEl.textContent = `${visibleTracks.length} Morceaux`;
  }
  
  const albumNameEl = document.getElementById('tracklist-album-name');
  if (albumNameEl) {
    albumNameEl.textContent = albumData.name || 'Sound Collection';
  }
  
  const albumTitleEl = document.getElementById('tracklist-album-title');
  if (albumTitleEl) {
    albumTitleEl.textContent = albumData.name || 'Sound Collection';
  }
  
  const albumCoverImg = document.getElementById('tracklist-album-cover');
  const albumCoverDefault = document.getElementById('tracklist-cover-default');
  
  if (albumData.cover) {
    albumCoverImg.src = albumData.cover;
    albumCoverImg.style.display = '';
    if (albumCoverDefault) albumCoverDefault.style.display = 'none';
  } else {
    albumCoverImg.style.display = 'none';
    if (albumCoverDefault) albumCoverDefault.style.display = '';
  }
}

function getVisibleTracks() {
  return tracks
    .map((track, index) => ({ track, index }))
    .filter(({ track }) => {
      return (track.album || 'Sound Collection') === (albumData.name || 'Sound Collection');
    });
}

function setAccountType(type) {
  if (type === 'admin' && !isAuthenticated) {
    return;
  }

  accountType = type;
  localStorage.setItem('yvre-account', type);
  renderAccountState();
}

function renderAccountState() {
  document.querySelectorAll('.account-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.account === accountType);
  });

  const adminBtn = document.getElementById('btn-admin');
  if (adminBtn) {
    adminBtn.classList.toggle('disabled', !isAuthenticated);
    adminBtn.disabled = !isAuthenticated;
  }

  const note = document.getElementById('account-note');
  if (note) {
    note.textContent = accountType === 'admin'
      ? '🔒 Mode Admin: tu as accès à tous les contrôles spéciaux.'
      : 'Tu es en mode public : tu peux écouter les titres disponibles.';
  }

  const accountPanel = document.querySelector('.account-panel');
  if (accountPanel) {
    accountPanel.style.display = accountType === 'admin' ? '' : 'none';
  }

  const adminOnlySections = document.querySelectorAll('.admin-only');
  adminOnlySections.forEach(section => {
    section.style.display = accountType === 'admin' ? '' : 'none';
  });
}

function updateAlbumBar() {
  const barName = document.getElementById('album-bar-name');
  const barCover = document.getElementById('album-bar-cover');
  const barPlaceholder = document.getElementById('album-bar-placeholder');
  
  if (barName) {
    barName.textContent = albumData.name || 'Sound Collection';
  }
  
  if (albumData.cover) {
    barCover.src = albumData.cover;
    barCover.style.display = '';
    if (barPlaceholder) barPlaceholder.style.display = 'none';
  } else {
    barCover.style.display = 'none';
    if (barPlaceholder) barPlaceholder.style.display = '';
  }
}

function updateMiniPlayerState() {
  const coverImg = document.getElementById('mini-player-cover-img');
  const coverIcon = document.getElementById('mini-player-cover-icon');
  const buttonIcon = document.getElementById('mini-player-button-icon');
  const track = tracks[currentTrackIndex];

  if (!coverImg || !coverIcon || !buttonIcon) return;

  if (track && track.cover) {
    coverImg.src = track.cover;
    coverImg.alt = `${track.title} cover`;
    coverImg.style.display = '';
    coverIcon.style.display = 'none';
  } else {
    coverImg.src = '';
    coverImg.alt = 'Cover';
    coverImg.style.display = 'none';
    coverIcon.style.display = '';
  }

  if (isPlaying) {
    buttonIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
  } else {
    buttonIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
  }
}

function hideMiniPlayer() {
  const mini = document.getElementById('mini-player');
  if (!mini) return;
  mini.classList.add('hidden');
}

function showMiniPlayer() {
  const mini = document.getElementById('mini-player');
  if (!mini) return;
  mini.classList.remove('hidden');
}

function expandMiniPlayerToPlayer() {
  hideMiniPlayer();
  navigateTo('screen-player');
}

function checkPassword() {
  const passwordInput = document.getElementById('login-password');
  const password = passwordInput.value.trim();
  const errorMsg = document.getElementById('login-error');

  if (password === ADMIN_PASSWORD) {
    isAuthenticated = true;
    localStorage.setItem('yvre-authenticated', 'true');
    localStorage.setItem('yvre-account', 'admin');
    accountType = 'admin';
    errorMsg.style.display = 'none';
    navigateTo('screen-home');
    renderAccountState();
  } else {
    errorMsg.style.display = 'block';
    passwordInput.value = '';
  }
}

function skipLogin() {
  isAuthenticated = false;
  accountType = 'listener';
  localStorage.setItem('yvre-authenticated', 'false');
  localStorage.setItem('yvre-account', 'listener');
  navigateTo('screen-home');
  renderAccountState();
}

function updateEmptyPlayer() {
  document.getElementById('player-track-name').textContent = 'Aucun titre';
  document.getElementById('player-artist').textContent = 'Ajoute un morceau pour commencer';
  document.getElementById('player-album-label').textContent = defaultAlbum;
  document.getElementById('time-total').textContent = '0:00';
  document.getElementById('time-current').textContent = '0:00';
  setProgress(0, 1);
  document.getElementById('play-icon').style.display = '';
  document.getElementById('pause-icon').style.display = 'none';
  document.getElementById('player-cd-spin').classList.remove('spinning');
  audio.removeAttribute('src');
  isPlaying = false;
  updateMiniPlayerState();
}

function renderTrackList() {
  const list = document.querySelector('.tracks-list');
  if (!list) return;

  const visibleTracks = getVisibleTracks();

  // Ensure currentTrackIndex is within visible tracks
  const visibleIndices = visibleTracks.map(v => v.index);
  if (!visibleIndices.includes(currentTrackIndex)) {
    currentTrackIndex = visibleIndices[0] || 0;
  }

  if (visibleTracks.length === 0) {
    list.innerHTML = '<div class="no-results">Aucun morceau dans cet album. Ajoute des titres pour commencer.</div>';
  } else {
    list.innerHTML = visibleTracks.map(({ track: t, index: i }) => {
      const coverClass = t.cover ? ' with-cover' : '';
      const coverImg = t.cover ? `<img class="cover-art-image" src="${t.cover}" alt="${t.title} cover" />` : '';
      return `
        <div class="track-item${i === currentTrackIndex ? ' active' : ''}" data-index="${i}">
          <div class="track-num">${i + 1}</div>
          <div class="track-art">
            <div class="cover-art-box tiny-cover${coverClass}">
              ${coverImg}
              <div class="cover-red-left"></div>
              <div class="cover-cd-wrap">
                <div class="cover-cd">
                  <div class="cover-cd-ring r1"></div>
                  <div class="cover-cd-center"></div>
                </div>
              </div>
              <div class="cover-red-right"></div>
            </div>
          </div>
          <div class="track-info">
            <p class="track-name">${t.title}</p>
            <p class="track-artist">${t.artist}</p>
          </div>
          <div class="track-duration">${t.duration}</div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.track-item').forEach(el => {
      el.addEventListener('click', () => openPlayer(Number(el.dataset.index)));
    });
  }

  updateTracklistMeta();
}

function updateCoverImage(track) {
  const playerCoverBox = document.querySelector('#player-cover .cover-art-box');
  if (!playerCoverBox) return;

  const existingImg = playerCoverBox.querySelector('.cover-art-image');
  if (track.cover) {
    if (!existingImg) {
      const img = document.createElement('img');
      img.className = 'cover-art-image';
      img.alt = `${track.title} cover`;
      playerCoverBox.prepend(img);
    }
    playerCoverBox.querySelector('.cover-art-image').src = track.cover;
    playerCoverBox.classList.add('with-cover');
  } else {
    if (existingImg) existingImg.remove();
    playerCoverBox.classList.remove('with-cover');
  }
}

// =====================
// NAVIGATION
// =====================
function navigateTo(targetId) {
  if (targetId === activeScreenId) return;

  const currentEl = document.getElementById(activeScreenId);
  const targetEl  = document.getElementById(targetId);
  if (!currentEl || !targetEl) return;

  if (targetId === 'screen-player' || targetId === 'screen-login') {
    hideMiniPlayer();
  } else {
    showMiniPlayer();
  }

  const goForward = screenOrder.indexOf(targetId) > screenOrder.indexOf(activeScreenId);

  currentEl.classList.remove('enter-from-right', 'enter-from-left', 'exit-to-left', 'exit-to-right', 'active');
  targetEl.classList.remove('enter-from-right', 'enter-from-left', 'exit-to-left', 'exit-to-right', 'active');

  targetEl.classList.add(goForward ? 'enter-from-right' : 'enter-from-left');
  void targetEl.offsetWidth;
  currentEl.classList.add(goForward ? 'exit-to-left' : 'exit-to-right');
  targetEl.classList.remove('enter-from-right', 'enter-from-left');
  targetEl.classList.add('active');

  setTimeout(() => {
    currentEl.classList.remove('exit-to-left', 'exit-to-right');
  }, 420);

  activeScreenId = targetId;
}

// =====================
// LOAD TRACK
// =====================
function loadTrack(index) {
  currentTrackIndex = index;
  currentSecs = 0;
  const t = tracks[index];

  document.getElementById('player-track-name').textContent = t.title;
  document.getElementById('player-artist').textContent     = t.artist;
  document.getElementById('player-album-label').textContent = t.album || defaultAlbum;
  document.getElementById('time-total').textContent        = t.duration;
  document.getElementById('time-current').textContent      = '0:00';

  if (t.src) {
    audio.src = t.src;
    audio.load();
  } else {
    audio.removeAttribute('src');
  }

  updateCoverImage(t);
  setProgress(0, t.totalSecs);
  updateTracklistActive();
  updateMiniPlayerState();
}

function setProgress(secs, total) {
  const pct = total > 0 ? (secs / total) * 100 : 0;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-thumb').style.left  = pct + '%';
  document.getElementById('time-current').textContent   = fmt(secs);
}

// =====================
// PLAYBACK
// =====================
function play() {
  const currentTrack = tracks[currentTrackIndex];
  if (!currentTrack) return;

  isPlaying = true;
  document.getElementById('play-icon').style.display  = 'none';
  document.getElementById('pause-icon').style.display = '';
  document.getElementById('player-cd-spin').classList.add('spinning');
  updateMiniPlayerState();

  if (currentTrack.src) {
    audio.play().catch(() => {});
    return;
  }

  clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    if (currentSecs < currentTrack.totalSecs) {
      currentSecs++;
      setProgress(currentSecs, currentTrack.totalSecs);
    } else {
      nextTrack();
    }
  }, 1000);
}

function pause() {
  if (!tracks[currentTrackIndex]) {
    isPlaying = false;
    updateMiniPlayerState();
    return;
  }

  isPlaying = false;
  document.getElementById('play-icon').style.display  = '';
  document.getElementById('pause-icon').style.display = 'none';
  document.getElementById('player-cd-spin').classList.remove('spinning');
  updateMiniPlayerState();

  if (tracks[currentTrackIndex].src) {
    audio.pause();
    return;
  }

  clearInterval(progressInterval);
}

function togglePlay() {
  if (!tracks[currentTrackIndex]) return;
  if (isPlaying) pause(); else play();
}

function prevTrack() {
  if (currentSecs > 3) {
    currentSecs = 0;
    if (tracks[currentTrackIndex].src) {
      audio.currentTime = 0;
    }
    setProgress(0, tracks[currentTrackIndex].totalSecs);
  } else {
    const idx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(idx);
    if (isPlaying) play();
  }
}

function nextTrack() {
  const idx = (currentTrackIndex + 1) % tracks.length;
  loadTrack(idx);
  if (isPlaying) play();
}

function openPlayer(index) {
  pause();
  loadTrack(index);
  navigateTo('screen-player');
  setTimeout(() => play(), 420);
}

// =====================
// SEEK
// =====================
function initSeek() {
  const bar = document.getElementById('progress-bar');
  let dragging = false;

  function seekTo(clientX) {
    const rect = bar.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const total = Math.max(1, tracks[currentTrackIndex].totalSecs);
    currentSecs = Math.floor(pct * total);

    if (tracks[currentTrackIndex].src) {
      audio.currentTime = currentSecs;
    }

    const fill  = document.getElementById('progress-fill');
    const thumb = document.getElementById('progress-thumb');
    fill.style.transition  = 'none';
    thumb.style.transition = 'none';
    setProgress(currentSecs, total);
    requestAnimationFrame(() => {
      fill.style.transition  = '';
      thumb.style.transition = '';
    });
  }

  bar.addEventListener('mousedown', e => { dragging = true; seekTo(e.clientX); });
  window.addEventListener('mousemove', e => { if (dragging) seekTo(e.clientX); });
  window.addEventListener('mouseup', () => { dragging = false; });

  bar.addEventListener('touchstart', e => { dragging = true; seekTo(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchmove', e => { if (dragging) seekTo(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchend', () => { dragging = false; });
}

// =====================
// ALBUM CREATION
// =====================
function createAlbumFromForm() {
  const albumNameField = document.getElementById('album-name');
  const albumCoverField = document.getElementById('album-cover');

  const name = albumNameField.value.trim();
  const coverFile = albumCoverField.files[0];

  if (!name) {
    alert('Merci de donner un nom à ton album.');
    return;
  }

  let cover = '';
  if (coverFile) {
    cover = URL.createObjectURL(coverFile);
  }

  albumData.name = name;
  albumData.cover = cover;

  updateAlbumBar();
  updateTracklistMeta();
  
  albumNameField.value = '';
  albumCoverField.value = '';
}

// =====================
// CUSTOM TRACKS
// =====================
function addTrackFromForm() {
  const titleField  = document.getElementById('upload-title');
  const artistField = document.getElementById('upload-artist');
  const audioField  = document.getElementById('upload-audio');
  const coverField  = document.getElementById('upload-cover');

  const title  = titleField.value.trim();
  const artist = artistField.value.trim() || 'Unknown Artist';
  const album  = albumData.name || 'Sound Collection';
  const audioFile = audioField.files[0];
  const coverFile = coverField.files[0];

  if (!title || !audioFile) {
    alert('Merci de renseigner un titre et un fichier audio.');
    return;
  }

  const src = URL.createObjectURL(audioFile);
  const cover = coverFile ? URL.createObjectURL(coverFile) : '';

  const newTrack = {
    title,
    artist,
    album,
    duration: '0:00',
    totalSecs: 0,
    cover,
    src,
  };

  tracks.push(newTrack);
  renderTrackList();
  titleField.value = '';
  artistField.value = '';
  audioField.value = '';
  coverField.value = '';
  
}

// =====================
// INIT
// =====================
function initApp() {
  audio = document.getElementById('audio-player');

  // LOGIN HANDLERS
  const loginBtn = document.getElementById('login-btn');
  const skipBtn = document.getElementById('login-skip-btn');
  const passwordInput = document.getElementById('login-password');

  if (loginBtn) {
    loginBtn.addEventListener('click', checkPassword);
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', skipLogin);
  }

  if (passwordInput) {
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        checkPassword();
      }
    });
  }

  // Correct stale admin state if password was not validated
  if (!isAuthenticated && accountType === 'admin') {
    accountType = 'listener';
    localStorage.setItem('yvre-account', 'listener');
  }

  if (activeScreenId === 'screen-login') {
    hideMiniPlayer();
  }

  const albumCard = document.getElementById('album-card');
  if (albumCard) {
    albumCard.addEventListener('click', () => {
      navigateTo('screen-tracklist');
    });
  }

  const recentPlayBtn = document.getElementById('recent-play-btn');
  if (recentPlayBtn) {
    recentPlayBtn.addEventListener('click', () => {
      openPlayer(0);
    });
  }

  const homeFloatBtn = document.getElementById('home-float-btn');
  if (homeFloatBtn) {
    homeFloatBtn.addEventListener('click', () => {
      navigateTo('screen-player');
    });
  }

  const tracklistBackBtn = document.getElementById('tracklist-back');
  if (tracklistBackBtn) {
    tracklistBackBtn.addEventListener('click', () => {
      navigateTo('screen-home');
    });
  }

  const playAllBtn = document.querySelector('.play-all-btn');
  if (playAllBtn) {
    playAllBtn.addEventListener('click', () => {
      const visible = getVisibleTracks();
      if (visible.length > 0) {
        openPlayer(visible[0].index);
      }
    });
  }

  document.querySelectorAll('.account-btn').forEach(btn => {
    btn.addEventListener('click', () => setAccountType(btn.dataset.account));
  });


  const tracklistFloatBtn = document.getElementById('tracklist-float-btn');
  if (tracklistFloatBtn) {
    tracklistFloatBtn.addEventListener('click', () => {
      openPlayer(currentTrackIndex);
    });
  }

  const playerBackBtn = document.getElementById('player-back');
  if (playerBackBtn) {
    playerBackBtn.addEventListener('click', () => {
      navigateTo('screen-tracklist');
    });
  }

  const playPauseBtn = document.getElementById('play-pause-btn');
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', togglePlay);
  }

  const prevBtn = document.getElementById('prev-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', prevTrack);
  }

  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', nextTrack);
  }

  const addTrackBtn = document.getElementById('add-track-btn');
  if (addTrackBtn) {
    addTrackBtn.addEventListener('click', addTrackFromForm);
  }

  const createAlbumBtn = document.getElementById('create-album-btn');
  if (createAlbumBtn) {
    createAlbumBtn.addEventListener('click', createAlbumFromForm);
  }

  const miniPlayerBtn = document.getElementById('mini-player-button');
  if (miniPlayerBtn) {
    miniPlayerBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      togglePlay();
    });
  }

  const miniPlayer = document.getElementById('mini-player');
  if (miniPlayer) {
    miniPlayer.addEventListener('click', expandMiniPlayerToPlayer);
  }

  audio.addEventListener('timeupdate', () => {
    if (tracks[currentTrackIndex].src) {
      currentSecs = Math.floor(audio.currentTime);
      setProgress(currentSecs, tracks[currentTrackIndex].totalSecs || Math.round(audio.duration));
    }
  });

  audio.addEventListener('loadedmetadata', () => {
    const track = tracks[currentTrackIndex];
    if (track.src === audio.src) {
      track.totalSecs = Math.round(audio.duration);
      track.duration = fmt(track.totalSecs);
      document.getElementById('time-total').textContent = track.duration;
      setProgress(Math.floor(audio.currentTime), track.totalSecs);
      renderTrackList();
    }
  });

  audio.addEventListener('ended', () => {
    nextTrack();
  });

  initSeek();
  renderAccountState();
  renderTrackList();
  updateAlbumBar();
  updateTracklistMeta();

  if (tracks.length > 0) {
    loadTrack(0);
  } else {
    updateEmptyPlayer();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

