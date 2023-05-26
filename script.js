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
        }

        .friend-list {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }

        .friend-card {
          background-color: #3b4252;
          color: #eceff4;
          padding: 10px;
          margin: 10px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 200px;
          border: 1px solid #4c566a;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: box-shadow 0.3s ease;
        }

        .friend-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin-bottom: 10px;
          transition: filter 0.3s ease;
        }

        .friend-name {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 5px;
          transition: color 0.3s ease;
        }

        .friend-card a {
          text-decoration: none;
          color: inherit;
        }

        .friend-card:hover {
          padding: 14px;
          transition: padding 0.3s ease;
          box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2), 0 0 8px rgba(0, 0, 0, 0.1);
        }

        .friend-card:hover .friend-avatar {
          filter: brightness(110%);
          transition: filter 0.3s ease;
        }

        .friend-card:hover .friend-name {
          color: #88c0d0;
          transition: color 0.3s ease;
        }
      </style>
    </head>
    <body>
      <h1>Steam Friend List</h1>
      <div class="friend-list" id="friend-list"></div>
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

        // Add " | " before the occurrence of "Last" in the friend name
        const modifiedName = name.replace(/Last/g, ' | Last');

        // Extract friend offline duration
        const offlineDuration = offlineElement.textContent.trim();

        // Extract friend profile URL
        const profileURL = panel.querySelector('.selectable_overlay').getAttribute('href');

        // Extract friend avatar URL
        const avatar = panel.querySelector('.player_avatar.friend_block_link_overlay.offline img').getAttribute('src');

        // Add friend data to the array
        friendData.push({ name: modifiedName, offlineDuration, profileURL, avatar });
      }
    });

    // Sort friend data by offline duration (from greatest to least)
    friendData.sort((a, b) => {
      const durationA = parseOfflineDuration(a.offlineDuration);
      const durationB = parseOfflineDuration(b.offlineDuration);
      return durationB - durationA;
    });

    // Display sorted friend names with avatars
    const friendListDiv = newTab.document.getElementById('friend-list');
    friendData.forEach(friend => {
      const friendCardDiv = newTab.document.createElement('div');
      friendCardDiv.classList.add('friend-card');

      const friendLink = newTab.document.createElement('a');
      friendLink.href = friend.profileURL;
      friendLink.target = '_blank';

      const friendAvatarImg = newTab.document.createElement('img');
      friendAvatarImg.classList.add('friend-avatar');
      friendAvatarImg.src = friend.avatar;

      const friendNameDiv = newTab.document.createElement('div');
      friendNameDiv.classList.add('friend-name');
      friendNameDiv.textContent = friend.name;

      friendLink.appendChild(friendAvatarImg);
      friendLink.appendChild(friendNameDiv);
      friendCardDiv.appendChild(friendLink);
      friendListDiv.appendChild(friendCardDiv);
    });
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
