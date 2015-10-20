var AppDispatcher = require('../dispatchers/AppDispatcher');
var Constants = require('../constants/AppConstants');

module.exports = {
  addItem: function(message) {
    AppDispatcher.handleViewAction({
      type: Constants.ActionTypes.ADD_MESSAGE,
      message: message
    });
  },

  typing: function() {
    AppDispatcher.handleViewAction({
      type: Constants.ActionTypes.TYPING
    });
  },

  postMessage: function(message) {
    AppDispatcher.handleViewAction({
      type: Constants.ActionTypes.POST_MESSAGE,
      message: message
    });
  },

  initList: function() {
    AppDispatcher.handleViewAction({
      type: Constants.ActionTypes.INIT_MESSAGES
    });
  }
};
