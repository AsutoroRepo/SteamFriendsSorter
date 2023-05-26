// Open a new tab and write the HTML structure
const newTab = window.open('', '_blank');
newTab.document.write(`
  <html>
    <head>
      <style>
        body {
          background-color: #2e3440;
          color: #eceff4;
          font-family: Arial, sans-serif;
          text-align: center;
          margin: 0;
        }

        .header {
          font-size: 24px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin: 20px 0;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
        }

        .friend-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 40px; /* Increased vertical gap */
          padding: 40px; /* Decreased padding */
          max-width: 1400px; /* Limit the maximum width to 1400px */
          margin: 0 auto; /* Center the grid */
          justify-items: center; /* Center the cards horizontally */
          justify-content: center; /* Center the grid vertically */
        }

        .friend-info {
          padding: 10px; /* Decreased padding */
          border: 1px solid #3b4252;
          border-radius: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
          background-color: #4c566a;
          width: 100%;
        }

        .friend-info:hover {
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
        }

        .friend-name {
          font-weight: bold;
          font-size: 18px;
          color: #eceff4;
          text-decoration: none;
        }

        .friend-name:hover {
          color: #5e81ac;
        }

        .friend-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          margin: 0 auto 10px;
        }

        .friend-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .filter-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 20px;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .filter-button {
          background-color: #5e81ac;
          color: #eceff4;
          font-size: 14px;
          font-weight: bold;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.3s ease;
        }

        .filter-button:hover {
          background-color: #88c0d0;
          transform: scale(1.05);
        }

        .filter-button:focus {
          outline: none;
          box-shadow: 0 0 0 2px #88c0d0;
        }

        .filter-button:active {
          transform: scale(0.95);
        }
      </style>
    </head>
    <body>
      <h1 class="header">Steam Offline Friends List</h1>
      <div class="friend-list" id="friend-list"></div>
      <div class="filter-bar">
        <div class="filter-buttons">
          <button class="filter-button" data-duration="all">All</button>
          <button class="filter-button" data-duration="1y">Offline > 1 Year</button>
          <button class="filter-button" data-duration="6m">Offline > 6 Months</button>
          <button class="filter-button" data-duration="1m">Offline > 1 Month</button>
          <button class="filter-button" data-duration="1w">Offline > 1 Week</button>
          <button class="filter-button" data-duration="1d">Offline > 1 Day</button>
          <button class="filter-button" data-duration="1h">Offline > 1 Hour</button>
        </div>
      </div>
    </body>
  </html>
`);

// Fetch the friend page HTML
fetch('https://steamcommunity.com/my/friends')
  .then(response => response.text())
  .then(html => {
    // Create a virtual DOM from the HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Find all friend panels
    const friendPanels = doc.querySelectorAll('.selectable.friend_block_v2.persona.offline');

    // Create an array to store friend data
    const friendData = [];

    // Iterate over each friend panel
    friendPanels.forEach(panel => {
      // Check if the friend has offline duration
      const offlineElement = panel.querySelector('.friend_last_online_text');
      if (offlineElement) {
        // Extract friend name
        const name = panel.querySelector('.friend_block_content').textContent.trim();

        // Create a new line for the word "Last" and everything after it
        const modifiedName = name.replace(/(.*Last.*)/, '<br>$1');

        // Extract friend offline duration
        const offlineDuration = offlineElement.textContent.trim();

        // Extract friend avatar image URL
        const avatarImg = panel.querySelector('.player_avatar img').src;

        // Extract friend profile link
        const profileLink = panel.querySelector('.selectable_overlay').href;

        // Add friend data to the array
        friendData.push({ name: modifiedName, offlineDuration, avatarImg, profileLink });
      }
    });

    // Sort friend data by offline duration (from greatest to least)
    friendData.sort((a, b) => {
      const durationA = parseOfflineDuration(a.offlineDuration);
      const durationB = parseOfflineDuration(b.offlineDuration);
      return durationB - durationA;
    });

    // Display sorted friend cards
    const friendListDiv = newTab.document.getElementById('friend-list');
    friendData.forEach(friend => {
      const friendInfoDiv = newTab.document.createElement('div');
      friendInfoDiv.classList.add('friend-info');

      const friendAvatarDiv = newTab.document.createElement('div');
      friendAvatarDiv.classList.add('friend-avatar');
      const avatarImg = newTab.document.createElement('img');
      avatarImg.src = friend.avatarImg;
      friendAvatarDiv.appendChild(avatarImg);

      const friendNameLink = newTab.document.createElement('a');
      friendNameLink.classList.add('friend-name');
      friendNameLink.href = friend.profileLink;
      friendNameLink.innerHTML = friend.name;

      friendInfoDiv.appendChild(friendAvatarDiv);
      friendInfoDiv.appendChild(friendNameLink);
      friendListDiv.appendChild(friendInfoDiv);
    });

    // Filter friend cards based on duration
    const filterButtons = newTab.document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const duration = button.dataset.duration;
        filterFriendsByDuration(duration);
      });
    });

    function filterFriendsByDuration(duration) {
      const friendInfoDivs = newTab.document.querySelectorAll('.friend-info');
      friendInfoDivs.forEach(div => {
        const offlineDuration = div.querySelector('.friend-name').textContent.split('\n').pop().trim();
        const durationInHours = parseOfflineDuration(offlineDuration);

        if (duration === 'all') {
          div.style.display = 'block';
        } else if (duration === '1y' && durationInHours >= 8760) {
          div.style.display = 'block';
        } else if (duration === '6m' && durationInHours >= 4380) {
          div.style.display = 'block';
        } else if (duration === '1m' && durationInHours >= 720) {
          div.style.display = 'block';
        } else if (duration === '1w' && durationInHours >= 168) {
          div.style.display = 'block';
        } else if (duration === '1d' && durationInHours >= 24) {
          div.style.display = 'block';
        } else if (duration === '1h' && durationInHours >= 1) {
          div.style.display = 'block';
        } else {
          div.style.display = 'none';
        }
      });
    }
  })
  .catch(error => {
    console.error('An error occurred:', error);
  });

// Helper function to parse offline duration in hours
function parseOfflineDuration(duration) {
  const hoursMatch = duration.match(/(\d+) hrs?/);
  const daysMatch = duration.match(/(\d+) days?/);

  let totalHours = 0;

  if (hoursMatch) {
    totalHours += parseInt(hoursMatch[1]);
  }

  if (daysMatch) {
    totalHours += parseInt(daysMatch[1]) * 24;
  }

  return totalHours;
}
