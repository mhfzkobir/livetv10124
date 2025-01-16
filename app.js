const m3uUrl = 'https://raw.githubusercontent.com/LIVETV10124/KobirIPTV/refs/heads/main/KobirIPTV.m3u'; // Replace with your M3U file URL

let channels = [];
const channelContainer = document.getElementById('channel-container');
const searchInput = document.getElementById('search');
const categorySelect = document.getElementById('category');

// VPN Connection Handler
function connectVPN(type) {
  alert(`Connecting to ${type} VPN...`);
  // Add connection logic for each VPN type as needed
}

// Fetch and parse M3U file
async function fetchChannels() {
  const response = await fetch(m3uUrl);
  const text = await response.text();
  parseM3U(text);
}

// Parse M3U file content
function parseM3U(m3uContent) {
  const lines = m3uContent.split('\n');
  let currentChannel = {};

  lines.forEach((line) => {
    if (line.startsWith('#EXTINF')) {
      const matchGroup = line.match(/group-title="([^"]+)"/);
      const matchLogo = line.match(/tvg-logo="([^"]+)"/);
      const channelName = line.split(',').pop();

      currentChannel = {
        name: channelName.trim(),
        url: null,
        category: matchGroup ? matchGroup[1] : 'Uncategorized',
        logo: matchLogo ? matchLogo[1] : null,
      };
    } else if (line.trim() && !line.startsWith('#')) {
      const url = line.trim();
      if (isPlayableUrl(url)) {
        currentChannel.url = url;
        channels.push(currentChannel);
      }
    }
  });

  displayChannels(channels);
  populateCategories();
}

// Helper function to detect playable URLs
function isPlayableUrl(url) {
  const supportedExtensions = /\.(mpd|m3u|m3u8)$/i; // Match .mpd, .m3u, .m3u8
  const dynamicScripts = /(php|id=)/i; // Match URLs containing 'php' or 'id='

  return supportedExtensions.test(url) || dynamicScripts.test(url);
}

// Display channels in grid view
function displayChannels(channelList) {
  channelContainer.innerHTML = '';
  channelList.forEach((channel) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      ${channel.logo ? `<img src="${channel.logo}" alt="${channel.name} Logo">` : ''}
      <h3>${channel.name}</h3>
    `;
    card.addEventListener('click', () => openPlayerPopup(channel.url));
    channelContainer.appendChild(card);
  });
}

// Populate categories dynamically
function populateCategories() {
  const categories = [...new Set(channels.map((channel) => channel.category))];
  categorySelect.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

// Open JW Player in a popup window
function openPlayerPopup(url) {
  const popup = window.open(
    '',
    '_blank',
    'width=1920,height=1080,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes'
  );

  popup.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Diamond Live TV Player</title>
      <script src="https://cdn.jwplayer.com/libraries/IDzF9Zmk.js"></script>
    </head>
    <body style="margin: 0; padding: 0; background: black;">
      <div id="player" style="width: 100%; height: 100%;"></div>
      <script>
        const player = jwplayer('player');
        player.setup({
          file: '${url}',
          width: '100%',
          height: '100%',
          controls: true,
          autostart: true,
          skin: {
            name: 'seven',
          },
        });
      </script>
    </body>
    </html>
  `);
}

// Search functionality
searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchTerm)
  );
  displayChannels(filteredChannels);
});

// Category filtering
categorySelect.addEventListener('change', () => {
  const selectedCategory = categorySelect.value;
  const filteredChannels =
    selectedCategory === 'all'
      ? channels
      : channels.filter((channel) => channel.category === selectedCategory);
  displayChannels(filteredChannels);
});

// Initialize
fetchChannels();
