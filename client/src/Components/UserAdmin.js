import React from 'react';
import { MDBCard, MDBCardBody, MDBInput, MDBBtn } from 'mdbreact';
import DataLayer from '../Utilities/DataLayer';
import SelectSearch from 'react-select-search';

export default class UserAdmin extends React.Component {

    constructor(props) {
        super();
        this.state = {
            newUser: (props.history.location.state.userEmail == null) ? true : false,
            passwordChanged: false,
            _id: "",
            email: "",
            name: "",
            surname: "",
            userType: "",
            active: true,
            locked: false,
            password: "",
            loginFailures: 0
        }

        this.saveUser = this.saveUser.bind(this);
        this.dataLayer = new DataLayer();
    }

    async componentWillMount() {
        if (!this.state.newUser) {
            this.props.loaderOn();
            let user = await this.dataLayer.Get(`/searchuser/${this.props.history.location.state.userEmail}`);
            this.setState({
                _id: user._id,
                email: user.email,
                name: user.name,
                surname: user.surname,
                userType: user.userType,
                active: user.active
            });
            this.props.loaderOff();
        }
    }

    async saveUser(event) {
        event.preventDefault();
        this.props.loaderOn();
        let user = this.state;

        if (!this.state.passwordChanged) {
            delete user.password;
        }

        if (this.state.newUser) {

            if (!this.state.passwordChanged) {
                alert('Password is required');
                return;
            }

            delete user._id;
            delete user.newUser;
            await this.dataLayer.Post('/adduser', user);
        }
        else {
            delete user.newUser;
            await this.dataLayer.Post('/updateuser', user);
        }

        const { history } = this.props;
        history.push('/workspace/adminpanel');
        this.props.loaderOff();
    }

    render() {
        return (
            <div>
                <h3>Add / Edit User</h3>
                <MDBCard>
                    <MDBCardBody>
                        <form onSubmit={this.saveUser}>
                            <MDBInput
                                name="email"
                                label="Email Address"
                                type="email"
                                value={this.state.email}
                                onChange={(event) => {
                                    this.setState({ email: event.target.value })
                                }}
                                required
                                validate
                            />
                            <MDBInput
                                name="name"
                                label="Name"
                                type="text"
                                value={this.state.name}
                                onChange={(event) => {
                                    this.setState({ name: event.target.value })
                                }}
                                required
                                validate
                            />
                            <MDBInput
                                name="surname"
                                label="Surname"
                                type="text"
                                value={this.state.surname}
                                onChange={(event) => {
                                    this.setState({ surname: event.target.value })
                                }}
                                required
                                validate
                            />
                            <MDBInput
                                name="password"
                                label="Password"
                                type="password"
                                value={this.state.password}
                                onChange={(event) => {
                                    this.setState({ password: event.target.value, passwordChanged: true })
                                }}
                            />
                            <SelectSearch
                                name="userType"
                                placeholder="Select a User Type"
                                value={this.state.userType}
                                options={[{ 'name': 'Agent', 'value': 'agent' }, { 'name': 'Supervisor', 'value': 'supervisor' }, { 'name': 'Supervisor (With Ticket Capture)', 'value': 'supervisoragent' }, { 'name': 'Admin', 'value': 'admin' }]}
                                search={true}
                                onChange={(selectedItem, state, props) => {
                                    this.setState({ userType: selectedItem.value })
                                }}
                                required
                                validate
                            />
                            <input
                                name="active"
                                type="checkbox"
                                checked={this.state.active}
                                onChange={(event) => {
                                    this.setState({ active: event.target.checked })
                                }}
                            /> Active <br />

                            <MDBBtn type="submit" color="mdb-color">Save</MDBBtn>
                        </form>
                    </MDBCardBody>
                </MDBCard>
            </div>
        );
    }
}