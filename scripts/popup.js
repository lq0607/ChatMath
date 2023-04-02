function updateCheckboxState(id, stateKey) {
  const checkbox = document.getElementById(id);

  // Request the current state of the checkbox from the background script
  chrome.runtime.sendMessage({ action: 'getCheckboxState', stateKey: stateKey }, (response) => {
    checkbox.checked = response.state || false;
  });

  // Add a change event listener to update the state and send a message to the content script
  checkbox.addEventListener('change', function () {
    chrome.runtime.sendMessage({ action: 'setCheckboxState', stateKey: stateKey, state: this.checked });
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: stateKey, checked: checkbox.checked });
    });
  });
}

// Initialize the checkboxes with their respective state keys
// updateCheckboxState('enableChatMathCheckbox', 'enableChatMathState');
updateCheckboxState('betterEquationsCheckbox', 'betterEquationsState');
updateCheckboxState('betterExplanationsCheckbox', 'betterExplanationsState');
