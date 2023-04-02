chrome.runtime.sendMessage({method: 'shouldTeXify', host: location.host},
  function(response) {
    if (JSON.parse(response.answer)) {

      var mathjax = document.createElement('script');
      mathjax.type = 'text/javascript';
      mathjax.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML&delayStartupUntil=configured';

      var inline_delimiters = [];
        inline_delimiters.push(['$', '$']);
        inline_delimiters.push(['[;', ';]']);
      
      var display_delimiters = [];
        display_delimiters.push(['$$', '$$']);
        display_delimiters.push(['\\[', '\\]']);

      var pageScript = document.createElement('script');
      pageScript.id = 'ChatMathScript';
      pageScript.type = 'text/javascript';
      pageScript.src = chrome.extension.getURL('scripts/pageScript.js');
      pageScript.setAttribute('inlineMath', JSON.stringify(inline_delimiters));
      pageScript.setAttribute('displayMath', JSON.stringify(display_delimiters));

      document.body.appendChild(mathjax);
      document.body.appendChild(pageScript);
    }
  });

