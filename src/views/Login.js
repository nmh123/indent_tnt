
import React, { useState, useEffect, Component } from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
} from "react-router-dom";

import {
    Button,
    Card,
    CardHeader,
    CardBody,
    FormGroup,
    Form,
    Input,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
    Row,
    Col,
    Container,
} from "reactstrap";
import netlifyIdentity from 'netlify-identity-widget'
import MyComponent from 'react-fullpage-custom-loader'
import config from "../app_config";
import { withAuth0,useAuth0,withAuthenticationRequired} from '@auth0/auth0-react';
const { user,loginWithRedirect,logout,getAccessTokenSilently} = withAuth0();


class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLogin: false,
            loginUser: null,
            token: '',
        }
        document.body.classList.add("bg-default");
    }
    async componentDidMount() {
        const { user,loginWithRedirect,logout,getAccessTokenSilently} = this.props.auth0;
        let self = this;   
        let url = config.APP_URL + '/auth-zero-login'      
        let request =await fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(user)
        })
            .then(res => res.json())
            .then((response) => {
                if (response.error) {
                    alert(JSON.stringify(response.error))
                    return;
                }              
                return response;
                
            });
            if(request.auth_token){
                localStorage.setItem("authLogin",request.auth_token)
                this.setState({token:request.auth_token})
            }  
            console.log("Request",request)                 
    }
/*     loginAPI(user) {
        alert("Testing",JSON.stringify(user))
        let self = this;
        let url = config.APP_URL + '/auth-zero-login'      
        fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(user)
        })
            .then(res => res.json())
            .then((response) => {
                if (response.error) {
                    alert(response.error)
                    return;
                }
                console.log(response)
                this.setState({
                    isLogin: true
                },() => localStorage.setItem('authLogin', response.auth_token))                
            });
    } */
    render() {       
        
        let { token } = this.state;    
        
        return (
            <>
            {(token != '')
            ? (
             <Redirect
                to={{
                    pathname: "/active-loads/",
                }}
            />) : (
                <MyComponent sentences={[""]}/>)}                                        
            </>
        )
    }
}
export default withAuth0(Login)
