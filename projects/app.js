/**
 * IUS Engineering Club — Innovation Projects Showcase Engine
 * Bilingual (TR/EN), Scroll-Snap Observer, In-Place Live Edit,
 * Interactive 3D Card Tilt, and Web Audio API Haptics.
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. DICTIONARY & I18N
  // --------------------------------------------------------------------------
  const I18N = {
    tr: {
      sound_label: "Ses: Kapalı",
      sound_on: "Ses: Açık",
      all_projects: "Tüm Projeler",
      nav_observatory: "Observatory",
      nav_certificates: "Sertifikalar",
      btn_submit_idea: "Fikir Gönder",
      hero_title_1: "Kampüsü Değiştiren",
      hero_title_2: "Mühendislik Vizyonu.",
      hero_subtitle: "Öğrenciler tarafından tasarlandı, geleceğe göre mühendisliği yapıldı. FENS amfilerinden teknoloji ekosistemine uzanan amiral gemisi donanım, yapay zeka ve yazılım inovasyonlarımız.",
      hero_explore: "Projeleri Keşfet",
      hero_flagships: "Amiral Gemisi Donanımlar",
      stat_active_projects: "Aktif Mühendislik Projesi",
      stat_budget: "Dengeli Bütçe Mimarisi",
      stat_budget_val: "1.300 KM",
      stat_open_source: "Öğrenci Üretimi & Açık Donanım",
      scroll_hint: "Aşağı Kaydırın",
      drawer_title: "Proje Kataloğu",
      drawer_subtitle: "Doğrudan istediğiniz inovasyona atlayın",
      search_placeholder: "Proje, kategori veya etiket ara...",
      edit_modal_title: "Projeyi Düzenle",
      edit_modal_desc: "Metinleri, bütçeyi, görselleri ve teknik parametreleri anında değiştirin.",
      label_title_tr: "Başlık (Türkçe)",
      label_title_en: "Başlık (İngilizce)",
      label_tagline_tr: "Slogan / Kısa Açıklama (Türkçe)",
      label_tagline_en: "Slogan / Kısa Açıklama (İngilizce)",
      label_category_tr: "Kategori (TR)",
      label_author: "Öneren / Yazar",
      label_budget: "Bütçe Planı",
      label_difficulty: "Zorluk Seviyesi (1 - 5)",
      label_owner: "Proje Sorumlusu / Ekip (TR)",
      label_palette: "Renk Paleti (5 Resmi Seçenek)",
      label_gallery: "Konsept Görsel Seçimi",
      ph_custom_url: "veya Özel Görsel URL'si yapıştırın...",
      label_problem_tr: "Problem / Gerekçe (Türkçe)",
      label_problem_en: "Problem / Gerekçe (İngilizce)",
      label_solution_tr: "Çözüm & Mühendislik İşleyişi (Türkçe)",
      label_solution_en: "Çözüm & Mühendislik İşleyişi (İngilizce)",
      label_first_step_tr: "İlk Somut Adım (Türkçe)",
      label_first_step_en: "İlk Somut Adım (İngilizce)",
      btn_reset: "Varsayılana Sıfırla",
      btn_copy_json: "JSON Kopyala",
      btn_download_json: "JSON İndir",
      btn_save_changes: "Değişiklikleri Kaydet",
      card_problem_title: "Problem & İhtiyaç",
      card_solution_title: "Mühendislik Çözümü",
      btn_edit: "Düzenle",
      btn_share: "Paylaş",
      spec_budget_label: "Bütçe Planı",
      toast_copied: "Proje bağlantısı panoya kopyalandı!",
      toast_saved: "Değişiklikler başarıyla kaydedildi!",
      toast_json_copied: "Güncel proje verisi JSON olarak panoya kopyalandı!",
      toast_json_downloaded: "projects.json indirildi",
      toast_reset: "Proje orijinal fabrika ayarlarına sıfırlandı!",
      title_sound: "Ses Aç/Kapat",
      title_palette: "Genel Renk Paleti",
      title_submit: "Yeni Proje / Fikir Gönder",
      title_switch_palette: "Renk Paletini Değiştir",
      theme_changed: "Genel tema:"
    },
    en: {
      sound_label: "Sound: Muted",
      sound_on: "Sound: Active",
      all_projects: "All Projects",
      nav_observatory: "Observatory",
      nav_certificates: "Certificates",
      btn_submit_idea: "Submit Idea",
      hero_title_1: "Engineering Vision",
      hero_title_2: "Transforming Campus.",
      hero_subtitle: "Crafted by students, engineered for the future. From FENS lecture halls to the regional tech ecosystem: flagship hardware, AI, and software innovations.",
      hero_explore: "Explore Innovations",
      hero_flagships: "Flagship Hardware",
      stat_active_projects: "Active Engineering Projects",
      stat_budget: "Balanced Budget Architecture",
      stat_budget_val: "1,300 KM",
      stat_open_source: "Student Built & Open Hardware",
      scroll_hint: "Scroll Down",
      drawer_title: "Project Catalog",
      drawer_subtitle: "Jump directly to any engineering initiative",
      search_placeholder: "Search projects, categories or tags...",
      edit_modal_title: "Edit Project Specs",
      edit_modal_desc: "Directly modify copy, budget, AI renders and engineering parameters in real-time.",
      label_title_tr: "Title (Turkish)",
      label_title_en: "Title (English)",
      label_tagline_tr: "Tagline / Summary (Turkish)",
      label_tagline_en: "Tagline / Summary (English)",
      label_category_tr: "Category (TR)",
      label_author: "Submitted By / Author",
      label_budget: "Budget Scope",
      label_difficulty: "Difficulty Level (1 - 5)",
      label_owner: "Project Lead / Team (TR)",
      label_palette: "Color Palette (5 Official Choices)",
      label_gallery: "Concept Visual Selection",
      ph_custom_url: "or paste custom Image URL...",
      label_problem_tr: "Problem / Motivation (Turkish)",
      label_problem_en: "Problem / Motivation (English)",
      label_solution_tr: "Solution & Engineering (Turkish)",
      label_solution_en: "Solution & Technical Operation (English)",
      label_first_step_tr: "First Concrete Step (Turkish)",
      label_first_step_en: "First Concrete Step (English)",
      btn_reset: "Reset to Default",
      btn_copy_json: "Copy JSON",
      btn_download_json: "Download JSON",
      btn_save_changes: "Save Changes",
      card_problem_title: "Problem & Motivation",
      card_solution_title: "Engineering Solution",
      btn_edit: "Edit Project",
      btn_share: "Share",
      spec_budget_label: "Budget Scope",
      toast_copied: "Project link copied to clipboard!",
      toast_saved: "Project updated and persisted locally!",
      toast_json_copied: "Updated project JSON copied to clipboard!",
      toast_json_downloaded: "projects.json downloaded",
      toast_reset: "Reset back to factory defaults!",
      title_sound: "Toggle Sound",
      title_palette: "Global Color Palette",
      title_submit: "Submit New Project / Idea",
      title_switch_palette: "Switch Color Palette",
      theme_changed: "Global theme:"
    }
  };

  // Runtime Translation Fallback for Specifications
  const SPEC_TRANSLATIONS = {
    'Mimari': { en: 'Architecture', tr: 'Mimari' },
    'Architecture': { en: 'Architecture', tr: 'Mimari' },
    'Doğrulama': { en: 'Authentication', tr: 'Doğrulama' },
    'Authentication': { en: 'Authentication', tr: 'Doğrulama' },
    'Güvenlik': { en: 'Safety & Sensors', tr: 'Güvenlik' },
    'Safety & Sensors': { en: 'Safety & Sensors', tr: 'Güvenlik' },
    'Şasi': { en: 'Chassis & Enclosure', tr: 'Şasi' },
    'Chassis & Enclosure': { en: 'Chassis & Enclosure', tr: 'Şasi' },
    'Platform': { en: 'Platform', tr: 'Platform' },
    'Veri Kaynağı': { en: 'Data Source', tr: 'Veri Kaynağı' },
    'Data Source': { en: 'Data Source', tr: 'Veri Kaynağı' },
    'Geliştirme Maliyeti': { en: 'Development Cost', tr: 'Geliştirme Maliyeti' },
    'Maliyet': { en: 'Development Cost', tr: 'Maliyet' },
    'Development Cost': { en: 'Development Cost', tr: 'Geliştirme Maliyeti' },
    'Kapsam': { en: 'Scope', tr: 'Kapsam' },
    'Scope': { en: 'Scope', tr: 'Kapsam' },
    'Katılımcı': { en: 'Participants', tr: 'Katılımcı' },
    'Participants': { en: 'Participants', tr: 'Katılımcı' },
    'Süre': { en: 'Duration', tr: 'Süre' },
    'Duration': { en: 'Duration', tr: 'Süre' },
    'Ödül': { en: 'Prizes', tr: 'Ödül' },
    'Prizes': { en: 'Prizes', tr: 'Ödül' },
    'Lokasyon': { en: 'Location', tr: 'Lokasyon' },
    'Location': { en: 'Location', tr: 'Lokasyon' },
    'Periyot': { en: 'Cadence', tr: 'Periyot' },
    'Cadence': { en: 'Cadence', tr: 'Periyot' },
    'Format': { en: 'Format', tr: 'Format' },
    'Kapasite': { en: 'Capacity', tr: 'Kapasite' },
    'Capacity': { en: 'Capacity', tr: 'Kapasite' },
    'Sertifika': { en: 'Certification', tr: 'Sertifika' },
    'Certification': { en: 'Certification', tr: 'Sertifika' },
    'Katılım': { en: 'Attendance', tr: 'Katılım' },
    'Attendance': { en: 'Attendance', tr: 'Katılım' },
    'Konuşmacılar': { en: 'Speakers', tr: 'Konuşmacılar' },
    'Speakers': { en: 'Speakers', tr: 'Konuşmacılar' },
    'Sergi': { en: 'Exhibition', tr: 'Sergi' },
    'Exhibition': { en: 'Exhibition', tr: 'Sergi' },
    'Kariyer': { en: 'Career Track', tr: 'Kariyer' },
    'Career Track': { en: 'Career Track', tr: 'Kariyer' }
  };

  // --------------------------------------------------------------------------
  // PALETTES DEFINITIONS (5 Authentic Palettes with Exact Hex Codes)
  // --------------------------------------------------------------------------
  const PALETTES = {
    'gothic-noir': {
      id: 'gothic-noir',
      name: 'Gothic noir',
      swatches: ['#000000', '#D1D0D0', '#988686', '#5C4E4E']
    },
    'cobalt-sky': {
      id: 'cobalt-sky',
      name: 'Cobalt sky',
      swatches: ['#0047AB', '#000080', '#82C8E5', '#6D8196']
    },
    'chili-spice': {
      id: 'chili-spice',
      name: 'Chili spice',
      swatches: ['#CD1C18', '#FFA896', '#9B1313', '#38000A']
    },
    'ink-wash': {
      id: 'ink-wash',
      name: 'Ink wash',
      swatches: ['#4A4A4A', '#CBCBCB', '#FFFFE3', '#6D8196']
    },
    'urban-loft': {
      id: 'urban-loft',
      name: 'Urban loft',
      swatches: ['#9C9A9A', '#A35E47', '#000000', '#464646']
    }
  };

  // --------------------------------------------------------------------------
  // 2. STATE & STORAGE
  // --------------------------------------------------------------------------
  let currentLang = localStorage.getItem('iec_lang') || 'tr';
  let soundEnabled = false;
  let audioCtx = null;
  let activeSectionIndex = 0;

  // Retrieve customized projects from localStorage if available
  let projectsData = [];
  try {
    const cachedCustom = localStorage.getItem('iec_projects_custom');
    if (cachedCustom) {
      const parsed = JSON.parse(cachedCustom);
      // Invalidate if cache contains legacy non-bilingual specs or outdated projects
      if (parsed.some(p => p.id === 'autonomous-campus-rover' || 
          (p.title && (p.title.tr || '').includes('Rover')) || 
          !parsed.some(p => p.id === 'dining-menu-system') ||
          typeof p.budget === 'string' ||
          (p.specs && p.specs.some(s => typeof s.label === 'string')))) {
        localStorage.removeItem('iec_projects_custom');
        projectsData = JSON.parse(JSON.stringify(window.IEC_PROJECTS || []));
      } else {
        projectsData = parsed;
      }
    } else if (window.IEC_PROJECTS && Array.isArray(window.IEC_PROJECTS)) {
      projectsData = JSON.parse(JSON.stringify(window.IEC_PROJECTS));
    }
  } catch (err) {
    console.warn("Could not load custom cache, using base data:", err);
    projectsData = window.IEC_PROJECTS || [];
  }

  // --------------------------------------------------------------------------
  // 3. SOUND SYNTHESIZER (Minimalist UI Feedback)
  // --------------------------------------------------------------------------
  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playUiBeep(freq = 600, duration = 0.04) {
    if (!soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    const pill = document.getElementById('audio-indicator');
    const label = pill.querySelector('.sound-label');
    if (soundEnabled) {
      initAudio();
      pill.classList.add('active');
      label.textContent = I18N[currentLang].sound_on;
      playUiBeep(880, 0.08);
      showToast(I18N[currentLang].sound_on);
    } else {
      pill.classList.remove('active');
      label.textContent = I18N[currentLang].sound_label;
      showToast(I18N[currentLang].sound_label);
    }
  }

  // --------------------------------------------------------------------------
  // 4. TOAST NOTIFICATIONS
  // --------------------------------------------------------------------------
  function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // --------------------------------------------------------------------------
  // 5. RENDER PROJECTS DOM
  // --------------------------------------------------------------------------
  function renderAllProjects() {
    const wrapper = document.getElementById('projects-wrapper');
    const dotsList = document.getElementById('progress-dots-list');
    const navCount = document.getElementById('nav-project-count');

    if (navCount) {
      navCount.textContent = projectsData.length;
    }

    wrapper.innerHTML = '';
    dotsList.innerHTML = '';

    // Hero dot
    const heroDot = document.createElement('li');
    heroDot.className = 'dot-item active';
    heroDot.innerHTML = `
      <button class="dot-btn" aria-label="Hero"></button>
      <div class="dot-tooltip">00 // Intro</div>
    `;
    heroDot.addEventListener('click', () => {
      playUiBeep(520, 0.03);
      document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
    });
    dotsList.appendChild(heroDot);

    projectsData.forEach((project, index) => {
      // 1. Build Project Section DOM
      const section = document.createElement('section');
      section.className = 'snap-section project-section';
      section.id = `project-${index}`;
      section.dataset.index = index + 1;

      // Palette Resolution: Stored per project, or project.palette, or harmonious fallback cycle
      const defaultPaletteCycle = ['cobalt-sky', 'urban-loft', 'chili-spice', 'ink-wash', 'gothic-noir'];
      const fallbackPalette = defaultPaletteCycle[index % defaultPaletteCycle.length];
      const savedPalette = localStorage.getItem('iec_palette_' + project.id) || project.palette || fallbackPalette;
      const currentPalConfig = PALETTES[savedPalette] || PALETTES['gothic-noir'];
      section.dataset.palette = currentPalConfig.id;

      const title = typeof project.title === 'object' ? (project.title[currentLang] || project.title.tr || '') : (project.title || '');
      const tagline = typeof project.tagline === 'object' ? (project.tagline[currentLang] || project.tagline.tr || '') : (project.tagline || '');
      const category = typeof project.category === 'object' ? (project.category[currentLang] || project.category.tr || '') : (project.category || '');
      const problem = typeof project.problem === 'object' ? (project.problem[currentLang] || project.problem.tr || '') : (project.problem || '');
      const solution = typeof project.solution === 'object' ? (project.solution[currentLang] || project.solution.tr || '') : (project.solution || '');
      const ownership = typeof project.ownership === 'object' ? (project.ownership[currentLang] || project.ownership.tr || '') : (project.author || '');
      
      let rawBudget = project.budget;
      let budgetVal = typeof rawBudget === 'object' ? (rawBudget[currentLang] || rawBudget.tr || '') : (rawBudget || '');

      // Specs Cells HTML (cleanly including budget projection in specs table)
      const allSpecs = [];
      (project.specs || []).forEach(s => {
        let l = typeof s.label === 'object' ? (s.label[currentLang] || s.label.tr || '') : s.label;
        let v = typeof s.value === 'object' ? (s.value[currentLang] || s.value.tr || '') : s.value;
        if (SPEC_TRANSLATIONS[l]) {
          l = SPEC_TRANSLATIONS[l][currentLang] || l;
        }
        allSpecs.push({ label: l, value: v });
      });

      if (budgetVal && budgetVal !== 'Planned') {
        allSpecs.push({
          label: I18N[currentLang].spec_budget_label,
          value: budgetVal
        });
      }

      const specsHtml = allSpecs.map(s => `
        <div class="spec-cell">
          <span class="spec-name">${s.label}</span>
          <span class="spec-val">${s.value}</span>
        </div>
      `).join('');

      // Gallery Thumbs HTML
      const gallery = project.gallery && project.gallery.length > 0 ? project.gallery : [project.image];
      const galleryThumbsHtml = gallery.length > 1 ? gallery.map((imgSrc, gIdx) => `
        <div class="thumb-item ${gIdx === 0 ? 'active' : ''}" data-src="${imgSrc}">
          <img src="${imgSrc}" alt="Thumbnail ${gIdx + 1}" loading="lazy">
        </div>
      `).join('') : '';

      section.innerHTML = `
        <div class="project-stage">
          <!-- LEFT NARRATIVE -->
          <div class="project-narrative">
            <div class="project-header-meta">
              <span class="project-category-text">${category}</span>
              <span class="project-lead-meta">${ownership}</span>
            </div>

            <h2 class="project-title">${title}</h2>
            <p class="project-tagline">${tagline}</p>

            <!-- Problem & Solution Cards (Clean & Emoji-Free) -->
            <div class="project-cards-container">
              <div class="feature-glass-card">
                <div class="card-title-bar">
                  <span class="card-title-text">${I18N[currentLang].card_problem_title}</span>
                </div>
                <p class="card-body-text">${problem}</p>
              </div>

              <div class="feature-glass-card">
                <div class="card-title-bar">
                  <span class="card-title-text">${I18N[currentLang].card_solution_title}</span>
                </div>
                <p class="card-body-text">${solution}</p>
              </div>
            </div>

            <!-- Technical Specs Grid -->
            ${specsHtml ? `<div class="tech-specs-bar">${specsHtml}</div>` : ''}

            <!-- Action Buttons -->
            <div class="project-actions-row">
              <button class="btn-edit-trigger" data-edit-index="${index}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span>${I18N[currentLang].btn_edit}</span>
              </button>

              <!-- INLINE PALETTE PICKER TRIGGER -->
              <div class="palette-picker-inline" id="palette-picker-${index}">
                <button class="btn-palette-trigger" type="button" data-palette-trigger="${index}" title="Renk Paletini Değiştir / Switch Palette">
                  <div class="palette-dots-preview">
                    <span style="background: ${currentPalConfig.swatches[0]}"></span>
                    <span style="background: ${currentPalConfig.swatches[1]}"></span>
                    <span style="background: ${currentPalConfig.swatches[2]}"></span>
                    <span style="background: ${currentPalConfig.swatches[3]}"></span>
                  </div>
                  <span class="palette-name-label">${currentPalConfig.name}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div class="palette-flyout-menu" id="palette-flyout-${index}">
                  ${Object.values(PALETTES).map(pal => `
                    <div class="palette-choice-item ${pal.id === currentPalConfig.id ? 'active' : ''}" data-project-idx="${index}" data-palette-id="${pal.id}">
                      <span class="palette-choice-name">${pal.name}</span>
                      <div class="palette-swatch-bar">
                        <span style="background: ${pal.swatches[0]}"></span>
                        <span style="background: ${pal.swatches[1]}"></span>
                        <span style="background: ${pal.swatches[2]}"></span>
                        <span style="background: ${pal.swatches[3]}"></span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <button class="btn-icon-subtle" data-share-index="${index}" title="${I18N[currentLang].btn_share}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
              </button>
            </div>
          </div>

          <!-- RIGHT HERO VISUAL STAGE (Pure Photo Presentation, Zero Overlay Tags) -->
          <div class="project-visual-stage">
            <div class="visual-canvas-card" id="card-stage-${index}">
              <img src="${project.image}" alt="${title}" class="visual-image" id="main-img-${index}" loading="lazy">
            </div>

            ${galleryThumbsHtml ? `<div class="visual-gallery-thumbs" id="thumbs-${index}">${galleryThumbsHtml}</div>` : ''}
          </div>
        </div>
      `;

      wrapper.appendChild(section);

      // 2. Build Dot Nav Item
      const dot = document.createElement('li');
      dot.className = 'dot-item';
      dot.dataset.targetIndex = index + 1;
      dot.innerHTML = `
        <button class="dot-btn" aria-label="${title}"></button>
        <div class="dot-tooltip">0${index + 1} // ${title}</div>
      `;
      dot.addEventListener('click', () => {
        playUiBeep(640, 0.03);
        section.scrollIntoView({ behavior: 'smooth' });
      });
      dotsList.appendChild(dot);

      // 3. Attach 3D Card Tilt Effect
      attach3DTilt(section.querySelector(`#card-stage-${index}`));

      // 4. Attach Gallery switcher listeners
      const thumbsContainer = section.querySelector(`#thumbs-${index}`);
      if (thumbsContainer) {
        thumbsContainer.querySelectorAll('.thumb-item').forEach(th => {
          th.addEventListener('click', () => {
            playUiBeep(720, 0.02);
            thumbsContainer.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
            th.classList.add('active');
            const mainImg = section.querySelector(`#main-img-${index}`);
            if (mainImg) {
              mainImg.src = th.dataset.src;
            }
          });
        });
      }
    });

    // Populate Drawer List
    populateDrawerList();

    // Rebind In-Place Edit Buttons
    document.querySelectorAll('.btn-edit-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.dataset.editIndex, 10);
        openEditModal(idx);
      });
    });

    // Rebind Share Buttons
    document.querySelectorAll('[data-share-index]').forEach(btn => {
      btn.addEventListener('click', () => {
        playUiBeep(800, 0.04);
        const url = window.location.origin + window.location.pathname + `#project-${btn.dataset.shareIndex}`;
        navigator.clipboard.writeText(url).then(() => {
          showToast(I18N[currentLang].toast_copied);
        });
      });
    });

    // Rebind Palette Trigger Buttons
    document.querySelectorAll('[data-palette-trigger]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pIdx = btn.dataset.paletteTrigger;
        const flyout = document.getElementById(`palette-flyout-${pIdx}`);
        if (!flyout) return;
        const isOpen = flyout.classList.contains('open');
        document.querySelectorAll('.palette-flyout-menu').forEach(f => f.classList.remove('open'));
        if (!isOpen) {
          flyout.classList.add('open');
          playUiBeep(640, 0.02);
        }
      });
    });

    // Rebind Palette Choices in Flyout (Instant Change & Persistence)
    document.querySelectorAll('.palette-flyout-menu .palette-choice-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const pIdx = parseInt(item.dataset.projectIdx, 10);
        const paletteId = item.dataset.paletteId;
        if (!isNaN(pIdx) && paletteId) {
          applyPaletteToProject(pIdx, paletteId);
        }
      });
    });

    // Setup Intersection Observer for slide tracking
    setupScrollObserver();
  }

  // --------------------------------------------------------------------------
  // PALETTE APPLICATION & SWITCHING ENGINE
  // --------------------------------------------------------------------------
  function applyPaletteToProject(pIdx, paletteId) {
    const project = projectsData[pIdx];
    if (!project || !PALETTES[paletteId]) return;

    const pal = PALETTES[paletteId];
    const sec = document.getElementById(`project-${pIdx}`);
    if (sec) {
      sec.dataset.palette = paletteId;
    }

    // Update the trigger button on this slide
    const picker = document.getElementById(`palette-picker-${pIdx}`);
    if (picker) {
      const dots = picker.querySelectorAll('.palette-dots-preview span');
      if (dots.length >= 4) {
        dots[0].style.background = pal.swatches[0];
        dots[1].style.background = pal.swatches[1];
        dots[2].style.background = pal.swatches[2];
        dots[3].style.background = pal.swatches[3];
      }
      const label = picker.querySelector('.palette-name-label');
      if (label) label.textContent = pal.name;

      // Update active state in flyout
      picker.querySelectorAll('.palette-choice-item').forEach(ch => {
        ch.classList.toggle('active', ch.dataset.paletteId === paletteId);
      });

      // Close flyout
      const flyout = picker.querySelector('.palette-flyout-menu');
      if (flyout) flyout.classList.remove('open');
    }

    // Save to project object & dedicated localStorage key so it stays permanently!
    project.palette = paletteId;
    localStorage.setItem(`iec_palette_${project.id}`, paletteId);
    try {
      localStorage.setItem('iec_projects_custom', JSON.stringify(projectsData));
    } catch (err) {}

    playUiBeep(840, 0.04);
    showToast(currentLang === 'tr' ? `Palet güncellendi: ${pal.name}` : `Palette updated: ${pal.name}`);
  }

  function initGlobalPaletteSwitcher() {
    const globalTrigger = document.getElementById('btn-global-palette-trigger');
    const globalFlyout = document.getElementById('global-palette-flyout');
    const globalDots = document.getElementById('global-palette-dots');
    const globalLabel = document.getElementById('global-palette-label');
    if (!globalTrigger || !globalFlyout) return;

    let savedGlobal = localStorage.getItem('iec_global_palette') || 'gothic-noir';
    if (!PALETTES[savedGlobal]) savedGlobal = 'gothic-noir';

    function updateGlobalTriggerUI(paletteId) {
      const pal = PALETTES[paletteId];
      if (!pal) return;
      if (globalDots) {
        const dots = globalDots.querySelectorAll('span');
        if (dots.length >= 4) {
          dots[0].style.background = pal.swatches[0];
          dots[1].style.background = pal.swatches[1];
          dots[2].style.background = pal.swatches[2];
          dots[3].style.background = pal.swatches[3];
        }
      }
      if (globalLabel) globalLabel.textContent = pal.name;
    }

    // Populate global flyout
    globalFlyout.innerHTML = Object.values(PALETTES).map(pal => `
      <div class="palette-choice-item ${pal.id === savedGlobal ? 'active' : ''}" data-global-palette-id="${pal.id}">
        <span class="palette-choice-name">${pal.name}</span>
        <div class="palette-swatch-bar">
          <span style="background: ${pal.swatches[0]}"></span>
          <span style="background: ${pal.swatches[1]}"></span>
          <span style="background: ${pal.swatches[2]}"></span>
          <span style="background: ${pal.swatches[3]}"></span>
        </div>
      </div>
    `).join('');

    updateGlobalTriggerUI(savedGlobal);
    document.body.dataset.globalPalette = savedGlobal;

    globalTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = globalFlyout.classList.contains('open');
      document.querySelectorAll('.palette-flyout-menu').forEach(f => f.classList.remove('open'));
      if (!isOpen) {
        globalFlyout.classList.add('open');
        playUiBeep(640, 0.02);
      }
    });

    globalFlyout.querySelectorAll('.palette-choice-item').forEach(ch => {
      ch.addEventListener('click', (e) => {
        e.stopPropagation();
        const palId = ch.dataset.globalPaletteId;
        const pal = PALETTES[palId];
        if (!pal) return;

        savedGlobal = palId;
        localStorage.setItem('iec_global_palette', palId);
        document.body.dataset.globalPalette = palId;
        updateGlobalTriggerUI(palId);

        globalFlyout.querySelectorAll('.palette-choice-item').forEach(c => {
          c.classList.toggle('active', c.dataset.globalPaletteId === palId);
        });

        // Set all projects to this palette
        projectsData.forEach((p, idx) => {
          applyPaletteToProject(idx, palId);
        });

        globalFlyout.classList.remove('open');
        playUiBeep(920, 0.05);
        showToast(currentLang === 'tr' ? `Genel tema: ${pal.name}` : `Global theme: ${pal.name}`);
      });
    });
  }

  function initModalPaletteChoices(currentPaletteId) {
    const picker = document.getElementById('modal-palette-picker');
    const inputHidden = document.getElementById('edit-palette');
    if (!picker || !inputHidden) return;

    const activeId = currentPaletteId || inputHidden.value || 'gothic-noir';
    inputHidden.value = activeId;

    picker.innerHTML = Object.values(PALETTES).map(pal => `
      <div class="palette-modal-choice ${pal.id === activeId ? 'selected' : ''}" data-modal-palette-id="${pal.id}">
        <div class="palette-swatch-bar">
          <span style="background: ${pal.swatches[0]}"></span>
          <span style="background: ${pal.swatches[1]}"></span>
          <span style="background: ${pal.swatches[2]}"></span>
          <span style="background: ${pal.swatches[3]}"></span>
        </div>
        <span>${pal.name}</span>
      </div>
    `).join('');

    picker.querySelectorAll('.palette-modal-choice').forEach(choice => {
      choice.addEventListener('click', () => {
        playUiBeep(750, 0.02);
        picker.querySelectorAll('.palette-modal-choice').forEach(c => c.classList.remove('selected'));
        choice.classList.add('selected');
        inputHidden.value = choice.dataset.modalPaletteId;
      });
    });
  }

  // --------------------------------------------------------------------------
  // 6. INTERACTIVE 3D CARD TILT (Smooth Perspective Touch)
  // --------------------------------------------------------------------------
  function attach3DTilt(cardElement) {
    if (!cardElement) return;

    cardElement.addEventListener('mousemove', (e) => {
      const rect = cardElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -9; // Max 9 deg
      const rotateY = ((x - centerX) / centerX) * 9;

      cardElement.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    cardElement.addEventListener('mouseleave', () => {
      cardElement.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  }

  // --------------------------------------------------------------------------
  // 7. SCROLL OBSERVER & DOT TRACKER
  // --------------------------------------------------------------------------
  let observer = null;
  function setupScrollObserver() {
    if (observer) observer.disconnect();

    const sections = document.querySelectorAll('.snap-section');
    const dots = document.querySelectorAll('.side-progress-nav .dot-item');
    const counter = document.getElementById('slide-counter');

    const observerOptions = {
      root: document.getElementById('scroll-container'),
      threshold: 0.55
    };

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index, 10);
          activeSectionIndex = index;

          dots.forEach((dot, dIdx) => {
            if (dIdx === index) {
              dot.classList.add('active');
            } else {
              dot.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(sec => observer.observe(sec));
  }

  // --------------------------------------------------------------------------
  // 8. DRAWER CATALOG LIST
  // --------------------------------------------------------------------------
  function populateDrawerList() {
    const list = document.getElementById('drawer-projects-list');
    if (!list) return;

    list.innerHTML = '';
    projectsData.forEach((p, idx) => {
      const title = typeof p.title === 'object' ? (p.title[currentLang] || p.title.tr || '') : p.title;
      const cat = typeof p.category === 'object' ? (p.category[currentLang] || p.category.tr || '') : p.category;
      const card = document.createElement('a');
      card.className = 'drawer-project-card';
      card.href = `#project-${idx}`;
      card.innerHTML = `
        <img src="${p.image}" alt="${title}" class="drawer-card-thumb" loading="lazy">
        <div class="drawer-card-info">
          <div class="drawer-card-title">${title}</div>
          <div class="drawer-card-cat">${cat}</div>
        </div>
      `;
      card.addEventListener('click', (e) => {
        e.preventDefault();
        closeDrawer();
        playUiBeep(600, 0.03);
        const targetSec = document.getElementById(`project-${idx}`);
        if (targetSec) targetSec.scrollIntoView({ behavior: 'smooth' });
      });
      list.appendChild(card);
    });
  }

  function openDrawer() {
    playUiBeep(500, 0.04);
    const drawer = document.getElementById('index-drawer');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
  }

  function closeDrawer() {
    const drawer = document.getElementById('index-drawer');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }

  // Drawer Search Filter
  const searchInput = document.getElementById('drawer-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      document.querySelectorAll('.drawer-project-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? 'flex' : 'none';
      });
    });
  }

  // --------------------------------------------------------------------------
  // 9. IN-PLACE LIVE EDIT MODAL (DÜZENLEME SİSTEMİ)
  // --------------------------------------------------------------------------
  let currentlyEditingIndex = -1;

  function openEditModal(index) {
    currentlyEditingIndex = index;
    const p = projectsData[index];
    if (!p) return;

    playUiBeep(700, 0.04);
    const modal = document.getElementById('edit-modal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');

    // Populate Fields
    document.getElementById('edit-project-id').value = index;
    document.getElementById('edit-title-tr').value = (p.title && p.title.tr) || '';
    document.getElementById('edit-title-en').value = (p.title && p.title.en) || '';
    document.getElementById('edit-tagline-tr').value = (p.tagline && p.tagline.tr) || '';
    document.getElementById('edit-tagline-en').value = (p.tagline && p.tagline.en) || '';
    document.getElementById('edit-category-tr').value = (p.category && (p.category[currentLang] || p.category.tr)) || '';
    document.getElementById('edit-author').value = p.author || '';
    document.getElementById('edit-budget').value = typeof p.budget === 'object' ? (p.budget[currentLang] || p.budget.tr || '') : (p.budget || '');

    const diffSlider = document.getElementById('edit-difficulty');
    diffSlider.value = p.difficulty || 3;
    document.getElementById('edit-difficulty-val').textContent = `${p.difficulty || 3}/5`;

    document.getElementById('edit-ownership-tr').value = (p.ownership && (p.ownership[currentLang] || p.ownership.tr)) || p.author || '';
    document.getElementById('edit-image-url').value = p.image || '';

    document.getElementById('edit-problem-tr').value = (p.problem && p.problem.tr) || '';
    document.getElementById('edit-problem-en').value = (p.problem && p.problem.en) || '';
    document.getElementById('edit-solution-tr').value = (p.solution && p.solution.tr) || '';
    document.getElementById('edit-solution-en').value = (p.solution && p.solution.en) || '';

    document.getElementById('edit-first-step-tr').value = (p.first_step && p.first_step.tr) || '';
    document.getElementById('edit-first-step-en').value = (p.first_step && p.first_step.en) || '';

    // Initialize Palette Choices in Modal
    const currentPal = localStorage.getItem('iec_palette_' + p.id) || p.palette || 'gothic-noir';
    initModalPaletteChoices(currentPal);

    // Highlight matching gallery choice
    highlightSelectedGallery(p.image);
  }

  function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    currentlyEditingIndex = -1;
  }

  function highlightSelectedGallery(src) {
    document.querySelectorAll('.gallery-choice').forEach(choice => {
      if (choice.dataset.src === src) {
        choice.classList.add('selected');
      } else {
        choice.classList.remove('selected');
      }
    });
  }

  // Gallery Choice click
  document.querySelectorAll('.gallery-choice').forEach(choice => {
    choice.addEventListener('click', () => {
      playUiBeep(850, 0.02);
      highlightSelectedGallery(choice.dataset.src);
      document.getElementById('edit-image-url').value = choice.dataset.src;
    });
  });

  // Difficulty range slider change
  const diffSlider = document.getElementById('edit-difficulty');
  if (diffSlider) {
    diffSlider.addEventListener('input', (e) => {
      document.getElementById('edit-difficulty-val').textContent = `${e.target.value}/5`;
    });
  }

  // Form submit (Save edits)
  const editForm = document.getElementById('edit-project-form');
  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (currentlyEditingIndex < 0) return;

      const p = projectsData[currentlyEditingIndex];
      p.title = p.title || {};
      p.title.tr = document.getElementById('edit-title-tr').value;
      p.title.en = document.getElementById('edit-title-en').value;
      p.tagline = p.tagline || {};
      p.tagline.tr = document.getElementById('edit-tagline-tr').value;
      p.tagline.en = document.getElementById('edit-tagline-en').value;
      
      p.category = p.category || {};
      p.category[currentLang] = document.getElementById('edit-category-tr').value;
      
      p.author = document.getElementById('edit-author').value;
      
      if (typeof p.budget === 'object') {
        p.budget[currentLang] = document.getElementById('edit-budget').value;
      } else {
        p.budget = document.getElementById('edit-budget').value;
      }

      p.difficulty = parseInt(document.getElementById('edit-difficulty').value, 10);
      
      p.ownership = p.ownership || {};
      p.ownership[currentLang] = document.getElementById('edit-ownership-tr').value;

      p.image = document.getElementById('edit-image-url').value || p.image;
      if (!p.gallery || !p.gallery.includes(p.image)) {
        p.gallery = [p.image, ...(p.gallery || [])];
      }

      p.problem = p.problem || {};
      p.problem.tr = document.getElementById('edit-problem-tr').value;
      p.problem.en = document.getElementById('edit-problem-en').value;
      p.solution = p.solution || {};
      p.solution.tr = document.getElementById('edit-solution-tr').value;
      p.solution.en = document.getElementById('edit-solution-en').value;

      p.first_step = p.first_step || {};
      p.first_step.tr = document.getElementById('edit-first-step-tr').value;
      p.first_step.en = document.getElementById('edit-first-step-en').value;

      // Save Palette Choice from Modal
      const modalPal = (document.getElementById('edit-palette') && document.getElementById('edit-palette').value) || 'gothic-noir';
      p.palette = modalPal;
      localStorage.setItem('iec_palette_' + p.id, modalPal);

      // Persist in localStorage
      localStorage.setItem('iec_projects_custom', JSON.stringify(projectsData));

      // Re-render and restore scroll position
      const scrollPos = document.getElementById('scroll-container').scrollTop;
      renderAllProjects();
      populateDrawerList();
      document.getElementById('scroll-container').scrollTop = scrollPos;

      closeEditModal();
      playUiBeep(920, 0.08);
      showToast(I18N[currentLang].toast_saved);
    });
  }

  // Reset to default button
  const btnReset = document.getElementById('btn-reset-project-default');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      const confirmMsg = currentLang === 'tr' ? "Bu projenin tüm yerel düzenlemelerini silip fabrika ayarlarına dönmek istediğinize emin misiniz?" : "Reset all local customizations and revert back to default project specs?";
      if (confirm(confirmMsg)) {
        localStorage.removeItem('iec_projects_custom');
        projectsData = JSON.parse(JSON.stringify(window.IEC_PROJECTS || []));
        renderAllProjects();
        populateDrawerList();
        closeEditModal();
        showToast(I18N[currentLang].toast_reset);
      }
    });
  }

  // Copy JSON button
  const btnCopyJson = document.getElementById('btn-copy-project-json');
  if (btnCopyJson) {
    btnCopyJson.addEventListener('click', () => {
      if (currentlyEditingIndex < 0) return;
      const jsonStr = JSON.stringify(projectsData[currentlyEditingIndex], null, 2);
      navigator.clipboard.writeText(jsonStr).then(() => {
        showToast(I18N[currentLang].toast_json_copied);
      });
    });
  }

  // Download JSON button
  const btnDownloadJson = document.getElementById('btn-download-project-json');
  if (btnDownloadJson) {
    btnDownloadJson.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectsData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "projects.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast(I18N[currentLang].toast_json_downloaded);
    });
  }

  // --------------------------------------------------------------------------
  // 10. LANGUAGE SWITCHER (TR / EN)
  // --------------------------------------------------------------------------
  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('iec_lang', lang);
    document.documentElement.lang = lang;
    document.body.className = `lang-${lang} theme-dark`;

    // Toggle button active classes
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Translate static elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (I18N[lang] && I18N[lang][key]) {
        el.textContent = I18N[lang][key];
      }
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.dataset.i18nPh;
      if (I18N[lang] && I18N[lang][key]) {
        el.placeholder = I18N[lang][key];
      }
    });

    // Translate tooltips / title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.dataset.i18nTitle;
      if (I18N[lang] && I18N[lang][key]) {
        el.title = I18N[lang][key];
      }
    });

    // Update sound indicator text
    const soundPill = document.getElementById('audio-indicator');
    if (soundPill) {
      const soundLabel = soundPill.querySelector('.sound-label');
      if (soundLabel) {
        soundLabel.textContent = soundEnabled ? I18N[lang].sound_on : I18N[lang].sound_label;
      }
    }

    // Refresh dynamic drawer list
    populateDrawerList();

    // Re-render dynamic project cards in new language
    const scrollContainer = document.getElementById('scroll-container');
    const scrollPos = scrollContainer ? scrollContainer.scrollTop : 0;
    renderAllProjects();
    if (scrollContainer) scrollContainer.scrollTop = scrollPos;

    playUiBeep(750, 0.03);
  }

  // --------------------------------------------------------------------------
  // 11. KEYBOARD NAVIGATION & GLOBAL LISTENERS
  // --------------------------------------------------------------------------
  window.addEventListener('keydown', (e) => {
    // If modal is open, let user type freely, only catch Escape
    const modalOpen = document.getElementById('edit-modal').classList.contains('open');
    const drawerOpen = document.getElementById('index-drawer').classList.contains('open');

    if (e.key === 'Escape') {
      if (modalOpen) closeEditModal();
      if (drawerOpen) closeDrawer();
      return;
    }

    if (modalOpen || drawerOpen) return;

    // Arrow keys or Page keys for slide snapping
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      const nextIdx = Math.min(activeSectionIndex + 1, projectsData.length);
      const targetSec = document.querySelector(`.snap-section[data-index="${nextIdx}"]`);
      if (targetSec) {
        playUiBeep(520, 0.02);
        targetSec.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      const prevIdx = Math.max(activeSectionIndex - 1, 0);
      const targetSec = document.querySelector(`.snap-section[data-index="${prevIdx}"]`);
      if (targetSec) {
        playUiBeep(480, 0.02);
        targetSec.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (e.key === 'e' || e.key === 'E') {
      // Shortcut to edit currently viewed project
      if (activeSectionIndex > 0) {
        openEditModal(activeSectionIndex - 1);
      }
    } else if (e.key === 'l' || e.key === 'L') {
      // Toggle language shortcut
      setLanguage(currentLang === 'tr' ? 'en' : 'tr');
    }
  });

  // --------------------------------------------------------------------------
  // 12. INITIALIZATION
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });

    // 2. Sound pill
    const soundPill = document.getElementById('audio-indicator');
    if (soundPill) {
      soundPill.addEventListener('click', toggleSound);
    }

    // 3. Drawer open / close
    const btnOpenDrawer = document.getElementById('open-index-drawer');
    if (btnOpenDrawer) btnOpenDrawer.addEventListener('click', openDrawer);

    const btnCloseDrawer = document.getElementById('close-index-drawer');
    if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeDrawer);

    const drawerBackdrop = document.getElementById('drawer-backdrop');
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

    // 4. Modal close
    const btnCloseModal = document.getElementById('close-edit-modal');
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeEditModal);

    const modalBackdrop = document.getElementById('edit-modal-backdrop');
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeEditModal);

    // 5. Hero CTA button
    const heroBtn = document.getElementById('start-tour-btn');
    if (heroBtn) {
      heroBtn.addEventListener('click', (e) => {
        e.preventDefault();
        playUiBeep(600, 0.03);
        const p0 = document.getElementById('project-0');
        if (p0) p0.scrollIntoView({ behavior: 'smooth' });
      });
    }

    const heroFilterBtn = document.getElementById('hero-quick-filter-btn');
    if (heroFilterBtn) {
      heroFilterBtn.addEventListener('click', () => {
        playUiBeep(600, 0.03);
        const p0 = document.getElementById('project-0');
        if (p0) p0.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // 6. Initial Render & Language Sync
    setLanguage(currentLang);

    // 7. Global Palette Switcher & Click-Outside Flyout Handler
    initGlobalPaletteSwitcher();

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.palette-picker-inline')) {
        document.querySelectorAll('.palette-flyout-menu').forEach(f => f.classList.remove('open'));
      }
    });
  });

})();
