(function () {
  const STORAGE_KEYS = {
    account: "hackconnect-account",
    profile: "hackconnect-profile",
    session: "hackconnect-session",
    savedHackathons: "hackconnect-saved-hackathons",
    githubWorkspace: "hackconnect-github-workspace",
    myTeam: "hackconnect-my-team",
    sentRequests: "hackconnect-sent-requests",
    receivedRequests: "hackconnect-received-requests",
    connections: "hackconnect-connections",
    teamLeader: "hackconnect-team-leader",
    teamMembership: "hackconnect-team-membership",
    chatThreads: "hackconnect-chat-threads",
    chatNotifications: "hackconnect-chat-notifications"
  };

  const HACKATHONS = [
    {
      id: 1,
      title: "AI Hack Mumbai 2026",
      organizer: "OpenBuild Labs",
      category: "AI",
      mode: "Virtual",
      prize: "Rs 3,00,000",
      deadline: "April 12, 2026",
      description: "Build impactful AI products for education, healthcare, and climate resilience.",
      teamSize: "2 to 5 members",
      eligibility: "Students and early-career developers worldwide",
      tracks: ["Generative AI", "HealthTech", "EdTech", "Climate AI"],
      timeline: [
        { label: "Registration closes", value: "April 12, 2026" },
        { label: "Build sprint starts", value: "April 14, 2026" },
        { label: "Final demo day", value: "April 16, 2026" }
      ],
      contact: {
        email: "team@openbuildlabs.dev",
        discord: "discord.gg/openbuild",
        lead: "Anika Rao"
      }
    },
    {
      id: 2,
      title: "ETHIndia 2026",
      organizer: "Devfolio",
      category: "Web3",
      mode: "On-site � Bengaluru",
      prize: "$50,000",
      deadline: "April 18, 2026",
      description: "A high-energy web3 build sprint for teams shipping DeFi, DAO, and creator tooling.",
      teamSize: "1 to 4 members",
      eligibility: "Open to student and professional builders",
      tracks: ["DeFi", "Infra", "Consumer Web3", "Security"],
      timeline: [
        { label: "Applications close", value: "April 18, 2026" },
        { label: "Check-in", value: "April 25, 2026" },
        { label: "Final judging", value: "April 27, 2026" }
      ],
      contact: {
        email: "hello@devfolio.co",
        discord: "discord.gg/ethindia",
        lead: "Program Team"
      }
    },
    {
      id: 3,
      title: "Design Systems Sprint",
      organizer: "Pixel Guild",
      category: "Design",
      mode: "Hybrid",
      prize: "Rs 1,50,000",
      deadline: "April 26, 2026",
      description: "Prototype accessible, production-ready design systems for early-stage startups.",
      teamSize: "2 to 6 members",
      eligibility: "Designers, frontend developers, and product teams",
      tracks: ["Accessibility", "Systems Thinking", "Product UI", "Design Ops"],
      timeline: [
        { label: "Shortlist announcement", value: "April 28, 2026" },
        { label: "Workshop day", value: "May 1, 2026" },
        { label: "Submission deadline", value: "May 3, 2026" }
      ],
      contact: {
        email: "hello@pixelguild.design",
        discord: "discord.gg/pixelguild",
        lead: "Mira Thomas"
      }
    },
    {
      id: 4,
      title: "HealthTech Build Weekend",
      organizer: "CareStack Collective",
      category: "AI",
      mode: "On-site  Hyderabad",
      prize: "Rs 2,50,000",
      deadline: "May 2, 2026",
      description: "Create healthcare workflows, diagnostics, or patient-facing products with strong UX.",
      teamSize: "2 to 5 members",
      eligibility: "Students, clinicians, and builders interested in health innovation",
      tracks: ["Diagnostics", "Patient Experience", "Clinical Workflow", "Public Health"],
      timeline: [
        { label: "Registration deadline", value: "May 2, 2026" },
        { label: "Mentor matching", value: "May 7, 2026" },
        { label: "Pitch finals", value: "May 10, 2026" }
      ],
      contact: {
        email: "events@carestackcollective.org",
        discord: "discord.gg/carestack",
        lead: "Sanjay Mehta"
      }
    }
  ];

  const TEAMMATES = [
    {
      id: "riya-menon",
      name: "Riya Menon",
      role: "Product Designer",
      education: "B.Des in Interaction Design, MIT Institute of Design",
      experience: "Designed hackathon MVPs for health and civic-tech teams with a focus on UX research and fast prototyping.",
      achievements: "Winner of 2 student design sprints and mentor for campus product clubs.",
      skills: ["Figma", "UX Research", "Design Systems"],
      location: "Mumbai",
      interests: ["HealthTech", "AI", "CivicTech"],
      availability: "Weekends only",
      goal: "Looking for a frontend or AI teammate to launch a polished MVP.",
      educationProof: "riya-mit-degree.pdf",
      experienceProof: "riya-product-case-study.pdf",
      achievementProof: "riya-design-awards.pdf",
      email: "riya.menon@email.com",
      phone: "+91 98765 43210"
    },
    {
      id: "arjun-patel",
      name: "Arjun Patel",
      role: "Full-stack Developer",
      education: "B.Tech in Computer Science, RV College of Engineering",
      experience: "Built production-ready MERN apps, hackathon backends, and internal tooling for startup teams.",
      achievements: "Top 10 finalist at 3 national hackathons and maintainer of multiple open-source repos.",
      skills: ["React", "Node.js", "PostgreSQL"],
      location: "Bengaluru",
      interests: ["FinTech", "AI", "EdTech"],
      availability: "Full event availability",
      goal: "Enjoys building rapid prototypes with strong backend architecture.",
      educationProof: "arjun-btech-transcript.pdf",
      experienceProof: "arjun-startup-experience.pdf",
      achievementProof: "arjun-hackathon-certificates.pdf",
      email: "arjun.patel@email.com",
      phone: "+91 97654 32109"
    },
    {
      id: "sara-khan",
      name: "Sara Khan",
      role: "AI/ML Engineer",
      education: "M.Tech in Artificial Intelligence, Jamia Millia Islamia",
      experience: "Worked on model training pipelines, evaluation workflows, and AI demos for climate and health products.",
      achievements: "Published student research on applied ML and won an AI innovation challenge.",
      skills: ["Python", "PyTorch", "Data Pipelines"],
      location: "Delhi",
      interests: ["AI", "ClimateTech", "HealthTech"],
      availability: "Flexible",
      goal: "Wants teammates who can ship product and present a strong final demo.",
      educationProof: "sara-mtech-degree.pdf",
      experienceProof: "sara-ml-project-portfolio.pdf",
      achievementProof: "sara-ai-award.pdf",
      email: "sara.khan@email.com",
      phone: "+91 96543 21098"
    },
    {
      id: "dev-malhotra",
      name: "Dev Malhotra",
      role: "Blockchain Developer",
      education: "B.Tech in Information Technology, VNR VJIET",
      experience: "Shipped smart-contract demos, wallet integrations, and event-ready blockchain proof-of-concepts.",
      achievements: "Built shortlisted Web3 projects for ETHIndia and student startup showcases.",
      skills: ["Solidity", "Next.js", "Wallet Integrations"],
      location: "Hyderabad",
      interests: ["Web3", "Creator Economy", "Security"],
      availability: "Evenings and weekends",
      goal: "Searching for product-minded builders for serious web3 hackathons.",
      educationProof: "dev-it-degree.pdf",
      experienceProof: "dev-web3-projects.pdf",
      achievementProof: "dev-ethindia-shortlist.pdf",
      email: "dev.malhotra@email.com",
      phone: "+91 95432 10987"
    }
  ];

  const DEFAULT_GITHUB_WORKSPACE = {
    connected: false,
    provider: "GitHub",
    org: "hackconnect-team-alpha",
    repo: "hackconnect-hackathon-app",
    branch: "main",
    lastSync: null,
    stats: [
      { label: "Commits this week", value: "18", sub: "+5 since yesterday" },
      { label: "Open pull requests", value: "3", sub: "2 ready for review" },
      { label: "Open issues", value: "7", sub: "1 blocker tagged" },
      { label: "Deploy health", value: "Green", sub: "Production stable" }
    ],
    commits: [
      { title: "feat: add teammate workspace widgets", author: "Arjun", time: "12 minutes ago", branch: "feature/workspace" },
      { title: "fix: refine dashboard modal spacing", author: "Riya", time: "43 minutes ago", branch: "ui/polish" },
      { title: "chore: sync demo data for hackathon cards", author: "Sara", time: "1 hour ago", branch: "main" }
    ],
    pullRequests: [
      { title: "Add GitHub collaboration workspace", status: "In review", reviewer: "Riya", branch: "feature/github-workspace" },
      { title: "Refactor profile data persistence", status: "Changes requested", reviewer: "Arjun", branch: "refactor/profile-store" },
      { title: "Polish responsive dashboard cards", status: "Ready to merge", reviewer: "Sara", branch: "ui/responsive-cards" }
    ],
    issues: [
      { title: "Connect real GitHub OAuth flow", severity: "High", owner: "Backend", state: "Planned" },
      { title: "Add team chat thread to workspace", severity: "Medium", owner: "Product", state: "Backlog" },
      { title: "Review mobile repo status layout", severity: "Low", owner: "Design", state: "In progress" }
    ],
    branches: [
      { name: "main", state: "Protected", deploy: "Production � healthy" },
      { name: "feature/github-workspace", state: "Active", deploy: "Preview live" },
      { name: "ui/responsive-cards", state: "Active", deploy: "Preview queued" }
    ],
    tasks: [
      { lane: "Now", title: "Finish review on workspace PR", owner: "Riya" },
      { lane: "Next", title: "Prepare final hackathon demo script", owner: "Arjun" },
      { lane: "Blocked", title: "OAuth app approval for production", owner: "Admin" }
    ]
  };

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function normalizeList(input) {
    return (input || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function getAccount() {
    return loadJson(STORAGE_KEYS.account, null);
  }

  function saveAccount(account) {
    saveJson(STORAGE_KEYS.account, account);
  }

  function getCurrentUserId() {
    const account = getAccount();
    const profile = getProfile();
    return account?.username || account?.email || profile?.fullName || "current-user";
  }

  function getUserTeamRole() {
    const account = getAccount();
    const profile = getProfile();
    return account?.teamRole || profile?.teamRole || "user";
  }

  function getProfile() {
    return loadJson(STORAGE_KEYS.profile, null);
  }

  function saveProfile(profile) {
    saveJson(STORAGE_KEYS.profile, profile);
  }

  function setSession(session) {
    saveJson(STORAGE_KEYS.session, session);
  }

  function getSession() {
    return loadJson(STORAGE_KEYS.session, null);
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.session);
  }

  function getSavedHackathons() {
    return loadJson(STORAGE_KEYS.savedHackathons, []);
  }

  function saveSavedHackathons(list) {
    saveJson(STORAGE_KEYS.savedHackathons, list);
  }

  function getGithubWorkspace() {
    const stored = loadJson(STORAGE_KEYS.githubWorkspace, null);
    return stored ? stored : { ...DEFAULT_GITHUB_WORKSPACE };
  }

  function saveGithubWorkspace(workspace) {
    saveJson(STORAGE_KEYS.githubWorkspace, workspace);
  }

  function getMyTeam() {
    return loadJson(STORAGE_KEYS.myTeam, []);
  }

  function saveMyTeam(list) {
    saveJson(STORAGE_KEYS.myTeam, list);
  }

  function addToMyTeam(id) {
    const current = getMyTeam();
    if (current.includes(id)) return current;
    const next = [...current, id];
    saveMyTeam(next);
    const membership = getTeamMembership();
    saveTeamMembership({
      ...membership,
      active: true
    });
    return next;
  }

  function removeFromMyTeam(id) {
    const next = getMyTeam().filter((item) => item !== id);
    saveMyTeam(next);
    return next;
  }

  function getTeamMembership() {
    return loadJson(STORAGE_KEYS.teamMembership, {
      active: false,
      joinedAs: "user"
    });
  }

  function saveTeamMembership(membership) {
    saveJson(STORAGE_KEYS.teamMembership, membership);
  }

  function leaveCurrentTeam() {
    saveMyTeam([]);
    saveJson(STORAGE_KEYS.teamLeader, null);
    const role = getUserTeamRole();
    const nextMembership = {
      active: false,
      joinedAs: role
    };
    saveTeamMembership(nextMembership);
    return nextMembership;
  }

  function getMyTeamMembers() {
    const ids = new Set(getMyTeam());
    return TEAMMATES.filter((person) => ids.has(person.id));
  }

  function connectGithubWorkspace() {
    const current = getGithubWorkspace();
    const connectedWorkspace = {
      ...current,
      connected: true,
      lastSync: new Date().toLocaleString()
    };
    saveGithubWorkspace(connectedWorkspace);
    return connectedWorkspace;
  }

  function refreshGithubWorkspace() {
    const current = getGithubWorkspace();
    const refreshed = {
      ...current,
      connected: true,
      lastSync: new Date().toLocaleString(),
      stats: current.stats.map((item, index) => {
        if (index === 0) return { ...item, value: String(Number.parseInt(item.value, 10) + 1) };
        if (index === 1) return { ...item, sub: "1 ready to merge" };
        return item;
      }),
      commits: [
        { title: "sync: refresh workspace telemetry", author: "HackConnect Bot", time: "Just now", branch: current.branch || "main" },
        ...current.commits.slice(0, 2)
      ]
    };
    saveGithubWorkspace(refreshed);
    return refreshed;
  }

  function getProfileCompletion(profile) {
    if (!profile) return 0;
    const importantFields = [
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
    const filled = importantFields.filter((field) => String(profile[field] || "").trim()).length;
    const uploadCount = ["educationProof", "experienceProof", "achievementProof"].filter((key) => profile[key]).length;
    return Math.min(100, Math.round(((filled + uploadCount) / (importantFields.length + 3)) * 100));
  }

  function getRecommendedTeammates(profile) {
    if (!profile) return TEAMMATES.slice(0, 3);
    const profileSkills = normalizeList(profile.skills).map((item) => item.toLowerCase());
    const profileInterests = normalizeList(profile.interests).map((item) => item.toLowerCase());
    const preferredAvailability = (profile.availability || "").toLowerCase();

    return TEAMMATES.map((person) => {
      const skillScore = person.skills.filter((skill) => profileSkills.some((item) => skill.toLowerCase().includes(item) || item.includes(skill.toLowerCase()))).length;
      const interestScore = person.interests.filter((interest) => profileInterests.includes(interest.toLowerCase())).length;
      const availabilityScore = preferredAvailability && person.availability.toLowerCase() === preferredAvailability ? 1 : 0;
      return {
        ...person,
        score: skillScore * 2 + interestScore * 3 + availabilityScore
      };
    }).sort((a, b) => b.score - a.score);
  }

  function getRecommendedHackathons(profile, filter) {
    let results = HACKATHONS;
    if (filter && filter !== "all") {
      results = results.filter((item) => item.category === filter);
    }

    if (!profile) return results;

    const interests = normalizeList(profile.interests).map((item) => item.toLowerCase());
    const targets = normalizeList(profile.hackathons).map((item) => item.toLowerCase());

    return results
      .map((hackathon) => {
        let score = 0;

        // 1. Direct category match with interests (3 points)
        const categoryMatch = interests.some((item) => hackathon.category.toLowerCase().includes(item));
        if (categoryMatch) score += 3;

        // 2. Track match with interests (2 points per match)
        const matchedTracks = hackathon.tracks.filter((track) =>
          interests.some((interest) => track.toLowerCase().includes(interest))
        );
        score += matchedTracks.length * 2;

        // 3. Title keyword match with interests (2 points)
        const titleMatch = interests.some((item) => hackathon.title.toLowerCase().includes(item));
        if (titleMatch) score += 2;

        // 4. Description keyword match with interests (1 point per match, max 2)
        const descriptionMatches = interests.filter((item) =>
          hackathon.description.toLowerCase().includes(item)
        ).length;
        score += Math.min(descriptionMatches, 2);

        // 5. Target hackathon name match (4 points)
        const targetMatch = targets.some((item) => hackathon.title.toLowerCase().includes(item));
        if (targetMatch) score += 4;

        return { ...hackathon, score };
      })
      .sort((a, b) => b.score - a.score);
  }

  function showToast(message) {
    const container = document.getElementById("toastContainer");
    if (!container) {
      window.alert(message);
      return;
    }
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  }

  function requireSession() {
    if (!getSession()) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  }

  function logout() {
    clearSession();
    showToast("Logged out successfully.");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 400);
  }

  // Connection Request Management
  function getSentRequests() {
    return loadJson(STORAGE_KEYS.sentRequests, []);
  }

  function saveSentRequests(list) {
    saveJson(STORAGE_KEYS.sentRequests, list);
  }

  function getReceivedRequests() {
    return loadJson(STORAGE_KEYS.receivedRequests, []);
  }

  function saveReceivedRequests(list) {
    saveJson(STORAGE_KEYS.receivedRequests, list);
  }

  function getConnections() {
    return loadJson(STORAGE_KEYS.connections, []);
  }

  function saveConnections(list) {
    saveJson(STORAGE_KEYS.connections, list);
  }

  function sendConnectionRequest(userId) {
    const sent = getSentRequests();
    if (!sent.includes(userId)) {
      sent.push(userId);
      saveSentRequests(sent);
    }
    return sent;
  }

  function acceptConnectionRequest(userId) {
    const received = getReceivedRequests().filter(id => id !== userId);
    saveReceivedRequests(received);

    const sent = getSentRequests().filter(id => id !== userId);
    saveSentRequests(sent);

    const connections = getConnections();
    if (!connections.includes(userId)) {
      connections.push(userId);
      saveConnections(connections);
    }

    return connections;
  }

  function rejectConnectionRequest(userId) {
    const received = getReceivedRequests().filter(id => id !== userId);
    saveReceivedRequests(received);
    return received;
  }

  function removeConnection(userId) {
    const connections = getConnections().filter(id => id !== userId);
    saveConnections(connections);
    return connections;
  }

  // Team Leader Management
  function getTeamLeader() {
    return loadJson(STORAGE_KEYS.teamLeader, null);
  }

  function setTeamLeader(userId) {
    saveJson(STORAGE_KEYS.teamLeader, userId);
  }

  function isTeamLeader() {
    const role = getUserTeamRole();
    if (role !== "leader") return false;

    const leader = getTeamLeader();

    if (!leader) {
      setTeamLeader(getCurrentUserId());
      return true;
    }

    return leader === getCurrentUserId();
  }

  function canLeaveTeam() {
    const role = getUserTeamRole();
    const membership = getTeamMembership();
    return role === "member" && membership.active;
  }

  function getChatThreads() {
    return loadJson(STORAGE_KEYS.chatThreads, {});
  }

  function saveChatThreads(threads) {
    saveJson(STORAGE_KEYS.chatThreads, threads);
  }

  function getChatNotifications() {
    return loadJson(STORAGE_KEYS.chatNotifications, []);
  }

  function saveChatNotifications(notifications) {
    saveJson(STORAGE_KEYS.chatNotifications, notifications);
  }

  window.HackConnectApp = {
    STORAGE_KEYS,
    HACKATHONS,
    TEAMMATES,
    DEFAULT_GITHUB_WORKSPACE,
    loadJson,
    saveJson,
    normalizeList,
    getAccount,
    saveAccount,
    getCurrentUserId,
    getUserTeamRole,
    getProfile,
    saveProfile,
    setSession,
    getSession,
    clearSession,
    getSavedHackathons,
    saveSavedHackathons,
    getGithubWorkspace,
    saveGithubWorkspace,
    connectGithubWorkspace,
    refreshGithubWorkspace,
    getMyTeam,
    saveMyTeam,
    addToMyTeam,
    removeFromMyTeam,
    getMyTeamMembers,
    getTeamMembership,
    saveTeamMembership,
    leaveCurrentTeam,
    getProfileCompletion,
    getRecommendedTeammates,
    getRecommendedHackathons,
    showToast,
    requireSession,
    logout,
    getSentRequests,
    saveSentRequests,
    getReceivedRequests,
    saveReceivedRequests,
    getConnections,
    saveConnections,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    removeConnection,
    getTeamLeader,
    setTeamLeader,
    isTeamLeader,
    canLeaveTeam,
    getChatThreads,
    saveChatThreads,
    getChatNotifications,
    saveChatNotifications
  };
}());
