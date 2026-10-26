'use strict';
const whatsappBase = 'https://wa.me/27651918511';
const whatsappUrl = message => `${whatsappBase}?text=${encodeURIComponent(message)}`;
document.getElementById('year').textContent = new Date().getFullYear();

// Masked, staggered word entrances inspired by the FedPump reference.
// Keep native text nodes, intentional breaks and coloured spans intact.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let revealObserver;
function splitHeading(heading) {
  if (heading.classList.contains('word-reveal')) return;
  const label = heading.innerText.replace(/\s+/g, ' ').trim();
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  let order = 0;
  nodes.forEach(node => {
    const fragment = document.createDocumentFragment();
    (node.textContent.match(/\s+|\S+/g) || []).forEach(token => {
      if (/^\s+$/.test(token)) { fragment.append(document.createTextNode(token)); return; }
      const mask = document.createElement('span');
      const word = document.createElement('span');
      mask.className = 'word-mask';
      mask.setAttribute('aria-hidden', 'true');
      word.className = 'motion-word';
      word.textContent = token;
      word.style.setProperty('--word-delay', `${Math.min(order++ * 48, 480)}ms`);
      mask.append(word);
      fragment.append(mask);
    });
    node.replaceWith(fragment);
  });
  heading.setAttribute('aria-label', label);
  heading.classList.add('word-reveal');
}
function setupReveals() {
  revealObserver?.disconnect();
  const enabled = 'IntersectionObserver' in window && !reducedMotion.matches;
  document.documentElement.classList.toggle('js-motion', enabled);
  if (!enabled) {
    document.querySelectorAll('.word-reveal').forEach(heading => heading.classList.add('words-visible'));
    document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
    return;
  }
  document.querySelectorAll('h1, main h2').forEach(splitHeading);
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add(entry.target.classList.contains('word-reveal') ? 'words-visible' : 'visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -25px 0px' });
  document.querySelectorAll('.reveal, .word-reveal').forEach((element, index) => {
    if (element.closest('.services-grid, .process-grid, .project-grid')) element.style.transitionDelay = `${(index % 3) * 70}ms`;
    revealObserver.observe(element);
  });
}
setupReveals();
reducedMotion.addEventListener('change', setupReveals);

const menu = document.querySelector('.menu-toggle');
const navigation = document.getElementById('navigation');
function closeMenu() {
  navigation.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open menu');
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  navigation.classList.toggle('open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
document.querySelectorAll('[data-service]').forEach(card => card.addEventListener('click', () => {
  document.getElementById('service-select').value = card.dataset.service;
}));

document.querySelector('.enquiry-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const message = `Hi ASAP Plumbing! I'd like to enquire about ${data.get('service')}.\n\nName: ${data.get('name').trim()}\nPhone: ${data.get('phone').trim()}\nSuburb: ${data.get('suburb').trim()}\n\n${data.get('message').trim()}`;
  const url = whatsappUrl(message);
  window.open(url, '_blank', 'noopener,noreferrer');
  const status = document.getElementById('form-status');
  status.replaceChildren(document.createTextNode('Your message is ready. '));
  const retry = document.createElement('a');
  retry.href = url;
  retry.target = '_blank';
  retry.rel = 'noopener noreferrer';
  retry.textContent = 'Open WhatsApp to review and send ↗';
  retry.style.textDecoration = 'underline';
  status.append(retry);
});

const chatPanel = document.getElementById('chat-panel');
const chatToggle = document.getElementById('chat-toggle');
const chatInput = document.getElementById('chat-input');
const messages = document.getElementById('chat-messages');
let returnFocus = chatToggle;
const conversation = [];
function setChat(open, trigger) {
  if (open && trigger) returnFocus = trigger;
  chatPanel.hidden = !open;
  chatToggle.setAttribute('aria-expanded', String(open));
  chatToggle.setAttribute('aria-label', open ? 'Close ASAP AI assistant demo' : 'Open ASAP AI assistant demo');
  if (open) chatInput.focus({ preventScroll: true });
  else returnFocus.focus({ preventScroll: true });
}
chatToggle.addEventListener('click', () => setChat(chatPanel.hidden, chatToggle));
document.getElementById('chat-close').addEventListener('click', () => setChat(false));
document.querySelectorAll('[data-open-chat]').forEach(button => button.addEventListener('click', () => setChat(true, button)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (!chatPanel.hidden) setChat(false);
    if (navigation.classList.contains('open')) { closeMenu(); menu.focus(); }
  }
});
function responseFor(text) {
  const query = text.toLowerCase();
  if (/emergen|burst|flood|urgent/.test(query)) return 'For urgent plumbing help, call 065 191 8511 now. ASAP offers a 24-hour service; the team will confirm availability. If water is escaping, close your main water valve only if it is safe and accessible. Stay away from wet electrical fittings. You can also use the WhatsApp button below to share your suburb and issue.';
  if (/geyser|hot water|insurance/.test(query)) return 'ASAP handles geyser installations, repairs and replacements, and deals with insurance claims. Is your geyser leaking, or do you have no hot water? Share your suburb and the issue with the team on WhatsApp. Please leave electrical or pressurised equipment to a qualified professional.';
  if (/area|suburb|cover|bellville|parklands|table view|brackenfell|cape town/.test(query)) return 'The team serves Cape Town: Northern and Southern Suburbs, City Centre, Peninsula, Atlantic Seaboard, Helderberg and Blaauwberg. Send your suburb and address area on WhatsApp to confirm coverage and availability.';
  if (/price|cost|quote|fee|charge/.test(query)) return 'ASAP advertises no call-out fees. Job pricing depends on the issue and the work required. Share a short description, your suburb and photos with the team for a quote. I can prepare the conversation, but cannot confirm prices or bookings.';
  if (/drain|block|toilet/.test(query)) return 'The team can help with blocked drains, sinks and toilets. Tell them which fixture is affected, when it started and your suburb. If water is overflowing, stop using the affected fixture. Continue on WhatsApp below to request assistance.';
  if (/bathroom|renovat|install|tap|leak|repair|maint/.test(query)) return 'ASAP offers general plumbing, repairs, maintenance, bathroom renovations and new installations. Describe what you need, where you are in Cape Town and your preferred timing. The WhatsApp link below will include our conversation so the team has context.';
  if (/book|appoint|schedule|available/.test(query)) return 'The ASAP team will need to confirm a time and availability directly. Send your suburb, the work you need and your preferred timing using the WhatsApp link below. This demo does not create a booking.';
  if (/hello|^hi\b|hey/.test(query)) return 'Hi! What can I help you with: an emergency, a geyser problem, blocked drains, a renovation or a quote?';
  return 'I can help with services, geysers, blocked drains, Cape Town coverage and quote enquiries. For advice specific to your issue, continue to the ASAP team on WhatsApp below. Your messages here will be included, ready for you to review before sending.';
}
function addMessage(text, type) {
  const element = document.createElement('div');
  element.className = `message ${type}`;
  element.textContent = text;
  messages.append(element);
  while (messages.children.length > 35) messages.firstElementChild.remove();
  messages.scrollTop = messages.scrollHeight;
}
function ask(text) {
  const question = text.trim().slice(0, 500);
  if (!question) return;
  addMessage(question, 'user');
  const response = responseFor(question);
  addMessage(response, 'bot');
  conversation.push(question);
  if (conversation.length > 8) conversation.shift();
  document.getElementById('chat-handoff').href = whatsappUrl(`Hi ASAP Plumbing, I used the website assistant and need help.\n\nMy enquiry:\n${conversation.join('\n')}`);
}
document.getElementById('chat-form').addEventListener('submit', event => {
  event.preventDefault();
  ask(chatInput.value);
  chatInput.value = '';
  chatInput.focus();
});
document.querySelectorAll('[data-question]').forEach(button => button.addEventListener('click', () => ask(button.dataset.question)));
