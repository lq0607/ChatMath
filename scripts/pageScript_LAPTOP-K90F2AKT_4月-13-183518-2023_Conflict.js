let mathJaxReady = false;

function config() {
  var scriptNode = document.getElementById('ChatMathScript');
  MathJax.Hub.Config({
    showProcessingMessages: false,
    messageStyle: 'none',
    tex2jax: {
      inlineMath: JSON.parse(scriptNode.getAttribute('inlineMath')),
      displayMath: JSON.parse(scriptNode.getAttribute('displayMath'))
    }
  });
}

function correctUnderscore() {  
  paragraphs = document.querySelectorAll('p')
  paragraphs.forEach((paragraph) => {
    if (paragraph.innerHTML.includes("<em>") || paragraph.innerHTML.includes("</em>")) {
      content = paragraph.textContent;
      // console.log(content);
      // console.log(paragraph);
      paragraph.innerHTML = paragraph.innerHTML.replace(/<em>/g, '_').replace(/<\/em>/g, '_');
      // console.log(paragraph);
  }
  });
}

function correctasterisk() { 
  paragraphs = document.querySelectorAll('p')
  paragraphs.forEach((paragraph) => {
    if (paragraph.innerHTML.includes("*")) {
      content = paragraph.textContent;
      paragraph.innerHTML = paragraph.innerHTML.replace(/(\\begin{[\w\s]*)(\{)([^]*?)(\})|(\*)/g, (match, begin, openBrace, content, closeBrace, asterisk) => {
        if (asterisk) {
            return '\\ast';
        } else {
            return begin + openBrace + content.replace(/\*/g, '\\ast') + closeBrace;
        }
      });
      paragraph.innerHTML = paragraph.innerHTML.replace(/(\\end{[\w\s]*)(\{)([^]*?)(\})|(\*)/g, (match, begin, openBrace, content, closeBrace, asterisk) => {
        if (asterisk) {
            return '\\ast';
        } else {
            return begin + openBrace + content.replace(/\*/g, '\\ast') + closeBrace;
        }
      });
    }
  });
}

function reTeX() {
  if(mathJaxReady){
    MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
  }
}

function renderAll() { 
  // console.info('Start to render.');
  // console.info(mathJaxReady);
  // correctasterisk();
  setTimeout(correctUnderscore, 500); // delay 0.5 second before correction
  setTimeout(reTeX, 1000); // delay 1 second before rendering
}

function waitForMathJax(){
  if(typeof MathJax !== 'undefined'){
    config();
    MathJax.Hub.Configured();
    mathJaxReady = true;
  }
  else{
    mathJaxReady = false
    setTimeout(waitForMathJax, 250); // check the status again after 250ms
  }
}


waitForMathJax();
setTimeout(renderAll, 10000);
// setInterval(correctasterisk, 200);

document.addEventListener('requestCompleted', () => {
  // reTeX()
  // setTimeout(reTeX, 1000); // delay 1 second before rendering
  renderAll();
});


