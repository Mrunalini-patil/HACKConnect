document.addEventListener("DOMContentLoaded", () => {
  bindGlobalActions();

  const page = document.body.dataset.page;
  if (page === "home") initHomePage();
  if (page === "profile") initProfilePage();
  if (page === "dashboard") initDashboardPage();
});

function bindGlobalActions() {
  document.querySelectorAll('[data-action="logout"]').forEach((button) => {
    button.addEventListener("click", () => HackConnectApp.logout());
  });
}

function initHomePage() {
  document.querySelectorAll("[data-scroll-target]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const target = document.getElementById(link.dataset.scrollTarget);
      target?.scrollIntoView({ behavior: "smooth" });
    });
  });

  document.querySelectorAll(".interactive-card").forEach((card) => {
    card.addEventListener("click", () => {
      card.classList.add("is-active");
      setTimeout(() => card.classList.remove("is-active"), 180);
    });
  });
}

function initProfilePage() {
  if (!HackConnectApp.requireSession()) return;

  const profile = HackConnectApp.getProfile() || {};
  const form = document.getElementById("profileForm");
  const uploadFields = ["educationProof", "experienceProof", "achievementProof"];

  populateProfileForm(profile);
  updateProfileSummary(profile);
  renderMatches(profile, "matchResults");
  renderRecommendedHackathons(profile);

  uploadFields.forEach((field) => {
    const input = document.getElementById(field);
    const status = document.getElementById(`${field}Status`);
    if (profile[field]) {
      status.textContent = `Selected: ${profile[field]}`;
    }
    input?.addEventListener("change", () => {
      status.textContent = input.files[0] ? `Selected: ${input.files[0].name}` : "No file selected";
    });
  });

  form?.addEventListener("input", () => {
    const draft = collectProfileFormData();
    updateProfileSummary(draft);
  });

  document.getElementById("previewMatchesBtn")?.addEventListener("click", () => {
    const draft = collectProfileFormData();
    renderMatches(draft, "matchResults");
    renderRecommendedHackathons(draft);
    HackConnectApp.showToast("Preview refreshed with your current profile details.");
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const nextProfile = collectProfileFormData();
    HackConnectApp.saveProfile({
      ...HackConnectApp.getProfile(),
      ...nextProfile
    });
    updateProfileSummary(nextProfile);
    renderMatches(nextProfile, "matchResults");
    renderRecommendedHackathons(nextProfile);
    HackConnectApp.showToast("Profile saved successfully.");
  });
}

function populateProfileForm(profile) {
  Object.entries(profile).forEach(([key, value]) => {
    const input = document.getElementById(key);
    if (input && input.type !== "file") {
      input.value = value;
    }
  });
}

function collectProfileFormData() {
  const fields = [
    "fullName",
    "headline",
    "college",
    "graduationYear",
    "bio",
    "skills",
    "interests",
    "hackathons",
    "availability",
    "experience",
    "achievements",
    "emailContact",
    "phoneContact",
    "linkedinUrl",
    "portfolioUrl"
  ];

  const data = {};
  fields.forEach((field) => {
    const element = document.getElementById(field);
    data[field] = element ? element.value.trim() : "";
  });

  ["educationProof", "experienceProof", "achievementProof"].forEach((field) => {
    const input = document.getElementById(field);
    const status = document.getElementById(`${field}Status`);
    data[field] = input?.files?.[0]?.name || (status?.textContent.startsWith("Selected: ") ? status.textContent.replace("Selected: ", "") : "");
  });

  return data;
}

function updateProfileSummary(profile) {
  const completion = HackConnectApp.getProfileCompletion(profile);
  document.getElementById("summaryName").textContent = profile.fullName || "Your profile is starting to take shape.";
  document.getElementById("summaryRole").textContent = profile.headline || "Complete the form to generate your teammate matches.";
  document.getElementById("profileProgressBar").style.width = `${completion}%`;
  document.getElementById("profileProgressText").textContent = `${completion}% complete`;
}

function renderMatches(profile, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const ownSkills = HackConnectApp.normalizeList(profile?.skills);
  const ownCard = profile?.fullName ? `
    <article class="stack-card">
      <h3>You: ${profile.fullName}</h3>
      <p><strong>${profile.headline || "Registered member"}</strong></p>
      <small>${profile.bio || "Your saved profile appears here so your team view includes you too."}</small>
      <div class="badge-row">
        ${(ownSkills.length ? ownSkills : ["Profile active"]).map((skill) => `<span class="badge">${skill}</span>`).join("")}
      </div>
    </article>
  ` : "";
  const isTeamView = containerId === "dashboardMatches";
  const people = isTeamView
    ? HackConnectApp.getMyTeamMembers()
    : HackConnectApp.getRecommendedTeammates(profile).slice(0, 3);

  const teamCards = people.map((person) => `
    <article class="stack-card">
      <h3>${isTeamView ? `Team Member: ${person.name}` : `Top Match: ${person.name}`}</h3>
      <p><strong>${person.role}</strong></p>
      <small>${person.goal}</small>
      <div class="badge-row">
        ${person.skills.map((skill) => `<span class="badge">${skill}</span>`).join("")}
      </div>
    </article>
  `).join("");

  const emptyTeamCard = isTeamView && !people.length
    ? `<article class="stack-card"><h3>No teammates added yet</h3><small>Open Find Teammates and use Add to Team to build your team here.</small></article>`
    : "";

  container.innerHTML = ownCard + (teamCards || emptyTeamCard);

  const counter = document.getElementById("matchCount");
  if (counter) counter.textContent = String(HackConnectApp.getRecommendedTeammates(profile).slice(0, 3).length);
}

function renderRecommendedHackathons(profile) {
  const container = document.getElementById("hackathonResults");
  if (!container) return;

  const hacks = HackConnectApp.getRecommendedHackathons(profile).slice(0, 3);
  container.innerHTML = hacks.map((item) => `
    <article class="stack-card">
      <h3>${getHackathonLabel(item.category)} ${item.title}</h3>
      <p>${item.organizer}</p>
      <small>${item.mode} | Deadline ${item.deadline}</small>
      <div class="badge-row">
        <span class="badge">${item.category}</span>
        <span class="badge">${item.prize}</span>
      </div>
    </article>
  `).join("");
}

function initDashboardPage() {
  const account = HackConnectApp.getAccount();
  const profile = HackConnectApp.getProfile();
  let activeFilter = "all";
  let currentTrackQuery = "";

  if (account?.name) {
    document.getElementById("dashboardGreeting").textContent = `Welcome back, ${account.name}.`;
  }
  if (profile?.headline) {
    document.getElementById("dashboardSubtitle").textContent = `${profile.headline} profile ready for hackathons, teammates, and applications.`;
  }

  renderDashboardStats(profile);
  renderHackathonGrid(profile, activeFilter, "hackathonGrid", "", "");
  renderSavedHackathons(profile);
  renderUpcomingHackathons(profile);
  renderPopupSuggestions(profile);
  renderNotifications();
  renderWorkspace(profile);
  initDashboardTeamRoleControls();
  initDashboardApplicationForm();
  bindDashboardApplicationRouting();
  setDashboardPage("discover");

  setTimeout(() => {
    const popup = document.getElementById("suggPopup");
    if (popup) popup.classList.add("visible");
  }, 1200);

  document.getElementById("dashboardPing")?.addEventListener("click", (event) => {
    event.stopPropagation();
    document.getElementById("notifPanel")?.classList.toggle("open");
  });

  document.getElementById("closePopupBtn")?.addEventListener("click", closePopup);
  document.getElementById("browsePopupBtn")?.addEventListener("click", () => {
    setDashboardPage("discover");
    closePopup();
  });
  document.getElementById("browseTeammatesBtn")?.addEventListener("click", () => {
    setDashboardPage("findteammates");
  });
  document.getElementById("closeModalBtn")?.addEventListener("click", closeModal);
  document.getElementById("expandModalBtn")?.addEventListener("click", toggleExpandModal);
  document.getElementById("modalOverlay")?.addEventListener("click", (event) => {
    if (event.target.id === "modalOverlay") closeModal();
  });
  document.getElementById("markReadBtn")?.addEventListener("click", markAllRead);
  document.getElementById("githubConnectBtn")?.addEventListener("click", connectGithubWorkspaceDemo);
  document.getElementById("githubSyncBtn")?.addEventListener("click", syncGithubWorkspaceDemo);

  document.addEventListener("click", (event) => {
    if (!event.target.closest("#notifPanel") && !event.target.closest("#dashboardPing")) {
      document.getElementById("notifPanel")?.classList.remove("open");
    }
  });

  document.getElementById("hackathonFilters")?.addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (!chip) return;
    activeFilter = chip.dataset.filter;
    document.querySelectorAll("#hackathonFilters .chip").forEach((item) => {
      item.classList.toggle("active", item === chip);
    });
    const query = document.getElementById("dashboardSearch")?.value.trim().toLowerCase() || "";
    renderHackathonGrid(HackConnectApp.getProfile(), activeFilter, "hackathonGrid", query, currentTrackQuery);
  });

  document.querySelectorAll("[data-dashboard-page]").forEach((button) => {
    button.addEventListener("click", () => setDashboardPage(button.dataset.dashboardPage));
  });

  document.querySelectorAll("[data-skill-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.skillFilter;
      document.querySelectorAll("#hackathonFilters .chip").forEach((chip) => {
        chip.classList.toggle("active", chip.dataset.filter === activeFilter);
      });
      const query = document.getElementById("dashboardSearch")?.value.trim().toLowerCase() || "";
      renderHackathonGrid(HackConnectApp.getProfile(), activeFilter, "hackathonGrid", query, currentTrackQuery);
      setDashboardPage("discover");
      HackConnectApp.showToast(`Filtering by ${button.textContent.trim()}.`);
    });
  });

  document.getElementById("dashboardSearch")?.addEventListener("input", (event) => {
    const query = event.target.value.trim().toLowerCase();
    activeFilter = document.querySelector("#hackathonFilters .chip.active")?.dataset.filter || "all";
    renderHackathonGrid(HackConnectApp.getProfile(), activeFilter, "hackathonGrid", query, currentTrackQuery);
    setDashboardPage("discover");
  });

  document.getElementById("trackSearch")?.addEventListener("input", (event) => {
    currentTrackQuery = event.target.value.trim().toLowerCase();
    const clearBtn = document.getElementById("clearTrackSearch");
    if (currentTrackQuery) {
      clearBtn?.classList.add("active");
    } else {
      clearBtn?.classList.remove("active");
    }
    activeFilter = document.querySelector("#hackathonFilters .chip.active")?.dataset.filter || "all";
    const query = document.getElementById("dashboardSearch")?.value.trim().toLowerCase() || "";
    renderHackathonGrid(HackConnectApp.getProfile(), activeFilter, "hackathonGrid", query, currentTrackQuery);
  });

  document.getElementById("clearTrackSearch")?.addEventListener("click", () => {
    document.getElementById("trackSearch").value = "";
    currentTrackQuery = "";
    document.getElementById("clearTrackSearch")?.classList.remove("active");
    activeFilter = document.querySelector("#hackathonFilters .chip.active")?.dataset.filter || "all";
    const query = document.getElementById("dashboardSearch")?.value.trim().toLowerCase() || "";
    renderHackathonGrid(HackConnectApp.getProfile(), activeFilter, "hackathonGrid", query, currentTrackQuery);
  });

  // Initialize module handlers
  initProfileModalHandlers?.();
  initChatModalHandlers?.();
  initTeammateEventHandlers?.();
  initSearchHandlers?.();
}

let currentApplicationHackathonId = null;

function bindDashboardApplicationRouting() {
  if (document.body.dataset.applicationRoutingBound === "true") return;
  document.body.dataset.applicationRoutingBound = "true";

  document.addEventListener("click", (event) => {
    const applyButton = event.target.closest("[data-apply-id]");
    if (applyButton) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      closeModal();
      closePopup();
      openApplicationForm(Number(applyButton.dataset.applyId));
      return;
    }

    const modalApply = event.target.closest("#modalApplyBtn");
    if (modalApply) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      const title = document.getElementById("modalTitle")?.textContent?.trim();
      const hackathon = HackConnectApp.HACKATHONS.find((item) => item.title === title);
      closeModal();
      closePopup();
      if (hackathon) openApplicationForm(hackathon.id);
      return;
    }

    const backButton = event.target.closest("#cancelApplicationBtn");
    if (backButton) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      closeApplicationForm();
    }
  }, true);
}

function initDashboardApplicationForm() {
  const form = document.getElementById("hackathonApplicationForm");
  const memberCount = document.getElementById("teamMemberCount");
  const titleInput = document.getElementById("projectTitle");

  if (!form || !memberCount || !titleInput) return;
  if (form.dataset.bound === "true") return;
  form.dataset.bound = "true";

  memberCount.addEventListener("change", () => {
    renderApplicationMemberSlots(Number(memberCount.value) || 1);
  });

  titleInput.addEventListener("input", validateApplicationThemeMatch);

  document.getElementById("cancelApplicationBtn")?.addEventListener("click", closeApplicationForm);
  document.getElementById("resetApplicationBtn")?.addEventListener("click", () => {
    resetApplicationForm();
    const hackathon = getCurrentApplicationHackathon();
    if (hackathon) {
      populateApplicationForm(hackathon);
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const hackathon = getCurrentApplicationHackathon();
    HackConnectApp.showToast(`Application submitted for ${hackathon?.title || "this hackathon"}.`);
    closeApplicationForm();
  });
}

function initDashboardTeamRoleControls() {
  const select = document.getElementById("dashboardTeamRole");
  const saveBtn = document.getElementById("saveDashboardTeamRoleBtn");
  if (!select || !saveBtn) return;

  select.value = HackConnectApp.getUserTeamRole();

  saveBtn.addEventListener("click", () => {
    const nextRole = select.value || "user";
    const account = HackConnectApp.getAccount() || {};
    const profile = HackConnectApp.getProfile() || {};
    const membership = HackConnectApp.getTeamMembership();
    const wasLeader = HackConnectApp.isTeamLeader();

    HackConnectApp.saveAccount({
      ...account,
      teamRole: nextRole
    });
    HackConnectApp.saveProfile({
      ...profile,
      teamRole: nextRole
    });

    if (nextRole === "leader") {
      HackConnectApp.setTeamLeader(HackConnectApp.getCurrentUserId());
      HackConnectApp.saveTeamMembership({
        ...membership,
        active: HackConnectApp.getMyTeam().length > 0,
        joinedAs: "leader"
      });
    } else if (nextRole === "member") {
      HackConnectApp.saveTeamMembership({
        ...membership,
        active: membership.active || HackConnectApp.getMyTeam().length > 0,
        joinedAs: "member"
      });
    } else {
      HackConnectApp.saveTeamMembership({
        active: false,
        joinedAs: "user"
      });
      if (wasLeader) {
        HackConnectApp.setTeamLeader(null);
      }
    }

    select.value = HackConnectApp.getUserTeamRole();
    renderDashboardStats(HackConnectApp.getProfile());
    renderNotifications();
    refreshTeamViews?.();

    const currentPage = document.querySelector("[data-dashboard-page].active")?.dataset.dashboardPage || "discover";
    setDashboardPage(currentPage);
    HackConnectApp.showToast("Team role updated on the dashboard.");
  });
}

function renderDashboardStats(profile) {
  const saved = HackConnectApp.getSavedHackathons().length;
  const profileScore = HackConnectApp.getProfileCompletion(profile);
  const matchCount = HackConnectApp.getRecommendedTeammates(profile).slice(0, 3).length;
  document.getElementById("savedCount").textContent = String(saved);
  document.getElementById("savedSidebarCount").textContent = String(saved);
  document.getElementById("profileScore").textContent = `${profileScore}%`;
  document.getElementById("matchCount").textContent = String(matchCount);
  const discoverCount = document.getElementById("discoverCount");
  if (discoverCount) discoverCount.textContent = String(HackConnectApp.HACKATHONS.length);
}

function renderHackathonGrid(profile, filter, gridId, query = "", trackQuery = "") {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  const saved = new Set(HackConnectApp.getSavedHackathons());
  let hacks = HackConnectApp.getRecommendedHackathons(profile, filter);
  
  if (query) {
    hacks = hacks.filter((item) =>
      item.title.toLowerCase().includes(query) ||
      item.organizer.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  }

  if (trackQuery) {
    hacks = hacks.filter((item) =>
      item.tracks && item.tracks.some((track) => track.toLowerCase().includes(trackQuery))
    );
  }

  if (!hacks.length) {
    grid.innerHTML = `<div class="stack-card"><p>No hackathons matched this filter yet.</p></div>`;
    return;
  }

  grid.innerHTML = hacks.map((item) => `
    <article class="hackathon-card" data-open-id="${item.id}">
      <header>
        <div class="hackathon-card-top">
          <div class="hackathon-emoji">${getHackathonLabel(item.category)}</div>
          <div>
            <h3>${item.title}</h3>
            <p class="muted-copy">${item.organizer}</p>
          </div>
        </div>
        <span class="section-pill">${item.category}</span>
      </header>
      <p class="muted-copy">${item.description}</p>
      <div class="meta-grid">
        <span>Mode: ${item.mode}</span>
        <span>Prize: ${item.prize}</span>
        <span>Deadline: ${item.deadline}</span>
        <span>Match score: ${item.score || 0}</span>
      </div>
      <div class="card-actions">
        <button class="btn btn-ghost" type="button" data-save-id="${item.id}">${saved.has(item.id) ? "Saved" : "Save"}</button>
        <button class="btn btn-primary" type="button" data-apply-id="${item.id}">Apply</button>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("[data-open-id]").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      openModal(Number(card.dataset.openId));
    });
  });

  grid.querySelectorAll("[data-save-id]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleSavedHackathon(Number(button.dataset.saveId));
    });
  });

  grid.querySelectorAll("[data-apply-id]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      openApplicationForm(Number(button.dataset.applyId));
    });
  });
}

function toggleSavedHackathon(id) {
  const current = HackConnectApp.getSavedHackathons();
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  HackConnectApp.saveSavedHackathons(next);
  renderDashboardStats(HackConnectApp.getProfile());
  renderHackathonGrid(
    HackConnectApp.getProfile(),
    document.querySelector("#hackathonFilters .chip.active")?.dataset.filter || "all",
    "hackathonGrid",
    document.getElementById("dashboardSearch")?.value.trim().toLowerCase() || "",
    document.getElementById("trackSearch")?.value.trim().toLowerCase() || ""
  );
  renderSavedHackathons(HackConnectApp.getProfile());
  renderUpcomingHackathons(HackConnectApp.getProfile());
  renderPopupSuggestions(HackConnectApp.getProfile());
  HackConnectApp.showToast(current.includes(id) ? "Removed from saved events." : "Hackathon saved.");
}

function renderSavedHackathons(profile) {
  const grid = document.getElementById("savedHackathonGrid");
  if (!grid) return;
  const savedIds = new Set(HackConnectApp.getSavedHackathons());
  const hacks = HackConnectApp.getRecommendedHackathons(profile, "all").filter((item) => savedIds.has(item.id));

  if (!hacks.length) {
    grid.innerHTML = `<div class="stack-card"><p>No saved hackathons yet. Save one from Discover to see it here.</p></div>`;
    return;
  }

  renderHackathonGrid(profile, "all", "savedHackathonGrid", "", "");
  Array.from(grid.children).forEach((card) => {
    const saveButton = card.querySelector("[data-save-id]");
    if (!saveButton || !savedIds.has(Number(saveButton.dataset.saveId))) {
      card.remove();
    }
  });
}

function renderUpcomingHackathons(profile) {
  const container = document.getElementById("upcomingHackathons");
  if (!container) return;
  const hacks = HackConnectApp.getRecommendedHackathons(profile, "all").slice(0, 3);
  container.innerHTML = hacks.map((item) => `
    <article class="stack-card">
      <h3>${getHackathonLabel(item.category)} ${item.title}</h3>
      <p>${item.organizer}</p>
      <small>${item.mode} | Deadline ${item.deadline}</small>
      <div class="badge-row">
        <span class="badge">${item.category}</span>
        <span class="badge">${item.prize}</span>
      </div>
    </article>
  `).join("");
}

function renderPopupSuggestions(profile) {
  const container = document.getElementById("popupCards");
  if (!container) return;
  const hacks = HackConnectApp.getRecommendedHackathons(profile, "all").slice(0, 3);
  container.innerHTML = hacks.map((item) => `
    <button class="popup-card" type="button" data-popup-id="${item.id}">
      <span class="popup-card-emoji">${getHackathonLabel(item.category)}</span>
      <span>
        <span class="popup-card-name">${item.title}</span>
        <span class="popup-card-detail">${item.prize} | ${item.deadline} | ${item.mode}</span>
      </span>
    </button>
  `).join("");

  container.querySelectorAll("[data-popup-id]").forEach((button) => {
    button.addEventListener("click", () => openModal(Number(button.dataset.popupId)));
  });
}

function renderNotifications() {
  const container = document.getElementById("notifList");
  if (!container) return;
  const profile = HackConnectApp.getProfile() || {};
  const workspace = HackConnectApp.getGithubWorkspace?.() || { connected: false };
  const messageNotifications = (HackConnectApp.getChatNotifications?.() || []).slice(0, 4);
  const items = [
    { text: "Your profile is looking stronger for teammate discovery.", time: "Just now", read: false },
    { text: workspace.connected ? `GitHub workspace synced for ${workspace.org}/${workspace.repo}.` : "Connect GitHub to start a shared repo workspace.", time: "12 min ago", read: false },
    { text: `Suggested match found for ${profile.headline || "your profile"}.`, time: "1 hour ago", read: false },
    { text: "Saved events are synced to your dashboard.", time: "Yesterday", read: true }
  ];
  const combined = [
    ...messageNotifications,
    ...items.map((item, index) => ({ ...item, id: `system-${index}`, type: "system" }))
  ].slice(0, 8);

  container.innerHTML = combined.map((item) => `
    <div class="notif-item" ${item.type === "message" ? `data-notification-person="${item.personId}"` : ""}>
      <div class="notif-dot ${item.read ? "read" : ""}"></div>
      <div>
        <div class="notif-text">${item.text}</div>
        <div class="notif-time">${item.time}</div>
      </div>
    </div>
  `).join("");

  container.querySelectorAll("[data-notification-person]").forEach((notification) => {
    notification.addEventListener("click", () => {
      openMessagesInbox?.(notification.dataset.notificationPerson);
      document.getElementById("notifPanel")?.classList.remove("open");
    });
  });

  const messageCount = getUnreadMessageCount?.() || 0;
  const ping = document.getElementById("dashboardPing");
  if (ping) {
    ping.title = messageCount ? `${messageCount} unread messages` : "Notifications";
  }
}

function markAllRead() {
  document.querySelectorAll(".notif-dot").forEach((dot) => dot.classList.add("read"));
  markAllMessageNotificationsRead?.();
  renderMessagesInbox?.();
  HackConnectApp.showToast("All notifications marked as read.");
}

function renderWorkspace(profile) {
  const workspace = HackConnectApp.getGithubWorkspace?.() || {};
  const title = document.getElementById("workspaceTitle");
  const subtitle = document.getElementById("workspaceSubtitle");
  const badge = document.getElementById("workspaceRepoBadge");
  const connectBtn = document.getElementById("githubConnectBtn");
  const syncBtn = document.getElementById("githubSyncBtn");

  if (workspace.connected) {
    title.textContent = `${workspace.org}/${workspace.repo} is linked to your team workspace.`;
    subtitle.textContent = `Track ${workspace.branch}, recent pushes, pull request health, issue flow, and delivery progress without leaving HackConnect.`;
    badge.textContent = `${workspace.provider} | ${workspace.branch}`;
    connectBtn.textContent = "Reconnect GitHub";
    syncBtn.disabled = false;
  } else {
    title.textContent = "Connect a repository for your hackathon team.";
    subtitle.textContent = "Once connected, your team can track commits, pull requests, issues, branches, and project progress from one place.";
    badge.textContent = "No repo linked";
    connectBtn.textContent = "Connect GitHub";
    syncBtn.disabled = true;
  }

  renderWorkspaceStats(workspace, profile);
  renderWorkspaceCollection("workspaceCommits", workspace.commits, renderCommitCard, "Connect GitHub to see your commit stream.");
  renderWorkspaceCollection("workspacePullRequests", workspace.pullRequests, renderPullRequestCard, "Pull requests will appear here after repo connection.");
  renderWorkspaceCollection("workspaceIssues", workspace.issues, renderIssueCard, "Open issues and blockers will appear here.");
  renderWorkspaceCollection("workspaceBranches", workspace.branches, renderBranchCard, "Branch and deploy status will show here.");
  renderWorkspaceCollection("workspaceTasks", workspace.tasks, renderTaskCard, "Team collaboration tasks will appear here.");
}

function renderWorkspaceStats(workspace, profile) {
  const container = document.getElementById("workspaceStats");
  if (!container) return;

  if (!workspace.connected) {
    container.innerHTML = `
      <article class="workspace-stat-card workspace-stat-empty">
        <div class="workspace-stat-label">Ready to connect</div>
        <div class="workspace-stat-value">GitHub</div>
        <p>Link a team repository to unlock commit tracking, PR reviews, issue visibility, and a shared delivery board.</p>
      </article>
    `;
    return;
  }

  const profileScore = HackConnectApp.getProfileCompletion(profile);
  const stats = [
    ...(workspace.stats || []),
    { label: "Profile readiness", value: `${profileScore}%`, helper: "Useful for building a stronger team context" }
  ];

  container.innerHTML = stats.map((item) => `
    <article class="workspace-stat-card">
      <div class="workspace-stat-label">${item.label}</div>
      <div class="workspace-stat-value">${item.value}</div>
      <p>${item.helper || "Team status insight"}</p>
    </article>
  `).join("");
}

function renderWorkspaceCollection(containerId, items, renderItem, emptyMessage) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items || !items.length) {
    container.innerHTML = `<article class="stack-card workspace-empty-card"><p>${emptyMessage}</p></article>`;
    return;
  }

  container.innerHTML = items.map(renderItem).join("");
}

function renderCommitCard(item) {
  return `
    <article class="stack-card workspace-feed-card">
      <div class="workspace-feed-top">
        <strong>${item.message}</strong>
        <span class="section-pill">${item.branch}</span>
      </div>
      <p class="muted-copy">${item.author} committed ${item.when}</p>
      <small>${item.hash}</small>
    </article>
  `;
}

function renderPullRequestCard(item) {
  return `
    <article class="stack-card workspace-feed-card">
      <div class="workspace-feed-top">
        <strong>${item.title}</strong>
        <span class="section-pill">${item.status}</span>
      </div>
      <p class="muted-copy">${item.author} | Review: ${item.reviewer}</p>
      <small>${item.branch}</small>
    </article>
  `;
}

function renderIssueCard(item) {
  return `
    <article class="stack-card workspace-feed-card">
      <div class="workspace-feed-top">
        <strong>${item.title}</strong>
        <span class="section-pill">${item.severity}</span>
      </div>
      <p class="muted-copy">Owner: ${item.owner}</p>
      <small>${item.state}</small>
    </article>
  `;
}

function renderBranchCard(item) {
  return `
    <article class="stack-card workspace-feed-card">
      <div class="workspace-feed-top">
        <strong>${item.name}</strong>
        <span class="section-pill">${item.status}</span>
      </div>
      <p class="muted-copy">Deploy: ${item.deploy}</p>
      <small>${item.updated}</small>
    </article>
  `;
}

function renderTaskCard(item) {
  return `
    <article class="stack-card workspace-feed-card">
      <div class="workspace-feed-top">
        <strong>${item.title}</strong>
        <span class="section-pill">${item.lane}</span>
      </div>
      <p class="muted-copy">Owner: ${item.owner}</p>
      <small>${item.note}</small>
    </article>
  `;
}

function connectGithubWorkspaceDemo() {
  if (!HackConnectApp.connectGithubWorkspace) return;
  HackConnectApp.connectGithubWorkspace();
  renderWorkspace(HackConnectApp.getProfile());
  renderNotifications();
  setDashboardPage("workspace");
  HackConnectApp.showToast("GitHub workspace connected for your team.");
}

function syncGithubWorkspaceDemo() {
  if (!HackConnectApp.refreshGithubWorkspace) return;
  HackConnectApp.refreshGithubWorkspace();
  renderWorkspace(HackConnectApp.getProfile());
  renderNotifications();
  HackConnectApp.showToast("Repository status refreshed.");
}

function openModal(id) {
  const item = HackConnectApp.HACKATHONS.find((hackathon) => hackathon.id === id);
  if (!item) return;

  const banner = document.getElementById("modalBanner");
  banner.innerHTML = `<div>${getHackathonLabel(item.category)}</div><div class="modal-toolbar"><button class="modal-toolbar-btn" type="button" id="expandModalBtnInner">Expand</button><button class="modal-toolbar-btn modal-close-btn" type="button" id="closeModalBtnInner">Close</button></div>`;
  document.getElementById("modalTags").innerHTML = `<span class="badge">${item.category}</span><span class="badge">${item.mode}</span>`;
  document.getElementById("modalTitle").textContent = item.title;
  document.getElementById("modalOrg").textContent = `Organized by ${item.organizer}`;
  document.getElementById("modalGrid").innerHTML = `
    <div class="modal-detail"><div class="modal-detail-label">Prize</div><div>${item.prize}</div></div>
    <div class="modal-detail"><div class="modal-detail-label">Deadline</div><div>${item.deadline}</div></div>
    <div class="modal-detail"><div class="modal-detail-label">Mode</div><div>${item.mode}</div></div>
    <div class="modal-detail"><div class="modal-detail-label">Category</div><div>${item.category}</div></div>
    <div class="modal-detail"><div class="modal-detail-label">Team Size</div><div>${item.teamSize || "See event rules"}</div></div>
    <div class="modal-detail"><div class="modal-detail-label">Eligibility</div><div>${item.eligibility || "Open"}</div></div>
  `;
  document.getElementById("modalDesc").textContent = item.description;
  document.getElementById("modalTracks").innerHTML = (item.tracks || []).map((track) => `<span class="badge">${track}</span>`).join("");
  document.getElementById("modalTimeline").innerHTML = (item.timeline || []).map((entry) => `
    <div class="timeline-row">
      <strong>${entry.label}</strong>
      <span>${entry.value}</span>
    </div>
  `).join("");
  document.getElementById("modalContact").innerHTML = `
    <div><strong>Lead:</strong> ${item.contact?.lead || "Event Team"}</div>
    <div><strong>Email:</strong> ${item.contact?.email || "Not listed"}</div>
    <div><strong>Community:</strong> ${item.contact?.discord || "Not listed"}</div>
  `;
  document.getElementById("modalApplyBtn").onclick = () => {
    openApplicationForm(item.id);
    closeModal();
  };
  document.getElementById("modalSaveBtn").onclick = () => toggleSavedHackathon(item.id);
  document.getElementById("modalOverlay").classList.add("open");
  document.getElementById("modalBox").classList.remove("is-expanded");
  document.getElementById("expandModalBtnInner")?.addEventListener("click", toggleExpandModal);
  document.getElementById("closeModalBtnInner")?.addEventListener("click", closeModal);
}

function closeModal() {
  document.getElementById("modalOverlay")?.classList.remove("open");
  document.getElementById("modalBox")?.classList.remove("is-expanded");
}

function toggleExpandModal() {
  const modal = document.getElementById("modalBox");
  if (!modal) return;
  modal.classList.toggle("is-expanded");
}

function closePopup() {
  document.getElementById("suggPopup")?.classList.remove("visible");
}

function setDashboardPage(pageName) {
  ["discover", "application", "saved", "myteam", "upcoming", "workspace", "messages", "findteammates", "requests", "connections"].forEach((name) => {
    const section = document.getElementById(`page-${name}`);
    if (section) section.hidden = name !== pageName;
  });

  document.querySelectorAll("[data-dashboard-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.dashboardPage === pageName);
  });

  if (pageName === "findteammates") {
    renderDiscoverTeammates(HackConnectApp.getProfile(), "all");
  }
  else if (pageName === "requests") {
    renderIncomingRequests();
  }
  else if (pageName === "connections") {
    renderConnections();
  }
  else if (pageName === "myteam") {
    renderMyTeam();
  }
  else if (pageName === "messages") {
    renderMessagesInbox?.();
  }
}

function getHackathonLabel(category) {
  const labelMap = {
    AI: "AI",
    Web3: "W3",
    Design: "UX"
  };
  return labelMap[category] || "HC";
}

function openApplicationForm(hackathonId) {
  const hackathon = HackConnectApp.HACKATHONS.find((item) => item.id === hackathonId);
  const section = document.getElementById("page-application");
  if (!hackathon || !section) return;

  currentApplicationHackathonId = hackathonId;
  setDashboardPage("application");
  populateApplicationForm(hackathon);
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeApplicationForm() {
  setDashboardPage("discover");
}

function getCurrentApplicationHackathon() {
  return HackConnectApp.HACKATHONS.find((item) => item.id === currentApplicationHackathonId) || null;
}

function populateApplicationForm(hackathon) {
  const applicationTitle = document.getElementById("applicationTitle");
  const applicationSubtitle = document.getElementById("applicationSubtitle");
  const applicationHeading = document.getElementById("applicationHackathonHeading");
  const applicationThemeHint = document.getElementById("applicationThemeHint");
  const hackathonName = document.getElementById("applicationHackathonName");
  const teamSizeHint = document.getElementById("applicationTeamSizeHint");
  const memberCount = document.getElementById("teamMemberCount");
  const form = document.getElementById("hackathonApplicationForm");
  const memberSlotHint = document.getElementById("memberSlotHint");
  const profile = HackConnectApp.getProfile() || {};
  const account = HackConnectApp.getAccount() || {};
  const { firstName, middleName, surname } = splitFullName(profile.fullName || account.name || "");
  const sizeRange = parseTeamSizeRange();

  if (!form || !memberCount) return;

  form.reset();
  applicationTitle.textContent = `Application for ${hackathon.title}`;
  applicationSubtitle.textContent = `${hackathon.organizer} | ${hackathon.category} | Deadline ${hackathon.deadline}`;
  applicationHeading.textContent = `Apply for ${hackathon.title}`;
  applicationThemeHint.textContent = `Suggested tracks: ${(hackathon.tracks || []).join(", ")}. Your project title will be checked against these themes.`;
  hackathonName.value = hackathon.title;
  teamSizeHint.value = `Maximum 10 members`;

  memberCount.innerHTML = "";
  for (let size = sizeRange.min; size <= sizeRange.max; size += 1) {
    const option = document.createElement("option");
    option.value = String(size);
    option.textContent = `${size} ${size === 1 ? "member" : "members"}`;
    memberCount.appendChild(option);
  }
  memberCount.value = String(2);

  document.getElementById("leaderFirstName").value = firstName;
  document.getElementById("leaderMiddleName").value = middleName;
  document.getElementById("leaderSurname").value = surname;
  document.getElementById("leaderUniversity").value = profile.college || "";
  document.getElementById("leaderEmail").value = profile.emailContact || account.email || "";
  document.getElementById("leaderPhone").value = profile.phoneContact || "";
  memberSlotHint.textContent = `Add teammate details for ${Math.max((Number(memberCount.value) || 1) - 1, 0)} ${Number(memberCount.value) === 2 ? "member" : "members"}.`;

  renderApplicationMemberSlots(Number(memberCount.value) || 1);
  validateApplicationThemeMatch();
}

function parseTeamSizeRange(teamSizeText) {
  return { min: 1, max: 10 };
}

function renderApplicationMemberSlots(totalMembers) {
  const container = document.getElementById("applicationMembersContainer");
  const memberSlotHint = document.getElementById("memberSlotHint");
  if (!container || !memberSlotHint) return;

  const teammateCount = Math.max(totalMembers - 1, 0);
  memberSlotHint.textContent = teammateCount
    ? `Add teammate details for ${teammateCount} ${teammateCount === 1 ? "member" : "members"}.`
    : "You selected a solo application. No additional teammate slots are needed.";

  container.innerHTML = Array.from({ length: teammateCount }, (_, index) => {
    const memberNumber = index + 1;
    return `
      <article class="surface-card application-member-card">
        <div class="section-title-row">
          <div>
            <h4>Member ${memberNumber}</h4>
            <p class="muted-copy">Enter teammate profile details for this slot.</p>
          </div>
        </div>
        <div class="field-grid">
          <div class="field">
            <label for="memberFirstName${memberNumber}">First name</label>
            <input type="text" id="memberFirstName${memberNumber}" name="memberFirstName${memberNumber}" required>
          </div>
          <div class="field">
            <label for="memberMiddleName${memberNumber}">Middle name</label>
            <input type="text" id="memberMiddleName${memberNumber}" name="memberMiddleName${memberNumber}">
          </div>
          <div class="field">
            <label for="memberSurname${memberNumber}">Surname</label>
            <input type="text" id="memberSurname${memberNumber}" name="memberSurname${memberNumber}" required>
          </div>
          <div class="field">
            <label for="memberStatus${memberNumber}">Status</label>
            <select id="memberStatus${memberNumber}" name="memberStatus${memberNumber}" required>
              <option value="">Select status</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Graduate">Graduate</option>
              <option value="Postgraduate">Postgraduate</option>
              <option value="Professional">Professional</option>
            </select>
          </div>
          <div class="field">
            <label for="memberUniversity${memberNumber}">University / college</label>
            <input type="text" id="memberUniversity${memberNumber}" name="memberUniversity${memberNumber}" required>
          </div>
          <div class="field">
            <label for="memberEmail${memberNumber}">Email ID</label>
            <input type="email" id="memberEmail${memberNumber}" name="memberEmail${memberNumber}" required>
          </div>
          <div class="field">
            <label for="memberPhone${memberNumber}">Phone number</label>
            <input type="tel" id="memberPhone${memberNumber}" name="memberPhone${memberNumber}" required>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function validateApplicationThemeMatch() {
  const hackathon = getCurrentApplicationHackathon();
  const titleInput = document.getElementById("projectTitle");
  const feedback = document.getElementById("projectThemeFeedback");

  if (!titleInput || !feedback) return;

  const title = titleInput.value.trim();

  if (!title) {
    feedback.textContent = "";
    feedback.classList.remove("is-warning", "is-success");
    return;
  }

  const normalizedTitle = normalizeThemeText(title);
  const titleWords = normalizedTitle.split(" ").filter(Boolean);
  const themeTerms = buildThemeKeywords([hackathon?.category || "", ...(hackathon?.tracks || [])]);

  if (titleWords.length < 2 || normalizedTitle.length < 8 || !themeTerms.length) {
    feedback.textContent = "";
    feedback.classList.remove("is-warning", "is-success");
    return;
  }

  const matchesTheme = themeTerms.some((term) => {
    if (term.includes(" ")) {
      return normalizedTitle.includes(term);
    }
    return titleWords.includes(term);
  });

  feedback.classList.toggle("is-warning", !matchesTheme);
  feedback.classList.toggle("is-success", matchesTheme);
  feedback.textContent = matchesTheme
    ? "Project title looks aligned with this hackathon's tracks."
    : "Project title doesn't match this hackathon's tracks yet.";
}

function buildThemeKeywords(values) {
  const aliasMap = {
    ai: ["ml", "machine learning", "llm", "genai", "model", "prediction", "assistant"],
    "generative ai": ["genai", "llm", "copilot", "chatbot", "generator"],
    healthtech: ["health", "medical", "clinic", "patient", "doctor", "care", "hospital", "wellness"],
    edtech: ["education", "learning", "student", "teacher", "classroom", "course"],
    climate: ["climate", "carbon", "energy", "sustainability", "green"],
    defi: ["wallet", "payment", "swap", "token", "finance", "trading"],
    infra: ["infrastructure", "developer", "protocol", "scaling", "network"],
    security: ["secure", "fraud", "privacy", "auth", "encryption"],
    accessibility: ["accessible", "screen reader", "inclusion", "disability"],
    "systems thinking": ["system", "workflow", "process", "operations"],
    "product ui": ["ui", "ux", "interface", "dashboard"],
    "design ops": ["design system", "component", "handoff", "design workflow"],
    diagnostics: ["diagnosis", "screening", "detection", "symptom"],
    "patient experience": ["patient", "care", "hospital", "visit"],
    "clinical workflow": ["clinic", "clinical", "workflow", "doctor", "nurse"],
    "public health": ["community", "public", "population", "health"]
  };
  const stopWords = new Set(["and", "for", "the", "with", "to", "of"]);
  const normalizedValues = values
    .map((value) => normalizeThemeText(value))
    .filter(Boolean);
  const keywords = new Set();

  normalizedValues.forEach((value) => {
    keywords.add(value);
    value.split(" ").forEach((word) => {
      if (word.length > 2 && !stopWords.has(word)) {
        keywords.add(word);
      }
    });

    Object.entries(aliasMap).forEach(([source, aliases]) => {
      if (value.includes(source)) {
        aliases.forEach((alias) => keywords.add(normalizeThemeText(alias)));
      }
    });
  });

  return Array.from(keywords);
}

function normalizeThemeText(value) {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function splitFullName(fullName) {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return { firstName: "", middleName: "", surname: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], middleName: "", surname: "" };
  }
  if (parts.length === 2) {
    return { firstName: parts[0], middleName: "", surname: parts[1] };
  }
  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(" "),
    surname: parts[parts.length - 1]
  };
}

function resetApplicationForm() {
  document.getElementById("hackathonApplicationForm")?.reset();
  document.getElementById("projectThemeFeedback")?.replaceChildren();
  document.getElementById("projectThemeFeedback")?.classList.remove("is-warning", "is-success");
  document.getElementById("applicationMembersContainer").innerHTML = "";
}

// Modular functions are now in modules/profile.js, modules/chat.js, modules/teammates.js, modules/search.js
// All functions are called from their respective modules during initialization
