(() => {
  'use strict';
  const data = window.PORTFOLIO || {};
  const $ = selector => document.querySelector(selector);
  const all = selector => document.querySelectorAll(selector);
  const base = new URL(document.body.dataset.base || './', document.baseURI);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safeUrl = value => {
    if (typeof value !== 'string' || !value.trim()) return '';
    try { const url = new URL(value, base); return ['https:','http:','mailto:'].includes(url.protocol) ? url.href : ''; }
    catch { return ''; }
  };
  const link = (url, label) => safeUrl(url) ? `<a href="${esc(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>` : '';
  const list = value => Array.isArray(value) ? value : [];
  const projects = list(data.projects);
  const publications = list(data.publications);
  const fullName = data.fullName || data.name || 'Sarang Manoj Pekhale';
  all('[data-full-name]').forEach(node => { node.textContent = fullName; });
  const nameParts = fullName.trim().split(/\s+/);
  all('[data-brand-name]').forEach(node => {
    node.innerHTML = `<strong class="brand-first-name">${esc(nameParts[0])}</strong>${nameParts.length > 1 ? ` <span class="brand-rest-name">${esc(nameParts.slice(1).join(' '))}</span>` : ''}`;
  });
  const page = document.body.dataset.page;
  document.title = `${page[0].toUpperCase() + page.slice(1)} — ${fullName}`;
  $('meta[property="og:title"]').content = document.title;
  $('#year').textContent = new Date().getFullYear();
  all('.email-link').forEach(node => {
    if (data.email) { node.href = `mailto:${data.email}`; node.textContent = data.email; }
    else node.hidden = true;
  });
  const profileLinks = $('#profile-links');
  if (profileLinks) {
    profileLinks.outerHTML = list(data.profiles).map(profile => link(profile.url, profile.label)).join('');
  }
  const photo = $('#about-photo');
  if (photo) {
    const portrait = safeUrl(data.portraitUrl);
    if (portrait) {
      photo.src = portrait; photo.alt = fullName;
    } else if (Number(data.aboutPhoto) === 2) {
      photo.src = new URL('assets/hero-wildflowers.jpeg',base).href;
      photo.width = 960; photo.height = 1280;
      photo.alt = 'Yellow wildflowers and golden light over a rocky hillside near Nashik';
    } else {
      photo.src = new URL('assets/hero-valley.jpeg',base).href;
      photo.width = 1280; photo.height = 838;
      photo.alt = 'Open sky over a rocky valley and green fields near Nashik';
    }
  }
  // Fade early, before the hero text or biography can pass behind the fixed menu.
  let syncHeaderSurface = () => {};
  const intro = $('.about-intro');
  if (intro) {
    const header = $('.site-header');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let framePending = false;
    syncHeaderSurface = () => {
      const expanded = $('.menu-toggle').getAttribute('aria-expanded') === 'true';
      const scroll = Math.max(0, window.scrollY);
      const scrollProgress = reducedMotion.matches ? Number(scroll > 0) : Math.min(scroll / 64, 1);
      const progress = expanded ? 1 : scrollProgress;
      header.style.setProperty('--header-opacity', String(progress * 0.96));
      header.style.setProperty('--header-border', String(progress * 0.1));
      header.style.setProperty('--header-shadow', String(progress * 0.06));
      header.style.setProperty('--header-blur', `${progress * 8}px`);
      header.style.setProperty('--brand-opacity', String(Number(scroll > 0)));
      header.style.setProperty('--nav-channel', scroll > 0 || expanded ? '0' : '255');
      header.style.setProperty('--nav-shadow', scroll > 0 || expanded ? '0' : '0.6');
      header.classList.toggle('has-scrolled', scroll > 0);
      framePending = false;
    };
    window.addEventListener('scroll', () => {
      if (!framePending) { framePending = true; window.requestAnimationFrame(syncHeaderSurface); }
    }, {passive:true});
    window.addEventListener('resize', syncHeaderSurface);
    window.addEventListener('pageshow', syncHeaderSurface);
    reducedMotion.addEventListener('change', syncHeaderSurface);
    syncHeaderSurface();
  }
  const menu = $('.menu-toggle');
  const navigation = $('#main-nav');
  const closeMenu = () => {
    menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Open navigation');
    navigation.classList.remove('open');
    syncHeaderSurface();
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded',String(open)); menu.setAttribute('aria-label',open ? 'Close navigation' : 'Open navigation');
    navigation.classList.toggle('open',open);
    syncHeaderSurface();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
  document.addEventListener('click', event => { if (!$('.site-header').contains(event.target)) closeMenu(); });
  window.matchMedia('(min-width: 681px)').addEventListener('change', closeMenu);
  navigation.addEventListener('click',event => { if (event.target.closest('a')) closeMenu(); });

  const researchTitle = project => project.academicTitle || project.title;
  if ($('#research-overview') && projects.length) $('#research-overview').innerHTML = projects.map(project => `<li><a href="${esc(new URL(`research/#${encodeURIComponent(project.id)}`,base).href)}"><strong>${esc(researchTitle(project))}.</strong></a> ${esc(project.summary)}</li>`).join('');
  if ($('#research-list') && projects.length) $('#research-list').innerHTML = projects.map(project => `<article class="research-entry" id="${esc(project.id)}"><p class="category">${esc(project.category)}</p><h2>${esc(researchTitle(project))}</h2><p>${esc(project.detail || project.summary)}</p>${project.question ? `<p class="research-question">${esc(project.question)}</p>` : ''}<p class="topics"><strong>Topics:</strong> ${list(project.tags).map(esc).join(' · ')}</p>${list(project.links).map(item => link(item.url,item.label)).join(' · ')}</article>`).join('');
  if ($('#news-list') && list(data.news).length) {
    $('#news-section').hidden = false;
    $('#news-list').innerHTML = data.news.map(item => `<tr><th scope="row">${esc(item.date)}</th><td>${safeUrl(item.url) ? link(item.url,item.title) : esc(item.title)}</td></tr>`).join('');
  }
  const paperAuthors = entry => {
    const authors = Array.isArray(entry.authors) ? entry.authors : [entry.authors];
    const authorName = name => name === fullName ? `<em>${esc(name)}</em>` : esc(name);
    if (authors.length > 3) {
      const remaining = authors.slice(3);
      const label = `${remaining.length} more author${remaining.length === 1 ? '' : 's'}`;
      return `${authors.slice(0,3).map(authorName).join(', ')}, and <button type="button" class="more-authors" aria-expanded="false" data-authors="${esc(remaining.join(', '))}" data-label="${esc(label)}" aria-label="Show ${esc(label)}">${esc(label)}</button>`;
    }
    return authors.map((name,index) => `${index && index === authors.length - 1 ? 'and ' : ''}${authorName(name)}`).join(', ');
  };
  const paperMarkup = (entry,index) => {
    const id = `citation-${entry.id || index}`;
    return `<li class="paper" id="paper-${esc(entry.id)}"><div class="paper-badge"><span class="paper-label">${esc(entry.abbreviation || entry.type || 'Paper')}</span></div><div class="paper-content"><h3>${esc(entry.title)}</h3><p class="paper-authors">${paperAuthors(entry)}</p><p class="paper-venue">${[entry.venue,entry.year].filter(Boolean).map(esc).join(', ')}</p><div class="paper-actions">${entry.bibtex ? `<button class="bibtex-toggle" type="button" aria-expanded="false" aria-controls="${esc(id)}">Bibtex</button>` : ''}${link(entry.url,'PDF')}${link(entry.codeUrl,'Code')}${link(entry.websiteUrl,'Website')}</div>${entry.bibtex ? `<div class="bibtex-panel" id="${esc(id)}" aria-hidden="true" inert><div><pre class="bibtex"><code>${esc(entry.bibtex)}</code></pre></div></div>` : ''}</div></li>`;
  };
  const selected = publications.filter(entry => entry.selected);
  if ($('#selected-publications') && selected.length) {
    $('#selected-publications-section').hidden = false;
    $('#selected-publications').innerHTML = selected.map(paperMarkup).join('');
  }
  const publicationGroups = $('#publication-groups');
  if (publicationGroups && publications.length) {
    const years = [...new Set(publications.map(entry => String(entry.year)))].sort((a,b) => Number(b) - Number(a));
    publicationGroups.innerHTML = years.map(year => `<section class="publication-year" aria-labelledby="publication-year-${esc(year)}"><h2 id="publication-year-${esc(year)}">${esc(year)}</h2><ol class="paper-list">${publications.filter(entry => String(entry.year) === year).map(paperMarkup).join('')}</ol></section>`).join('');
  }
  document.addEventListener('click', event => {
    const bibtex = event.target.closest('.bibtex-toggle');
    if (bibtex) {
      const panel = document.getElementById(bibtex.getAttribute('aria-controls'));
      const open = bibtex.getAttribute('aria-expanded') !== 'true';
      bibtex.setAttribute('aria-expanded',String(open));
      panel.classList.toggle('is-open',open);
      panel.setAttribute('aria-hidden',String(!open));
      panel.inert = !open;
    }
    const authors = event.target.closest('.more-authors');
    if (authors) {
      const open = authors.getAttribute('aria-expanded') !== 'true';
      authors.setAttribute('aria-expanded',String(open));
      authors.textContent = open ? authors.dataset.authors : authors.dataset.label;
      authors.setAttribute('aria-label',open ? 'Show fewer authors' : `Show ${authors.dataset.label}`);
    }
  });
  const academicEntry = entry => `<article class="academic-entry"><span class="entry-period">${esc(entry.period)}</span><div><h3>${esc(entry.title)}</h3><p>${esc(entry.institution)}</p>${entry.detail ? `<p>${esc(entry.detail)}</p>` : ''}</div></article>`;
  if ($('#education-list')) {
    $('#education-list').innerHTML = list(data.education).map(academicEntry).join('');
    if (!list(data.education).length) $('#education-list').parentElement.hidden = true;
    if (projects.length) $('#resume-interests').innerHTML = projects.map(project => `<li><strong>${esc(researchTitle(project))}</strong><p>${esc(project.summary)}</p></li>`).join('');
    const sections = [['teaching','Teaching & mentoring'],['awards','Awards & recognition'],['talks','Talks & conferences']];
    $('#resume-optional').innerHTML = sections.filter(([key]) => list(data[key]).length).map(([key,title]) => `<section class="resume-section"><h2>${title}</h2>${data[key].map(academicEntry).join('')}</section>`).join('');
    if (safeUrl(data.cvUrl)) { const cv = $('#cv-download'); cv.href = safeUrl(data.cvUrl); cv.hidden = false; cv.target = '_blank'; cv.rel = 'noopener noreferrer'; }
    $('#print-resume').hidden = false; $('#print-resume').addEventListener('click', () => window.print());
  }
})();
