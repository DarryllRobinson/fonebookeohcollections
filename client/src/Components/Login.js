import React from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput, MDBBtn } from 'mdbreact';
import DataLayer from '../Utilities/DataLayer';
import Security from '../Utilities/Security';
import Loader from './Loader';

export default class Login extends React.Component {

    constructor(props) {
        super();

        this.state = {
            loaderOn: false
        }

        this.security = new Security();
        this.dataLayer = new DataLayer();

        this.loaderOn = this.loaderOn.bind(this);
        this.loaderOff = this.loaderOff.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentWillMount() {
        this.security.terminateSession();
    }

    loaderOn() {
        this.setState({ loaderOn: true });
    }

    loaderOff() {
        this.setState({ loaderOn: false });
    }

    async onSubmit(event) {
        event.preventDefault();
        this.loaderOn();
        let user = event.target.username.value;
        let requestObject = { 'username': user, 'password': event.target.password.value }
        let loginResult = await this.dataLayer.Post('/authenticate', requestObject);

        if (loginResult != null && loginResult.success) {
            let config = await this.dataLayer.Get('/getconfig');
            sessionStorage.setItem('foneBookConfig', JSON.stringify(config));
            sessionStorage.setItem('foneBookUser', user);
            sessionStorage.setItem('foneBookUserType', loginResult.userType);
            this.security.writeLoginSession();
            const { history } = this.props;
            history.push('/workspace');
        }
        this.loaderOff();
    }

    render() {
        return (
            <MDBContainer>
                {
                    this.state.loaderOn ? (<Loader />) : (<div></div>)
                }
                <MDBRow>
                    <MDBCol md="3"></MDBCol>
                    <MDBCol md="6">
                        <MDBCard className="mt-5 py-3 text-center">
                            <h3>FoneBook for Collections</h3>
                            <MDBCardBody>
                                <form onSubmit={this.onSubmit}>
                                    <MDBInput
                                        label="Email Address"
                                        type="email"
                                        name="username"
                                        required
                                    />
                                    <MDBInput
                                        label="Password"
                                        type="password"
                                        name="password"
                                        required
                                    />
                                    <MDBBtn color="mdb-color" type="submit">Login</MDBBtn>
                                    {/* <br />
                                    <br />
                                    <span style={{fontSize:"small", color:"#c4c4c4"}}>{AppSettings.serverEndpoint}</span> */}
                                </form>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
        );
    }
}