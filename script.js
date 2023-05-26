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

        .friend-card {
          background-color: #3b4252;
          color: #eceff4;
          padding: 10px;
          margin-bottom: 20px;
          border-radius: 8px;
          display: inline-block;
          margin-right: 10px;
          max-width: 200px; /* Added max-width property */
          border: 1px solid #4c566a; /* Added border property */
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Added box-shadow property */
        }

        .friend-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          margin-bottom: 10px;
        }

        .friend-name {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 5px;
        }
      </style>
    </head>
    <body>
      <h1>Steam Friend List</h1>
      <div id="friend-list"></div>
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

        // Extract friend avatar
        const avatar = panel.querySelector('.player_avatar.friend_block_link_overlay.offline img').src;

        // Add friend data to the array
        friendData.push({ name: modifiedName, offlineDuration, avatar });
      }
    });

    // Sort friend data by offline duration (from greatest to least)
    friendData.sort((a, b) => {
      const durationA = parseOfflineDuration(a.offlineDuration);
      const durationB = parseOfflineDuration(b.offlineDuration);
      return durationB - durationA;
    });

    // Display sorted friend list in card fashion
    const friendListDiv = newTab.document.getElementById('friend-list');
    friendData.forEach(friend => {
      const friendCardDiv = newTab.document.createElement('div');
      friendCardDiv.classList.add('friend-card');

      const friendAvatarImg = newTab.document.createElement('img');
      friendAvatarImg.classList.add('friend-avatar');
      friendAvatarImg.src = friend.avatar;

      const friendNameDiv = newTab.document.createElement('div');
      friendNameDiv.classList.add('friend-name');
      friendNameDiv.textContent = friend.name;

      friendCardDiv.appendChild(friendAvatarImg);
      friendCardDiv.appendChild(friendNameDiv);
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
