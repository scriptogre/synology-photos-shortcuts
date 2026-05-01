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
    const deselectButton = document.querySelector('.synofoto-icon-button[data-tip="Cancel"]');
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
    const input = document.querySelector('input[placeholder="Add tags"]');
    // Is the input field visible?
    if (!input) {
      const infoButton = document.querySelector('.synofoto-lightbox-toolbar-right-button[data-tip="Information"]');
      if (infoButton) infoButton.click();
    }
  }
  setTimeout(() => {
    const input = document.querySelector('input[placeholder="Add tags"]');
    if (input) input.focus();
  }, 50);
}

// Action: Rotate (Shift + R)
function rotate() {
  const rotateButton = findButton('.synofoto-menu-text-button', 'Rotate');
  if (rotateButton) rotateButton.click();
}

// Action: Add to Album (Shift + A)
function addToAlbum() {
  const selectionButton = document.querySelector('.synofoto-selected-bar-button[data-tip="Add to Album"]');
  if (selectionButton) {
    selectionButton.click();
  } else {
    const lightboxButton = findButton('.synofoto-menu-text-button', 'Add to album');
    if (lightboxButton) lightboxButton.click();
  }
}

// Action: Open Delete Dialog (Shift + Delete or Shift + Back NORMSPACE)
function deleteDialog() {
  const selectionButton = document.querySelector('.synofoto-selected-bar-button[data-tip="Delete"]');
  if (selectionButton) {
    selectionButton.click();
  } else {
    const lightboxButton = document.querySelector('.synofoto-lightbox-toolbar-right-button[data-tip="Delete"]');
    if (lightboxButton) lightboxButton.click();
  }
}

// Action: Direct Delete (Ctrl + Delete) - Delete without confirmation
function directDelete() {
  // First, open the delete dialog
  deleteDialog();

  // Wait for the confirmation dialog to appear, then click the confirmation button
  const maxAttempts = 20; // Try for up to 2 seconds (20 * 100ms)
  let attempts = 0;

  const confirmDelete = setInterval(() => {
    // Look for the delete button in the confirmation dialog
    const confirmButton = document.querySelector('.synofoto-text-button-red');

    if (confirmButton) {
      confirmButton.click();
      clearInterval(confirmDelete);
    } else if (attempts >= maxAttempts) {
      clearInterval(confirmDelete);
    }
    attempts++;
  }, 100);
}

// Action: Download (Shift + D)
function download() {
  const selectViewDownloadButton = findButton('.synofoto-menu-text-button', 'Download')
  if (selectViewDownloadButton) {
    selectViewDownloadButton.click();
  } else {
    const selectViewDownloadButton = document.querySelector('.synofoto-icon-button[data-tip="Download"]')
    if (selectViewDownloadButton) {
      selectViewDownloadButton.click();
    }
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
  // Check if ratings stars are visible (right panel is open)
  const stars_visible = document.querySelectorAll('.synofoto-icon-button-rating');
  if (stars_visible.length === 0) {
    const infoButton = document.querySelector('.synofoto-lightbox-toolbar-right-button[data-tip="Information"]');
    if (infoButton) infoButton.click();
  }
  setTimeout(() => {
    // Find the rating stars; assuming they are in order and clickable to set rating
    const stars = document.querySelectorAll('.synofoto-icon-button-rating');
    if (stars.length >= rating) {
      stars[rating - 1].click(); // Click the nth star to set to n stars
    }
  }, 50);
}

// Map key to actions (Shift + {Key})
const actions = {
  'T': addTags,
  'R': rotate,
  'A': addToAlbum,
  'D': download,
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

//  console.log('key stroke:', event.key);

  // Force Delete shortcut (Ctrl + Delete)
  if (event.ctrlKey && event.key === 'Delete') {
    event.preventDefault();
    directDelete();
    return;
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

  // Rating shortcuts
  if (event.key >= '1' && event.key <= '5' && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault();
    ratePhoto(parseInt(event.key));
  }
}, true);
