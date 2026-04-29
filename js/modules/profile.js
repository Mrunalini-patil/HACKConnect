/**
 * Profile Module - Handles teammate profile display and management
 * Manages profile modal interactions, data population, and expansion
 */

function openTeammateProfile(person) {
  const profileModal = document.getElementById("profileModal");
  const expandBtn = document.getElementById("expandProfileModalBtn");
  const initials = person.name
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  document.getElementById("profileModalAvatar").textContent = initials;
  document.getElementById("profileModalName").textContent = person.name;
  document.getElementById("profileModalRole").textContent = person.role;
  document.getElementById("profileModalGoal").textContent = person.goal;
  document.getElementById("profileModalEducation").textContent = person.education || "Education details not shared yet.";
  document.getElementById("profileModalExperience").textContent = person.experience || "Experience details not shared yet.";
  document.getElementById("profileModalAchievements").textContent = person.achievements || "Achievement details not shared yet.";

  document.getElementById("profileModalSkills").innerHTML = person.skills
    .map((skill) => `<span class="badge">${skill}</span>`)
    .join("");

  document.getElementById("profileModalInterests").innerHTML = person.interests
    .map((interest) => `<span class="badge">${interest}</span>`)
    .join("");

  document.getElementById("profileModalAvailability").textContent = person.availability;

  const profileLink = `https://hackconnect.io/profile/${person.name.toLowerCase().replace(/\s+/g, "-")}`;
  document.getElementById("profileModalLink").innerHTML = `<a href="${profileLink}" target="_blank" rel="noopener noreferrer">View HackConnect Profile &rarr;</a>`;
  document.getElementById("profileModalProofs").innerHTML = [
    { label: "Education Proof", value: person.educationProof },
    { label: "Experience Proof", value: person.experienceProof },
    { label: "Achievement Proof", value: person.achievementProof }
  ].map((item) => `
    <div class="profile-proof-item">
      <div>
        <strong>${item.label}</strong>
        <span>${item.value || "Not uploaded"}</span>
      </div>
      ${item.value ? `<a href="#" class="profile-proof-link" data-proof-name="${item.value}">Preview</a>` : ""}
    </div>
  `).join("");

  const availableTeammatesList = document.getElementById("availableTeammatesList");
  const myTeamList = document.getElementById("myTeamList");

  const availableTeammates = (HackConnectApp.TEAMMATES || [])
    .filter((teammate) => teammate.id !== person.id)
    .slice(0, 3)
    .map((teammate) => teammate.name);
  const myTeam = HackConnectApp.getMyTeamMembers().map((teammate) => teammate.name);

  availableTeammatesList.innerHTML = availableTeammates.length > 0
    ? availableTeammates.map((teammate) => `<span class="badge">${teammate}</span>`).join("")
    : '<span class="badge-empty">No available teammates yet</span>';

  myTeamList.innerHTML = myTeam.length > 0
    ? myTeam.map((teammate) => `<span class="badge">${teammate}</span>`).join("")
    : '<span class="badge-empty">No team members yet</span>';

  document.getElementById("chatFromProfileBtn").onclick = () => {
    openTeammateChat(person);
    closeProfileModal();
  };
  document.getElementById("openRecipientDemoBtn").onclick = () => {
    openMessagesInbox(person.id);
    closeProfileModal();
  };

  document.querySelectorAll("[data-proof-name]").forEach((proofLink) => {
    proofLink.addEventListener("click", (event) => {
      event.preventDefault();
      HackConnectApp.showToast(`Preview unavailable in this demo: ${proofLink.dataset.proofName}`);
    });
  });

  profileModal?.classList.remove("fullscreen");
  if (expandBtn) {
    expandBtn.innerHTML = "&#9974;";
    expandBtn.title = "Expand to fullscreen";
  }
  document.getElementById("profileModalOverlay").classList.add("open");
}

function closeProfileModal() {
  document.getElementById("profileModalOverlay")?.classList.remove("open");
  document.getElementById("profileModal")?.classList.remove("fullscreen");
}

function toggleExpandProfileModal() {
  const profileModal = document.getElementById("profileModal");
  if (!profileModal) return;

  profileModal.classList.toggle("fullscreen");

  const expandBtn = document.getElementById("expandProfileModalBtn");
  if (expandBtn) {
    expandBtn.innerHTML = profileModal.classList.contains("fullscreen") ? "&#9974;" : "&#9974;";
    expandBtn.title = profileModal.classList.contains("fullscreen")
      ? "Collapse to normal view"
      : "Expand to fullscreen";
  }
}

function initProfileModalHandlers() {
  document.getElementById("closeProfileModalBtn")?.addEventListener("click", closeProfileModal);
  document.getElementById("expandProfileModalBtn")?.addEventListener("click", toggleExpandProfileModal);
  document.getElementById("profileModalOverlay")?.addEventListener("click", (event) => {
    if (event.target.id === "profileModalOverlay") closeProfileModal();
  });
}
