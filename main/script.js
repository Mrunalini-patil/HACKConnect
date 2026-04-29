document.addEventListener('DOMContentLoaded', function () {
  const page = document.body.dataset.page;
  if (page === 'login') {
    initLoginPage();
  } else if (page === 'signup') {
    initSignupPage();
  } else {
    initIndexPage();
  }
});

function initIndexPage() {
  const seeFeaturesBtn = document.querySelector('a[href="#features"]');
  if (seeFeaturesBtn) {
    seeFeaturesBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const featuresSection = document.getElementById('features');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach(card => {
    card.addEventListener('click', function() {
      this.classList.toggle('clicked');
      setTimeout(() => {
        this.classList.remove('clicked');
      }, 200);
    });
  });
}

function initLoginPage() {
  const identifier = document.getElementById('identifier');
  const password = document.getElementById('password');
  const identifierErr = document.getElementById('identifierErr');
  const passwordErr = document.getElementById('passwordErr');
  const togglePw = document.getElementById('togglePw');
  const socialButtons = document.querySelectorAll('.social-btn');

  if (togglePw) {
    togglePw.addEventListener('click', function() {
      const currentType = password.getAttribute('type');
      password.setAttribute('type', currentType === 'password' ? 'text' : 'password');
      this.textContent = currentType === 'password' ? '🙈' : '👁';
    });
  }

  socialButtons.forEach(button => {
    button.addEventListener('click', function() {
      const provider = this.dataset.provider || 'social';
      alert(`Continue with ${provider}. This is a demo flow, so no account is created.`);
      window.location.href = 'dashboard.html';
    });
  });

  if (identifier) {
    identifier.addEventListener('input', () => {
      identifier.classList.remove('error');
      identifierErr.textContent = '';
    });
  }

  if (password) {
    password.addEventListener('input', () => {
      password.classList.remove('error');
      passwordErr.textContent = '';
    });
  }
}

function initSignupPage() {
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      if (name && email && password && confirmPassword) {
        if (password === confirmPassword) {
          alert('Sign up successful! Welcome to HackConnect.');
          window.location.href = 'dashboard.html';
        } else {
          alert('Passwords do not match.');
        }
      } else {
        alert('Please fill in all fields.');
      }
    });
  }
}

function handleLogin() {
  const identifier = document.getElementById('identifier');
  const password = document.getElementById('password');
  const identifierErr = document.getElementById('identifierErr');
  const passwordErr = document.getElementById('passwordErr');

  let hasError = false;
  identifierErr.textContent = '';
  passwordErr.textContent = '';
  identifier.classList.remove('error');
  password.classList.remove('error');

  if (!identifier.value.trim()) {
    identifier.classList.add('error');
    identifierErr.textContent = 'Enter your email or username.';
    hasError = true;
  }

  if (!password.value) {
    password.classList.add('error');
    passwordErr.textContent = 'Enter your password.';
    hasError = true;
  }

  if (hasError) {
    return;
  }

  if (password.value.toLowerCase() === 'wrong') {
    password.classList.add('error');
    passwordErr.textContent = 'That password looks incorrect. Try again.';
    return;
  }

  alert('Welcome back! You are now logged in to HackConnect.');
  window.location.href = 'dashboard.html';
}

function handleForgot() {
  alert('Password reset instructions would be sent to your email in a real app.');
}

