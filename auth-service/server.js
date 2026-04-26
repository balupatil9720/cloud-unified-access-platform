const express = require('express')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const fs = require('fs')

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const SECRET = "mysecretkey"
const PUBLIC_IP = "13.234.240.222"

// -------------------------
// 📂 USER STORAGE
// -------------------------
const USERS_FILE = 'users.json'

if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]))
}

function getUsers() {
    return JSON.parse(fs.readFileSync(USERS_FILE))
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

// -------------------------
// 🔐 VALIDATION
// -------------------------
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPassword(password) {
    return password.length >= 6
}

// -------------------------
// 🔐 AUTH MIDDLEWARE
// -------------------------
function authenticate(req, res, next) {
    const cookie = req.headers.cookie
    if (!cookie) return res.redirect('/')

    const match = cookie.match(/token=([^;]+)/)
    if (!match) return res.redirect('/')

    const token = match[1]

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) return res.redirect('/')
        req.user = decoded
        next()
    })
}

// -------------------------
// 🖥️ LOGIN + SIGNUP UI
// -------------------------
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WCE Mini Cloud | Login</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:'Inter',system-ui,sans-serif}
body{background:#f4f6fb;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:1rem}
.card{background:#fff;border:0.5px solid #dde1ea;border-radius:16px;padding:2.5rem 2rem;width:100%;max-width:400px}
.logo{width:40px;height:40px;background:#042C53;border-radius:10px;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem}
.logo svg{width:20px;height:20px;fill:#fff}
h1{font-size:20px;font-weight:600;text-align:center;color:#111;margin-bottom:2px}
.sub{font-size:12px;text-align:center;color:#6b7280;margin-bottom:1.5rem}
.field{position:relative;margin-bottom:.75rem}
.field input{width:100%;padding:10px 12px;border:0.5px solid #dde1ea;border-radius:9px;font-size:14px;color:#111;background:#fafafa;outline:none;transition:border-color .15s}
.field input:focus{border-color:#378ADD;background:#fff}
.field input::placeholder{color:#9ca3af}
.btn{width:100%;padding:11px;background:#042C53;color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:500;cursor:pointer;transition:opacity .15s}
.btn:hover{opacity:.88}
.toggle{text-align:center;font-size:13px;color:#6b7280;margin-top:1.25rem}
.toggle a{color:#185FA5;font-weight:500;text-decoration:none}
.popup{margin-top:1rem;padding:10px;border-radius:8px;font-size:13px;text-align:center;display:none}
.popup.err{background:#FCEBEB;color:#A32D2D;display:block}
.popup.ok{background:#EAF3DE;color:#3B6D11;display:block}
.footer-note{text-align:center;font-size:11px;color:#9ca3af;margin-top:1.5rem;padding-top:1rem;border-top:0.5px solid #eee}
</style>
</head>
<body>
<div class="card">
  <div class="logo">
    <svg viewBox="0 0 24 24"><path d="M3 15a4 4 0 004 4h9a5 5 0 10-4.584-7H6a3 3 0 000 6z" fill-rule="evenodd"/></svg>
  </div>
  <h1>WCE Mini Cloud</h1>
  <p class="sub">Walchand College of Engineering, Sangli</p>

  <form id="loginForm">
    <div class="field"><input type="email" name="email" placeholder="University email" required></div>
    <div class="field"><input type="password" name="password" placeholder="Password" required></div>
    <button type="submit" class="btn">Login to portal</button>
  </form>

  <form id="signupForm" style="display:none">
    <div class="field"><input type="email" name="email" placeholder="University email" required></div>
    <div class="field"><input type="password" name="password" placeholder="Password (min 6 characters)" required></div>
    <button type="submit" class="btn">Create account</button>
  </form>

  <p class="toggle">
    <span id="toggleText">Don't have an account?</span>
    <a href="#" id="toggleLink"> Sign up</a>
  </p>
  <div id="popup" class="popup"></div>
  <p class="footer-note">Secured access · Authorized users only</p>
</div>

<script>
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const toggleLink = document.getElementById('toggleLink');
const toggleText = document.getElementById('toggleText');
const popup = document.getElementById('popup');
let isLogin = true;

function showMsg(msg, ok) {
  popup.textContent = msg;
  popup.className = 'popup ' + (ok ? 'ok' : 'err');
  setTimeout(() => { popup.className = 'popup'; }, 3000);
}

toggleLink.onclick = (e) => {
  e.preventDefault();
  isLogin = !isLogin;
  loginForm.style.display = isLogin ? '' : 'none';
  signupForm.style.display = isLogin ? 'none' : '';
  toggleText.textContent = isLogin ? "Don't have an account?" : "Already have an account?";
  toggleLink.textContent = isLogin ? ' Sign up' : ' Login';
  popup.className = 'popup';
};

loginForm.onsubmit = async (e) => {
  e.preventDefault();
  const res = await fetch('/login', { method: 'POST', body: new URLSearchParams(new FormData(loginForm)) });
  if (res.redirected) { window.location = res.url; }
  else { showMsg(await res.text(), false); }
};

signupForm.onsubmit = async (e) => {
  e.preventDefault();
  const res = await fetch('/signup', { method: 'POST', body: new URLSearchParams(new FormData(signupForm)) });
  const text = await res.text();
  showMsg(text, text.includes('successful'));
  if (text.includes('successful')) setTimeout(() => toggleLink.click(), 1500);
};
</script>
</body>
</html>
    `)
})

// -------------------------
// 📝 SIGNUP
// -------------------------
app.post('/signup', (req, res) => {
    const { email, password } = req.body

    if (!isValidEmail(email)) {
        return res.send("Invalid email format")
    }

    if (!isValidPassword(password)) {
        return res.send("Password must be at least 6 characters")
    }

    let users = getUsers()

    if (users.find(u => u.email === email)) {
        return res.send("User already exists")
    }

    users.push({ email, password })
    saveUsers(users)

    res.send("Signup successful! Please login.")
})

// -------------------------
// 🔑 LOGIN
// -------------------------
app.post('/login', (req, res) => {
    const { email, password } = req.body

    let users = getUsers()

    const user = users.find(u => u.email === email && u.password === password)

    if (!user) {
        return res.send("Invalid credentials")
    }

    const token = jwt.sign({ email }, SECRET, { expiresIn: '1h' })

    res.setHeader("Set-Cookie", `token=${token}; Path=/; HttpOnly`)
    res.redirect('/dashboard')
})

// -------------------------
// 📊 DASHBOARD
// -------------------------
app.get('/dashboard', authenticate, (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WCE Dashboard</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:'Inter',system-ui,sans-serif}
body{background:#f4f6fb;color:#111;min-height:100vh}
.nav{background:#fff;border-bottom:0.5px solid #dde1ea;padding:0 2rem;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}
.nav-brand{display:flex;align-items:center;gap:10px}
.nav-icon{width:36px;height:36px;border-radius:9px;background:#042C53;display:flex;align-items:center;justify-content:center}
.nav-icon svg{width:18px;height:18px;fill:#fff}
.brand-name{font-size:15px;font-weight:600;color:#111}
.brand-sub{font-size:11px;color:#6b7280}
.nav-right{display:flex;align-items:center;gap:10px}
.user-pill{background:#f4f6fb;border:0.5px solid #dde1ea;border-radius:20px;padding:6px 14px;font-size:12px;color:#374151;display:flex;align-items:center;gap:7px}
.user-dot{width:7px;height:7px;border-radius:50%;background:#1D9E75}
.logout-btn{background:#fff;border:0.5px solid #dde1ea;color:#374151;border-radius:8px;padding:7px 14px;font-size:12px;cursor:pointer;text-decoration:none;transition:border-color .15s,color .15s}
.logout-btn:hover{border-color:#E24B4A;color:#A32D2D}
.main{max-width:860px;margin:0 auto;padding:2rem 1.5rem}
.welcome-row{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:2rem;gap:1rem;flex-wrap:wrap}
.welcome-label{font-size:11px;font-weight:500;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
.welcome-name{font-size:26px;font-weight:600;color:#111}
.welcome-sub{font-size:13px;color:#6b7280;margin-top:4px}
.date-badge{background:#fff;border:0.5px solid #dde1ea;border-radius:8px;padding:8px 14px;font-size:12px;color:#6b7280;white-space:nowrap}
.cards-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem;margin-bottom:2rem}
.service-card{background:#fff;border:0.5px solid #dde1ea;border-radius:14px;overflow:hidden;transition:border-color .2s,box-shadow .2s}
.service-card:hover{border-color:#aab4c9;box-shadow:0 4px 16px rgba(0,0,0,.06)}
.card-accent{height:3px}
.card-accent.blue{background:#378ADD}.card-accent.purple{background:#7F77DD}.card-accent.teal{background:#1D9E75}
.card-body{padding:1.25rem}
.card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem}
.card-icon{width:40px;height:40px;border-radius:9px;display:flex;align-items:center;justify-content:center}
.card-icon.blue{background:#E6F1FB}.card-icon.purple{background:#EEEDFE}.card-icon.teal{background:#E1F5EE}
.card-icon svg{width:20px;height:20px;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;fill:none}
.card-icon.blue svg{stroke:#185FA5}.card-icon.purple svg{stroke:#534AB7}.card-icon.teal svg{stroke:#0F6E56}
.status-badge{font-size:11px;padding:3px 10px;border-radius:20px;font-weight:500}
.status-badge.active{background:#EAF3DE;color:#3B6D11}
.status-badge.lms{background:#EEEDFE;color:#534AB7}
.status-badge.analytics{background:#E1F5EE;color:#0F6E56}
.card-title{font-size:17px;font-weight:600;margin-bottom:2px;color:#111}
.card-subtitle{font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.75rem}
.card-desc{font-size:13px;color:#6b7280;line-height:1.6;margin-bottom:1.25rem}
.launch-btn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:9px 0;border-radius:8px;font-size:13px;font-weight:500;border:0.5px solid #dde1ea;background:#fafafa;color:#374151;text-decoration:none;transition:background .15s,border-color .15s}
.launch-btn:hover{border-color:#aab4c9;background:#fff}
.launch-btn svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;opacity:.55}
.section-divider{border:none;border-top:0.5px solid #dde1ea;margin:0 0 1.5rem}
.section-label{font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.08em;color:#6b7280;margin-bottom:1rem}
.resources-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;margin-bottom:2rem}
.resource-item{background:#fff;border:0.5px solid #dde1ea;border-radius:8px;padding:10px 14px;display:flex;align-items:center;gap:10px;font-size:13px;color:#374151}
.resource-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.footer{display:flex;justify-content:space-between;font-size:11px;color:#9ca3af;padding-top:1rem;border-top:0.5px solid #dde1ea;flex-wrap:wrap;gap:.5rem}
</style>
</head>
<body>

<nav class="nav">
  <div class="nav-brand">
    <div class="nav-icon">
      <svg viewBox="0 0 24 24"><path d="M3 15a4 4 0 004 4h9a5 5 0 10-4.584-7H6a3 3 0 000 6z" fill-rule="evenodd"/></svg>
    </div>
    <div>
      <div class="brand-name">WCE Mini Cloud</div>
      <div class="brand-sub">Walchand College of Engineering, Sangli</div>
    </div>
  </div>
  <div class="nav-right">
    <div class="user-pill">
      <span class="user-dot"></span>
      <span>${req.user.email}</span>
    </div>
    <a href="/logout" class="logout-btn">Sign out</a>
  </div>
</nav>

<main class="main">
  <div class="welcome-row">
    <div>
      <div class="welcome-label">Student portal</div>
      <div class="welcome-name">Welcome, ${req.user.email.split('@')[0]}</div>
      <div class="welcome-sub">Access your academic and administrative tools below</div>
    </div>
    <div class="date-badge" id="liveDate"></div>
  </div>

  <div class="cards-grid">
    <div class="service-card">
      <div class="card-accent blue"></div>
      <div class="card-body">
        <div class="card-header">
          <div class="card-icon blue">
            <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          </div>
          <span class="status-badge active">Active</span>
        </div>
        <div class="card-title">Odoo</div>
        <div class="card-subtitle">ERP Suite</div>
        <div class="card-desc">Academic management, attendance tracking, finance, and inventory control.</div>
        <a href="http://${PUBLIC_IP}:8069" target="_blank" rel="noopener noreferrer" class="launch-btn">
          Launch Odoo
          <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>
    </div>

    <div class="service-card">
      <div class="card-accent purple"></div>
      <div class="card-body">
        <div class="card-header">
          <div class="card-icon purple">
            <svg viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <span class="status-badge lms">LMS</span>
        </div>
        <div class="card-title">Moodle</div>
        <div class="card-subtitle">Learning Platform</div>
        <div class="card-desc">Courses, assignments, quizzes, and virtual classroom collaboration.</div>
        <a href="http://${PUBLIC_IP}:8080" target="_blank" rel="noopener noreferrer" class="launch-btn">
          Open Moodle
          <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>
    </div>

    <div class="service-card">
      <div class="card-accent teal"></div>
      <div class="card-body">
        <div class="card-header">
          <div class="card-icon teal">
            <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <span class="status-badge analytics">Analytics</span>
        </div>
        <div class="card-title">ERPNext</div>
        <div class="card-subtitle">Next-gen ERP</div>
        <div class="card-desc">HR, project tracking, real-time dashboards, and resource planning.</div>
        <a href="http://${PUBLIC_IP}:8090" target="_blank" rel="noopener noreferrer" class="launch-btn">
          Access ERPNext
          <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>
    </div>
  </div>

  <hr class="section-divider">
  <div class="section-label">Campus digital ecosystem</div>
  <div class="resources-grid">
    <div class="resource-item"><span class="resource-dot" style="background:#378ADD"></span>Student Webmail</div>
    <div class="resource-item"><span class="resource-dot" style="background:#7F77DD"></span>Digital Library</div>
    <div class="resource-item"><span class="resource-dot" style="background:#EF9F27"></span>Attendance Hub</div>
    <div class="resource-item"><span class="resource-dot" style="background:#1D9E75"></span>ID Card Services</div>
  </div>

  <div class="footer">
    <span>© 2025 Walchand College of Engineering, Sangli</span>
    <span>Secure authenticated access</span>
  </div>
</main>

<script>
  const d = new Date();
  document.getElementById('liveDate').textContent = d.toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
</script>
</body>
</html>
    `)
})

// -------------------------
// 🚪 LOGOUT
// -------------------------
app.get('/logout', (req, res) => {
    res.setHeader("Set-Cookie", "token=; Path=/; Max-Age=0")
    res.redirect('/')
})

app.listen(3000, () => console.log("Auth service running on port 3000"))