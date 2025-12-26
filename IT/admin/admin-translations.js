/**
 * Admin Panel Translations + Translation Editor
 * Allows admin to edit main portal translations from settings
 * Shows ALL translations and updates in real-time
 */

let adminCurrentLang = localStorage.getItem('admin_language') || 'uz';

// Get custom translations saved by admin
function getCustomTranslations() {
  try {
    return JSON.parse(localStorage.getItem('custom_translations') || '{}');
  } catch (e) {
    console.error('Error loading custom translations:', e);
    return {};
  }
}

// Save custom translations
function saveCustomTranslations(translations) {
  try {
    localStorage.setItem('custom_translations', JSON.stringify(translations));
    console.log('💾 Saved to localStorage:', Object.keys(translations).length, 'translations');
    return true;
  } catch (e) {
    console.error('Error saving translations:', e);
    return false;
  }
}

// Open translation editor modal
function openTranslationsEditor() {
  const modal = document.getElementById('translations-modal');
  const body = document.getElementById('translations-modal-body');
  if (!modal || !body) {
    console.error('Translation modal not found');
    alert('Modal topilmadi!');
    return;
  }

  // Get default translations from translations.js
  const textMap = window.__ITC_textMap || {};
  const customTranslations = getCustomTranslations();

  // Get ALL keys
  const allKeys = Object.keys(textMap);
  console.log(`📝 Loading ${allKeys.length} translations, ${Object.keys(customTranslations).length} custom`);

  let html = `
    <div style="margin-bottom: 16px; padding: 12px; background: rgba(59, 130, 246, 0.1); border-radius: 8px;">
      <p style="font-size: 0.9rem; margin: 0; color: var(--text-primary);">
        📊 Jami: <strong>${allKeys.length}</strong> ta tarjima | 
        ✏️ Tahrirlangan: <strong>${Object.keys(customTranslations).length}</strong> ta
      </p>
    </div>
    <div class="translation-search" style="margin-bottom: 16px;">
      <input type="text" id="translation-search-input" class="admin-input" 
             placeholder="🔍 Kalit so'z yoki tarjima qidirish..." 
             style="width: 100%; font-size: 14px; padding: 10px;">
    </div>
    <div style="max-height: 50vh; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 8px;">
      <table class="admin-table" style="font-size: 0.85rem; margin: 0;">
        <thead style="position: sticky; top: 0; z-index: 10; background: var(--bg-secondary);">
          <tr>
            <th style="width: 5%;">#</th>
            <th style="width: 40%;">O'zbekcha (asl matn)</th>
            <th style="width: 40%;">English (tarjima)</th>
            <th style="width: 15%;">Holat</th>
          </tr>
        </thead>
        <tbody id="translations-table-body">
  `;

  allKeys.forEach((uzKey, index) => {
    const defaultEn = textMap[uzKey] || '';
    const customEn = customTranslations[uzKey];
    const currentEn = customEn !== undefined ? customEn : defaultEn;
    const isCustom = customEn !== undefined;

    // Truncate long texts for display
    const displayKey = uzKey.length > 50 ? uzKey.substring(0, 50) + '...' : uzKey;

    html += `
      <tr class="translation-row" data-key-index="${index}" style="border-bottom: 1px solid var(--border-color);">
        <td style="color: var(--text-muted); font-size: 0.75rem;">${index + 1}</td>
        <td style="font-size: 0.8rem; color: var(--text-secondary);" title="${uzKey.replace(/"/g, '&quot;')}">${displayKey.replace(/</g, '&lt;')}</td>
        <td>
          <input type="text" class="admin-input translation-input" 
                 data-original-key="${encodeURIComponent(uzKey)}"
                 data-original-value="${encodeURIComponent(defaultEn)}"
                 value="${currentEn.replace(/"/g, '&quot;')}" 
                 style="font-size: 0.85rem; padding: 6px; width: 100%;">
        </td>
        <td id="status-${index}">
          ${isCustom ? '<span style="color: #4ade80; font-size: 0.75rem;">✅ Tahrirlangan</span>' : '<span style="color: var(--text-muted); font-size: 0.75rem;">⚪ Standart</span>'}
        </td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';

  html += `
    <div style="margin-top: 16px; padding: 12px; background: rgba(16, 185, 129, 0.1); border-radius: 8px;">
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">
        💡 <strong>Maslahat:</strong> Tarjimani o'zgartiring va Saqlash tugmasini bosing. 
        Asosiy sahifani yangilab, tilni almashtiring.
      </p>
    </div>
  `;

  body.innerHTML = html;
  modal.style.display = 'flex';

  // Search functionality
  document.getElementById('translation-search-input')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.translation-row').forEach(row => {
      const input = row.querySelector('.translation-input');
      const key = decodeURIComponent(input?.dataset.originalKey || '').toLowerCase();
      const value = input?.value.toLowerCase() || '';
      const isVisible = key.includes(query) || value.includes(query);
      row.style.display = isVisible ? '' : 'none';
    });
  });

  console.log('📝 Translation editor opened');
}

// Save translations from editor
function saveTranslationsFromEditor() {
  console.log('💾 Save button clicked');

  const customTranslations = {};
  let changesCount = 0;

  document.querySelectorAll('.translation-input').forEach(input => {
    const key = decodeURIComponent(input.dataset.originalKey || '');
    const originalValue = decodeURIComponent(input.dataset.originalValue || '');
    const newValue = input.value;

    // If value differs from original default, save it
    if (newValue !== originalValue) {
      customTranslations[key] = newValue;
      changesCount++;
    }
  });

  console.log(`💾 Found ${changesCount} changes to save`);

  // Save to localStorage
  const saved = saveCustomTranslations(customTranslations);

  if (!saved) {
    alert('❌ Saqlashda xatolik!');
    return;
  }

  // Apply to textMap immediately
  applyCustomTranslationsToTextMap();

  // Notify other tabs/windows via storage event
  localStorage.setItem('translations_updated', Date.now().toString());

  // Try to update main portal if open (using BroadcastChannel)
  try {
    const bc = new BroadcastChannel('itcenter_translations');
    bc.postMessage({ type: 'translations_updated', translations: customTranslations });
    bc.close();
    console.log('📡 BroadcastChannel message sent');
  } catch (e) {
    console.log('BroadcastChannel not supported');
  }

  // Close modal
  document.getElementById('translations-modal').style.display = 'none';

  // Show success message
  if (window.adminShowToast) {
    window.adminShowToast(`✅ ${changesCount} ta tarjima saqlandi!`, 'success');
  } else {
    alert(`✅ ${changesCount} ta tarjima saqlandi!\n\nAsosiy sahifani yangilang va tilni almashtiring.`);
  }
}

// Apply custom translations to the global textMap
function applyCustomTranslationsToTextMap() {
  const customTranslations = getCustomTranslations();
  const textMap = window.__ITC_textMap;

  if (textMap && Object.keys(customTranslations).length > 0) {
    Object.keys(customTranslations).forEach(key => {
      textMap[key] = customTranslations[key];
    });
    console.log(`📝 Applied ${Object.keys(customTranslations).length} custom translations to textMap`);
  }
}

// Listen for translation updates from admin panel (for main portal)
function setupTranslationListener() {
  // Listen via BroadcastChannel
  try {
    const bc = new BroadcastChannel('itcenter_translations');
    bc.onmessage = (event) => {
      if (event.data.type === 'translations_updated') {
        console.log('📝 Received translation update');
        applyCustomTranslationsToTextMap();
        // Re-apply if translation function exists
        if (window.__ITC_applyTranslations && window.__ITC_currentLang) {
          const currentLang = window.__ITC_currentLang();
          if (currentLang === 'EN') {
            window.__ITC_applyTranslations('UZ');
            setTimeout(() => window.__ITC_applyTranslations('EN'), 100);
          }
        }
      }
    };
  } catch (e) { }

  // Also listen via storage event (cross-tab)
  window.addEventListener('storage', (e) => {
    if (e.key === 'translations_updated' || e.key === 'custom_translations') {
      console.log('📝 Translation storage update detected');
      applyCustomTranslationsToTextMap();
    }
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('📝 Admin translations initializing...');

  // Apply custom translations on load
  setTimeout(applyCustomTranslationsToTextMap, 100);

  // Set up translation listener
  setupTranslationListener();

  // Set up translation editor button
  const editBtn = document.getElementById('edit-translations-btn');
  if (editBtn) {
    editBtn.onclick = openTranslationsEditor;
    console.log('📝 Edit button connected');
  }

  // Set up save button
  const saveBtn = document.getElementById('save-translations-btn');
  if (saveBtn) {
    saveBtn.onclick = saveTranslationsFromEditor;
    console.log('📝 Save button connected');
  }

  // Set up close button
  const closeBtn = document.getElementById('translations-modal-close');
  if (closeBtn) {
    closeBtn.onclick = () => {
      document.getElementById('translations-modal').style.display = 'none';
    };
  }

  // Close on overlay click
  const modal = document.getElementById('translations-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
});

// Expose globally
window.openTranslationsEditor = openTranslationsEditor;
window.saveTranslationsFromEditor = saveTranslationsFromEditor;
window.applyCustomTranslationsToTextMap = applyCustomTranslationsToTextMap;
window.getCustomTranslations = getCustomTranslations;
