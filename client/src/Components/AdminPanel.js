import React from 'react';
import { MDBCard, MDBCardBody, MDBCardTitle, MDBCardText, MDBBtn, MDBRow, MDBCol, MDBIcon, MDBInput } from 'mdbreact';
import DataLayer from '../Utilities/DataLayer';

export default class AdminPanel extends React.Component {

    constructor() {
        super();
        this.state = {
            reasons: { items: [] },
            resolutions: { items: [] },
            stores: { items: [] },
            users: []
        }

        this.loadConfig = this.loadConfig.bind(this);
        this.addConfig = this.addConfig.bind(this);
        this.deleteConfig = this.deleteConfig.bind(this);

        this.addEditStore = this.addEditStore.bind(this);
        this.deleteStore = this.deleteStore.bind(this);

        this.addEditUser = this.addEditUser.bind(this);
        this.deleteUser = this.deleteUser.bind(this);

        this.dataLayer = new DataLayer();
    }

    componentWillMount() {
        this.loadConfig();
    }

    async addConfig(event, config) {

        event.preventDefault();
        this.props.loaderOn();
        if (event.key === 13) {
            return;
        }

        switch (config) {
            case 'reasons':
                let reasons = this.state.reasons;
                reasons.items.push({ key: event.target.newEntry.value.replace(' ', '').toLowerCase(), value: event.target.newEntry.value });
                await this.dataLayer.Post('/updateconfig', reasons);
                this.loadConfig();
                break;
            case 'resolutions':
                let resolutions = this.state.resolutions;
                resolutions.items.push({ key: event.target.newEntry.value.replace(' ', '').toLowerCase(), value: event.target.newEntry.value });
                await this.dataLayer.Post('/updateconfig', resolutions);
                this.loadConfig();
                break;
            default:
                break;
        }
        this.props.loaderOff();
    }

    async deleteConfig(index, config) {
        this.props.loaderOn();
        switch (config) {
            case 'reasons':
                let reasons = this.state.reasons;
                reasons.items.splice(index, 1);
                await this.dataLayer.Post('/updateconfig', reasons);
                this.loadConfig();
                break;
            case 'resolutions':
                let resolutions = this.state.resolutions;
                resolutions.items.splice(index, 1);
                await this.dataLayer.Post('/updateconfig', resolutions);
                this.loadConfig();
                break;
            case 'stores':
                let stores = this.state.stores;
                stores.items.splice(index, 1);
                await this.dataLayer.Post('/updateconfig', stores);
                this.loadConfig();
                break;
            default:
                break;
        }
        this.props.loaderOff();
    }

    addEditStore(storeKey, storeName) {
        const { history } = this.props;
        history.push('/workspace/storeadmin', { storeKey, storeName });
    }

    async deleteStore(storeKey, storeIndex) {
        this.props.loaderOn();
        let store = await this.dataLayer.Get(`/getstoredetails/${storeKey}`);
        await this.deleteConfig(storeIndex, 'stores');
        await this.dataLayer.Post('/deletestore', store);
        this.props.loaderOff();
        this.loadConfig();
    }

    addEditUser(userEmail) {
        const { history } = this.props;
        history.push('/workspace/useradmin', { userEmail });
    }

    async deleteUser(userId) {
        this.props.loaderOn();
        let user = {
            _id: userId
        }
        await this.dataLayer.Post('/deleteuser', user);
        this.props.loaderOff();
        this.loadConfig();
    }

    async loadConfig() {
        this.props.loaderOn();
        let serverConfig = await this.dataLayer.Get('/getconfig');
        let users = await this.dataLayer.Get('/getusers');

        let reasons = serverConfig.filter((config) => config.id === 'reasons')[0];
        let resolutions = serverConfig.filter((config) => config.id === 'resolutions')[0];
        let stores = serverConfig.filter((config) => config.id === 'stores')[0];
        this.props.loaderOff();
        this.setState({ reasons, resolutions, stores, users });
    }

    render() {
        return (
            <div>
                <h1>Admin Panel</h1>

                {/* REASONS */}
                <MDBCard className="mb-3">
                    <MDBCardBody>
                        <MDBCardTitle>Reasons</MDBCardTitle>
                        <MDBCardText>
                            <form id="adminForm" onSubmit={(event) => this.addConfig(event, 'reasons')}>
                                <MDBRow>
                                    <MDBCol>
                                        <MDBInput
                                            name="newEntry"
                                            label="New Reason"
                                            type="text"
                                            size="sm"
                                            validate
                                            required
                                        />
                                    </MDBCol>
                                    <MDBCol>
                                        <MDBBtn color="mdb-color" type="submit">Save</MDBBtn>
                                    </MDBCol>
                                </MDBRow>
                            </form>
                            {
                                this.state.reasons.items.map((item, index) => {
                                    return (
                                        <MDBRow>
                                            <MDBCol>
                                                <p>
                                                    <a className="red-text mr-2"><MDBIcon icon="trash-alt" onClick={() => this.deleteConfig(index, 'reasons')} /></a>
                                                    {item.value}
                                                </p>
                                            </MDBCol>
                                        </MDBRow>
                                    );
                                })
                            }

                        </MDBCardText>
                    </MDBCardBody>
                </MDBCard>

                {/* RESOLUTIONS */}
                <MDBCard className="mb-3">
                    <MDBCardBody>
                        <MDBCardTitle>Resolutions</MDBCardTitle>
                        <MDBCardText>
                            <form id="adminForm" onSubmit={(event) => this.addConfig(event, 'resolutions')}>
                                <MDBRow>
                                    <MDBCol>
                                        <MDBInput
                                            name="newEntry"
                                            label="New Resolution"
                                            type="text"
                                            size="sm"
                                            validate
                                            required
                                        />
                                    </MDBCol>
                                    <MDBCol>
                                        <MDBBtn color="mdb-color" type="submit">Save</MDBBtn>
                                    </MDBCol>
                                </MDBRow>
                            </form>

                            {
                                this.state.resolutions.items.map((item, index) => {
                                    return (
                                        <MDBRow>
                                            <MDBCol>
                                                <p>
                                                    <a className="red-text mr-2"><MDBIcon icon="trash-alt" onClick={() => this.deleteConfig(index, 'resolutions')} /></a>
                                                    {item.value}
                                                </p>
                                            </MDBCol>
                                        </MDBRow>
                                    );
                                })
                            }
                        </MDBCardText>
                    </MDBCardBody>
                </MDBCard>

                {/* STORES */}
                <MDBCard className="mb-3">
                    <MDBCardBody>
                        <MDBCardTitle>Stores</MDBCardTitle>
                        <MDBCardText>
                            {
                                this.state.stores.items.map((item, index) => {
                                    return (
                                        <MDBRow>
                                            <MDBCol>
                                                <p>
                                                    <a className="red-text mr-2" onClick={() => this.deleteStore(item.key, index)}><MDBIcon icon="trash-alt" /></a>
                                                    <a className="blue-text mr-2" onClick={() => this.addEditStore(item.key, item.value)}><MDBIcon icon="edit" /></a>
                                                    <span>{item.value}</span>
                                                </p>
                                            </MDBCol>
                                        </MDBRow>
                                    );
                                })
                            }
                            <MDBBtn color="mdb-color" onClick={() => this.addEditStore(null)}>New Store</MDBBtn>
                        </MDBCardText>
                    </MDBCardBody>
                </MDBCard>

                {/* USERS */}
                <MDBCard className="mb-3">
                    <MDBCardBody>
                        <MDBCardTitle>Users</MDBCardTitle>
                        <MDBCardText>
                            {
                                this.state.users.map((user) => {
                                    return (
                                        <MDBRow>
                                            <MDBCol>
                                                <p>
                                                    <a className="red-text mr-2" onClick={() => this.deleteUser(user._id)}><MDBIcon icon="trash-alt" /></a>
                                                    <a className="blue-text mr-2" onClick={() => this.addEditUser(user.email)}><MDBIcon icon="edit" /></a>
                                                    <span>{user.name} {user.surname} - {user.email} - {user.userType}</span>
                                                </p>
                                            </MDBCol>
                                        </MDBRow>
                                    );
                                })
                            }
                            <MDBBtn color="mdb-color" onClick={() => this.addEditUser(null)}>New User</MDBBtn>
                        </MDBCardText>
                    </MDBCardBody>
                </MDBCard>
            </div>
        );
    }
}