Reconstruire engine.js quand tail.01..04 sont là :

cat bundle/engine.head.js bundle/engine.amort.js bundle/engine.tail.01.js bundle/engine.tail.02.js bundle/engine.tail.03.js bundle/engine.tail.04.js > engine.js

Présent : head, amort, tail.01
Manque : tail.02 tail.03 tail.04, puis app.js + index.html Netlify
