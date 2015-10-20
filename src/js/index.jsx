const React = require('react');
const AppContainer = require('./components/AppContainer.jsx');

// APPEND THE WIDGET
var reactContainer = document.createElement('div');
reactContainer.id = "feedbackloop-main-container";
reactContainer.style.zIndex = 9999999;
document.body.appendChild(reactContainer);
React.render(<AppContainer user={window.feedbackLoop} />, reactContainer);
