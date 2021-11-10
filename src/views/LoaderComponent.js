import React, {Component } from "react";
import {
BrowserRouter as Router,
withRouter,
} from "react-router-dom";
import "../App.css";
import "./loader.css";

class LoaderComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible:this.props.show
        }
    }
    render()
    {
        if(this.state.visible === true){
        return(    
            <div className="container loader-body">
                <div className="text-center m-2" style={{margin:"auto",textAlign:"center"}}>                
                <div className = "spinner-border text-primary submit-loader" role = "status" style={{ width: "5 rem",height:"5 rem" }}> <span class="sr-only"> Loading ...</span> </div></div>                
            </div>
        
        )}
        else{
            return(<></>)
        }
    }
}
export default withRouter(LoaderComponent);