const React = require('react');
const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
const Message = require('./Message.jsx');
const MessageStore = require('../stores/MessageStore.js');
const LoadingSpinner = require('./ReactSpinner.jsx');

const indexBy = function(array, property) {
  let results = {};
  (array || []).forEach(function(object) {
    results[object[property]] = object;
  });
  return results
};

let MessageList = React.createClass({
  componentDidUpdate() {
    let node = this.getDOMNode();
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  },

  render() {
    var accum = [];
    for (var i = 0; i < this.props.loadingMessages; i++) {
      accum.push(i);
    }

    return (<div className="fbl-content">
      <ReactCSSTransitionGroup transitionName="fbl-table-view-cell">
        <ul className="fbl-table-view">
          {this.props.messages.map(message =>
              <Message key={message.ts} user={this.props.user} message={message}/>
          )}
          {accum.map(idx =>
            <li key={idx} className="fbl-table-view-cell fbl-right">
              <LoadingSpinner small={true} />
            </li>
          )}
        </ul>
      </ReactCSSTransitionGroup>
    </div>);
  }
});

module.exports = MessageList;
