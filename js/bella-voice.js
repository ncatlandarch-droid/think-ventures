/**
 * Bella Voice Guide — Think! Ventures
 * 
 * Makes Bella speak contextual messages as users navigate.
 * Uses Web Speech API with a female voice.
 * Bella speaks when:
 *   - Page first loads (welcome)
 *   - User scrolls to key sections
 *   - User clicks Bella
 */

const BellaVoice = (() => {
  let synth = null;
  let selectedVoice = null;
  let hasSpoken = {};
  let isReady = false;
  let isMuted = false;

  // Messages for each section
  const SECTION_MESSAGES = {
    welcome: "Hey there! I'm Bella, your guide to Think Ventures. Scroll down to see how we build businesses for free!",
    explainer: "This is our full explainer video. Watch it to understand how we turn your dream into a real business.",
    mission: "We serve first-generation founders, H-B-C-U communities, and rural entrepreneurs who can't afford to wait.",
    'how-it-works': "Here's the step-by-step process. From dream to launch in just days. Zero cost to you.",
    programs: "Four powerful programs. LaunchPad builds your business. MerchEngine creates your store. Plus workshops and our AI lab.",
    proof: "Arlan L-L-C is our proof of concept. Built from zero to a fully operational business in one day. Forty-one thousand dollars of value.",
    partners: "Meet our partner ecosystem. Every partner helps strengthen the network for all entrepreneurs.",
    transparency: "Full transparency. Every dollar in, every dollar out. We believe founders deserve to see where the money goes.",
    apply: "Ready to start? Click apply and let's build your business together!",
  };

  // Click messages (random)
  const CLICK_MESSAGES = [
    "Need help? Click LaunchPad Tool in the menu to start your business!",
    "Every entrepreneur deserves a chance. That's why we do this.",
    "Have you watched the explainer video yet? It's really good!",
    "Fun fact: we built our first business in just one day!",
    "Did you know all of this is completely free for founders?",
  ];

  // Find a good female voice
  function findFemaleVoice(voices) {
    // Priority: look for specific good female voices
    const preferred = [
      'Microsoft Zira',
      'Google US English Female',
      'Samantha',
      'Karen',
      'Moira',
      'Tessa',
      'Fiona',
      'Victoria',
      'Microsoft Jenny',
    ];

    for (const pref of preferred) {
      const match = voices.find(v => v.name.includes(pref));
      if (match) return match;
    }

    // Fallback: any English female voice
    const englishFemale = voices.find(v =>
      v.lang.startsWith('en') &&
      (v.name.toLowerCase().includes('female') ||
       v.name.includes('Zira') ||
       v.name.includes('Hazel') ||
       v.name.includes('Susan'))
    );
    if (englishFemale) return englishFemale;

    // Final fallback: first English voice
    return voices.find(v => v.lang.startsWith('en')) || voices[0];
  }

  function init() {
    if (!('speechSynthesis' in window)) {
      console.log('Bella Voice: Speech synthesis not supported');
      return;
    }

    synth = window.speechSynthesis;

    function loadVoices() {
      const voices = synth.getVoices();
      if (voices.length > 0) {
        selectedVoice = findFemaleVoice(voices);
        isReady = true;
        console.log('Bella Voice: Using', selectedVoice.name);
        setupScrollObserver();
        // Welcome after 2 seconds
        setTimeout(() => speak('welcome'), 2000);
      }
    }

    // Voices load async in some browsers
    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
  }

  function speak(sectionId) {
    if (!isReady || isMuted) return;
    if (hasSpoken[sectionId]) return;

    const text = SECTION_MESSAGES[sectionId];
    if (!text) return;

    // Cancel any current speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = 0.95;
    utterance.pitch = 1.15;
    utterance.volume = 0.85;

    // Add speaking ring animation
    const bellaFloat = document.getElementById('bellaFloat');
    const bellaRing = bellaFloat?.querySelector('.bella-float__ring');
    if (bellaRing) {
      utterance.onstart = () => bellaRing.classList.add('speaking');
      utterance.onend = () => bellaRing.classList.remove('speaking');
    }

    synth.speak(utterance);
    hasSpoken[sectionId] = true;
  }

  function speakRandom() {
    if (!isReady || isMuted) return;
    synth.cancel();
    const msg = CLICK_MESSAGES[Math.floor(Math.random() * CLICK_MESSAGES.length)];
    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.voice = selectedVoice;
    utterance.rate = 0.95;
    utterance.pitch = 1.15;
    utterance.volume = 0.85;

    const bellaRing = document.querySelector('.bella-float__ring');
    if (bellaRing) {
      utterance.onstart = () => bellaRing.classList.add('speaking');
      utterance.onend = () => bellaRing.classList.remove('speaking');
    }

    synth.speak(utterance);
  }

  function toggleMute() {
    isMuted = !isMuted;
    if (isMuted) synth.cancel();
    const muteBtn = document.getElementById('bellaMuteBtn');
    if (muteBtn) {
      muteBtn.innerHTML = isMuted
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
    }
    return isMuted;
  }

  function setupScrollObserver() {
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          speak(entry.target.id);
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(section => observer.observe(section));
  }

  return { init, speak, speakRandom, toggleMute };
})();

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', BellaVoice.init);
