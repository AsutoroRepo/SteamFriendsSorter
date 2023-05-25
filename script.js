// Open a new tab and write the HTML structure
const newTab = window.open('', '_blank');
newTab.document.write(`
  <html>
    <head>
      <style>
        body {
          background-color: #1f1f1f;
          color: #ffffff;
          font-family: Arial, sans-serif;
          text-align: center;
        }

        .friend-info {
          margin-bottom: 20px;
        }

        .friend-name {
          font-weight: bold;
          font-size: 18px;
        }

        .offline-duration {
          font-size: 14px;
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

        // Extract friend offline duration
        const offlineDuration = offlineElement.textContent.trim();

        // Add friend data to the array
        friendData.push({ name, offlineDuration });
      }
    });

    // Sort friend data by offline duration (from greatest to least)
    friendData.sort((a, b) => {
      const durationA = parseOfflineDuration(a.offlineDuration);
      const durationB = parseOfflineDuration(b.offlineDuration);
      return durationB - durationA;
    });

    // Display sorted friend data
    const friendListDiv = newTab.document.getElementById('friend-list');
    friendData.forEach(friend => {
      const friendInfoDiv = newTab.document.createElement('div');
      friendInfoDiv.classList.add('friend-info');

      const friendNameDiv = newTab.document.createElement('div');
      friendNameDiv.classList.add('friend-name');
      friendNameDiv.textContent = friend.name;

      const offlineDurationDiv = newTab.document.createElement('div');
      offlineDurationDiv.classList.add('offline-duration');
      offlineDurationDiv.textContent = friend.offlineDuration;

      friendInfoDiv.appendChild(friendNameDiv);
      friendInfoDiv.appendChild(offlineDurationDiv);
      friendListDiv.appendChild(friendInfoDiv);
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
