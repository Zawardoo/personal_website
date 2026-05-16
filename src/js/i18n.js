// ============================================================
// i18n.js — EN/SK language toggle
// ============================================================

const SK = {
  // ---- Splash ----
  'splash.eyebrow':     'QA Automatizacia · Web Development',
  'splash.sub':         'Inžinier zo Slovenska. Staviam testovacie súpravy, ktoré chytia bugy, a weby, ktoré žiadne nemajú.',
  'splash.testing.title': 'Testovanie',
  'splash.testing.desc':  'QA automatizácia, end-to-end testy, CI/CD pipelines a infraštruktúra, ktorá udržiava fintech spoľahlivým.',
  'splash.testing.cta':   'Preskúmať',
  'splash.webdev.title':  'Web Dev',
  'splash.webdev.desc':   'Weby a full-stack aplikácie na mieru. Žiadne šablóny — dizajnované a kódované od nuly.',
  'splash.webdev.cta':    'Preskúmať',

  // ---- Nav ----
  'nav.home':       'Domov',
  'nav.about':      'O mne',
  'nav.skills':     'Zručnosti',
  'nav.contact':    'Kontakt',
  'nav.cta':        'Napíšte mi',

  // ---- Testing Hero ----
  'test.hero.tag':      'QA · DEV · OPS',
  'test.hero.tagline':  'Test automation inžinier zo Slovenska',
  'test.hero.title1':   'Spoľahlivý softvér,',
  'test.hero.title2':   'testovaný end-to-end.',
  'test.hero.sub':      'Som Jozef — QA automation inžinier v 365.bank s 3+ rokmi vo fintechusu. Navrhujem automatizačné frameworky v Pythone, staviam CI/CD pipelines v Jenkins a spustam záťažové testy, ktoré udržiavajú bankové systémy spoľahlivé.',
  'test.hero.cv':       'Stiahnuť CV',
  'test.hero.contact':  'Napíšte mi',

  // Testing floating tags
  'test.ftag1.label': 'Framework',
  'test.ftag1.value': 'Robot · Selenium',
  'test.ftag2.label': 'Jazyk',
  'test.ftag2.value': 'Python · SQL',
  'test.ftag3.label': 'Pipeline',
  'test.ftag3.value': 'Jenkins CI ✓',
  'test.ftag4.label': 'Výkon. testy',
  'test.ftag4.value': 'JMeter · Dynatrace',

  // Testing logo strip
  'test.logos.label': 'Pracujem s',

  // Testing About
  'test.about.pill':    'O mne',
  'test.about.title1':  'Testujem fintech ',
  'test.about.title2':  'od 2022.',
  'test.about.sub':     'Od manuálneho QA po plnú automatizáciu — staviam frameworky, pipelines a výkonnostné testy, ktoré udržiavajú bankové systémy v chode.',
  'test.about.me.title': 'O mne',
  'test.about.me.p1':   'Aktuálne pracujem ako <strong>Automation Engineer v 365.bank</strong> v Bratislave. Navrhujem a udržiavam backend testovacie frameworky v <strong>Pythone s Robot Framework</strong>, integrované s Oracle DB, MSSQL a Apache JMeter.',
  'test.about.me.p2':   'Predchádzajúcich 2,5 roka som strávil ako <strong>QA Tester</strong> v tej istej banke — testovanie SOAP/REST API, písanie regresných skriptov v SoapUI a Postman a <strong>mentorovanie 3 juniorných testerov</strong> počas onboardingu.',
  'test.about.me.p3':   'Mimo práce prevádzkujem <strong>Docker-based homelab</strong>, denné použitie Linuxu a staviam vedlajšie projekty s <strong>FastAPI, PostgreSQL a Tailwind CSS</strong>.',

  'test.feat.auto.title': 'Automatizácia testov',
  'test.feat.auto.desc':  'Backend a mobilné testovacie frameworky s Python, Robot Framework, Selenium, Playwright a Appium — s paralelným spúšťaním na fyzických zariadeniach cez Selenium Grid.',
  'test.feat.api.title':  'API testovanie',
  'test.feat.api.desc':   'SOAP a REST API testovanie pomocou SoapUI a Postman. Automatizované regresné skripty, validácia kontraktov a generovanie syntetických testovacích dát.',
  'test.feat.cicd.title': 'CI / CD',
  'test.feat.cicd.desc':  'Jenkins pipelines pre automatické spúšťanie smoke a regresných testov pri každom deploy. Git, Gitea a Docker-based workflow.',
  'test.feat.perf.title': 'Výkonnostné testy',
  'test.feat.perf.desc':  'Záťažové a stresové testy s Apache JMeter. Analýza výsledkov z DB logov a Dynatrace. Health checky a monitoring pre kritické bankové služby.',

  // Testing Skills
  'test.skills.pill':  'Stack',
  'test.skills.title1': 'Zručnosti ',
  'test.skills.title2': '& nástroje.',
  'test.skills.sub':    'Čo používam každý deň, podľa toho, kde to sedí v stacku.',

  'test.sk.auto':  'Automatizácia testov',
  'test.sk.api':   'API testovanie',
  'test.sk.db':    'Databázy',
  'test.sk.cicd':  'CI/CD & DevOps',
  'test.sk.perf':  'Výkonnosť',
  'test.sk.qa':    'QA Workflow',

  // Testing CTA
  'test.cta.title':  'Potrebujete partnera pre automatizáciu testov?',
  'test.cta.sub':    'Otvoreny full-time aj freelance práci. Email je najrýchlejší — odpoveď zvyčajne do dňa alebo dvoch.',
  'test.cta.btn':    'Začať konverzáciu',
  'test.cta.cv':     'Stiahnuť CV',

  // Testing Contact
  'test.contact.pill':  'Kontakt',
  'test.contact.title1': 'Napíšte ',
  'test.contact.title2': 'mi.',
  'test.contact.sub':    'Pošlite správu alebo použite akýkoľvek kanál nižšie.',
  'contact.email.label':  'Email',
  'contact.li.label':     'LinkedIn',
  'contact.gh.label':     'GitHub',
  'form.name.label':    'Meno',
  'form.email.label':   'Email',
  'form.msg.label':     'Správa',
  'form.name.ph':       'Jozef Mrkvička',
  'form.email.ph':      'jozef@priklad.sk',
  'form.msg.ph':        'Pár riadkov o pozícii alebo projekte…',
  'form.submit':        'Odoslať správu',
  'form.err.name':      'Zadajte prosím vaše meno',
  'form.err.email':     'Zadajte prosím platný email',
  'form.err.msg':       'Správa nesmie byť prázdna',
  'form.ok':            'Správa odoslaná — ozvem sa čoskoro.',

  // ---- Webdev Hero ----
  'wd.hero.tag':       'DIZAJN · KÓD · DEPLOY',
  'wd.hero.tagline':   'Full-stack web development',
  'wd.hero.title1':    'Weby na mieru,',
  'wd.hero.title2':    'od nuly.',
  'wd.hero.sub':       'Žiadne šablóny. Žiadne stavebnice. Navrhnem vašu vizuálnu identitu, prototypujem vo Figme a ručne kódujem každý pixel — od interaktívnych WebGL zážitkov po full-stack aplikácie s backendom a API.',
  'wd.hero.cta':       'Začať projekt',
  'wd.hero.services':  'Služby',

  // Webdev floating tags
  'wd.ftag1.label': 'Kód',
  'wd.ftag1.value': 'HTML · CSS · JS',
  'wd.ftag2.label': 'Branding',
  'wd.ftag2.value': 'Figma · Identita',
  'wd.ftag3.label': 'Grafika',
  'wd.ftag3.value': 'WebGL · GLSL',
  'wd.ftag4.label': 'Backend',
  'wd.ftag4.value': 'FastAPI · PostgreSQL',

  // Webdev Services
  'wd.svc.pill':    'Služby',
  'wd.svc.title1':  'Všetko čo potrebujete, ',
  'wd.svc.title2':  'nič navyše.',
  'wd.svc.sub':     'Od brandingu a dizajnu vo Figme cez ručne kódované weby až po full-stack aplikácie — riešim všetko od začiatku do konca.',

  'wd.feat.brand.title': 'Vizuálna identita & dizajn',
  'wd.feat.brand.p1':   '<strong>Vaša značka, navrhnutá od nuly.</strong> Vytvorím kompletnú vizuálnu identitu — logo, farby, typografiu a dizajn systém — ešte pred napísaním jediného riadku kódu.',
  'wd.feat.brand.p2':   'Všetko začína vo <strong>Figme</strong>: wireframy, high-fidelity mockupy, interaktívne prototypy. Schválite dizajn, potom ho postavím pixel-perfect.',
  'wd.feat.brand.p3':   'Mobile-first, prístupné, konzistentné na každej obrazovke. Vaša značka vyzerá rovnako na mobile, tablete aj 4K monitore.',
  'wd.feat.web.title':  'Ručne kódované weby',
  'wd.feat.web.desc':   'Žiadne šablóny, žiadny WordPress. Každý web je písaný od nuly s čistým HTML, CSS a JavaScriptom. Rýchly, unikátny a plne váš.',
  'wd.feat.gl.title':   'Interaktívne WebGL',
  'wd.feat.gl.desc':    'Vlastné shader efekty, 3D vizuály a interaktívne animácie pomocou WebGL a GLSL. Detail, ktorý robí web nezabudnuteľným.',
  'wd.feat.app.title':  'Full-Stack Aplikácie',
  'wd.feat.app.desc':   'Webové aplikácie s autentifikáciou, databázami a API. Postavené s Python, FastAPI, PostgreSQL a Supabase.',
  'wd.feat.host.title': 'Hosting & Údržba',
  'wd.feat.host.desc':  'Deployment na Docker alebo Linux VPS, nastavenie domény, SSL, monitoring dostupnosti a priebežné aktualizácie.',

  // Webdev Stack
  'wd.stack.pill':   'Stack',
  'wd.stack.title1': 'Nástroje ',
  'wd.stack.title2': '& tech.',
  'wd.stack.sub':    'S čím staviam, podľa vrstvy.',

  'wd.sk.front':   'Frontend',
  'wd.sk.design':  'Dizajn',
  'wd.sk.back':    'Backend',
  'wd.sk.data':    'Dáta & Auth',
  'wd.sk.deploy':  'Deploy',

  // Webdev CTA
  'wd.cta.title':  'Máte projekt na mysli?',
  'wd.cta.sub':    'Beriem obmedzeny počet projektov, aby som udržal kvalitu. Porozprávajme sa o tom, čo potrebujete.',
  'wd.cta.btn':    'Začať konverzáciu',

  // Webdev Contact
  'wd.contact.pill':   'Kontakt',
  'wd.contact.title1': 'Postavme ',
  'wd.contact.title2': 'niečo.',
  'wd.contact.sub':    'Povedzte mi o vašom projekte a ozvem sa do 24 hodín.',
  'wd.form.msg.label': 'Detaily projektu',
  'wd.form.msg.ph':    'Povedzte mi, čo potrebujete — typ webu, časový rámec, rozpočet…',
  'wd.form.err.msg':   'Popíšte prosím váš projekt',
  'wd.form.ok':        'Správa odoslaná — ozvem sa čoskoro.',

  // Footer
  'foot.home': 'Domov',
  'foot.about': 'O mne',
  'foot.skills': 'Zručnosti',
  'foot.contact': 'Kontakt',
};

let lang = localStorage.getItem('lang') || 'en';
const cache = new Map();
const phCache = new Map();

function applyLang(newLang) {
  lang = newLang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang === 'sk' ? 'sk' : 'en';

  // Text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (!cache.has(el)) cache.set(el, el.innerHTML);
    el.innerHTML = (lang === 'sk' && SK[key]) ? SK[key] : cache.get(el);
  });

  // Placeholders
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    if (!phCache.has(el)) phCache.set(el, el.placeholder);
    el.placeholder = (lang === 'sk' && SK[key]) ? SK[key] : phCache.get(el);
  });

  // Toggle buttons
  document.querySelectorAll('.lang-toggle').forEach(btn => {
    btn.querySelectorAll('span').forEach(s => {
      s.classList.toggle('active', s.dataset.lang === lang);
    });
  });
}

function createToggle() {
  const btn = document.createElement('button');
  btn.className = 'lang-toggle';
  btn.setAttribute('aria-label', 'Switch language');
  btn.innerHTML = '<span data-lang="en">EN</span><span data-lang="sk">SK</span>';
  btn.addEventListener('click', () => applyLang(lang === 'en' ? 'sk' : 'en'));
  return btn;
}

export function initI18n() {
  // Insert toggle into nav bar (before the CTA button)
  const navCta = document.querySelector('.nav-bar .nav-cta');
  if (navCta) navCta.parentNode.insertBefore(createToggle(), navCta);

  // Insert toggle into mobile dropdown menu
  const mobileLangItem = document.querySelector('.nav-drawer .mobile-lang-item');
  if (mobileLangItem) mobileLangItem.appendChild(createToggle());

  // Insert toggle into splash footer
  const splashFooter = document.querySelector('.splash-footer');
  if (splashFooter) {
    splashFooter.appendChild(document.createElement('span')).className = 'splash-sep';
    splashFooter.appendChild(document.createTextNode(''));
    splashFooter.appendChild(createToggle());
  }

  // Apply stored language on load
  if (lang === 'sk') {
    requestAnimationFrame(() => applyLang('sk'));
  } else {
    document.querySelectorAll('.lang-toggle span[data-lang="en"]').forEach(s => s.classList.add('active'));
  }

  window.i18n = { applyLang, getLang: () => lang };
}
