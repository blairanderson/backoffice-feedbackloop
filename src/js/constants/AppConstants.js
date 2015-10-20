const keyMirror = require('react/lib/keyMirror');

module.exports = {

  ActionTypes: keyMirror({
    INIT_MESSAGES: null,
    ADD_MESSAGE: null,
    POST_MESSAGE: null,
    TYPING: null
  }),

  ActionSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null
  })

};
