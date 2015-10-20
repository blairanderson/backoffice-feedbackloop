const AppDispatcher = require('../dispatchers/AppDispatcher');
const ActionCreator = require('../actions/MessageActionCreators');
const Constants = require('../constants/AppConstants');
const BaseStore = require('./BaseStore');
const baseurl = require('baseurl').baseUrl;
const autolink = require('autolink-js');
const assign = require('object-assign');
const request = require('superagent');
const {uniqueId} = require("store_utils");

//some underscore methods. should just use lodash custom
const _ = {
  indexBy: function(array, property) {
    let results = {};
    (array || []).forEach(function(object) {
      results[object[property]] = object;
    });
    return results
  }
}

// data storage
let _channel_id = false;
let _messagesSent = 0;
let _messages = [];
let _messagesByTimestamp = {};
let _channels = [];
let _team = {};
let _users = [];
let _usersByName = [];
let _usersById = [];
let _self = {};

//websocket connection
let _connection = false;

let MessageStore = assign({}, BaseStore, {
  // public methods used by Controller-View to operate on data
  getAll() {
    return {
      user: _self,
      messages: _messages,
      loadingMessages: _messagesSent,
      team: _team,
      users: _users
    };
  },

  // register store with dispatcher, allowing actions to flow through
  dispatcherIndex: AppDispatcher.register(function(payload) {
    let action = payload.action;
    let message = action.message;

    switch (action.type) {
      case Constants.ActionTypes.ADD_MESSAGE:
        if (message.content !== '') {
          console.log(JSON.stringify(message));
          addItem(message);
          _messagesSent--;
          if (_messagesSent < 0 ) {
            _messagesSent = 0;
          }
          MessageStore.emitChange();
        }
        break;

      case Constants.ActionTypes.TYPING:
        typingPost();
        break;

      case Constants.ActionTypes.POST_MESSAGE:
        if (message.content === '') {
          //  ErrorActionCreator.createError("Cannot send an empty message.");
        } else {
          _messagesSent++;
          MessageStore.emitChange();
          postMessage(message)
        }

        break;

      case Constants.ActionTypes.INIT_MESSAGES:
        initializeStores().then(function(data) {
          let {team} = data;
          let {url, users, self, channels} = data.rtm;
          let {messages, channel_id} =  data.channel;

          setTeam(team);
          createConnection(url);
          setUsers(users);
          setChannels(channels);
          setSelf(self);
          setChannel(channel_id);

          //Messages must be last!
          setMessages(messages);

          MessageStore.emitChange();
        }).catch(function(error) {
          console.log("there was an error", error.message);
          // potentially setError("there was some error")
          // it would be cool to self-destruct or something to show whats going on.

          MessageStore.emitChange();
        });

        break;

      // add more cases for other actionTypes...
    }
  })

});

module.exports = MessageStore;

function createConnection(url) {
  _connection = new WebSocket(url);
  _connection.onmessage = onConnectionMessage
}

function setChannel(channel_id) {
  _channel_id = channel_id;
}

function setTeam(team) {
  let hash = team.token;
  team.token = `${hash.s}-${hash.l}-${hash.a}-${hash.c}-${hash.k}`;
  _team = team;
}

function setUsers(users) {
  _users = users;
  _usersByName = _.indexBy(_users, "name");
  _usersById = _.indexBy(_users, "id");
}
function setChannels(channels) {
  _channels = channels;
}

function setSelf(self) {
  _self = self;
}

function onConnectionMessage(payload) {
  let data = JSON.parse(payload.data);
  if (data.type == "message") {
    handleNewMessage(data);
  }
  if (data.type === "typing") {
    //handleTyping(data);
  }
}

function typingPost() {
  sendConnectionMessages("typing")
}


function sendConnectionMessages(message, data) {
  //We can do stuff with typing... just not sure how
}

// add private functions to modify data
function addItem(message) {

  message = filterMessage(
    addUniqueIdToMessage(
      addTeamUserProfile(
        message
      )
    )
  );

  if (message) {
    if (_messagesByTimestamp[message.ts]) {
      console.log("this is a duplicate", message)
    } else {
      _messagesByTimestamp[message.ts] = message;
      _messages.push(message);
    }
  }
}

function setMessages(messages) {
  _messages = messages
    .filter(filterMessage)
    .map(addTeamUserProfile)
    .reverse();
  _messagesByTimestamp = _.indexBy(_messages, 'ts');

  _messages = [];
  for (var key in _messagesByTimestamp) {
    _messages.push(_messagesByTimestamp[key]);
  }
}

function filterMessage(message) {
  if (subTypesToIgnore[message.subtype]) {
    return false
  }

  reformat(message);
  message.text = autolink.link(message.text, {
    target: "_blank",
    rel: "nofollow"
  });
  // messages with .user are from team users typing "respond/ yolo"
  // messages with username are team users through the client
  let prefix = "respond/";

  if ((message.username || message.user) && message.text.indexOf(prefix) == 0) {
    message.text = message.text.replace(prefix, '');
    return message;
  }
  // messages with .username are from feedbackloop end users, pass them through...
  if (message.username == "FeedbackLoop") {
    return message;
  }
}

const subTypesToIgnore = {
  "file_share": true,
  "channel_leave": true,
  "channel_join": true
};


//https://api.slack.com/docs/formatting
//recurse over your findings! Huzzaaah!
function reformat(message) {
  let match = message.text.match(/<(.*?)>/);
  if (match && match.length > 0) {
    let m = match[1];
    let replace = m;
    if (m.slice(0, 2) === "#C") {
      replace = swapChannel(m);
    }
    if (m.slice(0, 2) === "@U") {
      replace = swapUser(m);
    }
    if (m.slice(0, 1) === "!") {
      replace = swapSpecial(m)
    }

    message.text = message.text.replace(match[0], replace);
    reformat(message);
  }
}


function swapChannel(channel_id) {
  if (_channels.length == 0) {
    return false
  }

  let lookup = {}, i, len;
  for (i = 0, len = _channels.length; i < len; i++) {
    lookup[_channels[i].id] = _channels[i];
  }
  return lookup[channel_id.slice(1)].name;
}

function swapUser(user_id) {
  if (_users.length === 0) {
    return false
  }

  let lookup = {}, i, len;
  for (i = 0, len = _users.length; i < len; i++) {
    lookup[_users[i].id] = _users[i];
  }
  return lookup[user_id.slice(1)].name;
}

function swapSpecial(special) {
}

function addUniqueIdToMessage(message) {
  message.id = message.ts;
  return message;
}

function addTeamUserProfile(message) {
  let user = _usersByName[message.username] || _usersById[message.user];
  if (user) {
    message.user = user;
  }
  return message;
}


function handleNewMessage(message) {
  if (message.channel === _channel_id) {
    ActionCreator.addItem(message);
  }
}

let _messageQueue = [];
let __delay = 2000;
let _message_sent_count = 0;
function postMessage(message) {
  let {token} = _team;
  let channel = _channel_id;
  let email = window.feedbackLoop.email;

  if (channel && email) {
    messageChannel({
      count: _message_sent_count,
      user: window.feedbackLoop,
      message: {
        token: token,
        channel: channel,
        text: message
      }
    }).then(function() {
      console.log("messageChannel promise then[arguments]", arguments);
      //  Show that we succesfully posted the message?
      //ErrorActionCreator.successfulMessageSent(); (clear all the errors)
    }).catch(function() {
      console.log("messageChannel promise catch[arguments]", arguments);
      //ErrorActionCreator.createError("Sorry there was an error");
    });
    _message_sent_count++;

  } else {
    _messageQueue.push(message);
    setTimeout(function() {
      _messageQueue.forEach(postMessage);
    }, __delay);
  }
}

function messageChannel(opts) {
  return new Promise(function(resolve, reject) {
    request.post(baseurl() + "/messages").set('Accept', 'application/json')
      .set('X-API-Key', "put-something-here")
      .send(opts)
      .end(function(err, res) {
        if (err && err.message) {
          reject(Error(err.message))
        } else {
          resolve(res)
        }
      });
  });
}

function initializeStores(callback) {
  let user = window.feedbackLoop;
  let teamUrl = "https://www.getfeedbackloop.com/api/teams/";
  if (user.devLocal) {
    teamUrl = "http://localhost:3000/api/teams/";
  }
  let url = `${teamUrl}${user.app_id}.json?email=${user.email}&user_id=${user.user_id}`;

  return new Promise(function(resolve, reject) {
    request.get(url).end(function(err, res) {
      if (err && err.message) {
        reject(Error(err.message))
      } else {
        resolve(JSON.parse(res.text))
      }
    });
  });

}
