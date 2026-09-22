(function(){
  // =========================================================
  // CONFIGURATION OF THE EMAIL SECTION USING https://formspree.io
  // =========================================================
  const CONFIG = {
    FORMSPREE_ENDPOINT: 'https://formspree.io/f/xppwdkaz',
    ADMIN_EMAIL: 'ndzanarodrigue6@gmail.com'
  };

  const CV_PATH = 'images/Rodrigue_Ndzana_CV.pdf';

  // ---- Loading screen ----
  const loadingScreen = document.getElementById('loadingScreen');
  function hideLoadingScreen(){
    if(!loadingScreen) return;
    loadingScreen.classList.add('hidden');
    setTimeout(() => { loadingScreen.remove(); }, 800);
  }
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const minDisplay = reducedMotionQuery.matches ? 0 : 2600;
  const loadStart = Date.now();
  window.addEventListener('load', () => {
    const elapsed = Date.now() - loadStart;
    setTimeout(hideLoadingScreen, Math.max(0, minDisplay - elapsed));
  });
  // Safety net in case the load event is delayed by a slow resource
  setTimeout(hideLoadingScreen, 7000);

  // ---- Theme toggle (dark / pure white) ----
  const themeToggle = document.getElementById('themeToggle');
  const rootEl = document.documentElement;
  function applyTheme(theme){
    if(theme === 'light'){
      rootEl.setAttribute('data-theme', 'light');
    } else {
      rootEl.removeAttribute('data-theme');
    }
    try{ localStorage.setItem('rn_theme', theme); }catch(e){}
    if(themeToggle){
      themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    }
  }
  if(themeToggle){
    themeToggle.addEventListener('click', function(){
      const isLight = rootEl.getAttribute('data-theme') === 'light';
      applyTheme(isLight ? 'dark' : 'light');
    });
    // Sync the button label with whatever the inline head script already applied.
    applyTheme(rootEl.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  }

  // ---- Year ----
  document.getElementById('year').textContent = new Date().getFullYear();

  // ---- Mobile nav ----
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));

  // ---- Typed code effect (hero) ----
  const target = document.getElementById('typedCode');
  const fullHTML = [
    '<span class="ln">1</span><span class="code-key">const</span> rodrigue <span class="code-punc">=</span> <span class="code-punc">{</span>',
    '<span class="ln">2</span>&nbsp;&nbsp;role<span class="code-punc">:</span> <span class="code-str">"Full Stack Developer"</span><span class="code-punc">,</span>',
    '<span class="ln">3</span>&nbsp;&nbsp;based<span class="code-punc">:</span> <span class="code-str">"Cape Town, ZA"</span><span class="code-punc">,</span>',
    '<span class="ln">4</span>&nbsp;&nbsp;stack<span class="code-punc">:</span> <span class="code-punc">[</span><span class="code-str">"React"</span><span class="code-punc">,</span> <span class="code-str">"Node"</span><span class="code-punc">,</span> <span class="code-str">"Java"</span><span class="code-punc">,</span> <span class="code-str">"C#"</span><span class="code-punc">],</span>',
    '<span class="ln">5</span>&nbsp;&nbsp;status<span class="code-punc">:</span> <span class="code-str">"open to work"</span>',
    '<span class="ln">6</span><span class="code-punc">}</span>',
    '<span class="ln">7</span>',
    '<span class="ln">8</span><span class="code-fn">rodrigue</span><span class="code-punc">.</span><span class="code-fn">buildSomething</span><span class="code-punc">()</span><span class="cursor"></span>'
  ];
  let i = 0;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function typeNext(){
    if(i >= fullHTML.length){ return; }
    const line = document.createElement('div');
    target.appendChild(line);
    line.innerHTML = fullHTML[i];
    i++;
    setTimeout(typeNext, prefersReduced ? 0 : 160);
  }
  typeNext();

  // ---- Skill bars on scroll into view ----
  const skillRows = document.querySelectorAll('.skill-row');
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const fill = entry.target.querySelector('.skill-fill');
        fill.style.width = entry.target.dataset.level + '%';
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  skillRows.forEach(row => skillObserver.observe(row));

  // =========================================================
  // EMAIL DELIVERY (contact form)
  // Uses Formspree if configured; otherwise falls back to a
  // pre-filled mailto: link so nothing is ever silently lost.
  // =========================================================
  function isFormspreeConfigured(){
    return CONFIG.FORMSPREE_ENDPOINT && !/your-form-id/.test(CONFIG.FORMSPREE_ENDPOINT);
  }

  function openMailtoFallback(subject, fields){
    const bodyLines = Object.entries(fields).map(([k, v]) => k + ': ' + v);
    const body = bodyLines.join('\n');
    const url = 'mailto:' + CONFIG.ADMIN_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
    window.open(url, '_blank');
  }

  async function sendEmail(subject, fields){
    if(!isFormspreeConfigured()){
      openMailtoFallback(subject, fields);
      return { ok: false, fallback: true };
    }
    try{
      const res = await fetch(CONFIG.FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(Object.assign({ _subject: subject }, fields))
      });
      if(res.ok){ return { ok: true }; }
      openMailtoFallback(subject, fields);
      return { ok: false, fallback: true };
    } catch(err){
      openMailtoFallback(subject, fields);
      return { ok: false, fallback: true };
    }
  }

  // ---- Contact form ----
  const form = document.getElementById('contactForm');
  const contactSubmitBtn = document.getElementById('contactSubmitBtn');
  const formNote = document.getElementById('formNote');

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    let valid = true;
    const checks = [
      ['nameField', 'cname', v => v.trim().length > 0],
      ['emailField', 'cemail', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)],
      ['subjectField', 'csubject', v => v.trim().length > 0],
      ['messageField', 'cmessage', v => v.trim().length > 3],
    ];
    checks.forEach(([fieldId, inputId, test]) => {
      const fieldEl = document.getElementById(fieldId);
      const val = document.getElementById(inputId).value;
      if(!test(val)){
        fieldEl.classList.add('has-error');
        valid = false;
      } else {
        fieldEl.classList.remove('has-error');
      }
    });
    if(!valid) return;

    const name = document.getElementById('cname').value.trim();
    const email = document.getElementById('cemail').value.trim();
    const subject = document.getElementById('csubject').value.trim();
    const message = document.getElementById('cmessage').value.trim();

    contactSubmitBtn.disabled = true;
    contactSubmitBtn.textContent = 'Sending...';

    const result = await sendEmail('New portfolio message: ' + subject, {
      Name: name,
      Email: email,
      Subject: subject,
      Message: message
    });

    contactSubmitBtn.disabled = false;
    contactSubmitBtn.textContent = 'Send message';

    if(result.ok){
      formNote.textContent = 'Message sent - Rodrigue will get back to you soon.';
      showToast('Message sent to Rodrigue.');
      form.reset();
    } else {
      formNote.textContent = 'Opened your email app with the message pre-filled - hit send there to deliver it.';
      showToast('Opening your email client...');
      form.reset();
    }
  });

  // ---- "Ask about this project" - pre-fills and focuses the contact form ----
  document.querySelectorAll('.project-inquire').forEach(btn => {
    btn.addEventListener('click', function(){
      const projectName = btn.dataset.project || 'this project';
      document.getElementById('csubject').value = 'Inquiry: ' + projectName;
      document.getElementById('cmessage').value =
        "Hi Rodrigue,\n\nI'd like to know more about the " + projectName + " project - could you share an update on where it stands?\n\n";
      document.getElementById('contact').scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
      setTimeout(() => {
        const msgField = document.getElementById('cmessage');
        msgField.focus();
        msgField.setSelectionRange(msgField.value.length, msgField.value.length);
      }, prefersReduced ? 0 : 500);
    });
  });

  // =========================================================
  // AUTH STORE — demo only, data lives in this browser's
  // localStorage. Not a substitute for real server-side auth.
  // =========================================================
  function getUsers(){
    try { return JSON.parse(localStorage.getItem('rn_demo_users') || '{}'); }
    catch(e){ return {}; }
  }
  function saveUsers(u){ localStorage.setItem('rn_demo_users', JSON.stringify(u)); }
  function setSession(name, email){
    localStorage.setItem('rn_demo_session', JSON.stringify({name, email}));
    reflectSession();
  }
  function clearSession(){
    localStorage.removeItem('rn_demo_session');
    reflectSession();
  }
  function getSession(){
    try { return JSON.parse(localStorage.getItem('rn_demo_session')); }
    catch(e){ return null; }
  }

  // Set true right before opening the login modal from the CV button,
  // so we know to trigger the download automatically once signed in.
  let pendingDownload = false;

  function reflectSession(){
    const s = getSession();
    const statusEl = document.getElementById('accessStatus');
    const panel = document.getElementById('privatePanel');
    const logoutBtn = document.getElementById('logoutBtn');
    const manageBtn = document.getElementById('manageAccountBtn');
    const openLogin2 = document.getElementById('openLogin2');
    const accessCopy = document.getElementById('accessCopy');
    const privateName = document.getElementById('privateName');

    if(s){
      statusEl.classList.add('show');
      document.getElementById('accessName').textContent = s.name;
      document.getElementById('accessAvatar').textContent = s.name.trim().charAt(0).toUpperCase();
      panel.style.display = 'block';
      logoutBtn.style.display = 'inline-flex';
      manageBtn.style.display = 'inline-flex';
      openLogin2.style.display = 'none';
      accessCopy.textContent = "You're signed in my CV and account settings are ready below.";
      if(privateName) privateName.textContent = s.name.split(' ')[0];
    } else {
      statusEl.classList.remove('show');
      panel.style.display = 'none';
      logoutBtn.style.display = 'none';
      manageBtn.style.display = 'none';
      openLogin2.style.display = 'inline-flex';
      openLogin2.textContent = 'Sign in / Create account';
      accessCopy.textContent = 'Sign in to download my CV and unlock this private area - the same authentication pattern I build into full-stack projects.';
    }
  }

  // ---- Hero "Download CV" - gated behind login ----
  document.getElementById('heroDownloadCv').addEventListener('click', function(){
    if(getSession()){
      window.open(CV_PATH, '_blank');
      document.getElementById('clientAccess').scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    } else {
      pendingDownload = true;
      openModal();
    }
  });

  // ---- Login / signup modal ----
  const overlay = document.getElementById('modalOverlay');
  const openBtns = [document.getElementById('openLogin'), document.getElementById('openLogin2')];
  const closeBtn = document.getElementById('modalClose');
  const tabs = document.querySelectorAll('.modal-tab');
  const signinForm = document.getElementById('signinForm');
  const signupForm = document.getElementById('signupForm');
  const modalMsg = document.getElementById('modalMsg');

  function openModal(defaultTab){
    overlay.classList.add('open');
    modalMsg.className = 'modal-msg';
    const which = defaultTab || 'signin';
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === which));
    signinForm.classList.toggle('active', which === 'signin');
    signupForm.classList.toggle('active', which === 'signup');
    document.getElementById(which === 'signin' ? 'siEmail' : 'suName').focus();
  }
  function closeModal(){
    overlay.classList.remove('open');
    if(!getSession()) pendingDownload = false;
  }
  openBtns.forEach(b => b && b.addEventListener('click', () => { pendingDownload = false; openModal(); }));
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if(e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape'){ closeModal(); closeManageModal(); } });

  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const which = tab.dataset.tab;
    signinForm.classList.toggle('active', which === 'signin');
    signupForm.classList.toggle('active', which === 'signup');
    modalMsg.className = 'modal-msg';
  }));

  function afterAuthSuccess(){
    if(pendingDownload){
      window.open(CV_PATH, '_blank');
      pendingDownload = false;
      setTimeout(() => {
        document.getElementById('clientAccess').scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
      }, 400);
    }
  }

  signupForm.addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('suName').value.trim();
    const email = document.getElementById('suEmail').value.trim().toLowerCase();
    const pass = document.getElementById('suPassword').value;
    if(!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || pass.length < 4){
      modalMsg.textContent = 'Please fill in every field - password needs at least 4 characters.';
      modalMsg.className = 'modal-msg error show';
      return;
    }
    const users = getUsers();
    if(users[email]){
      modalMsg.textContent = 'An account with that email already exists - try signing in instead.';
      modalMsg.className = 'modal-msg error show';
      return;
    }
    users[email] = { name, pass };
    saveUsers(users);
    setSession(name, email);
    modalMsg.textContent = 'Account created - you are signed in.';
    modalMsg.className = 'modal-msg success show';
    showToast('Welcome, ' + name + '.');
    const wasPending = pendingDownload;
    setTimeout(() => { closeModal(); if(wasPending) afterAuthSuccess(); }, 700);
    signupForm.reset();
  });

  signinForm.addEventListener('submit', function(e){
    e.preventDefault();
    const email = document.getElementById('siEmail').value.trim().toLowerCase();
    const pass = document.getElementById('siPassword').value;
    const users = getUsers();
    const record = users[email];
    if(!record || record.pass !== pass){
      modalMsg.textContent = 'No matching account found - check your details or create an account.';
      modalMsg.className = 'modal-msg error show';
      return;
    }
    setSession(record.name, email);
    modalMsg.textContent = 'Signed in successfully.';
    modalMsg.className = 'modal-msg success show';
    showToast('Welcome back, ' + record.name + '.');
    const wasPending = pendingDownload;
    setTimeout(() => { closeModal(); if(wasPending) afterAuthSuccess(); }, 600);
    signinForm.reset();
  });

  document.getElementById('logoutBtn').addEventListener('click', function(){
    clearSession();
    showToast('Signed out.');
  });

  // =========================================================
  // MANAGE ACCOUNT — update details or delete account
  // =========================================================
  const manageOverlay = document.getElementById('manageOverlay');
  const manageForm = document.getElementById('manageForm');
  const manageMsg = document.getElementById('manageMsg');
  const deleteBtn = document.getElementById('deleteAccountBtn');

  function openManageModal(){
    const s = getSession();
    if(!s) return;
    document.getElementById('mgName').value = s.name;
    document.getElementById('mgEmail').value = s.email;
    document.getElementById('mgPassword').value = '';
    manageMsg.className = 'modal-msg';
    deleteBtn.textContent = 'Delete my account';
    deleteBtn.classList.remove('confirming');
    manageOverlay.classList.add('open');
  }
  function closeManageModal(){ manageOverlay.classList.remove('open'); }

  [document.getElementById('manageAccountBtn'), document.getElementById('manageAccountBtn2')]
    .forEach(b => b && b.addEventListener('click', openManageModal));
  document.getElementById('manageClose').addEventListener('click', closeManageModal);
  manageOverlay.addEventListener('click', (e) => { if(e.target === manageOverlay) closeManageModal(); });

  manageForm.addEventListener('submit', function(e){
    e.preventDefault();
    const session = getSession();
    if(!session) return;
    const newName = document.getElementById('mgName').value.trim();
    const newEmail = document.getElementById('mgEmail').value.trim().toLowerCase();
    const newPass = document.getElementById('mgPassword').value;

    if(!newName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)){
      manageMsg.textContent = 'Please enter a valid name and email.';
      manageMsg.className = 'modal-msg error show';
      return;
    }
    if(newPass && newPass.length < 4){
      manageMsg.textContent = 'New password needs at least 4 characters.';
      manageMsg.className = 'modal-msg error show';
      return;
    }

    const users = getUsers();
    const oldEmail = session.email;
    const record = users[oldEmail];
    if(!record){
      manageMsg.textContent = 'Account not found - it may have already been removed.';
      manageMsg.className = 'modal-msg error show';
      return;
    }
    if(newEmail !== oldEmail && users[newEmail]){
      manageMsg.textContent = 'Another account already uses that email.';
      manageMsg.className = 'modal-msg error show';
      return;
    }

    const updated = { name: newName, pass: newPass ? newPass : record.pass };
    delete users[oldEmail];
    users[newEmail] = updated;
    saveUsers(users);
    setSession(newName, newEmail);

    manageMsg.textContent = 'Details updated.';
    manageMsg.className = 'modal-msg success show';
    showToast('Account updated.');
    setTimeout(closeManageModal, 700);
  });

  // two-step delete: first click arms it, second click (within 4s) confirms
  let deleteArmed = false;
  let deleteArmTimer;
  deleteBtn.addEventListener('click', function(){
    if(!deleteArmed){
      deleteArmed = true;
      deleteBtn.textContent = 'Click again to confirm delete';
      deleteBtn.classList.add('confirming');
      clearTimeout(deleteArmTimer);
      deleteArmTimer = setTimeout(() => {
        deleteArmed = false;
        deleteBtn.textContent = 'Delete my account';
        deleteBtn.classList.remove('confirming');
      }, 4000);
      return;
    }
    clearTimeout(deleteArmTimer);
    const session = getSession();
    if(!session) return;
    const users = getUsers();
    delete users[session.email];
    saveUsers(users);
    clearSession();
    closeManageModal();
    showToast('Account deleted. Sign up again anytime.');
  });

  reflectSession();

  // ---- Toast ----
  let toastTimer;
  function showToast(msg){
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
  }
})();
