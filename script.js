// Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const attendeeCountEl = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greetingEl = document.getElementById("greeting");
const attendeesContainer = document.getElementById("attendeesContainer");

// Track attendance
let count = 0;
const maxCount = 50;
const teamCounts = {
  water: 0,
  zero: 0,
  power: 0,
};
let attendees = [];
// Load saved counts from localStorage (if any)
function loadCounts() {
  // Try to load attendees first (preferred)
  var savedAttendees = localStorage.getItem("attendees");
  if (savedAttendees) {
    try {
      attendees = JSON.parse(savedAttendees) || [];
    } catch (e) {
      attendees = [];
    }
  }

  // Derive counts from attendees if available, otherwise fallback to older keys
  if (attendees.length) {
    count = attendees.length;
    // reset teamCounts then compute
    teamCounts.water = 0; teamCounts.zero = 0; teamCounts.power = 0;
    for (var i = 0; i < attendees.length; i++) {
      var t = attendees[i].team;
      if (teamCounts.hasOwnProperty(t)) teamCounts[t] += 1;
    }
  } else {
    var savedTotal = localStorage.getItem("attendanceCount");
    if (savedTotal !== null) {
      count = parseInt(savedTotal, 10) || 0;
    }

    var savedTeams = localStorage.getItem("teamCounts");
    if (savedTeams) {
      try {
        var parsed = JSON.parse(savedTeams);
        teamCounts.water = parsed.water || 0;
        teamCounts.zero = parsed.zero || 0;
        teamCounts.power = parsed.power || 0;
      } catch (e) {
        // ignore malformed data
      }
    }
  }

  // Update DOM from loaded values
  attendeeCountEl.textContent = count;
  var pct = Math.round((count / maxCount) * 100);
  progressBar.style.width = pct + "%";
  document.getElementById("waterCount").textContent = teamCounts.water;
  document.getElementById("zeroCount").textContent = teamCounts.zero;
  document.getElementById("powerCount").textContent = teamCounts.power;

  renderAttendees();
}

// Save counts to localStorage
function saveCounts() {
  try {
    localStorage.setItem("attendanceCount", String(count));
    localStorage.setItem("teamCounts", JSON.stringify(teamCounts));
    localStorage.setItem("attendees", JSON.stringify(attendees));
  } catch (e) {
    console.warn("Could not save counts to localStorage", e);
  }
}

// Initialize from storage
loadCounts();

// Handl form submission
form.addEventListener("submit", function (event) {
  event.preventDefault();

  var name = nameInput.value.trim();
  var team = teamSelect.value;

  if (!name || !team) {
    greetingEl.textContent = "Please enter a name and select a team.";
    greetingEl.style.display = "block";
    return;
  }

  if (count >= maxCount) {
    greetingEl.textContent = "Attendance is full.";
    greetingEl.style.display = "block";
    return;
  }
  // Record attendee
  var teamName = teamSelect.selectedOptions[0].text;
  attendees.push({ name: name, team: team, teamName: teamName, time: Date.now() });

  // Recompute counts from attendees
  count = attendees.length;
  teamCounts.water = 0; teamCounts.zero = 0; teamCounts.power = 0;
  for (var i = 0; i < attendees.length; i++) {
    var t = attendees[i].team;
    if (teamCounts.hasOwnProperty(t)) teamCounts[t] += 1;
  }

  attendeeCountEl.textContent = count;
  var percentage = Math.round((count / maxCount) * 100);
  progressBar.style.width = percentage + "%";
  document.getElementById("waterCount").textContent = teamCounts.water;
  document.getElementById("zeroCount").textContent = teamCounts.zero;
  document.getElementById("powerCount").textContent = teamCounts.power;

  // Persist updated state
  saveCounts();

  // Re-render attendee list
  renderAttendees();

  // Show welcome message briefly
  var teamName = teamSelect.selectedOptions[0].text;
  greetingEl.textContent = `Welcome, ${name} from ${teamName}`;
  greetingEl.classList.add("success-message");
  greetingEl.style.display = "block";

  // Clear form and focus
  form.reset();
  nameInput.focus();

  // Hide greeting after 3 seconds
  setTimeout(function () {
    greetingEl.style.display = "none";
  }, 3000);
});

  // Render attendee list into the DOM
  function renderAttendees() {
    if (!attendeesContainer) return;
    attendeesContainer.innerHTML = "";
    for (var i = 0; i < attendees.length; i++) {
      var a = attendees[i];
      var item = document.createElement("div");
      item.className = "attendee-item";

      var nameSpan = document.createElement("span");
      nameSpan.className = "attendee-name";
      nameSpan.textContent = a.name;

      var teamSpan = document.createElement("span");
      teamSpan.className = "attendee-team " + a.team;
      teamSpan.textContent = a.teamName.replace("Team ", "");

      item.appendChild(nameSpan);
      item.appendChild(teamSpan);
      attendeesContainer.appendChild(item);
    }
  }
