const React = require('react');
const ActionCreator = require('../actions/MessageActionCreators');
const gravatar = require('gravatar');
const StyleSheet = require('react-style');
const cssReset = require('css-reset');

let Message = React.createClass({
  getDefaultProps() {
    return {
      message: {text: ''}
    };
  },

  render() {
    let {message} = this.props;

    if (message.user && message.user.profile) {
      return (<li className="fbl-table-view-cell">
        <img className="fbl-media-object fbl-radius-25 fbl-pull-left"
             src={message.user.profile.image_48}
             width={34}
             height={34}
             alt={message.user.real_name}/>

        <div className="fbl-media-body fbl-radius-25 fbl-left">
          <div dangerouslySetInnerHTML={{__html: message.text}}/>
        </div>
      </li>);
    }

    let img = "";
    if (this.props.user.email && this.props.user.email != "") {
      let src = gravatar.url(this.props.user.email);
      img = (<img className="fbl-media-object fbl-pull-right"
                  src={src}
                  width={34}
                  height={34}
                  alt={"gravatar for: "+this.props.user.email}/>);
    }

    return (<li className="fbl-table-view-cell fbl-right">
      {img}
      <div className="fbl-media-body fbl-radius-25 fbl-right">
        <div dangerouslySetInnerHTML={{__html: message.text}}/>
      </div>
    </li>);
  }

});

module.exports = Message;

let styles = {
  messageStyles: {
    "borderRadius": "20px",
    "padding": "5px 15px 7px"
  },
  memberMessageStyles: {
    "backgroundColor": "#E4E4E4"
  },
};
