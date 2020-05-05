import React from 'react';
import { MDBBtn, MDBInput, MDBRow, MDBCol } from 'mdbreact';
import SelectSearch from 'react-select-search';
import DataLayer from '../Utilities/DataLayer';

export default class LogTicket extends React.Component {

    client = {
        id: "",
        name: "",
        surname: "",
        cell: "",
        gender: "",
        dateOfBirth: undefined,
        saCitizen: true,
    }

    ticket = {
        hostRef: "",
        agentId: sessionStorage.getItem("foneBookUser"),
        clientId: "",
        storeId: "",
        storeAgent: "",
        status: "",
        opened: new Date(),
        closed: "",
        reason: "",
        resolution: "",
        escalatedId: "",
        notes: []
    }

    constructor(props) {
        super();

        this.state = {
            client: this.client,
            ticket: this.ticket,
            storeAgent: false,
            showCusomerDetail: false,
            storeList: [],
            storeAgentList: [],
            reasonsList: [],
            resolutionsList: [],
            newCustomer: false,
            escalate: false,
            supervisorList: [],
            clientDetailsUpdate: false
        }

        this.onIDLookup = this.onIDLookup.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.getSupervisors = this.getSupervisors.bind(this);

        this.dataLayer = new DataLayer();
        this.processChangeEvent = this.processChangeEvent.bind(this);
    }

    componentWillMount() {
        let callCenterConfig = JSON.parse(sessionStorage.getItem('foneBookConfig'));

        if (callCenterConfig != null) {
            //Load stores from config
            let configStores = callCenterConfig.find((config) => config.id === 'stores');
            let storeList = [];
            configStores.items.forEach((store) => {
                storeList.push({ 'name': store.value, 'value': store.key });
            });
            storeList = storeList.sort((a, b) => {
                if (a.name > b.name) { return 1; }
                if (a.name < b.name) { return -1; }
                return 0;
            })

            //Load reasons from config
            let configReasons = callCenterConfig.find((config) => config.id === 'reasons');
            let reasonsList = [];
            //reasonsList.push({ 'name': 'Other', 'value': 'Other' });
            configReasons.items.forEach((reason) => {
                reasonsList.push({ 'name': reason.value, 'value': reason.value });
            });
            reasonsList = reasonsList.sort((a, b) => {
                if (a.name > b.name) { return 1; }
                if (a.name < b.name) { return -1; }
                return 0;
            })

            //Load resolutions from config
            let configResolutions = callCenterConfig.find((config) => config.id === 'resolutions');
            let resolutionsList = [];
            //resolutionsList.push({ 'name': 'Other', 'value': 'Other' });
            configResolutions.items.forEach((resolution) => {
                resolutionsList.push({ 'name': resolution.value, 'value': resolution.key });
            });
            resolutionsList = resolutionsList.sort((a, b) => {
                if (a.name > b.name) { return 1; }
                if (a.name < b.name) { return -1; }
                return 0;
            })

            this.setState({ storeList, reasonsList, resolutionsList });
        }
    }

    processChangeEvent() {
        this.setState({
            client: this.client,
            ticket: this.ticket
        });
    }

    async loadAgents(selectedItem, state, props) {
        this.props.loaderOn();
        let store = await this.dataLayer.Get(`/getstoredetails/${selectedItem.value}`);
        let storeAgentList = [];

        this.ticket.storeId = selectedItem.value;

        if (store !== undefined) {
            store.agents.forEach((agent) => {
                storeAgentList.push({ 'name': `${agent.name} - ${agent.email} - ${agent.tel}`, 'value': `${agent.name} - ${agent.email} - ${agent.tel}` });
            });

            storeAgentList = storeAgentList.sort((a, b) => {
                if (a.name > b.name) { return 1; }
                if (a.name < b.name) { return -1; }
                return 0;
            })
            this.setState({ storeAgentList });
        }
        this.props.loaderOff();
    }

    async onIDLookup() {
        this.props.loaderOn();
        //let clientLookupResult = await this.dataLayer.Get(`/getclientdetails/${this.client.id}`)
        let clientLookupResult = await this.dataLayer.Post('/getclientdetailsPOST', { id: this.client.id });

        console.log(clientLookupResult);

        if (clientLookupResult != null) {
            this.client = clientLookupResult;
            this.client.dateOfBirth = this.client.dateOfBirth.substring(0, 10);

            this.setState({
                client: this.client,
                showCusomerDetail: true,
                newCustomer: false
            });
        }
        else {
            this.setState({
                showCusomerDetail: true,
                newCustomer: true
            });
        }
        this.props.loaderOff();
    }

    validateSubmissionData(form) {

        if (form.storeAgent.value === 'true') {
            if (this.ticket.storeId === '') {
                alert('Please select a store');
                return false;
            }
            if (this.ticket.storeAgent === '') {
                alert('Please select a store agent');
                return false;
            }
        }

        if (form.callReason.value === '') {
            this.props.notify('error', 'Call reason is required');
            return false;
        }

        return true;
    }

    async getSupervisors() {
        this.props.loaderOn();
        let supervisors = await this.dataLayer.Get('/searchusertype/supervisor');
        let supervisoragents = await this.dataLayer.Get('/searchusertype/supervisoragent');
        let supervisorList = [];

        if (supervisors != null) {
            supervisors.forEach((supervisor) => supervisorList.push({ 'name': `${supervisor.name} ${supervisor.surname}`, 'value': supervisor.email }));
        }

        if (supervisoragents != null) {
            supervisoragents.forEach((supervisor) => supervisorList.push({ 'name': `${supervisor.name} ${supervisor.surname}`, 'value': supervisor.email }));
        }
        this.props.loaderOff();
        this.setState({
            supervisorList: supervisorList
        });
    }

    async onSubmit(event) {
        event.preventDefault();

        this.props.loaderOn();

        let form = event.target;
        
        if (event.key === 13) {
            return;
        }

        if (this.validateSubmissionData(event.target)) {

            this.client.id = this.client.id.trim();

            if (this.state.newCustomer) {
                this.client._id = null;
                this.client.dateOfBirth = new Date(this.client.dateOfBirth);
                await this.dataLayer.Post('/addclient', this.client);
                await this.onIDLookup();
            } else {
                if (this.state.clientDetailsUpdate) {
                    this.client.dateOfBirth = new Date(this.client.dateOfBirth);
                    await this.dataLayer.Post('/updateclient', this.client);
                }
            }

            //Check call reason
            if (this.ticket.reason === 'Other') {
                if (form.callReasonDescription !== null && form.callReasonDescription.value.trim() !== "") {
                    this.ticket.reason = form.callReasonDescription.value.trim();
                }
            }

            //Check call resolution
            if (this.ticket.resolution === 'Other') {
                if (form.callResolutionDescription !== null && form.callResolutionDescription.value.trim() !== "") {
                    this.ticket.resolution = form.callResolutionDescription.value.trim();
                }
            }

            if (form != null) {
                if (form.note != null) {
                    if (form.note.value.trim() !== '') {
                        this.ticket.notes.push(`[${sessionStorage.getItem("foneBookUser")}] ${form.note.value}`);
                    }
                }
            }

            this.ticket.clientId = this.client.id;
            this.ticket.clientCell = this.client.cell;

            //Set Status
            if (this.state.escalate) {
                this.ticket.closed = new Date('1900-01-01');
                this.ticket.status = 'escalated';
            }
            else {
                this.ticket.closed = new Date();
                this.ticket.status = 'closed';
            }

            let result = await this.dataLayer.Post('/addticket', this.ticket);
            if (result != null) {
                this.props.notify('success', 'Ticket successfully saved');
                const { history } = this.props;
                history.push('/workspace');
            }
            else {
                this.props.notify('error', 'An error occurred');
            }
        }
        this.props.loaderOff();
    }

    render() {
        return (
            <div>
                <h3 className="mb-3">New Ticket</h3>
                <form onSubmit={this.onSubmit}>
                    {/* SELECT CALLER TYPE */}
                    <div className="form-group">
                        <input
                            type="radio"
                            name="storeAgent"
                            value={true}
                            onChange={() => this.setState({ storeAgent: true })}
                            required
                        /> Store Agent <br />

                        <input
                            type="radio"
                            name="storeAgent"
                            value={false}
                            onChange={() => this.setState({ storeAgent: false })}
                            required
                        /> Private Customer
                    </div>

                    {/* SEARCH STORE AGENTS */}
                    <div className="form-group">
                        {
                            (this.state.storeAgent) ?
                                (
                                    <div>
                                        <SelectSearch
                                            name="storeId"
                                            options={this.state.storeList}
                                            placeholder="Select a Store"
                                            search={true}
                                            onChange={(selectedItem, state, props) => this.loadAgents(selectedItem, state, props)}
                                            value={this.ticket.storeId}
                                        />
                                        <SelectSearch
                                            name="storeId"
                                            options={this.state.storeAgentList}
                                            placeholder="Select an Agent"
                                            search={true}
                                            onChange={(selectedItem, state, props) => {
                                                this.ticket.storeAgent = selectedItem.value;
                                                this.processChangeEvent();
                                            }}
                                            value={this.ticket.storeAgent}
                                        />
                                    </div>
                                )
                                : (<div></div>)
                        }
                    </div>

                    {/* SEARCH CUSTOMER */}
                    <MDBRow>
                        <MDBCol md="8">
                            <MDBInput
                                name="id"
                                label="Customer ID / Passport Number"
                                type="text"
                                value={this.client.id}
                                onChange={(event) => {
                                    this.client.id = event.target.value;
                                    this.processChangeEvent();
                                }}
                                maxLength="13"
                                minLength="10"
                                validate
                                required
                            />
                        </MDBCol>
                        <MDBCol md="4">
                            <MDBBtn color="mdb-color" onClick={this.onIDLookup}> Lookup Client</MDBBtn>
                        </MDBCol>
                    </MDBRow>

                    {/* CUSTOMER & TIKCET INFORMATION */}
                    {
                        (this.state.showCusomerDetail) ?
                            (
                                <div className="form-group">
                                    <MDBInput
                                        name="hostRef"
                                        label="Host System Reference"
                                        type="text"
                                        value={this.client.hostRef}
                                        onChange={(event) => {
                                            this.ticket.hostRef = event.target.value;
                                            this.processChangeEvent();
                                        }}
                                        required
                                    />
                                    <input
                                        name="saCitizen"
                                        label="SA Citizen"
                                        type="checkbox"
                                        checked={this.client.saCitizen}
                                        onChange={(event) => {
                                            this.client.saCitizen = event.target.checked;
                                            this.processChangeEvent();
                                        }}
                                    /> SA Citizen
                                    <MDBInput
                                        name="name"
                                        label="First Name"
                                        type="text"
                                        value={this.client.name}
                                        onChange={(event) => {
                                            this.client.name = event.target.value;
                                            this.processChangeEvent();
                                            this.setState({ clientDetailsUpdate: true });
                                        }}
                                        required
                                    />
                                    <MDBInput
                                        name="surname"
                                        label="Surname"
                                        type="text"
                                        value={this.client.surname}
                                        onChange={(event) => {
                                            this.client.surname = event.target.value;
                                            this.processChangeEvent();
                                            this.setState({ clientDetailsUpdate: true });
                                        }}
                                        required
                                    />
                                    <MDBInput
                                        name="dateOfBirth"
                                        label="Date of Birth"
                                        type="date"
                                        value={this.client.dateOfBirth}
                                        onChange={(event) => {
                                            this.client.dateOfBirth = event.target.value;
                                            this.processChangeEvent();
                                            this.setState({ clientDetailsUpdate: true });
                                        }}
                                    />
                                    <SelectSearch
                                        name="gender"
                                        options={[{ 'name': 'Male', 'value': 'male' }, { 'name': 'Female', 'value': 'female' }]}
                                        placeholder="Select a Gender"
                                        search={true}
                                        value={this.client.gender}
                                        onChange={(selectedItem, state, props) => {
                                            this.client.gender = selectedItem.value;
                                            this.processChangeEvent();
                                            this.setState({ clientDetailsUpdate: true });
                                        }}
                                        required
                                    />
                                    <MDBInput
                                        name="cell"
                                        label="Cellphone Number"
                                        type="text"
                                        value={this.client.cell}
                                        onChange={(event) => {
                                            this.client.cell = event.target.value;
                                            this.processChangeEvent();
                                            this.setState({ clientDetailsUpdate: true });
                                        }}
                                        maxLength="10"
                                        required
                                    />

                                    {/* TICKET INFORMATION */}
                                    <SelectSearch
                                        name="callReason"
                                        options={this.state.reasonsList}
                                        placeholder="Select a Call Reason"
                                        search={true}
                                        onChange={(selectedItem, state, props) => {
                                            debugger
                                            this.ticket.reason = selectedItem.value;
                                            this.processChangeEvent();
                                        }}
                                        value={this.ticket.reason}
                                    />

                                    {
                                        (this.ticket.reason === 'Other') ?
                                            (
                                                <MDBInput
                                                    label="Fault Description"
                                                    name="callReasonDescription"
                                                />
                                            ) :
                                            (
                                                <div></div>
                                            )
                                    }
                                    <SelectSearch
                                        options={this.state.resolutionsList}
                                        placeholder="Select a Resolution"
                                        search={true}
                                        name="callResolution"
                                        value={this.ticket.resolution}
                                        onChange={(selectedItem, state, props) => {
                                            this.ticket.resolution = selectedItem.value;
                                            this.processChangeEvent();
                                        }}
                                        required
                                    />

                                    {
                                        (this.ticket.resolution === 'Other') ?
                                            (
                                                <MDBInput
                                                    label="Resolution Description"
                                                    name="callResolutionDescription"
                                                />
                                            ) :
                                            (
                                                <div></div>
                                            )
                                    }

                                    <input
                                        name="escalate"
                                        label="Escalate"
                                        type="checkbox"
                                        value={this.state.escalate}
                                        onChange={(event) => {
                                            this.getSupervisors();
                                            this.setState({
                                                escalate: event.target.checked
                                            });
                                        }}
                                    /> Escalate

                                    <MDBInput
                                        label="Note"
                                        type="textarea"
                                        name="note"
                                    />

                                    {
                                        this.state.escalate ?
                                            (
                                                <div>
                                                    <SelectSearch
                                                        options={this.state.supervisorList}
                                                        placeholder="Select a Supervisor"
                                                        search={true}
                                                        name="escalateId"
                                                        value={this.ticket.escalatedId} /* /searchusertype/{type} */
                                                        onChange={(selectedItem, state, props) => {
                                                            this.ticket.escalatedId = selectedItem.value;
                                                            this.processChangeEvent();
                                                        }}
                                                    />
                                                    <MDBBtn color="mdb-color" type="submit">Escalate Ticket</MDBBtn>
                                                </div>
                                            ) : (
                                                <MDBBtn color="mdb-color" type="submit">Resolve Ticket</MDBBtn>
                                            )
                                    }
                                    <MDBBtn color="mdb-color" onClick={() => {
                                        this.props.history.push('/workspace');
                                    }}>Cancel</MDBBtn>
                                </div>
                            ) : (<div></div>)
                    }
                </form>
            </div>
        );
    }
}