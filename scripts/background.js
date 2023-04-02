// /*----- Handle the popup page -----*/
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   // Handle the 'getCheckboxState' action
//   if (request.action === 'getCheckboxState') {
//     // Get the checkbox state from the storage
//     chrome.storage.sync.get(request.stateKey, (data) => {
//       sendResponse({ state: data[request.stateKey] });
//     });
//     return true; // Required to use sendResponse asynchronously
//   }
//   // Handle the 'setCheckboxState' action
//   else if (request.action === 'setCheckboxState') {
//     // Set the checkbox state in the storage
//     chrome.storage.sync.set({ [request.stateKey]: request.state });
//   }
// });



/*----- For Math rendering -----*/
// Check if the conversation is finished
const urlPattern = '*://chat.openai.com/backend-api/conversation*';
chrome.webRequest.onSendHeaders.addListener(
  (details) => {
    chrome.tabs.executeScript(details.tabId, {
      code: 'document.dispatchEvent(new CustomEvent("requestStarted"));',
    });
  },
  { urls: [urlPattern] }
);

chrome.webRequest.onCompleted.addListener(
  (details) => {
    chrome.tabs.executeScript(details.tabId, {
      code: 'document.dispatchEvent(new CustomEvent("requestCompleted"));',
    });
  },
  { urls: [urlPattern] }
);


// Set the headers to allow the MathJax CDN if we're typesetting this page
chrome.webRequest.onHeadersReceived.addListener(function(details) {
    var hostname = get_hostname(details.url);
    if (!should_texify(hostname)) {
      return;
    }

    // Check though all the response headers
    for (var i = 0; i < details.responseHeaders.length; i++) {
      var header = details.responseHeaders[i];
      if (header.name.toLowerCase() == 'content-security-policy') {
        // Individual policies are separated with ;
        var policies = header.value.split(';');
        for (var j = 0; j < policies.length; j++) {
          // Terms of the policy are separated with spaces
          var terms = policies[j].trim().split(' ');
          // Add the MathJax CDN to script-src and font-src
          if (terms[0].trim().toLowerCase() == 'script-src') {
            terms.push('https://cdnjs.cloudflare.com');
          }
          else if (terms[0].trim().toLowerCase() == 'font-src') {
            terms.push('https://cdnjs.cloudflare.com');
          }
          policies[j] = terms.join(' ');
        }
        header.value = policies.join('; ');
        return {responseHeaders: details.responseHeaders};
      }
    }
  },
  {urls: ["<all_urls>"], types: ["main_frame", "sub_frame"]},
  ["blocking", "responseHeaders"]
);

// Respond to requests from other scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.method == 'shouldTeXify') {
    sendResponse({answer: should_texify(request.host)});
  } else {
    sendResponse({});
  }
});

function should_texify(host) {
  if (host.indexOf('chat.openai.com') >= 0) {
    return true;
  }
  else{
    return false;
  }
}

function get_hostname(url) {
  var parser = document.createElement('a');
  parser.href = url;
  return parser.hostname;
}

