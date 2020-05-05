import React from 'react';
import { MDBBtn, MDBInput, MDBRow, MDBCol, MDBBadge, MDBNavLink } from 'mdbreact';
import DataLayer from '../Utilities/DataLayer';
import SelectSearch from 'react-select-search';
//import Select from 'react-select';
import moment from 'moment';

export default class EscalateTicket extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            client: {},
            ticket: {},
            ticketCount: 0,
            tempNotes: '',
        }

        this.dataLayer = new DataLayer();
        this.handleChange = this.handleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.updateTicket = this.updateTicket.bind(this);
    }

    componentWillMount() {
        let callCenterConfig = JSON.parse(sessionStorage.getItem('foneBookConfig'));
        let configResolutions = callCenterConfig.find((config) => config.id === 'resolutions');
        let resolutionsList = [];

        configResolutions.items.forEach((resolution) => {
            resolutionsList.push({ 'name': resolution.value, 'value': resolution.value });
        });

        resolutionsList = resolutionsList.sort((a, b) => {
            if (a.name > b.name) { return 1; }
            if (a.name < b.name) { return -1; }
            return 0;
        })

        this.setState({ resolutionsList });

        this.loadTicket();
    }

    async loadTicket() {

        this.props.loaderOn();
        let tickets = [];
        let ticket = {};
        let client = {};
        let dumbGoLangDate = new Date('0001-01-01').toLocaleDateString();

        if (this.props.location.state && this.props.location.state.reopened) {
            tickets = await this.dataLayer.Get('/getclosedticketssql');
        }
        else {
            tickets = await this.dataLayer.Get('/getopenticketssql');
        }

        if (tickets == null) {
            this.props.notify('success', 'No tickets available');
            const { history } = this.props;
            history.push('/workspace');
            return;
        }

        if (this.props.location.state && this.props.location.state.ticket_id) {
            ticket = tickets.find(ticket => ticket._id === this.props.location.state.ticket_id);
        }
        else {
            ticket = tickets[0]
        }

        //client = await this.dataLayer.Get(`/getclientdetails/${ticket.clientId}`);
        //client = await this.dataLayer.Post('/getclientdetailsPOST', { id: ticket.clientId });
        client = await this.dataLayer.Get(`/getclientdetailsPOSTsql/${ticket.clientId}`);
        //console.log('await client[0]: ', client[0]);

        //Date logic to cater for Go Lang default 01/01/0001 date if no date exists
        if (ticket.promiseToPayDate && new Date(ticket.promiseToPayDate).toLocaleDateString() !== dumbGoLangDate) {
            ticket.promiseToPayDate = ticket.promiseToPayDate.substring(0, 10);
            //console.log('ticket.promiseToPayDate: ', ticket.promiseToPayDate);
        }
        else {
            ticket.promiseToPayDate = null;
        }

        if (ticket.debitOrderResubmissionsDate && new Date(ticket.debitOrderResubmissionsDate).toLocaleDateString() !== dumbGoLangDate) {
            ticket.debitOrderResubmissionsDate = ticket.debitOrderResubmissionsDate.substring(0, 10);
        }
        else {
            ticket.debitOrderResubmissionsDate = null;
        }

        this.setState({
            ticketCount: tickets.length,
            client: client[0],
            ticket: ticket,
            tempNotes: ''
        });

        this.props.loaderOff();
    }

    handleChange(client, ticket) {
      console.log('handleChange ticket: ', ticket);
        this.setState({
            client: client,
            ticket: ticket,
        })
    }

    async updateTicket() {
        this.props.loaderOn();
        /*let day = new Date()
        let dayWrapper = moment(day);
        let dayString = dayWrapper.format("YYYY-MM-DD");*/

        let ticket = this.state.ticket;
        console.log('updateTicket ticket: ', ticket);

        if (ticket.promiseToPayDate) {
          //const date = moment('2018-10-03T05:00:00.000+0000');
          //console.log(date.format('MMM-DD-YYYY'));

          const date = moment(ticket.promiseToPayDate);
            ticket.promiseToPayDate = date.format('YYYY-MM-DD'); //new Date(ticket.promiseToPayDate);
        }

        if (ticket.debitOrderResubmissionsDate) {
          const date = moment(ticket.debitOrderResubmissionsDate);
          ticket.debitOrderResubmissionsDate = date.format('YYYY-MM-DD'); //new Date(ticket.debitOrderResubmissionsDate);
        }

        //ticket.notes.push(`[${sessionStorage.getItem('foneBookUser')}] ${this.state.tempNotes}`);
        ticket.notes = ticket.notes + `[${sessionStorage.getItem('foneBookUser')}] ${this.state.tempNotes}`;

        if (this.props.location.state && this.props.location.state.reopened) {
            ticket.reopenedBy = sessionStorage.getItem("foneBookUser");
            ticket.status = "escalated";
        }

        //console.log('Escalated ticket: ', ticket);
        //console.log(`Escalated posting to: /updateticketsql/${ticket.ticketId}`);
        console.log('ticket to be posted: ', ticket);
        await this.dataLayer.Post(`/updateticketsql/${ticket.ticketId}`, ticket);
        //await this.dataLayer.Post('/updateticketsql', ticket);
        //await this.dataLayer.Post(`/ticketssql`)
        this.props.loaderOff();
        this.props.history.push('/workspace');
    }

    async onSubmit(event) {
        event.preventDefault();
        let day = new Date()
        let dayWrapper = moment(day);
        let dayString = dayWrapper.format("YYYY-MM-DD HH:MM:SS");

        let customValidation = this.customValidation();
        if (!customValidation.valid) {
            alert(customValidation.message);
            return;
        }

        this.props.loaderOn();
        let ticket = this.state.ticket;


        //ticket.notes.push(`[${sessionStorage.getItem('foneBookUser')}] ${this.state.tempNotes}`);
        ticket.notes = ticket.notes + `[${sessionStorage.getItem('foneBookUser')}] ${this.state.tempNotes}`;
        ticket.closed = dayString; //new Date();
        ticket.status = 'Closed';

        if (ticket.promiseToPayDate) {
            ticket.promiseToPayDate = dayString; //new Date(ticket.promiseToPayDate);
        }

        if (ticket.debitOrderResubmissionsDate) {
            ticket.debitOrderResubmissionsDate = dayString; //new Date(ticket.debitOrderResubmissionsDate);
        }

        if (this.props.location.state && this.props.location.state.reopened) {
            ticket.reopenedBy = sessionStorage.getItem("foneBookUser");
        }

        await this.dataLayer.Post(`/updateticketsql/${ticket.ticketId}`, ticket);
        //await this.dataLayer.Post(`/ticketssql`)

        this.props.loaderOff();
        this.props.history.push('/workspace');
    }

    customValidation() {
        let response = { valid: true, message: "" };

        if (!this.state.ticket.resolution) {
            response.valid = false;
            response.message = "Please capture a resolution to continue."
        }

        // if (this.state.ticket.promiseToPayDate) {
        //     if (new Date(new Date().toLocaleDateString()) > new Date(this.state.ticket.promiseToPayDate)) {
        //         response.valid = false;
        //         response.message = "The promise to pay date is in the past, please select a valid date";
        //     }
        // }

        // if (this.state.ticket.debitOrderResubmissionsDate) {
        //     if (new Date(new Date().toLocaleDateString()) > new Date(this.state.ticket.debitOrderResubmissionsDate)) {
        //         response.valid = false;
        //         response.message = "The debit order resubmission date is in the past, please select a valid date";
        //     }
        // }

        return response;
    }

    render() {

        let ticket = this.state.ticket;
        //if (this.state.client !== {}) {
          let client = this.state.client;
          //console.log('client: ', client);
        //}
        //console.log('ticket: ', ticket);
        //console.log('this.state.client.clientId: ', this.state.client[0]);
        //let clientId = this.state.client[0].clientId;

        let newNotes = [];
        let amountRegex = /^(0|[1-9]\d*)(\.\d*)?$/;

        if (!ticket.notes) {
            ticket.notes = [];
        }


        //let day = new Date()
        //let dayWrapper = moment(day);
        //let dayString = dayWrapper.format("YYYY-MM-DD HH:MM:SS");

        //console.log('dayString: ', dayString);

        /*ticket.notes.forEach(note => {
            if (note.includes('\n')) {
                note.split('\n').forEach(n => newNotes.push(n.trim()))
            }
            else {
                newNotes.push(note);
            }
        })*/

        newNotes = ticket.notes;

        return (
            <div>
                <MDBRow between>
                    <MDBCol>
                        <h3 className="mb-3">Escalated Ticket</h3>
                    </MDBCol>
                    <MDBCol className="text-right">
                        <h4>
                            <MDBNavLink to="/workspace">
                                <MDBBadge color="info">{this.state.ticketCount} Tickets</MDBBadge>
                            </MDBNavLink>
                        </h4>
                    </MDBCol>
                </MDBRow>

                <form onSubmit={this.onSubmit}>
                    <MDBRow>
                        <MDBCol md="6" sm="12">
                            <MDBInput
                                name="hostRef"
                                label="Host System Reference"
                                type="text"
                                value={this.state.ticket.hostRef}
                                disabled
                            />
                        </MDBCol>

                        <MDBCol md="6" sm="12">
                            <MDBInput
                                name="id"
                                label="Customer ID / Passport Number"
                                type="text"
                                value={this.state.client.clientId}
                                disabled
                            />
                        </MDBCol>

                        <MDBCol md="6" sm="12">
                            <MDBInput
                                name="name"
                                label="First Name"
                                type="text"
                                value={this.state.client.name}
                                disabled
                            />
                        </MDBCol>

                        <MDBCol md="6" sm="12">
                            <MDBInput
                                name="cell"
                                label="Cellphone Number"
                                type="text"
                                value={this.state.client.cell}
                                disabled
                            />
                        </MDBCol>

                        <MDBCol md="6" sm="12">
                            <MDBInput
                                name="open"
                                label="Date Opened"
                                type="text"
                                value={new Date(this.state.ticket.opened).toLocaleString()}
                                disabled
                            />
                        </MDBCol>

                        <MDBCol md="6" sm="12">
                            <MDBInput
                                name="accountAge"
                                label="Account Age"
                                type="number"
                                value={this.state.ticket.accountAge}
                                disabled
                            />
                        </MDBCol>

                        <MDBCol sm="12">
                            <MDBInput
                                name="reason"
                                label="Reason"
                                type="text"
                                value={this.state.ticket.reason}
                                disabled
                            />
                        </MDBCol>

                        {/* Editable Fields */}
                        <MDBCol md="6" sm="12">
                            <MDBInput
                                name="promiseToPayAmount"
                                label="Promise to Pay Amount"
                                type="text"
                                value={this.state.ticket.promiseToPayAmount}
                                onChange={event => {
                                    if (amountRegex.test(event.target.value) || event.target.value === "") {
                                        ticket.promiseToPayAmount = event.target.value;
                                    }
                                    else {
                                        ticket.promiseToPayAmount = "";
                                    }

                                    this.handleChange(client, ticket);
                                }}
                                onBlur={event => {
                                    if (ticket.promiseToPayAmount && ticket.promiseToPayAmount !== "") {
                                        ticket.promiseToPayAmount = (Math.round(ticket.promiseToPayAmount * 100) / 100).toFixed(2);
                                        this.handleChange(client, ticket);
                                    }
                                }}
                                min={0}
                            />
                        </MDBCol>

                        <MDBCol md="6" sm="12">
                            <MDBInput
                                name="promiseToPayDate"
                                label="Promise to Pay Date"
                                type="date"
                                value={this.state.ticket.promiseToPayDate}
                                onChange={event => {
                                    if (event.target.value !== "") {
                                      console.log('PTP date: ', event.target.value);
                                        ticket.promiseToPayDate = event.target.value;
                                        console.log('PTP ticket: ', ticket);
                                        this.handleChange(client, ticket);
                                    }
                                }}
                                required={(ticket.promiseToPayAmount && ticket.promiseToPayAmount > 0) ? true : false}
                            />
                        </MDBCol>

                        <MDBCol md="6" sm="12">
                            <MDBInput
                                name="debitOrderResubmissionsAmount"
                                label="Debit Order Resubmissions Amount"
                                type="text"
                                value={this.state.ticket.debitOrderResubmissionsAmount}
                                onChange={event => {
                                    if (amountRegex.test(event.target.value) || event.target.value === "") {
                                        ticket.debitOrderResubmissionsAmount = event.target.value;
                                    }
                                    else {
                                        ticket.debitOrderResubmissionsAmount = "";
                                    }

                                    this.handleChange(client, ticket);
                                }}
                                onBlur={event => {
                                    if (ticket.debitOrderResubmissionsAmount && ticket.debitOrderResubmissionsAmount !== "") {
                                        ticket.debitOrderResubmissionsAmount = (Math.round(ticket.debitOrderResubmissionsAmount * 100) / 100).toFixed(2);
                                        this.handleChange(client, ticket);
                                    }
                                }}
                                min={0}
                            />
                        </MDBCol>

                        <MDBCol md="6" sm="12">
                            <MDBInput
                                name="debitOrderResubmissionsDate"
                                label="Debit Order Resubmissions Date"
                                type="date"
                                value={this.state.ticket.debitOrderResubmissionsDate}
                                onChange={event => {
                                    if (event.target.value !== "") {
                                      console.log('debitOrderResubmissionsDate event.target.value: ', event.target.value);
                                        ticket.debitOrderResubmissionsDate = event.target.value;
                                        this.handleChange(client, ticket);
                                    }
                                }}
                                required={(ticket.debitOrderResubmissionsAmount && ticket.debitOrderResubmissionsAmount > 0) ? true : false}
                            />
                        </MDBCol>

                        <MDBCol md="12" sm="12">
                            <h5>Notes</h5>
                            {
                                //newNotes.map((note) => (<p><i>{note}</i></p>))
                                <p><i>{newNotes}</i></p>
                            }
                        </MDBCol>

                        <MDBCol md="6" sm="12">
                            <span>Customer Cell: <a href={"tel:" + this.state.client.cell}>{this.state.client.cell}</a></span><br />
                            <span>Additional Tel 1: <a href={"tel:" + this.state.ticket.telephone1}>{this.state.ticket.telephone1}</a></span><br />
                            <span>Additional Tel 2: <a href={"tel:" + this.state.ticket.telephone2}>{this.state.ticket.telephone2}</a></span><br />
                            <span>Additional Tel 3: <a href={"tel:" + this.state.ticket.telephone3}>{this.state.ticket.telephone3}</a></span><br />
                            <span>Additional Tel 4: <a href={"tel:" + this.state.ticket.telephone4}>{this.state.ticket.telephone4}</a></span><br />
                            <span>Additional Tel 5: <a href={"tel:" + this.state.ticket.telephone5}>{this.state.ticket.telephone5}</a></span><br />
                        </MDBCol>
                        <MDBCol md="6" sm="12">
                            <span>Additional Tel 6: <a href={"tel:" + this.state.ticket.telephone6}>{this.state.ticket.telephone6}</a></span><br />
                            <span>Additional Tel 7: <a href={"tel:" + this.state.ticket.telephone7}>{this.state.ticket.telephone7}</a></span><br />
                            <span>Additional Tel 8: <a href={"tel:" + this.state.ticket.telephone8}>{this.state.ticket.telephone8}</a></span><br />
                            <span>Additional Tel 9: <a href={"tel:" + this.state.ticket.telephone9}>{this.state.ticket.telephone9}</a></span><br />
                            <span>Additional Tel 10: <a href={"tel:" + this.state.ticket.telephone10}>{this.state.ticket.telephone10}</a></span><br />
                        </MDBCol>

                    </MDBRow>

                    <br />
                    <label>Resolution</label>
                    <SelectSearch
                        options={this.state.resolutionsList}
                        placeholder="Select a Resolution"
                        search={true}
                        name="callResolution"
                        value={this.state.ticket.resolution}
                        onChange={(selectedItem) => {
                            ticket.resolution = selectedItem.value;
                            //this.handleChange(client, ticket);

                        }}
                    />

                    <MDBInput
                        label="Note"
                        type="textarea"
                        name="note"
                        value={this.state.tempNotes}
                        onChange={(event) => {
                            this.setState({ tempNotes: event.target.value });
                        }}
                        required
                    />

                    <MDBBtn color="mdb-color" type="submit" id="close">Close Ticket</MDBBtn>
                    <MDBBtn color="mdb-color" onClick={this.updateTicket}>Update Ticket</MDBBtn>
                </form>
            </div>
        );
    }
}
