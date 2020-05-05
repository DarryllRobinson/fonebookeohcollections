import React from 'react';
import { MDBDataTable, MDBBtn } from 'mdbreact';
import DataLayer from '../Utilities/DataLayer';
import Security from '../Utilities/Security';

export default class Dashboard extends React.Component {

    constructor(props) {
        super();

        this.state = {
            openTicketsLoaded: true,
            columns: [
                {
                    label: 'Escalated To',
                    field: 'escalatedId',
                    sort: 'asc'
                },
                {
                    label: 'Client ID Number',
                    field: 'clientId',
                    sort: 'asc'
                },
                {
                    label: 'Host Reference Number',
                    field: 'hostRef',
                    sort: 'asc'
                },
                {
                    label: 'Opened On',
                    field: 'opened',
                    sort: 'asc'
                },
                {
                    label: 'Total',
                    field: 'total',
                    sort: 'asc'
                },
                {
                    label: 'Current',
                    field: 'current',
                    sort: 'asc'
                },
                {
                    label: '30 Days',
                    field: 'days30',
                    sort: 'asc'
                },
                {
                    label: '60 Days',
                    field: 'days60',
                    sort: 'asc'
                },
                {
                    label: '90 Days',
                    field: 'days90',
                    sort: 'asc'
                },
                {
                    label: '120 Days',
                    field: 'days120',
                    sort: 'asc'
                },
                {
                    label: '150 Days',
                    field: 'days150',
                    sort: 'asc'
                },
                {
                    label: 'Open',
                    sort: 'asc'
                }
            ],
            rows: []
        }

        this.security = new Security();
        this.dataLayer = new DataLayer();
        this.loadOpenTickets = this.loadOpenTickets.bind(this);
        this.loadClosedTickets = this.loadClosedTickets.bind(this);
        this.openTicket = this.openTicket.bind(this);
        this.reopenTicket = this.reopenTicket.bind(this);
        this.processChangeEvent = this.processChangeEvent.bind(this);
    }

    componentWillMount() {
        this.loadOpenTickets();
    }

    async loadOpenTickets() {
        this.props.loaderOn();
        //let openTickets = await this.dataLayer.Get('/getopentickets');
        //let openTickets = await this.dataLayer.Get('/getopenticketssql');
        let openAccounts = await this.dataLayer.Get('/getopenaccountsssql');
        let rows = [];

        if (openAccounts != null) {
            openAccounts.forEach((account, index) => {
                let row = {
                    escalatedId: account.escalatedId,
                    clientId: account.clientId,
                    hostRef: account.hostRef,
                    opened: new Date(account.opened).toLocaleString(),
                    total: account.TotalBalance,
                    current: account.CurrentBalance,
                    days30: account.Days30,
                    days60: account.Days60,
                    days90: account.Days90,
                    days120: account.Days120,
                    days150: account.Days150,
                    id: <MDBBtn color="mdb-color" name={account._id} size="sm" onClick={this.openTicket}>Open</MDBBtn>
                }
                rows.push(row);
            });
        }

        /*if (openTickets != null) {
            openTickets.forEach((ticket, index) => {
                let row = {
                    escalatedId: ticket.escalatedId,
                    clientId: ticket.clientId,
                    hostRef: ticket.hostRef,
                    opened: new Date(ticket.opened).toLocaleString(),
                    reason: ticket.reason,
                    id: <MDBBtn color="mdb-color" name={ticket._id} size="sm" onClick={this.openTicket}>Open</MDBBtn>
                }
                rows.push(row);
            });
        }*/
        this.props.loaderOff();
        this.setState({ rows: rows, openTicketsLoaded: true });
    }

    async loadClosedTickets() {
        this.props.loaderOn();
        //let openTickets = await this.dataLayer.Get('/getopenticketssql');
        let openAccounts = await this.dataLayer.Get('/getclosedaccountsssql');
        let rows = [];

        if (openAccounts != null) {
            openAccounts.forEach((account, index) => {
              let row = {
                  escalatedId: account.escalatedId,
                  clientId: account.clientId,
                  hostRef: account.hostRef,
                  opened: new Date(account.opened).toLocaleString(),
                  total: account.TotalBalance,
                  current: account.CurrentBalance,
                  days30: account.Days30,
                  days60: account.Days60,
                  days90: account.Days90,
                  days120: account.Days120,
                  days150: account.Days150,
                  id: <MDBBtn color="mdb-color" name={account._id} size="sm" onClick={this.openTicket}>Open</MDBBtn>
              }
                rows.push(row);
            });
        }
        this.props.loaderOff();
        this.setState({ rows: rows, openTicketsLoaded: false });
    }

    openTicket(event) {
        let ticket_id = event.target.name;
        let reopened = false;
        const { history } = this.props;
        history.push('/workspace/escalatedticket', { ticket_id, reopened });
    }

    reopenTicket(event) {
        let ticket_id = event.target.name;
        let reopened = true;
        const { history } = this.props;
        history.push('/workspace/escalatedticket', { ticket_id, reopened });
    }

    processChangeEvent() {
        this.setState({ refresh: true });
    }

    render() {
        let gridData = { columns: this.state.columns, rows: this.state.rows }
        return (
            <div>
                {
                    (this.state.openTicketsLoaded) ?
                        (<h4>Open Tickets</h4>) :
                        (<h4>Closed Tickets</h4>)
                }

                <MDBBtn color="mdb-color" onClick={this.loadOpenTickets}>Load Open Tickets</MDBBtn>
                <MDBBtn color="mdb-color" onClick={this.loadClosedTickets}>Load Closed Tickets</MDBBtn>

                <MDBDataTable
                    striped
                    bordered
                    small
                    data={gridData}
                />
            </div>
        );
    }
}
