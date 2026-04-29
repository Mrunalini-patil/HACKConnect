/**
 * Search Module - Handles all search and filter interactions
 * Manages teammate search, hackathon search, skill filters, and track search
 */

let teammatCurrentFilter = "all";
let teammatSearchQuery = "";
let trackedQuery = "";

function initSearchHandlers() {
  // Teammate filter chips
  document.querySelectorAll(".teammat-filter-chip").forEach((chip) => {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".teammat-filter-chip").forEach((c) => c.classList.remove("active"));
      this.classList.add("active");
      teammatCurrentFilter = this.dataset.filter || "all";
      renderTeammatesGrid(null, teammatCurrentFilter, teammatSearchQuery);
    });
  });

  // Teammate search input
  document.getElementById("teammatSearch")?.addEventListener("input", (e) => {
    teammatSearchQuery = e.target.value;
    renderTeammatesGrid(null, teammatCurrentFilter, teammatSearchQuery);
  });

  // Hackathon search input
  document.getElementById("dashboardSearch")?.addEventListener("input", (e) => {
    const query = e.target.value;
    renderHackathonGrid(null, "all", "hackathonGrid", query, trackedQuery);
  });

  // Track search input
  document.getElementById("trackSearch")?.addEventListener("input", (e) => {
    const trackQuery = e.target.value;
    trackedQuery = trackQuery;
    renderHackathonGrid(null, "all", "hackathonGrid", "", trackedQuery);
    
    // Show/hide clear button
    const clearBtn = document.getElementById("clearTrackSearch");
    if (clearBtn) {
      clearBtn.style.display = trackQuery ? "block" : "none";
    }
  });

  // Clear track search
  document.getElementById("clearTrackSearch")?.addEventListener("click", () => {
    document.getElementById("trackSearch").value = "";
    trackedQuery = "";
    renderHackathonGrid(null, "all", "hackathonGrid", "", "");
    document.getElementById("clearTrackSearch").style.display = "none";
  });
}
