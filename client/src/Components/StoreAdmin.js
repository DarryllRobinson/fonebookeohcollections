import React from 'react';
import { MDBCard, MDBCardBody, MDBInput, MDBRow, MDBCol, MDBBtn, MDBIcon } from 'mdbreact';
import DataLayer from '../Utilities/DataLayer';

export default class StoreAdmin extends React.Component {

    constructor(props) {
        super();
        this.state = {
            newStore: (props.history.location.state.storeKey == null) ? true : false,
            _id: "",
            id: "",
            name: "",
            address: "",
            tel: "",
            agents: [{
                name: "",
                email: "",
                tel: ""
            }]
        }

        this.dataLayer = new DataLayer();

        this.addAgent = this.addAgent.bind(this);
        this.saveStore = this.saveStore.bind(this);
    }

    async componentWillMount() {
        if (!this.state.newStore) {
            this.props.loaderOn();
            let store = await this.dataLayer.Get(`/getstoredetails/${this.props.history.location.state.storeKey}`);
            this.setState({
                _id: store._id,
                id: store.id,
                name: this.props.history.location.state.storeName,
                address: store.address,
                tel: store.tel,
                agents: store.agents
            });
            this.props.loaderOff();
        }
    }

    addAgent() {
        let agents = this.state.agents;
        agents.push({ name: "", email: "", tel: "" });
        this.setState({ agents });
    }

    deleteAgent(index) {
        let agents = this.state.agents;
        agents.splice(index, 1);
        this.setState({ agents });
    }

    async saveStore(event) {
        event.preventDefault();
        this.props.loaderOn();
        let store = this.state;

        if (this.state.newStore) {
            delete store.newStore;
            delete store._id;

            let config = await this.dataLayer.Get('/getconfig');
            let stores = config.filter((config) => config.id === 'stores')[0];

            stores.items.push({ key: store.id, value: store.name });

            await this.dataLayer.Post('/updateconfig', stores);
            await this.dataLayer.Post('/addstore', store);

            const { history } = this.props;
            history.push('/workspace/adminpanel');
        }
        else {
            delete store.newStore;

            await this.dataLayer.Post('/updatestore', store);

            const { history } = this.props;
            history.push('/workspace/adminpanel');
        }
        this.props.loaderOff();
    }

    render() {
        return (
            <div>
                <h3>Add / Edit Store</h3>
                <MDBCard>
                    <MDBCardBody>
                        <form onSubmit={this.saveStore}>
                            <label>Store Key: {this.state.id}</label>
                            <MDBInput
                                name="name"
                                label="Store Name"
                                type="text"
                                value={this.state.name}
                                disabled={!this.state.newStore}
                                onChange={(event) => {
                                    this.setState({
                                        name: event.target.value,
                                        id: event.target.value.replace(/\s/g, '').toLowerCase()
                                    })
                                }}
                                required
                                validate
                            />
                            <MDBInput
                                name="address"
                                label="Store Address"
                                type="text"
                                value={this.state.address}
                                onChange={(event) => {
                                    this.setState({ address: event.target.value })
                                }}
                                required
                                validate
                            />
                            <MDBInput
                                name="tel"
                                label="Store Telephone"
                                type="text"
                                value={this.state.tel}
                                onChange={(event) => {
                                    this.setState({ tel: event.target.value })
                                }}
                                required
                                validate
                                maxLength={10}
                                minLength={10}
                            />
                            <MDBRow>
                                <MDBBtn color="mdb-color" onClick={this.addAgent}>Add Agent</MDBBtn>
                            </MDBRow>
                            {
                                this.state.agents.map((agent, index) => {
                                    return (
                                        <MDBRow>
                                            <a className="red-text mr-2" onClick={() => this.deleteAgent(index)}><MDBIcon icon="trash-alt" /></a>
                                            <MDBCol>
                                                <MDBInput
                                                    name="agentName"
                                                    label="Agent Name"
                                                    value={agent.name}
                                                    type="text"
                                                    onChange={(event) => {
                                                        let agents = this.state.agents
                                                        agents[index].name = event.target.value
                                                        this.setState({ agents })
                                                    }}
                                                    required
                                                    validate
                                                />
                                            </MDBCol>
                                            <MDBCol>
                                                <MDBInput
                                                    name="agentTel"
                                                    label="Agent Telephone"
                                                    value={agent.tel}
                                                    type="text"
                                                    onChange={(event) => {
                                                        let agents = this.state.agents
                                                        agents[index].tel = event.target.value
                                                        this.setState({ agents })
                                                    }}
                                                    required
                                                    validate
                                                    maxLength={10}
                                                    minLength={10}
                                                />
                                            </MDBCol>
                                            <MDBCol>
                                                <MDBInput
                                                    name="email"
                                                    label="Agent Email"
                                                    value={agent.email}
                                                    type="email"
                                                    onChange={(event) => {
                                                        let agents = this.state.agents
                                                        agents[index].email = event.target.value
                                                        this.setState({ agents })
                                                    }}
                                                    required
                                                    validate
                                                />
                                            </MDBCol>
                                        </MDBRow>
                                    );
                                })
                            }
                            <MDBBtn type="submit" color="mdb-color">Save</MDBBtn>
                        </form>
                    </MDBCardBody>
                </MDBCard>
            </div>
        );
    }
}