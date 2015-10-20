const React = require('react');
const Spinner = require('spin.js');

// The spinner is spinJS
//http://fgnass.github.io/spin.js/#?lines=13&length=6&width=4&radius=18&corners=1.0&rotate=0&trail=52&speed=0.8&direction=1&hwaccel=on

const spinCfg = {
  lines: 13, // The number of lines to draw
  length: 6, // The length of each line
  width: 4, // The line thickness
  radius: 18, // The radius of the inner circle
  corners: 1, // Corner roundness (0..1)
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#000', // #rgb or #rrggbb or array of colors
  speed: 0.8, // Rounds per second
  trail: 52, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: true, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: '50%', // Top position relative to parent
  left: '50%' // Left position relative to parent
};

let smallSpinCfg = JSON.parse(JSON.stringify(spinCfg));
let config = {left: "90%",length: 5, width: 2, radius: 5};
Object.keys(config).forEach(function(key){
  smallSpinCfg[key] = config[key]
});

module.exports = React.createClass({
  componentDidMount() {
    if (this.props.small) {
      this.spinner = new Spinner(smallSpinCfg);
    } else {
      this.spinner = new Spinner(spinCfg);
    }
    this.spinner.spin(this.refs.container.getDOMNode());
  },

  componentWillReceiveProps(newProps) {
    if (newProps.stopped === true && !this.props.stopped) {
      this.spinner.stop();
    } else if (!newProps.stopped && this.props.stopped === true) {
      this.spinner.spin(this.refs.container.getDOMNode());
    }
  },

  componentWillUnmount() {
    this.spinner.stop();
  },

  render() {
    return (<span ref="container"/>);
  }
});


