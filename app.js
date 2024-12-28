let channels = [];  // Store the channels
let filteredChannels = [];  // Store filtered channels

// Function to fetch the M3U playlist and parse it
fetch('https://raw.githubusercontent.com/MohammadKobirShah/KobirIPTV/refs/heads/main/KobirIPTV.m3u')
    .then(response => response.text())
    .then(data => {
        channels = parseM3U(data);
        filteredChannels = channels;  // Initially, no filtering
        displayCategories(channels);
        displayChannels(filteredChannels);
    })
    .catch(error => console.error('Error fetching M3U playlist:', error));

// Function to parse the M3U data
function parseM3U(m3uData) {
    const lines = m3uData.split('\n');
    const channels = [];
    let channel = null;

    lines.forEach(line => {
        if (line.startsWith('#EXTINF:')) {
            if (channel) {
                channels.push(channel);
            }

            const channelInfo = line.split(',');
            const logoUrl = line.match(/tvg-logo="([^"]+)"/) ? line.match(/tvg-logo="([^"]+)"/)[1] : null;
            const category = line.match(/group-title="([^"]+)"/) ? line.match(/group-title="([^"]+)"/)[1] : 'Uncategorized';

            channel = {
                name: channelInfo[1] || 'Unknown Channel',
                url: lines[lines.indexOf(line) + 1] || '',
                logo: logoUrl || 'https://via.placeholder.com/200',  // Fallback image
                category: category
            };
        }
    });

    if (channel) {
        channels.push(channel);
    }

    return channels;
}

// Function to display the channels in grid format
function displayChannels(channels) {
    const channelGrid = document.getElementById('channelGrid');
    channelGrid.innerHTML = '';  // Clear the existing grid

    channels.forEach(channel => {
        const card = document.createElement('div');
        card.classList.add('channel-card');
        card.tabIndex = 0; // Make it focusable for DPAD navigation
        card.setAttribute('role', 'button');  // Accessibility
        card.setAttribute('aria-label', `Click to play ${channel.name}`);
        card.innerHTML = `
            <img src="${channel.logo}" alt="${channel.name}">
            <p><strong>${channel.name}</strong></p>
        `;
        
        // Add event listener to play channel when card is clicked
        card.addEventListener('click', () => {
            window.open(channel.url, '_blank');
        });

        channelGrid.appendChild(card);
    });
}

// Function to filter the channels based on search and selected category
function filterChannels() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const selectedCategory = document.getElementById('categorySelect').value;

    filteredChannels = channels.filter(channel => {
        const matchesSearch = channel.name.toLowerCase().includes(searchInput);
        const matchesCategory = !selectedCategory || channel.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    displayChannels(filteredChannels);  // Re-display the filtered channels
}

// Function to populate the category dropdown
function displayCategories(channels) {
    const categories = [...new Set(channels.map(channel => channel.category))];
    const categorySelect = document.getElementById('categorySelect');

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}
