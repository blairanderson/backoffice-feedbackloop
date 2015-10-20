const React = require('react');

let Header = React.createClass({
  getInitialState() {
    return {};
  },

  componentDidMount() {
  },

  render() {
    return (
      <header className="fbl-bar fbl-bar-nav">
        <button onClick={this.props.onClick} className="fbl-btn fbl-pull-right">&times;</button>
        <h1 className="fbl-title">FeedbackLoop</h1>
      </header>
    );
  }
});

module.exports = Header;
