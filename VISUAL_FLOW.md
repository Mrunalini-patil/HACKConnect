# Visual Flow Diagram

## 🔄 Complete Connection & Team Building Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER A (Team Leader)                          │
└─────────────────────────────────────────────────────────────────────┘

STEP 1: DISCOVER & REQUEST
┌────────────────────────────────────────┐
│  📋 Discover Teammates                 │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  👤 User B                        │ │
│  │  Full-stack Developer             │ │
│  │  [Send Request]  [View Profile]   │ │ ← Click "Send Request"
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
                    ↓
                    ↓ (Request Sent)
                    ↓
┌────────────────────────────────────────┐
│  ┌──────────────────────────────────┐ │
│  │  👤 User B                        │ │
│  │  Full-stack Developer             │ │
│  │  [Pending]  [View Profile]        │ │ ← Status: Pending
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘

───────────────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────────────┐
│                        USER B (Receiving Request)                    │
└─────────────────────────────────────────────────────────────────────┘

STEP 2: RECEIVE & ACCEPT
┌────────────────────────────────────────┐
│  🔔 Requests (Incoming)                │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  👤 User A                        │ │
│  │  Product Designer                 │ │
│  │  [Accept] [Reject] [View Profile] │ │ ← Click "Accept"
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
                    ↓
                    ↓ (Accepted)
                    ↓
┌────────────────────────────────────────┐
│  🤝 Connections                        │
│                                        │
│  ✨ You are the team leader.           │
│     You can add connections to team.  │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  👤 User A                        │ │
│  │  Product Designer                 │ │
│  │  [Add to Team]  [View Profile]    │ │ ← Now available
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘

───────────────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────────────┐
│                        USER A (Back to Leader)                       │
└─────────────────────────────────────────────────────────────────────┘

STEP 3: VIEW CONNECTIONS & ADD TO TEAM
┌────────────────────────────────────────┐
│  🤝 Connections                        │
│                                        │
│  ✨ You are the team leader.           │
│     You can add connections to team.  │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  👤 User B                        │ │
│  │  Full-stack Developer             │ │
│  │  [Add to Team]  [View Profile]    │ │ ← Click "Add to Team"
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
                    ↓
                    ↓ (Added to Team)
                    ↓
STEP 4: MANAGE TEAM
┌────────────────────────────────────────┐
│  👥 My Team                            │
│                                        │
│  ✨ You are the team leader.           │
│     You can manage team members.      │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  👤 User B                        │ │
│  │  Full-stack Developer             │ │
│  │  [Remove]  [View Profile]         │ │ ← Can remove if needed
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════

## 🎨 Button State Legend

┌─────────────────────────────────────────────────────────────────────┐
│  STATE              │  COLOR    │  CONTEXT                          │
├─────────────────────┼───────────┼───────────────────────────────────┤
│  Send Request       │  🟢 Green │  Available to send                │
│  Pending            │  ⚪ Gray  │  Request sent, waiting            │
│  Accept             │  🟢 Green │  Accept incoming request          │
│  Reject             │  🔴 Red   │  Reject incoming request          │
│  Add to Team        │  🟢 Green │  Add connection (leader only)     │
│  Remove             │  🔴 Red   │  Remove member (leader only)      │
│  Connected          │  ⚪ Gray  │  Already in connections           │
│  In Team            │  ⚪ Gray  │  Already a team member            │
│  Leader Only        │  ⚪ Gray  │  Non-leader restricted            │
│  View Profile       │  ⚪ Ghost │  Open profile modal               │
└─────────────────────┴───────────┴───────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════

## 📊 Status Transitions

```
      DISCOVER
          │
          ↓ [Send Request]
      PENDING ─────────────────────┐
          │                        │
          │                   [Reject]
          ↓ [Accept]               │
     CONNECTION ←──────────────────┘
          │
          ↓ [Add to Team] (Leader Only)
      IN TEAM
          │
          ↓ [Remove] (Leader Only)
     CONNECTION
```

═══════════════════════════════════════════════════════════════════════

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER (LocalStorage)                    │
├─────────────────────────────────────────────────────────────────────┤
│  • sentRequests: []      → Requests current user sent               │
│  • receivedRequests: []  → Requests current user received           │
│  • connections: []       → Accepted connections                     │
│  • myTeam: []           → Team member IDs                           │
│  • teamLeader: ""       → Current team leader ID                    │
└─────────────────────────────────────────────────────────────────────┘
                                  ↕
┌─────────────────────────────────────────────────────────────────────┐
│                         LOGIC LAYER (utils.js)                       │
├─────────────────────────────────────────────────────────────────────┤
│  • sendConnectionRequest()                                          │
│  • acceptConnectionRequest()                                        │
│  • rejectConnectionRequest()                                        │
│  • addToMyTeam()                                                    │
│  • removeFromMyTeam()                                               │
│  • isTeamLeader()                                                   │
└─────────────────────────────────────────────────────────────────────┘
                                  ↕
┌─────────────────────────────────────────────────────────────────────┐
│                      RENDER LAYER (teammates.js)                     │
├─────────────────────────────────────────────────────────────────────┤
│  • renderDiscoverTeammates()  → Discover page                       │
│  • renderIncomingRequests()   → Requests page                       │
│  • renderConnections()        → Connections page                    │
│  • renderMyTeam()             → My Team page                        │
└─────────────────────────────────────────────────────────────────────┘
                                  ↕
┌─────────────────────────────────────────────────────────────────────┐
│                          UI LAYER (HTML)                             │
├─────────────────────────────────────────────────────────────────────┤
│  • #teammatGrid       → Discover Teammates container                │
│  • #requestsGrid      → Requests container                          │
│  • #connectionsGrid   → Connections container                       │
│  • #myTeamGrid        → My Team container                           │
└─────────────────────────────────────────────────────────────────────┘
```

═══════════════════════════════════════════════════════════════════════

## 🎯 Permission Matrix

```
┌────────────────────┬──────────────┬──────────────┐
│      ACTION        │    LEADER    │  NON-LEADER  │
├────────────────────┼──────────────┼──────────────┤
│  Send Request      │      ✅      │      ✅      │
│  Accept Request    │      ✅      │      ✅      │
│  Reject Request    │      ✅      │      ✅      │
│  View Connections  │      ✅      │      ✅      │
│  Add to Team       │      ✅      │      ❌      │
│  Remove from Team  │      ✅      │      ❌      │
│  View Team         │      ✅      │      ✅      │
│  Manage Team       │      ✅      │      ❌      │
└────────────────────┴──────────────┴──────────────┘
```

═══════════════════════════════════════════════════════════════════════

## 🚀 Quick Start Guide

1. **Open your application:**
   - Navigate to: `/app/frontend/public/dashboard.html`
   - Log in with your account

2. **Test the flow:**
   ```
   Discover Teammates → Send Request → Pending
                 ↓
   Requests → Accept → Connections
                 ↓
   Connections → Add to Team → My Team
   ```

3. **Key Sections:**
   - 🔍 Discover Teammates (send requests)
   - 🔔 Requests (incoming requests)
   - 🤝 Connections (accepted connections)
   - 👥 My Team (team roster)

═══════════════════════════════════════════════════════════════════════

**✅ Implementation Complete!**
All files are ready in `/app/frontend/public/`
