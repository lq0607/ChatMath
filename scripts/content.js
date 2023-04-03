let enableChatMath = true;
let betterEquations = false;
let betterExplanations = false;
let betterEquationsPrompt = '';
let betterExplanationsPrompt = ''

let initialized = false;

let textarea = document.createElement('textarea');
let customTextarea = document.createElement('textarea');
let button = document.createElement('button');
let customButton = document.createElement('button');

// Create the toolbar component
const toolbar = createToolbar();

function toggleAndReplaceTextarea() {
  if (!initialized) { // if not initialized, we initialize the elements
    console.info("ChatMath initialization")
    
    /*===== Replace the textarea with a custom textarea =====*/    
    textarea = document.querySelector('textarea[tabindex="0"][placeholder="Send a message..."]'); // Find the textarea
    
    // Hide the original textarea
    textarea.style.display = 'none';

    // Create a custom textarea
    customTextarea.className = textarea.className;
    customTextarea.style = textarea.style.cssText;
    customTextarea.placeholder = 'Send a message...';
    customTextarea.style.overflow = 'hidden'; // Hide the scrollbar
    customTextarea.textContent = textarea.textContent; // copy the text from the textarea to the customTextarea
    
    // Insert the custom textarea before the original textarea
    textarea.parentNode.insertBefore(customTextarea, textarea);

    // Set the custom textarea's display property to 'none' initially to hide it
    customTextarea.style.display = '';

    /*----- Automatically resize the custom textarea -----*/
    function updateTextareaHeight(textarea) {
      // Reset the height to enable resizing
      customTextarea.style.height = '24px';

      // Set the height based on the scrollHeight
      textarea.style.height = textarea.scrollHeight + 'px';
    }

    customTextarea.addEventListener('input', function () {
      // Update the textarea height
      updateTextareaHeight(customTextarea);
    });

    /*----- Add an event listener for the 'keydown' event -----*/
    customTextarea.addEventListener('keydown', function (event) {
      // Check if the Enter key is pressed
      if (event.key === 'Enter') {
        // Check if the Shift key is also pressed
        if (event.shiftKey) {
          // If the Shift+Enter keys are pressed, insert a new line at the cursor position
          event.preventDefault(); // Prevent the default behavior of the Enter key
          
          const cursorPosition = customTextarea.selectionStart; // Get the current cursor position in the custom textarea
          const currentValue = customTextarea.value; // Get the current value of the custom textarea

          customTextarea.value = currentValue.slice(0, cursorPosition) + '\n' + currentValue.slice(cursorPosition); // Insert a new line character ('\n') at the cursor position
          customTextarea.selectionStart = customTextarea.selectionEnd = cursorPosition + 1; // Set the cursor position to the new line in the custom textarea
          updateTextareaHeight(customTextarea); // Update the textarea height
        } else {
          // If only the Enter key is pressed, perform the previous behavior
          event.preventDefault(); // Prevent the default behavior of the Enter key
          
          // Form the prompt text
          if (enableChatMath) {
            insertPrompt = '\n\n[Write your answer with the following requirements:' + betterEquationsPrompt + betterExplanationsPrompt + ']';
          } else {
            insertPrompt = '';
          }

          customTextarea.value += insertPrompt; // Append the fixed text to the custom textarea          
          textarea.value = customTextarea.value; // Copy the combined text to the original textarea

          // Trigger the Enter key event on the original textarea
          const enterKeyEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
          textarea.dispatchEvent(enterKeyEvent);

          customTextarea.value = ''; // Clear the custom textarea
        }
      }
    });

    
    /*===== Replace the button with a custom button =====*/
    button = document.querySelector('button:has(svg.h-4.w-4.mr-1 polygon)');

    button.style.display = 'none';

    customButton.className = button.className;
    customButton.innerHTML = button.innerHTML;
    customButton.style = button.style.cssText;
    customButton.disabled = true

    button.parentNode.insertBefore(customButton, button);

    customButton.style.display = '';

    // Press Enter when click the button      
    customButton.addEventListener('click', function () {
      const enterKeyEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        keyCode: 13,
        code: 'Enter',
        which: 13,
        bubbles: true
      });
      
      customTextarea.dispatchEvent(enterKeyEvent); // pass the key to customTextarea  
    });

    /*----- Detect if the custom textarea is empty and disable/enable the button -----*/
    customTextarea.addEventListener('input', function () {
        // Enable the button if the textarea is not empty
        customButton.disabled = customTextarea.value.trim() === '';      
      }
    );

    initialized = true;
  }

  // check if toolbar is inserted correctly
  toolbarCheck = document.querySelector('div[class="toolbar"]');
  if (!toolbarCheck) {
    // If the toolbar is not here, it means the initialization is not executed correctly, so initialize again
    initialized = false;
    
    // Add toolbar after the textarea
    textarea.parentNode.parentNode.appendChild(toolbar)
  }


  // Determine the status of ChatMath, which is determined by the status of the options.
  if (betterEquations || betterExplanations){
    enableChatMath = true;
  } else {
    enableChatMath = false;
  }

  /* Toggle the display of textareas */
  if (enableChatMath) {
    customTextarea.style.display = ''; // makes the custom textarea visible 
    textarea.style.display = 'none'; // hide the original textarea
    customTextarea.textContent = textarea.textContent; // copy the text from the textarea to the customTextarea
  } else {
    customTextarea.style.display = 'none';
    textarea.style.display = '';
    textarea.textContent = customTextarea.textContent; // copy the text from the customTextarea to the textarea
  }

  /* Toggle the display of buttons */
  if (enableChatMath) {
    customButton.style.display = '';
    button.style.display = 'none';
  } else {
    customButton.style.display = 'none';
    button.style.display = '';
  }
  
}


function betterEquationsStateUpdate(isChecked){
  if (isChecked) {
    betterEquationsPrompt = '\n - Please write all equations and notations (if there are any) in LaTeX code format, but do not put them in the code block.';
    betterEquations = true;
  } else {
    betterEquationsPrompt = '';
    betterEquations = false;
  }
  // console.info(betterEquationsPrompt);
}

function betterExplanationsState(isChecked){
  if (isChecked) {
    betterExplanationsPrompt = '\n - Please write the explanation for beginners. You should give intuitions and simple numeric examples for the concepts you are explaining.';
    betterExplanations = true;
  } else {
    betterExplanationsPrompt = '';
    betterExplanations = false;
  }
  // console.info(betterExplanationsPrompt)
}


// Define the toolbar component
function createToolbar() {
  // Create the toolbar container element
  const toolbar = document.createElement('div');
  toolbar.classList.add('toolbar');
  
  // Create the ChatMath label
  const ChatMathLabel = document.createElement('label');
  ChatMathLabel.textContent = ' ChatMath: ';

  // Create the first checkbox and label
  const enableBetterEquationsCheckbox = document.createElement('input');
  enableBetterEquationsCheckbox.type = 'checkbox';
  enableBetterEquationsCheckbox.id = 'enableBetterEquations';

  const enableBetterEquationsLabel = document.createElement('label');
  enableBetterEquationsLabel.htmlFor = 'enableBetterEquationsCheckbox';
  enableBetterEquationsLabel.textContent = ' Better equations ';

  // Create the second checkbox and label
  const enableBetterExplanationsCheckbox = document.createElement('input');
  enableBetterExplanationsCheckbox.type = 'checkbox';
  enableBetterExplanationsCheckbox.id = 'enableBetterExplanations';

  const enableBetterExplanationsLabel = document.createElement('label');
  enableBetterExplanationsLabel.htmlFor = 'enableBetterExplanationsCheckbox';
  enableBetterExplanationsLabel.textContent = ' Better explanations ';

  // Add the checkboxes and labels to the toolbar
  ChatMathLabel.style.marginLeft = '10px';
  toolbar.appendChild(ChatMathLabel);
  ChatMathLabel.style.marginRight = '10px';

  toolbar.appendChild(enableBetterEquationsCheckbox);
  toolbar.appendChild(enableBetterEquationsLabel);
  enableBetterEquationsLabel.style.marginRight = '20px';
  
  toolbar.appendChild(enableBetterExplanationsCheckbox);
  toolbar.appendChild(enableBetterExplanationsLabel);
  enableBetterExplanationsLabel.style.marginRight = '20px';

  // Add event listeners to the checkboxes
  enableBetterEquationsCheckbox.addEventListener('change', function() {
    betterEquationsStateUpdate(this.checked)
    toggleAndReplaceTextarea()
  });
  enableBetterExplanationsCheckbox.addEventListener('change', function() {
    betterExplanationsState(this.checked)
    toggleAndReplaceTextarea()
  });

  // Return the toolbar element
  return toolbar;
}


setInterval(toggleAndReplaceTextarea, 3000); // periodically update the function
// setTimeout(toggleAndReplaceTextarea, 10000);
