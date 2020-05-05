import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MDBContainer } from 'mdbreact';
import Header from './Header';
import ComponentRoutes from '../Utilities/ComponentRoutes';
import Notification from '../Components/Notification';
import Loader from './Loader';

export default class AgentWorkspace extends React.Component {

    constructor() {
        super();
        this.state = {
            notificationType: '',
            notificationMessage: '',
            notificationShow: false,
            loaderOn: true
        }

        this.notify = this.notify.bind(this);
        this.loaderOn = this.loaderOn.bind(this);
        this.loaderOff = this.loaderOff.bind(this);
    }

    notify(type, message) {
        this.setState({
            notificationShow: false
        });
        this.setState({
            notificationType: type,
            notificationMessage: message,
            notificationShow: true
        });
    }

    loaderOn() {
        this.setState({ loaderOn: true });
    }

    loaderOff() {
        this.setState({ loaderOn: false });
    }

    render() {
        return (
            <Router>
                {
                    this.state.loaderOn ? (<Loader />) : (<div></div>)
                }
                
                <Header />

                {
                    this.state.notificationShow ? (<Notification type={this.state.notificationType} message={this.state.notificationMessage} />) : (<div></div>)
                }
                
                <MDBContainer>
                    <ComponentRoutes notify={this.notify} loaderOn={this.loaderOn} loaderOff={this.loaderOff} />
                </MDBContainer>
            </Router>
        );
    }
}