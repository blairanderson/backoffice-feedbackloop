const React = require('react');
const ActionCreator = require('../actions/MessageActionCreators');


module.exports = React.createClass({
  getInitialState(){
    return {
      formValue: '',
      placeholder: 'Ask Us Anything!',
      typing: false
    }
  },

  sendMessage(ev) {
    ev.preventDefault();
    let textarea = React.findDOMNode(this.refs.formTextarea);

    let message = textarea.value;

    if (message && message.length>1) {
      ActionCreator.postMessage(message);
      this.setState(this.getInitialState());
      textarea.value = "";
    } else {
      this.setState({placeholder: "Type Out a Message!"})
    }
  },

  onKey(ev) {
    if (ev.which == 13) {
      this.sendMessage(ev)
    } else {
      this.setState({typing: true});
    }
  },

  render() {
    return (<div className="fbl-bar fbl-bar-standard fbl-bar-footer">
      <form onSubmit={this.sendMessage}>
        <div className="fbl-input-table">

          <span className="fbl-input-table-btn">
            <button className="fbl-btn fbl-pull-right">Pic</button>
          </span>

          <textarea ref="formTextarea"
                    onKeyDown={this.onKey}
                    className="fbl-input-table-input"
                    placeholder={this.state.placeholder}
                    rows="1"/>

          <span className="fbl-input-table-btn">
            <button type="submit" className="fbl-btn fbl-pull-right">Send</button>
          </span>
        </div>
      </form>
    </div>)
  }
});
