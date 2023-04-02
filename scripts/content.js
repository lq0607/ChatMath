let enableChatMath = true;
let betterEquations = false;
let betterExplanations = false;
let betterEquationsPrompt = '';
let betterExplanationsPrompt = ''

let replacedTextareas = new Map();
let replacedButtons = new Map();

// Create the toolbar component
const toolbar = createToolbar();

function toggleAndReplaceTextarea() {
  // Determine the status of ChatMath, which is determined by the status of the options.
  if (betterEquations || betterExplanations){
    enableChatMath = true;
  } else {
    enableChatMath = false;
  }

  /* Replace the textarea with a custom textarea */
  const textareas = document.querySelectorAll('textarea[tabindex="0"][placeholder="Send a message..."]');
  for (let textarea of textareas) {
    if (replacedTextareas.has(textarea)) {
      // If the original textarea has a custom textarea, toggle its display
      const customTextarea = replacedTextareas.get(textarea);
      if (enableChatMath) { 
        customTextarea.style.display = ''; // makes the custom textarea visible 
        textarea.style.display = 'none'; // hide the original textarea
        customTextarea.textContent = textarea.textContent; // copy the text from the textarea to the customTextarea
      } else {
        customTextarea.style.display = 'none';
        textarea.style.display = '';
        textarea.textContent = customTextarea.textContent; // copy the text from the customTextarea to the textarea
      }
    } else {
      // Hide the original textarea
      textarea.style.display = 'none';

      // Create a custom textarea
      const customTextarea = document.createElement('textarea');
      customTextarea.className = textarea.className;
      customTextarea.style = textarea.style.cssText;
      customTextarea.placeholder = 'Send a message...';
      customTextarea.style.overflow = 'hidden'; // Hide the scrollbar
      
      // Insert the custom textarea before the original textarea
      textarea.parentNode.insertBefore(customTextarea, textarea);
      
      // Add toolbar after the textarea
      textarea.parentNode.parentNode.appendChild(toolbar)

      // Set the custom textarea's display property to 'none' initially to hide it
      customTextarea.style.display = '';

      // Add the original and custom textarea to the replacedTextareas Map
      replacedTextareas.set(textarea, customTextarea);

      /*----- Detect if the custom textarea is empty and disable/enable the button -----*/
      customTextarea.addEventListener('input', function () {
        const buttons = document.querySelectorAll('button');
          for (let button of buttons) {
            if (replacedButtons.has(button)) {
              const customButton = replacedButtons.get(button);
              
              // Enable the button if the textarea is not empty
              customButton.disabled = customTextarea.value.trim() === '';
            }
          }
        }
      );

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
    }
  }

  /* Replace the button with a custom button */
  const buttons = document.querySelectorAll('button:has(svg.h-4.w-4.mr-1 polygon)');
  for (let button of buttons) {
    if (replacedButtons.has(button)) {
      const customButton = replacedButtons.get(button);
      if (enableChatMath) { 
        customButton.style.display = '';
        button.style.display = 'none';
      } else {
        customButton.style.display = 'none';
        button.style.display = '';
      }
    } else {
      button.style.display = 'none';

      const customButton = document.createElement('button');
      customButton.className = button.className;
      customButton.innerHTML = button.innerHTML;
      customButton.style = button.style.cssText;
      customButton.disabled = true

      button.parentNode.insertBefore(customButton, button);

      customButton.style.display = '';

      replacedButtons.set(button, customButton);

      // Press Enter when click the button      
      customButton.addEventListener('click', function () {
        const enterKeyEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          keyCode: 13,
          code: 'Enter',
          which: 13,
          bubbles: true
        });
        
        const textareas = document.querySelectorAll('textarea');
        for (let textarea of textareas) {
          if (replacedTextareas.has(textarea)) {
            const customTextarea = replacedTextareas.get(textarea);
            customTextarea.dispatchEvent(enterKeyEvent);
          }
        }
      });      
    }
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
  console.info(betterEquationsPrompt);
}

function betterExplanationsState(isChecked){
  if (isChecked) {
    betterExplanationsPrompt = '\n - Please write the explanation for beginners. You should give intuitions and simple numeric examples for the concepts you are explaining.';
    betterExplanations = true;
  } else {
    betterExplanationsPrompt = '';
    betterExplanations = false;
  }
  console.info(betterExplanationsPrompt)
}


// Define the toolbar component
function createToolbar() {
  // Create the toolbar container element
  const toolbar = document.createElement('div');
  toolbar.classList.add('toolbar');

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
  toolbar.appendChild(enableBetterEquationsCheckbox);
  toolbar.appendChild(enableBetterEquationsLabel);
  enableBetterEquationsLabel.style.marginRight = '20px';
  
  toolbar.appendChild(enableBetterExplanationsCheckbox);
  toolbar.appendChild(enableBetterExplanationsLabel);
  enableBetterExplanationsLabel.style.marginRight = '20px';

  // Add event listeners to the checkboxes
  enableBetterEquationsCheckbox.addEventListener('change', function() {
    betterEquationsStateUpdate(this.checked)
  });
  enableBetterExplanationsCheckbox.addEventListener('change', function() {
    betterExplanationsState(this.checked)
  });

  // Return the toolbar element
  return toolbar;
}

setInterval(toggleAndReplaceTextarea, 5000); // periodically update the function