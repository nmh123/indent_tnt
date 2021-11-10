import React from "react";
import "bootstrap-daterangepicker/daterangepicker.css";
import "../App.css";
import "./loader.css";
import MyComponent from 'react-fullpage-custom-loader'
const Loader = () =>{
    return(
        <MyComponent sentences={["Redirecting..."]}/>
    );
}
export default Loader;
