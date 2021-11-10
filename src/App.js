

import React, { useState, useEffect ,Component } from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
} from "react-router-dom";

// import views
import Login from './views/Login';
import ActiveLoads from './views/ActiveLoads';
import LoadsDetails from './views/LoadsDetails';
import LoadsHistory from './views/LoadsHistory';
import ExpiredLoads from './views/ExpiredLoads';
import CreateNewLoads from './views/CreateNewLoads';
import EditNewLoads from './views/EditNewLoads';
import { withAuth0} from '@auth0/auth0-react';
import PrivateRoute from './views/PrivateRoute';

function App() {
    return (
        <Router>
            <Switch>
                <PrivateRoute exact path="/" component={Login}/>                
                <PrivateRoute path="/active-loads/:page_num?/:per_page?/:status?/:tracking_mode?/:load_number?/:customer_name?/:carrier_name?/:priority?/:risk?/:startDate?/:endDate?" component={ActiveLoads}>
                </PrivateRoute>
                <PrivateRoute path="/delivered-loads/:tracking_mode?/:load_number?/:customer_name?/:carrier_name?/:priority?/:risk?/:startDate?/:endDate?" component={LoadsHistory} type = "Delivered">
                </PrivateRoute>
                <PrivateRoute path="/expired-loads/:tracking_mode?/:load_number?/:customer_name?/:carrier_name?/:priority?/:risk?/:startDate?/:endDate?" component={ExpiredLoads} type="Expired">
                </PrivateRoute>
                <PrivateRoute path="/create-new-load/"  component = {CreateNewLoads}>
                </PrivateRoute>
                <Route path="/loads-details/:id" render={(props) => (
                    <LoadsDetails {...props} />
                )}>   
                </Route>
                <Route path="/edit-loads/:id" render={(props) => (
                    <EditNewLoads {...props} />
                )}> 
                </Route>
            </Switch>
        </Router>
    );
}

export default App;
