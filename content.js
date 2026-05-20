// Helper to find a button by selector and text
function findButton(selector, text) {
  const buttons = document.querySelectorAll(selector);
  for (const button of buttons) {
    const buttonText = button.querySelector('.button-text')?.textContent.trim();
    if (buttonText === text) return button;
  }
  return null;
}

// Action: Select All (Ctrl + A)
function selectAll() {
  const checkboxes = document.querySelectorAll('.synofoto-selectable-checkbox');
  if (checkboxes.length === 0) return;

  const allSelected = Array.from(checkboxes).every(cb => cb.classList.contains('checked'));

  if (allSelected) {
    const deselectButton = document.querySelector('.synofoto-icon-button[data-tooltip-content="Cancel"]');
    if (deselectButton) {
      deselectButton.click();
      return;
    }
  }

  checkboxes.forEach(cb => {
    if (!cb.classList.contains('checked')) cb.click();
  });
}

// Action: Add Tags (Shift + T)
function addTags() {
  const editTagsButton = findButton('button.synofoto-menu-text-button', 'Edit tags');
  if (editTagsButton) {
    editTagsButton.click();
  } else {
    const infoButton = document.querySelector('.synofoto-lightbox-toolbar-right-button[data-tooltip-content="Information"]');
    if (infoButton) {
      infoButton.click();
      setTimeout(() => {
        const input = document.querySelector('.synofoto__input[placeholder*="tags"]');
        if (input) input.focus();
      }, 50);
    }
  }
}

// Action: Rotate (Shift + R)
function rotate() {
  const rotateButton = findButton('.synofoto-menu-text-button', 'Rotate');
  if (rotateButton) rotateButton.click();
}

// Action: Add to Album (Shift + A)
function addToAlbum() {
  const selectionButton = document.querySelector('.synofoto-selected-bar-button[data-tooltip-content="Add to Album"]');
  if (selectionButton) {
    selectionButton.click();
  } else {
    const lightboxButton = findButton('.synofoto-menu-text-button', 'Add to album');
    if (lightboxButton) lightboxButton.click();
  }
}

// Action: Open Delete Dialog (Shift + Delete or Shift + Back NORMSPACE)
function deleteDialog() {
  const selectionButton = document.querySelector('.synofoto-selected-bar-button[data-tooltip-content="Delete"]');
  if (selectionButton) {
    selectionButton.click();
  } else {
    const lightboxButton = document.querySelector('.synofoto-lightbox-toolbar-right-button[data-tooltip-content="Delete"]');
    if (lightboxButton) lightboxButton.click();
  }
}

// Action: Download (Shift + D)
function download() {
  const selectViewDownloadButton = findButton('.synofoto-menu-text-button', 'Original')
  if (selectViewDownloadButton) {
    selectViewDownloadButton.click();
  }
}

// Action: Change View (Shift + Tab)
function changeView() {
  const changeViewButton = document.querySelector('.synofoto-change-view-btn');
  if (changeViewButton) {
    changeViewButton.click();
  }
}

// Action: Rate Photo (1-5 keys for 1-5 stars)
function ratePhoto(rating) {
  // Find the rating stars; assuming they are in order and clickable to set rating
  const stars = document.querySelectorAll('.synofoto-icon-button-rating');
  if (stars.length >= rating) {
    stars[rating - 1].click(); // Click the nth star to set to n stars
  }
}

// --- Album dialog navigation ---

let _albumNavIndex = -1;

function getAlbumItems() {
  return Array.from(document.querySelectorAll(
    '.synofoto-album-list-item, .synofoto-album-list-item-selected'
  )).filter(item => item.querySelector('.synofoto-album-list-name'));
}

function isAlbumDialogOpen() {
  return getAlbumItems().length > 0;
}

function selectAlbumItem(item) {
  item.click();
  item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function navigateAlbumByLetter(letter) {
  const items = getAlbumItems();
  if (items.length === 0) return false;

  const names = items.map(item =>
    item.querySelector('.synofoto-album-list-name').textContent.trim().toLowerCase()
  );
  const lowerLetter = letter.toLowerCase();

  let targetIndex = names.findIndex(name => name.startsWith(lowerLetter));
  if (targetIndex === -1) {
    targetIndex = names.findIndex(name => name > lowerLetter);
  }
  if (targetIndex === -1) targetIndex = 0;

  _albumNavIndex = targetIndex;
  selectAlbumItem(items[targetIndex]);
  return true;
}

function navigateAlbumByArrow(direction) {
  const items = getAlbumItems();
  if (items.length === 0) { _albumNavIndex = -1; return false; }

  if (_albumNavIndex === -1) {
    _albumNavIndex = direction === 'down' ? 0 : items.length - 1;
  } else {
    _albumNavIndex = direction === 'down' ? _albumNavIndex + 1 : _albumNavIndex - 1;
    _albumNavIndex = ((_albumNavIndex % items.length) + items.length) % items.length;
  }

  selectAlbumItem(items[_albumNavIndex]);
  return true;
}

// Action: Confirm OK dialog (Enter)
function confirmOk() {
  const okButton = findButton('button.synofoto-text-button', 'OK');
  if (okButton) { okButton.click(); return true; }
  return false;
}

// Action: Tag People (Shift + P)
function tagPeople() {
  const button = findButton('button.synofoto-menu-text-button', 'Tag people');
  if (button) button.click();
}

// Map key to actions (Shift + {Key})
const actions = {
  'T': addTags,
  'R': rotate,
  'A': addToAlbum,
  'D': download,
  'P': tagPeople,
  'Tab': changeView,
  'Delete': deleteDialog,
  'Backspace': deleteDialog,
};

// Add the keydown event listener
document.addEventListener('keydown', (event) => {
  if (
      event.target.tagName === 'INPUT'
      || event.target.tagName === 'TEXTAREA'
      || event.target.isContentEditable
  ) return;

  // Album dialog navigation — intercept before all other shortcuts
  if (isAlbumDialogOpen() && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      navigateAlbumByArrow(event.key === 'ArrowDown' ? 'down' : 'up');
      return;
    }
    if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
      event.preventDefault();
      navigateAlbumByLetter(event.key);
      return;
    }
  }

  if (event.shiftKey) {
    const action = actions[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  }

  // Select All shortcut
  // Cmd + A on Mac, CTRL + A on Windows
  const isMac = navigator.platform.toUpperCase().includes('MAC');
  const selectAllKey = isMac ? event.metaKey : event.ctrlKey;
  if (selectAllKey && event.key === 'a') {
    event.preventDefault(); // Prevent the default browser "select all" behavior
    selectAll(); // Run our custom "Select All" function
  }

  // Confirm OK dialog
  if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
    const handled = confirmOk();
    if (handled) event.preventDefault();
  }

  // Rating shortcuts
  if (event.key >= '1' && event.key <= '5' && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault();
    ratePhoto(parseInt(event.key));
  }
}, true);