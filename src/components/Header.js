import React, { useState, useEffect, Component } from "react";
import { Link } from "react-router-dom";
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    NavbarText,
    Container,
    Media,
} from 'reactstrap';

import netlifyIdentity from 'netlify-identity-widget'
import { withAuth0,withAuthenticationRequired} from '@auth0/auth0-react';
import './Header.css';

export default withAuth0(class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isLogin: false,
            user: null,
        }
        document.body.classList.remove("bg-default");
    }

    componentDidMount() {
        let self = this;
    }
    toggle() {
        let o = this.state.isOpen ? false : true;
        this.setState({ isOpen: o });
    }
     logout() {
        const {logout} = this.props.auth0;
        localStorage.clear()
        logout();      
    } 

    render() {
        const {isLoading,user,loginWithRedirect,logout } = this.props.auth0;      
        return (
            <>
                <div className="header bg-gradient-info pb-8 pt-5 pt-md-7">
                    <Navbar expand="md" className="navbar-top navbar-dark" id="navbar-main">
                        <Container fluid>
                             <NavbarBrand href="/" className="font-weight-bold h1 m-auto">Transportation One</NavbarBrand>
                            {/* <img src = "https://images.squarespace-cdn.com/content/v1/576a988415d5db796d3ae837/1466609046105-1E9G5KZ8D270MDZXV185/logo.png?format=1500w" style={{width:"20%"}}/> */}
                            <NavbarToggler onClick={this.toggle.bind(this)} />
                            <Collapse isOpen={this.state.isOpen} navbar>
                                <Nav className="m-auto" navbar>
                                  {/*   <UncontrolledDropdown nav inNavbar> */}
                                  {/*   <DropdownToggle nav>
                                            <div><h3  className="text-white" >Loads</h3></div>
                                        </DropdownToggle>
                                        <DropdownMenu> */}
                                        <Link to="/active-loads/" className="font-weight-bold text-capitalize p-2 mr-2  text-white">
                                        {/* <DropdownItem className="text-primary">
                                         */}Active Loads
                                          {/*   </DropdownItem> */}
                                            </Link>
                                            <Link to="/delivered-loads/" className="font-weight-bold text-capitalize p-2 mr-2 text-white">
                                            {/* <DropdownItem className="text-primary"> */}
                                            Delivered Loads
                                            {/* </DropdownItem> */}
                                            </Link>
                                            <Link to="/expired-loads/" className="font-weight-bold text-capitalize p-2 mr-2 text-white">
                                          {/*   <DropdownItem className="text-primary"> */}
                                            Expired Loads
                                          {/*   </DropdownItem> */}
                                            </Link>
                                            <Link to="/create-new-load/" className="font-weight-bold text-capitalize p-2 mr-2 text-white">
                                           {/*  <DropdownItem className="text-primary"> */}
                                            Create New Load
                                            {/* </DropdownItem> */}</Link>
                                       {/*  </DropdownMenu>
                                    </UncontrolledDropdown> */}
                                </Nav>
                                <UncontrolledDropdown nav inNavbar>
                                    <DropdownToggle nav>
                                        <Media className="align-items-center">
                                            <span className="avatar avatar-sm rounded-circle">
                                                <img
                                                    alt="..."
                                                    src={user ? user.picture :''}
                                                />
                                            </span>
                                            <Media className="ml-2 d-none d-lg-block">
                                                <span className="mb-0 text-sm font-weight-bold text-white">
                                                    {user ? user.name : ''}
                                                </span>
                                            </Media>
                                        </Media>
                                    </DropdownToggle>
                                    <DropdownMenu right>
                                        <DropdownItem onClick={()=>{this.logout()}}>
                                            Logout
                                        </DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledDropdown>
                            </Collapse>
                        </Container>
                    </Navbar>
                </div>
            </>
        );
    }
});
