import React from "react";
import { MDBNavbar, MDBNavbarBrand, MDBNavbarNav, MDBNavItem, MDBNavLink, MDBIcon } from "mdbreact";

export default class Header extends React.Component {

    constructor(props) {
        super();
        this.logOut = this.logOut.bind(this);
    }

    logOut() {
        window.location = '/';
    }

    render() {
        let userType = sessionStorage.getItem('foneBookUserType');
        function getAccessPaths() {
            switch (userType) {
                case 'agent':
                    return (
                        <MDBNavbarNav left>
                            <MDBNavItem>
                                <MDBNavLink to="/workspace/logticket">Log Ticket</MDBNavLink>
                            </MDBNavItem>
                        </MDBNavbarNav>
                    )
                case 'supervisor':
                    return (
                        <MDBNavbarNav left>
                            <MDBNavItem>
                                <MDBNavLink to="/workspace/escalatedticket">Escalated Tickets</MDBNavLink>
                            </MDBNavItem>
                            <MDBNavItem>
                                <MDBNavLink to="/workspace/report">Report</MDBNavLink>
                            </MDBNavItem>
                        </MDBNavbarNav>
                    )
                case 'supervisoragent':
                    return (
                        <MDBNavbarNav left>
                            <MDBNavItem>
                                <MDBNavLink to="/workspace/logticket">Log Ticket</MDBNavLink>
                            </MDBNavItem>
                            <MDBNavItem>
                                <MDBNavLink to="/workspace/escalatedticket">Escalated Tickets</MDBNavLink>
                            </MDBNavItem>
                            <MDBNavItem>
                                <MDBNavLink to="/workspace/report">Report</MDBNavLink>
                            </MDBNavItem>
                        </MDBNavbarNav>
                    )
                case 'admin':
                    return (
                        <MDBNavbarNav left>
                            <MDBNavItem>
                                <MDBNavLink to="/workspace/adminpanel">Admin Panel</MDBNavLink>
                            </MDBNavItem>
                            <MDBNavItem>
                                <MDBNavLink to="/workspace/import">Import CSV</MDBNavLink>
                            </MDBNavItem>
                        </MDBNavbarNav>
                    )
                default:
                    return null
            }
        }

        return (
            <MDBNavbar color="stylish-color" dark expand="md" className="mb-4">
                <MDBNavbarBrand>
                    <strong className="white-text">FoneBook for Collections</strong>
                </MDBNavbarBrand>

                {
                    getAccessPaths()
                }


                <MDBNavbarNav right>
                    <MDBNavItem>
                        <MDBNavLink className="waves-effect waves-light" to="/workspace">
                            <MDBIcon icon="home" />
                        </MDBNavLink>
                    </MDBNavItem>
                    <MDBNavItem>
                        <MDBNavLink className="waves-effect waves-light" onClick={this.logOut}>
                            <MDBIcon icon="sign-out-alt" />
                        </MDBNavLink>
                    </MDBNavItem>
                </MDBNavbarNav>
            </MDBNavbar>
        );
    }
}