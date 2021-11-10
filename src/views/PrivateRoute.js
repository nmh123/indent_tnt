import React from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    
} from "react-router-dom";
import {withAuthenticationRequired} from "@auth0/auth0-react";
import Loader from "./Loader"
const PrivateRoute = ({component,...args})=>(
    <Route
        component = {withAuthenticationRequired(component,{onRedirecting:()=><Loader/>,})}{...args}
    />
);

export default PrivateRoute;

