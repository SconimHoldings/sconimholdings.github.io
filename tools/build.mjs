// Builds the Sconim Holdings website into plain HTML files that GitHub Pages serves as they are.
// Run from the repository root: node tools/build.mjs
// Embody's Privacy Policy and Terms come from data/embody-legal.json, exported from the app
// (see README.md), so the website and the app always say the same thing.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://sconimholdings.com';
const EMAIL = 'contact@sconimholdings.com';
const YEAR = new Date().getFullYear();

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Simple glyphs for the apps still in development (kept vague on purpose).
const SUN = '<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M8 32h32"/><path d="M14 32a10 10 0 0 1 20 0"/><path d="M24 12v4M11 18l3 3M37 18l-3 3"/></svg>';
const GRID = '<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="3"/><rect x="27" y="9" width="12" height="12" rx="3"/><rect x="9" y="27" width="12" height="12" rx="3"/><path d="M28 33l4 4 7-8"/></svg>';
const SOON_DAWN = `<div class="tile dawn">${SUN}</div>`;
const SOON_TIDE = `<div class="tile tide">${GRID}</div>`;
const mail = (subject) => `<a href="mailto:${EMAIL}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}">${EMAIL}</a>`;

function layout({ path, title, description, image = '/assets/embody-share.jpg', icon = '/assets/favicon.svg', body, before = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE}${path}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Sconim Holdings">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE}${path}">
<meta property="og:image" content="${SITE}${image}">
<meta name="theme-color" content="#f3f6f9">
<link rel="icon" href="${icon}">
<link rel="apple-touch-icon" href="/assets/embody-icon.png">
<link rel="stylesheet" href="/assets/site.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="top"><div class="wrap">
  <a class="brand" href="/">Sconim Holdings</a>
  <nav aria-label="Main"><a href="/embody/">Embody</a><a class="wide" href="/#about">About</a><a href="/#contact">Contact</a></nav>
</div></header>
${before}<main id="main" class="wrap">
${body}
</main>
<footer><div class="wrap">
  <span>&copy; ${YEAR} Sconim Holdings LLC &middot; Ohio, United States</span>
  <nav aria-label="Footer"><a href="/embody/privacy/">Embody Privacy Policy</a><a href="/embody/terms/">Embody Terms</a><a href="/embody/support/">Support</a><a href="/privacy/">Website privacy</a></nav>
</div></footer>
</body>
</html>
`;
}

/** The header block shared by the Embody pages, with a small menu between them. */
function embodyHeader(current) {
  const links = [
    ['/embody/', 'Overview'],
    ['/embody/support/', 'Support'],
    ['/embody/privacy/', 'Privacy Policy'],
    ['/embody/terms/', 'Terms of Service'],
  ];
  return `<div class="sky"><div class="wrap"><div class="hero">
  <div class="product">
    <img src="/assets/embody-icon.png" alt="The Embody app icon: a glowing mint spiral" width="112" height="112">
    <div><h1>Embody</h1><p class="tag">Law of Assumption</p></div>
  </div>
  <nav class="subnav" aria-label="Embody">${links
    .map(([href, label]) => `<a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a>`)
    .join('')}</nav>
</div></div></div>
`;
}

function legalPage(doc, path) {
  const sections = doc.sections
    .map(
      (s) =>
        `<h2>${esc(s.heading)}</h2>\n` +
        (s.paragraphs ?? []).map((p) => `<p>${esc(p)}</p>`).join('\n') +
        (s.bullets?.length ? `\n<ul>${s.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''),
    )
    .join('\n');
  return layout({
    path,
    title: `${doc.title} - Embody`,
    description: `The ${doc.title} for Embody - Law of Assumption, by Sconim Holdings LLC.`,
    icon: '/assets/embody-icon.png',
    before: embodyHeader(path),
    body: `<article class="doc">
<section class="stack">
<h2 style="margin-top:0;font-size:clamp(26px,4vw,34px)">${esc(doc.title)}</h2>
<p class="intro">${esc(doc.intro)}</p>
${sections}
</section>
</article>`,
  });
}

const legal = JSON.parse(readFileSync(join(root, 'data/embody-legal.json'), 'utf8'));

const pages = {
  'index.html': layout({
    path: '/',
    title: 'Sconim Holdings',
    description: 'Sconim Holdings LLC is an Ohio company that builds and publishes software, including Embody - Law of Assumption.',
    before: `<div class="sky"><div class="wrap"><div class="hero hero-grid">
  <div>
    <p class="eyebrow">Sconim Holdings LLC</p>
    <h1 style="margin-top:16px">Software made with care.</h1>
    <p class="lead" style="margin-top:18px">We are an independent company in Ohio that builds and publishes software, including Embody, a gentle daily practice for the Law of Assumption.</p>
    <div class="actions"><a class="button" href="#apps">See what we make</a><a class="button secondary" href="mailto:${EMAIL}">Get in touch</a></div>
  </div>
  <div class="lineup" aria-hidden="true">
    ${SOON_DAWN}
    <img src="/assets/embody-icon.png" alt="" width="124" height="124">
    ${SOON_TIDE}
  </div>
</div></div></div>
`,
    body: `<section id="apps">
  <p class="eyebrow">What we make</p>
  <h2 style="margin-top:10px">Our apps</h2>
  <div class="products">
    <article class="card product-card live">
      <img class="art" src="/assets/embody-icon.png" alt="" width="72" height="72">
      <h3><a class="stretched" href="/embody/">Embody - Law of Assumption</a></h3>
      <p>Choose the life you want, bring it to life with photos and links, and spend a few quiet minutes each day living from the feeling that it’s already yours.</p>
      <p><span class="badge">Coming soon</span></p>
      <p class="small-links"><a href="/embody/support/">Support</a><a href="/embody/privacy/">Privacy</a><a href="/embody/terms/">Terms</a></p>
    </article>
    <article class="card product-card soon">
      <div class="art tile dawn" aria-hidden="true">${SUN}</div>
      <h3>A new wellbeing app</h3>
      <p>Another calm, thoughtful app for your inner life. We’ll share more soon.</p>
      <p><span class="badge soft">Coming soon</span></p>
    </article>
    <article class="card product-card soon">
      <div class="art tile tide" aria-hidden="true">${GRID}</div>
      <h3>A tool for everyday work</h3>
      <p>Software that takes the busywork out of your day, so you can focus on what matters. We’ll share more soon.</p>
      <p><span class="badge soft">Coming soon</span></p>
    </article>
  </div>
</section>

<section class="spotlight" aria-labelledby="spotlight-title">
  <div class="phone"><img src="/assets/embody-today.jpg" alt="The Today screen in Embody: the Manifest card and a Reality called My Dream Home" width="469" height="1015" loading="lazy"></div>
  <div>
    <p class="eyebrow">Now building</p>
    <h2 id="spotlight-title" style="margin-top:10px">Embody - Law of Assumption</h2>
    <p class="lead" style="margin-top:14px">A gentle daily practice for the Law of Assumption: decide what you want, assume it’s already yours, and live from there.</p>
    <ul class="checks">
      <li><strong>Realities.</strong> A vision board for each life you’re choosing, with links, photos, places and people.</li>
      <li><strong>Manifest and SATS.</strong> Short guided practices that take a few minutes, including one for bedtime.</li>
      <li><strong>Learn.</strong> How manifesting unfolds, in plain words, with a short course.</li>
      <li><strong>Private by design.</strong> No accounts, no ads and no tracking. What you create stays on your phone.</li>
    </ul>
    <div class="actions"><a class="button" href="/embody/">Explore Embody</a><a class="button secondary" href="/embody/support/">Support</a></div>
  </div>
</section>

<section id="about">
  <p class="eyebrow">About</p>
  <h2 style="margin-top:10px">How we work</h2>
  <p class="lead" style="margin-top:14px">Sconim Holdings LLC is a privately held company based in Ohio. We build and publish software under our own brands, and each product has its own privacy policy and terms, linked from its page.</p>
  <div class="grid">
    <div class="card"><h3>Useful first</h3><p>Every product starts from a real need and stays focused on doing that one thing well.</p></div>
    <div class="card"><h3>Plain language</h3><p>Clear pricing, and privacy policies and terms written so people can actually read them.</p></div>
    <div class="card"><h3>Built to last</h3><p>A small, independent company making software for phones, tablets and the web.</p></div>
  </div>
</section>

<section id="contact">
  <div class="band">
    <h2>Say hello</h2>
    <p class="lead">Questions, feedback, partnerships or press: we’d love to hear from you.</p>
    <div class="actions"><a class="button" href="mailto:${EMAIL}">${EMAIL}</a></div>
    <p class="muted" style="margin-top:16px">Sconim Holdings LLC &middot; Ohio, United States</p>
  </div>
</section>`,
  }),

  'embody/index.html': layout({
    path: '/embody/',
    title: 'Embody - Law of Assumption',
    description: 'Embody is a gentle daily practice for the Law of Assumption: choose the life you want, and practice living from it. Coming soon to the App Store and Google Play.',
    icon: '/assets/embody-icon.png',
    before: embodyHeader('/embody/'),
    body: `<section class="stack">
  <p class="lead">Your chosen life, manifested. Choose what you want, bring it to life with photos and links, then spend a few quiet minutes each day feeling it’s already yours.</p>
  <p><span class="badge">Coming soon to the App Store and Google Play</span></p>
</section>

<section aria-labelledby="look-title">
  <h2 id="look-title">A look inside</h2>
  <div class="gallery">
    <figure><div class="phone"><img src="/assets/embody-today.jpg" alt="Today: the Manifest card and a Reality called My Dream Home" width="469" height="1015" loading="lazy"></div><figcaption><strong>Today</strong>Manifest, and the lives you’re choosing</figcaption></figure>
    <figure><div class="phone"><img src="/assets/embody-practice.jpg" alt="Practice: What do you need right now? with answers like It’s bedtime and Doubt crept in" width="469" height="1015" loading="lazy"></div><figcaption><strong>Practice</strong>Tap what you need right now</figcaption></figure>
    <figure><div class="phone"><img src="/assets/embody-learn.jpg" alt="Learn: how manifesting unfolds, from deciding to assuming it" width="469" height="1015" loading="lazy"></div><figcaption><strong>Learn</strong>How manifesting unfolds</figcaption></figure>
  </div>
</section>

<section>
  <h2>Inside Embody</h2>
  <div class="grid">
    <div class="card"><h3>Realities</h3><p>A vision board for each life you’re choosing: save the real things, like links, photos, places and people.</p></div>
    <div class="card"><h3>Manifest</h3><p>The whole practice in one short flow: picture it done, step inside it, and hold the feeling.</p></div>
    <div class="card"><h3>SATS at bedtime</h3><p>Choose one short scene that implies it’s done, run it while you’re awake, and hold it as you fall asleep.</p></div>
    <div class="card"><h3>Practice</h3><p>Tap what you need right now, like bedtime, doubt or a hard day, and Embody suggests the practice that fits.</p></div>
    <div class="card"><h3>Learn</h3><p>How manifesting unfolds, a short course, and why assuming the end works where chasing doesn’t.</p></div>
    <div class="card"><h3>Affirm</h3><p>Your own assumptions, questions from the end, a journal, and an Assumption Coach for the moments doubt creeps in.</p></div>
  </div>
</section>

<section class="stack">
  <h2>Private by design</h2>
  <p class="lead">Everything you create stays on your phone. There are no accounts, no ads and no tracking. The Assumption Coach asks your permission before it uses AI, and we don’t store what you send.</p>
</section>

<section class="stack">
  <h2>Free for 14 days</h2>
  <p class="lead">Try everything in Embody free for 14 days. After that, Embody Premium is a monthly or yearly subscription through the App Store or Google Play. The price is shown before you start, and you can cancel anytime in your store settings.</p>
</section>

<section>
  <p class="note">The Law of Assumption is a spiritual and philosophical framework, not established science. Embody isn’t a substitute for medical, psychological or financial advice. If you’re struggling, please reach out to someone you trust or a professional. In the United States, you can call or text 988 at any time.</p>
</section>`,
  }),

  'embody/support/index.html': layout({
    path: '/embody/support/',
    title: 'Support - Embody',
    description: 'Help with Embody - Law of Assumption: subscriptions, your data, the Assumption Coach, and how to contact us.',
    icon: '/assets/embody-icon.png',
    before: embodyHeader('/embody/support/'),
    body: `<article class="doc faq">
<section class="stack">
<h2 style="margin-top:0;font-size:clamp(26px,4vw,34px)">Support</h2>
<p class="intro">Email ${mail('Embody support')} and we’ll get back to you as soon as we can. It helps to mention your phone model and what you were doing when something went wrong.</p>

<h3>How do I restore my subscription on a new phone?</h3>
<p>Sign in with the same Apple ID or Google account, open Embody, and tap Restore purchase on the trial screen.</p>

<h3>How do I cancel my subscription?</h3>
<p>Subscriptions are managed by Apple or Google. On iPhone, open Settings, tap your name, then Subscriptions. On Android, open Google Play, tap your profile picture, then Payments &amp; subscriptions. Deleting the app does not cancel a subscription.</p>

<h3>Can I get a refund?</h3>
<p>Refunds are handled by the store you bought from. For Apple, visit <a href="https://reportaproblem.apple.com">reportaproblem.apple.com</a>. For Google Play, see <a href="https://support.google.com/googleplay/answer/2479637">Google Play’s refund help</a>.</p>

<h3>Where is my data?</h3>
<p>On your phone. Embody has no accounts, so your Realities, journal and practice history are never stored on our servers. Because of that, we can’t recover them if the app is deleted, though your phone’s own backups may include them.</p>

<h3>How do I erase everything?</h3>
<p>In Embody, go to You, then Account &amp; privacy, then Erase data on this device. It’s permanent. Your subscription is separate, so cancel it in your store settings if you no longer want it.</p>

<h3>How does the Assumption Coach use AI?</h3>
<p>The Coach asks your permission once before its first conversation. Its replies are written by AI from Anthropic, our service provider, and we don’t store what you send. If it can’t connect, it still works on your phone with a simpler guided version.</p>

<h3>Is Embody therapy or medical advice?</h3>
<p>No. Embody presents the Law of Assumption as a spiritual and philosophical framework, not science, and it is not a substitute for professional care. If you are in crisis, contact your local emergency number. In the United States, call or text 988 to reach the Suicide &amp; Crisis Lifeline.</p>
</section>
</article>`,
  }),

  'embody/privacy/index.html': legalPage(legal.privacy, '/embody/privacy/'),
  'embody/terms/index.html': legalPage(legal.terms, '/embody/terms/'),

  'privacy/index.html': layout({
    path: '/privacy/',
    title: 'Website privacy - Sconim Holdings',
    description: 'How the Sconim Holdings website handles your information.',
    body: `<article class="doc">
<section class="hero stack">
<h1>Website privacy</h1>
<p class="intro">This page covers this website. For the app, see the <a href="/embody/privacy/">Embody Privacy Policy</a>.</p>
<p>This website doesn’t use cookies, analytics, advertising or any other trackers, and it has no forms. It is hosted on GitHub Pages, which may keep visitors’ IP addresses in its logs to keep the service secure. If you email us, we use your message only to reply to you.</p>
<p>Questions: ${mail()}.</p>
</section>
</article>`,
  }),

  '404.html': layout({
    path: '/404.html',
    title: 'Page not found - Sconim Holdings',
    description: 'This page doesn’t exist.',
    body: `<section class="hero stack">
<h1>Page not found</h1>
<p class="lead">That page doesn’t exist. Try the <a href="/">home page</a> or <a href="/embody/">Embody</a>.</p>
</section>`,
  }),
};

for (const [file, html] of Object.entries(pages)) {
  const path = join(root, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, html);
  if (/—/.test(html)) throw new Error(`${file} has an em-dash; use a period, comma, colon or parentheses instead.`);
}

writeFileSync(
  join(root, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['/', '/embody/', '/embody/support/', '/embody/privacy/', '/embody/terms/', '/privacy/']
    .map((p) => `  <url><loc>${SITE}${p}</loc></url>`)
    .join('\n')}\n</urlset>\n`,
);
console.log(`Built ${Object.keys(pages).length} pages.`);
