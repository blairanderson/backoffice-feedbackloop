const FEEDBACKLOOP_STYLESHEET_NAMESPACE = "fbl-chat-nmspc";
const React = require('react/addons');
const Header = require("./Header.jsx");
const ChatForm = require("./ChatForm.jsx");
const MessageList = require("./MessageList.jsx");
const MessageStore = require('../stores/MessageStore');
const ActionCreator = require('../actions/MessageActionCreators');

module.exports = React.createClass({
  getInitialState() {
    return {
      user: {},
      messages: [],
      loadingMessages: 0,
      team: {},
      users: [],
      typing: {content: ""}
    };
  },

  _onChange() {
    this.props.onLoad();
    this.setState(MessageStore.getAll());
  },

  componentDidMount() {
    MessageStore.addChangeListener(this._onChange);
    ActionCreator.initList();
  },

  componentWillUnmount() {
    MessageStore.removeChangeListener(this._onChange);
  },

  render() {
    let {typing} = this.state;
    typing = (typing && typing.content && typing.content.toString()) || "";

    return (<div className={FEEDBACKLOOP_STYLESHEET_NAMESPACE}>
      <Header onClick={this.props.onWidgetClick} />
      <MessageList {...this.state} />
      <ChatForm />
    </div>);
  }
});
