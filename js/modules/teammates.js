/**
 * Teammate and connection flow.
 *
 * Registration selects one of three team access modes:
 * - user: can connect and view accepted connections
 * - leader: can build one team and manage its roster
 * - member: can view the team and leave the current team
 */

let lastProfile = null;
let lastFilter = "all";
let lastQuery = "";

function canManageTeam() {
  return HackConnectApp.getUserTeamRole() === "leader" && HackConnectApp.isTeamLeader();
}

function getPersonStatus(personId) {
  const myTeam = HackConnectApp.getMyTeam();
  const sentRequests = HackConnectApp.getSentRequests();
  const receivedRequests = HackConnectApp.getReceivedRequests();
  const connections = HackConnectApp.getConnections();

  if (myTeam.includes(personId)) return "in-team";
  if (connections.includes(personId)) return "accepted";
  if (sentRequests.includes(personId)) return "pending";
  if (receivedRequests.includes(personId)) return "received";

  return "none";
}

function getFilteredTeammates(filter = "all", query = "") {
  let data = HackConnectApp.TEAMMATES || [];

  if (filter !== "all") {
    data = data.filter((teammate) =>
      (teammate.skills || []).some((skill) =>
        skill.toLowerCase().includes(filter.toLowerCase())
      )
    );
  }

  if (query) {
    data = data.filter((teammate) => {
      const haystack = [
        teammate.name,
        teammate.role,
        teammate.goal,
        teammate.location || "",
        ...(teammate.skills || []),
        ...(teammate.interests || [])
      ].join(" ").toLowerCase();

      return haystack.includes(query.toLowerCase());
    });
  }

  return data;
}

function getTeamRoleLabel() {
  const role = HackConnectApp.getUserTeamRole();
  if (role === "leader") return "Leader";
  if (role === "member") return "Member";
  return "User";
}

function getConnectionsNote() {
  const role = HackConnectApp.getUserTeamRole();
  if (role === "leader") {
    return "You registered as a leader. Accepted connections can be added to your one active team.";
  }
  if (role === "member") {
    return "You registered as a member. Accepted connections are visible here, but only a leader can add people to a team.";
  }
  return "You are using the app as a user. Accepted connections stay visible here for networking.";
}

function getMyTeamNote() {
  const role = HackConnectApp.getUserTeamRole();
  if (role === "leader") {
    return "You are leading this team. You can add accepted connections and remove members.";
  }
  if (role === "member") {
    return "You are part of a team as a member. Only leaders can manage the roster, and you can leave the current team.";
  }
  return "You are using the app as a user. You can view the team here, but only leaders can manage members.";
}

function buildActionButton(person, context, status) {
  const isLeader = canManageTeam();

  if (context === "discover") {
    if (status === "none") {
      return `<button class="request-btn" data-action="send-request" data-id="${person.id}">Send Request</button>`;
    }
    if (status === "pending") {
      return `<button class="request-btn disabled-btn" disabled>Pending</button>`;
    }
    if (status === "accepted") {
      return `<button class="request-btn disabled-btn" disabled>Accepted</button>`;
    }
    if (status === "in-team") {
      return `<button class="request-btn disabled-btn" disabled>In Team</button>`;
    }
  }

  if (context === "requests") {
    return `
      <button class="accept-btn" data-action="accept-request" data-id="${person.id}">Accept</button>
      <button class="reject-btn" data-action="reject-request" data-id="${person.id}">Reject</button>
    `;
  }

  if (context === "connections") {
    if (status === "in-team") {
      return `<button class="request-btn disabled-btn" disabled>In Team</button>`;
    }
    if (isLeader && status === "accepted") {
      return `<button class="add-team-btn" data-action="add-to-team" data-id="${person.id}">Add to Team</button>`;
    }
    return `<button class="request-btn disabled-btn" disabled>Accepted</button>`;
  }

  if (context === "myteam") {
    if (isLeader) {
      return `<button class="remove-btn" data-action="remove-from-team" data-id="${person.id}">Remove</button>`;
    }
    return `<button class="request-btn disabled-btn" disabled>Team Member</button>`;
  }

  return "";
}

function getProfileUrl(person) {
  return `https://hackconnect.io/profile/${person.name.toLowerCase().replace(/\s+/g, "-")}`;
}

function hasMessageThread(personId) {
  const threads = HackConnectApp.getChatThreads?.() || {};
  return Array.isArray(threads[personId]) && threads[personId].length > 0;
}

function buildTeammateCard(person, context = "discover") {
  const status = getPersonStatus(person.id);
  const buttonHtml = buildActionButton(person, context, status);
  const initials = person.name
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const interests = (person.interests || []).slice(0, 3).join(", ");
  const profileUrl = getProfileUrl(person);
  const messageBadge = hasMessageThread(person.id)
    ? `<span class="message-status-badge">Message Sent</span>`
    : "";

  return `
    <div class="teammate-card" data-person-id="${person.id}">
      <div class="teammate-card-header">
        <div style="display: flex; gap: 0.9rem; align-items: flex-start;">
          <div class="teammate-avatar">${initials}</div>
          <div class="teammate-info-header">
            <h3>${person.name}</h3>
            <p>${person.role}</p>
          </div>
        </div>
        <div class="teammate-header-tags">
          ${messageBadge}
          <span class="availability-tag">${person.availability || "Available"}</span>
        </div>
      </div>
      <p class="teammate-goal">${person.goal}</p>
      <div class="teammate-meta">
        <div class="meta-item">
          <strong>Location</strong>
          <span>${person.location || "Remote"}</span>
        </div>
        <div class="meta-item">
          <strong>Interests</strong>
          <span>${interests || "Open to different tracks"}</span>
        </div>
        <div class="meta-item">
          <strong>Profile</strong>
          <span><a href="${profileUrl}" target="_blank" rel="noopener noreferrer">View HackConnect Profile</a></span>
        </div>
      </div>
      <div class="teammate-skills">
        ${person.skills.slice(0, 4).map((skill) => `<span class="skill-tag">${skill}</span>`).join("")}
      </div>
      <div class="teammate-actions">
        ${buttonHtml}
        <button class="view-profile-btn" data-action="view-profile" data-id="${person.id}">View Profile</button>
      </div>
    </div>
  `;
}

function renderDiscoverTeammates(profile, filter = "all", query = "") {
  lastProfile = profile;
  lastFilter = filter;
  lastQuery = query;

  const el = document.getElementById("teammatGrid");
  if (!el) return;

  const teammates = getFilteredTeammates(filter, query);

  if (!teammates.length) {
    el.innerHTML = `<div class="empty-state"><p>No teammates found</p></div>`;
    return;
  }

  el.innerHTML = teammates.map((person) => buildTeammateCard(person, "discover")).join("");
}

function renderIncomingRequests() {
  const el = document.getElementById("requestsGrid");
  if (!el) return;

  const receivedIds = HackConnectApp.getReceivedRequests();
  const people = (HackConnectApp.TEAMMATES || []).filter((person) => receivedIds.includes(person.id));

  if (!people.length) {
    el.innerHTML = `<div class="empty-state"><p>No pending requests</p></div>`;
    return;
  }

  el.innerHTML = people.map((person) => buildTeammateCard(person, "requests")).join("");
}

function renderConnections() {
  const el = document.getElementById("connectionsGrid");
  if (!el) return;

  const connectionIds = HackConnectApp.getConnections();
  const people = (HackConnectApp.TEAMMATES || []).filter((person) => connectionIds.includes(person.id));
  const note = `<p class='leader-note'>${getConnectionsNote()}</p>`;

  if (!people.length) {
    el.innerHTML = `<div class="empty-state">${note}<p>No connections yet. Accept requests to build your network.</p></div>`;
    return;
  }

  el.innerHTML = note + people.map((person) => buildTeammateCard(person, "connections")).join("");
}

function renderLeaveTeamPanel() {
  const isLeader = canManageTeam();
  const canLeave = HackConnectApp.canLeaveTeam();
  if (isLeader || !canLeave) return "";

  return `
    <div class="surface-card" style="margin-bottom: 1rem; padding: 1rem;">
      <h3 style="margin-bottom: 0.35rem;">Leave Current Team</h3>
      <p class="muted-copy" style="margin-bottom: 0.85rem;">As a member, you can leave your current team. This clears your active one-team slot.</p>
      <button class="remove-btn" data-action="leave-team">Leave Team</button>
    </div>
  `;
}

function renderMyTeam() {
  const el = document.getElementById("myTeamGrid");
  if (!el) return;

  const teamIds = HackConnectApp.getMyTeam();
  const people = (HackConnectApp.TEAMMATES || []).filter((person) => teamIds.includes(person.id));
  const note = `<p class='leader-note'>${getMyTeamNote()}</p>`;

  if (!people.length) {
    el.innerHTML = `${renderLeaveTeamPanel()}<div class="empty-state">${note}<p>No team members yet.</p></div>`;
    return;
  }

  el.innerHTML = renderLeaveTeamPanel() + note + people.map((person) => buildTeammateCard(person, "myteam")).join("");
}

function refreshTeamViews() {
  renderDiscoverTeammates(lastProfile || HackConnectApp.getProfile(), lastFilter, lastQuery);
  renderIncomingRequests();
  renderConnections();
  renderMyTeam();
}

function handleSendRequest(personId) {
  HackConnectApp.sendConnectionRequest(personId);
  HackConnectApp.showToast("Connection request sent.");
  refreshTeamViews();
}

function handleAcceptRequest(personId) {
  HackConnectApp.acceptConnectionRequest(personId);
  HackConnectApp.showToast("Request accepted. The connection is now visible in Connections.");
  refreshTeamViews();
}

function handleRejectRequest(personId) {
  HackConnectApp.rejectConnectionRequest(personId);
  HackConnectApp.showToast("Connection request rejected.");
  refreshTeamViews();
}

function handleAddToTeam(personId) {
  if (!canManageTeam()) {
    HackConnectApp.showToast("Only leaders can add accepted connections to a team.");
    return;
  }

  HackConnectApp.addToMyTeam(personId);
  HackConnectApp.showToast("Member added to your team.");
  refreshTeamViews();
}

function handleRemoveFromTeam(personId) {
  if (!canManageTeam()) {
    HackConnectApp.showToast("Only leaders can remove team members.");
    return;
  }

  HackConnectApp.removeFromMyTeam(personId);
  HackConnectApp.showToast("Member removed from your team.");
  refreshTeamViews();
}

function handleLeaveTeam() {
  if (!HackConnectApp.canLeaveTeam()) {
    HackConnectApp.showToast("Only members with an active team can leave it.");
    return;
  }

  HackConnectApp.leaveCurrentTeam();
  HackConnectApp.showToast("You have left the team.");
  refreshTeamViews();
}

function handleViewProfile(personId) {
  const person = HackConnectApp.TEAMMATES.find((teammate) => teammate.id === personId);
  if (person && typeof openTeammateProfile === "function") {
    openTeammateProfile(person);
  }
}

function handleTeammateAction(event) {
  const actionBtn = event.target.closest("[data-action]");
  if (!actionBtn) return;

  const action = actionBtn.dataset.action;
  const personId = actionBtn.dataset.id;

  if (action === "send-request") handleSendRequest(personId);
  if (action === "accept-request") handleAcceptRequest(personId);
  if (action === "reject-request") handleRejectRequest(personId);
  if (action === "add-to-team") handleAddToTeam(personId);
  if (action === "remove-from-team") handleRemoveFromTeam(personId);
  if (action === "leave-team") handleLeaveTeam();
  if (action === "view-profile") handleViewProfile(personId);
}

function initTeammateSearch() {
  const searchInput = document.getElementById("teammatSearch");
  if (!searchInput) return;

  searchInput.addEventListener("input", (event) => {
    renderDiscoverTeammates(lastProfile, lastFilter, event.target.value.trim());
  });
}

function initTeammateFilters() {
  const filterContainer = document.getElementById("teammatFilters");
  if (!filterContainer) return;

  filterContainer.addEventListener("click", (event) => {
    const chip = event.target.closest(".teammat-filter-chip");
    if (!chip) return;

    document.querySelectorAll(".teammat-filter-chip").forEach((filterChip) => {
      filterChip.classList.remove("active");
    });
    chip.classList.add("active");

    const query = document.getElementById("teammatSearch")?.value.trim() || "";
    renderDiscoverTeammates(lastProfile, chip.dataset.filter, query);
  });
}

function initTeammateNavigation() {
  document.querySelectorAll("[data-dashboard-page]").forEach((button) => {
    button.addEventListener("click", () => {
      const page = button.dataset.dashboardPage;

      if (page === "findteammates") renderDiscoverTeammates(HackConnectApp.getProfile(), lastFilter, lastQuery);
      if (page === "requests") renderIncomingRequests();
      if (page === "connections") renderConnections();
      if (page === "myteam") renderMyTeam();
    });
  });
}

function initTeammateEventHandlers() {
  ["teammatGrid", "requestsGrid", "connectionsGrid", "myTeamGrid"].forEach((gridId) => {
    const grid = document.getElementById(gridId);
    if (grid) {
      grid.addEventListener("click", handleTeammateAction);
    }
  });

  initTeammateSearch();
  initTeammateFilters();
  initTeammateNavigation();
  renderDiscoverTeammates(HackConnectApp.getProfile());
}

window.refreshTeamViews = refreshTeamViews;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTeammateEventHandlers);
} else {
  setTimeout(initTeammateEventHandlers, 100);
}
