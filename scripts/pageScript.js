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

function reTeX() {
  if(mathJaxReady){
    MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
  }
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
setTimeout(reTeX, 10000);

document.addEventListener('requestCompleted', () => {
  // reTeX()
  setTimeout(reTeX, 1000); // delay 1 second before rendering
});