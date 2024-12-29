let channels = [];
let filteredChannels = [];
let favorites = [];

// Fetch and parse M3U playlist
fetch('https://raw.githubusercontent.com/MohammadKobirShah/KobirIPTV/refs/heads/main/KobirIPTV.m3u')
    .then(response => {
        showLoadingIndicator(); // Show loading indicator while fetching
        return response.text();
    })
    .then(data => {
        channels = parseM3U(data);
        filteredChannels = channels;
        displayCategories(channels);
        displayChannels(filteredChannels);
        hideLoadingIndicator(); // Remove the loading indicator
    })
    .catch(error => {
        console.error('Error fetching M3U playlist:', error);
        showError('Failed to load channels. Please try again later.');
    });

// Parse M3U playlist
function parseM3U(data) {
    const lines = data.split('\n');
    const channels = [];
    let channel = null;

    lines.forEach(line => {
        if (line.startsWith('#EXTINF:')) {
            if (channel) channels.push(channel);

            const name = line.split(',')[1] || 'Unknown Channel';
            const logo = line.match(/tvg-logo="([^"]+)"/)?.[1] || 'https://via.placeholder.com/200';
            const category = line.match(/group-title="([^"]+)"/)?.[1] || 'Uncategorized';

            channel = { name, url: '', logo, category };
        } else if (channel && line.startsWith('http')) {
            channel.url = line;
        }
    });

    if (channel) channels.push(channel);
    return channels;
}

// Display channels
function displayChannels(channels) {
    const grid = document.getElementById('channelGrid');
    grid.innerHTML = '';

    if (channels.length === 0) {
        grid.innerHTML = '<p>No channels found. Please adjust your filters.</p>';
        return;
    }

    channels.forEach(channel => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.innerHTML = `<img src="${channel.logo}" alt="${channel.name}"><p>${channel.name}</p>`;
        card.onclick = () => playChannel(channel);
        grid.appendChild(card);
    });
}

// Display categories
function displayCategories(channels) {
    const categories = [...new Set(channels.map(c => c.category))];
    const select = document.getElementById('categorySelect');

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

// Filter channels
function filterChannels() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categorySelect').value;

    filteredChannels = channels.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search);
        const matchesCategory = !category || c.category === category;
        return matchesSearch && matchesCategory;
    });

    displayChannels(filteredChannels);
}

// Play channel in fullscreen and select Bangla audio track
function playChannel(channel) {
    const video = document.getElementById('video-player');

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(channel.url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            const audioTracks = hls.audioTracks;
            const banglaTrackIndex = audioTracks.findIndex(track => track.name.toLowerCase().includes('bangla'));

            if (banglaTrackIndex !== -1) {
                hls.audioTrack = banglaTrackIndex;
                console.log(`Selected Bangla audio track: ${audioTracks[banglaTrackIndex].name}`);
            } else {
                console.log('No Bangla audio track available.');
            }

            video.play();
            enableFullscreen(video);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', data);
            showError('Error playing the channel. Please try again.');
        });
    } else {
        video.src = channel.url;
        video.play();
        enableFullscreen(video);
    }
}

// Enable fullscreen mode
function enableFullscreen(video) {
    if (video.requestFullscreen) {
        video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
    } else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen();
    } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
    }
}

// Manage favorites
function toggleFavorite(channel) {
    if (favorites.includes(channel)) {
        favorites = favorites.filter(fav => fav !== channel);
    } else {
        favorites.push(channel);
    }
    displayFavorites();
}

function displayFavorites() {
    const grid = document.getElementById('favoritesGrid');
    grid.innerHTML = '';

    favorites.forEach(channel => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.innerHTML = `<img src="${channel.logo}" alt="${channel.name}"><p>${channel.name}</p>`;
        grid.appendChild(card);
    });
}

// Loading indicator
function showLoadingIndicator() {
    document.getElementById('loading-indicator').classList.remove('hidden');
}

function hideLoadingIndicator() {
    document.getElementById('loading-indicator').classList.add('hidden');
}

// Error message
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => errorDiv.classList.add('hidden'), 5000);
}
