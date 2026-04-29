document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "login") initLogin();
  if (page === "signup") initSignup();
});

function initLogin() {
  const form = document.getElementById("loginForm");
  const toggle = document.getElementById("togglePassword");
  const forgot = document.querySelector('[data-action="forgot-password"]');
  const socialButtons = document.querySelectorAll(".social-btn");

  toggle?.addEventListener("click", () => {
    const input = document.getElementById("password");
    const hidden = input.type === "password";
    input.type = hidden ? "text" : "password";
    toggle.textContent = hidden ? "Hide" : "Show";
  });

  forgot?.addEventListener("click", () => {
    HackConnectApp.showToast("Password reset is simulated in this demo.");
  });

  socialButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const account = HackConnectApp.getAccount();
      if (account) {
        HackConnectApp.setSession({ email: account.email, name: account.name });
        HackConnectApp.showToast(`Signed in with ${button.dataset.provider}.`);
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 450);
      } else {
        HackConnectApp.showToast("Create an account first so the demo has profile data to load.");
      }
    });
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const identifier = document.getElementById("identifier").value.trim();
    const password = document.getElementById("password").value;
    const account = HackConnectApp.getAccount();

    resetError("identifierErr");
    resetError("passwordErr");

    let hasError = false;
    if (!identifier) {
      setError("identifierErr", "Enter your email or username.");
      hasError = true;
    }
    if (!password) {
      setError("passwordErr", "Enter your password.");
      hasError = true;
    }
    if (hasError) return;

    if (!account) {
      setError("identifierErr", "No account found yet. Use sign up first.");
      return;
    }

    const matchesIdentity =
      identifier.toLowerCase() === account.email.toLowerCase() ||
      identifier.toLowerCase() === account.username.toLowerCase();

    if (!matchesIdentity || password !== account.password) {
      setError("passwordErr", "Those credentials do not match this demo account.");
      return;
    }

    HackConnectApp.setSession({ email: account.email, name: account.name });
    HackConnectApp.showToast("Welcome back to HackConnect.");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 450);
  });
}

function initSignup() {
  const form = document.getElementById("signupForm");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = {
      name: document.getElementById("name").value.trim(),
      username: document.getElementById("username").value.trim(),
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value,
      confirmPassword: document.getElementById("confirmPassword").value,
      role: document.getElementById("role").value,
      educationLevel: document.getElementById("educationLevel").value
    };

    ["nameErr", "usernameErr", "emailErr", "passwordErr", "confirmPasswordErr", "roleErr", "educationLevelErr"].forEach(resetError);

    let hasError = false;
    if (!values.name) hasError = setError("nameErr", "Enter your full name.") || hasError;
    if (!values.username) hasError = setError("usernameErr", "Choose a username.") || hasError;
    if (!values.email) hasError = setError("emailErr", "Enter your email.") || hasError;
    if (!values.password) hasError = setError("passwordErr", "Create a password.") || hasError;
    if (values.password && values.password.length < 6) hasError = setError("passwordErr", "Use at least 6 characters.") || hasError;
    if (values.confirmPassword !== values.password) hasError = setError("confirmPasswordErr", "Passwords must match.") || hasError;
    if (!values.role) hasError = setError("roleErr", "Select your role.") || hasError;
    if (!values.educationLevel) hasError = setError("educationLevelErr", "Select your education level.") || hasError;
    if (hasError) return;

    HackConnectApp.saveAccount(values);
    HackConnectApp.saveProfile({
      fullName: values.name,
      headline: values.role,
      emailContact: values.email
    });
    HackConnectApp.saveTeamMembership({
      active: false,
      joinedAs: "user"
    });
    HackConnectApp.setSession({ email: values.email, name: values.name });
    HackConnectApp.showToast("Account created. Complete your profile next.");
    setTimeout(() => {
      window.location.href = "profile.html";
    }, 500);
  });
}

function setError(id, message) {
  const element = document.getElementById(id);
  if (element) element.textContent = message;
  return true;
}

function resetError(id) {
  const element = document.getElementById(id);
  if (element) element.textContent = "";
}
