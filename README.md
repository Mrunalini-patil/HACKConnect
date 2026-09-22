# HackConnect

HackConnect is a full-stack platform designed to help students, developers, and creators discover peer teammates and collaborate effectively for hackathons and coding competitions.

---

## Key Features

* **User Authentication:** Secure sign-up and login workflows for managing user profiles.
* **Teammate Discovery & Search:** Filter and search for potential teammates based on technical skills and project roles.
* **Interactive Dashboard:** Access project activities, team invites, and collaboration metrics in one place.
* **Messaging & Communication:** Real-time chat module for seamless team coordination.
* **Profile Customization:** Showcase developer profiles, technical skill sets, and social links.

---

## Tech Stack

* **Frontend:** HTML5, CSS3 (Modular Layouts & Page Styles), JavaScript (ES6+ Modules)
* **Backend & Logic:** Custom JavaScript module controllers (`auth.js`, `search.js`, `chat.js`, `teammates.js`)
* **Styling:** CSS Component Architecture (`components.css`, `layout.css`, page-specific stylesheets)

---

## Project Structure

```text
HackConnect/
├── index.html           # Landing page
├── login.html           # Authentication / Login page
├── signup.html          # Registration page
├── dashboard.html       # Main user portal
├── profile.html         # User profile configuration
├── README.md            # Project documentation
└── js/                  # JavaScript logic & asset organization
    ├── main.js          # Main application entry point
    ├── auth.js          # Authentication handlers
    ├── utils.js         # Helper functions
    ├── css/             # Stylesheet architecture
    │   ├── main.css
    │   ├── layout.css
    │   ├── components.css
    │   └── pages/       # Page-specific styling
    └── modules/         # Core application features
        ├── chat.js
        ├── profile.js
        ├── search.js
        └── teammates.js
