import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import netlifyIdentity from 'netlify-identity-widget';

// import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./assets/css/argon-dashboard-react.css";
import {Auth0Provider} from '@auth0/auth0-react';

/* window.netlifyIdentity = netlifyIdentity;
// You must run this once before trying to interact with the widget
netlifyIdentity.init({
    APIUrl: 'https://tnt.dev.bugasafeature.com/.netlify/identity'
});
 */
ReactDOM.render(
  <React.StrictMode>
    <Auth0Provider
    domain="tntdevbugasafeature.us.auth0.com"
    clientId="alUdlX63NRCnJ9qZejNZQhfbKxA3lXlf"
    redirectUri={window.location.origin}
    allowSignUp = "false"
    >
    <App />
    </Auth0Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
