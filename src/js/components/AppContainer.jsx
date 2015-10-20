const React = require('react');
const App = require('./App.jsx');
const ReactSpinner = require('./ReactSpinner.jsx');
const Firechat = require('firechat');
const cookie = require('react-cookie');
const styles = require('../../../dist/styles/main.css');

const FBLCOOKIE = 'fbl-open';
let appStyles = {};
let iconStyles = {
  fontFamily: "helvetica neue, lucida grande, sans-serif",
  textAlign: "center",
  cursor: "pointer",
  zIndex: 10000,
  position: "fixed",
  bottom: "30px",
  right: "30px",
  width: "42px",
  fontSize: "50px",
  lineHeight: "0px",
  borderRadius: "70px",
  border: "none",
  backgroundColor: "white"
};

let AppContainer = React.createClass({
  getInitialState() {
    let open = cookie.load(FBLCOOKIE) || false;
    return {
      open: open,
      loaded: false,
      activated: open
    };
  },

  componentWillMount(){
    let firebaseUrl = feedbackLoop.firebaseUrl || "https://getfeedbackloop.firebaseio.com/cfe41d29-1353-4ae8-bd25-9ee1a34e102c/chat";
    this.chatRef = new Firebase(firebaseUrl);
    this.firechat = new Firechat(this.chatRef);
    this.chatRef.onAuth(this.initChat);
  },

  componentDidMount(){
    if (!!feedbackLoop.jwt) {
      this.chatRef.authWithCustomToken(feedbackLoop.jwt, function(error, authData) {
        if (error) {console.log("Login Failed!", error);}
        else {console.log("Login Succeeded!", authData);}
      },{remember: 'none'});
    } else {
      this.chatRef.authAnonymously(function(error, authData) {
        if (error) {console.log(error);}
      });
    }
  },

  componentWillUnmount(){
  },

  initChat(authData) {
    if(!authData){
      return false
    }
    if (authData.auth && authData.auth.displayName) {
      this.firechat.setUser(authData.uid, authData.auth.displayName);
    } else {
      this.firechat.setUser(authData.uid, authData[authData.provider].displayName);
    }
  },

  onWidgetClick() {
    this.setState({open: !this.state.open, activated: true}, this.saveCookieState);
  },

  saveCookieState(){
    cookie.save(FBLCOOKIE, this.state.open);
  },

  onLoad() {
    this.setState({loaded: true})
  },

  render() {
    //Set a Default
    let loadingText = "?";
    //Overwrite it
    if (this.state.loaded === false && this.state.open === true) {
      loadingText = (<ReactSpinner />);
    }

    //Set a Default
    let app = '';

    //Overwrite it to start our application
    if (this.state.activated) {
      //Here we swap in email confirmation app
      app = (<App onLoad={this.onLoad} onWidgetClick={this.onWidgetClick}/>);
    }

    let loadedAndOpen = this.state.loaded && this.state.open;
    iconStyles.display = loadedAndOpen ? "none" : "block";
    appStyles.display = !loadedAndOpen ? "none" : "block";

    return (<div>
      <div styles={iconStyles} onClick={this.onWidgetClick}>
        {loadingText}
      </div>
      <div styles={appStyles}>
        {app}
      </div>
    </div>);
  }
});

module.exports = AppContainer;
