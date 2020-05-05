import React from 'react';
import DataLayer from '../Utilities/DataLayer';

export default class ImportCSV extends React.Component {

    state = {
        entryCount: 0,
        uploadedRecords: [],
        supervisorList: [],
        progress: 0,
    }

    constructor(props) {
        super(props);
        this.handleFileChosenNewTickets = this.handleFileChosenNewTickets.bind(this);
        this.handleFileChosenKillList = this.handleFileChosenKillList.bind(this);
        this.saveRecordsToDatabase = this.saveRecordsToDatabase.bind(this);
        this.getSupervisors = this.getSupervisors.bind(this);
        this.saveClient = this.saveClient.bind(this);
        this.saveTicket = this.saveTicket.bind(this);
        this.killTickets = this.killTickets.bind(this);

        this.dataLayer = new DataLayer();
    }

    async componentWillMount() {
        await this.getSupervisors();
    }

    async handleFileChosenNewTickets(file) {
        if (!file) {
            return
        }
        this.props.loaderOn();
        let fileReader = new FileReader();
        fileReader.readAsText(file);

        setTimeout(() => {
            let lines = fileReader.result.split("\n");
            let result = [];
            let headers = lines[0].split(",");

            for (let i = 1; i < lines.length; i++) {
                let obj = {};
                let currentline = lines[i].split(",");
                for (let j = 0; j < headers.length; j++) {
                    obj[headers[j].trim()] = currentline[j];
                }

                if (obj.msisdn)
                    result.push(obj);
            }

            this.setState({
                entryCount: result.length,
                uploadedRecords: result
            })

            this.saveRecordsToDatabase().then(response => {
                this.props.loaderOff();
            });

        }, 3000);
    }

    async handleFileChosenKillList(file) {
        if (!file) {
            return
        }
        this.props.loaderOn();
        let fileReader = new FileReader();
        fileReader.readAsText(file);

        setTimeout(async () => {
            let lines = fileReader.result.split("\n");
            let result = [];
            let headers = lines[0].split(",");

            for (let i = 1; i < lines.length; i++) {
                let obj = {};
                let currentline = lines[i].split(",");
                for (let j = 0; j < headers.length; j++) {
                    obj[headers[j].trim()] = currentline[j];
                }

                result.push(obj);
            }

            this.setState({
                entryCount: result.length,
                uploadedRecords: result
            })

            await this.killTickets();
            this.props.loaderOff();

        }, 3000);
    }

    async saveRecordsToDatabase() {

        let clients = [];
        let tickets = [];

        await this.state.uploadedRecords.map(async (record) => {
            clients.push({
                id: record.id_number,
                name: record.customer_name,
                cell: record.msisdn,
            })

            tickets.push({
                clientId: record.id_number,
                clientCell: record.msisdn,
                hostRef: record.account_number,
                agentId: sessionStorage.getItem("foneBookUser"),
                status: "escalated",
                opened: new Date(),
                accountAge: record.age,
                escalatedId: record.agentname,
                telephone1: record.telephone1,
                telephone2: record.telephone2,
                telephone3: record.telephone3,
                telephone4: record.telephone4,
                telephone5: record.telephone5,
                telephone6: record.telephone6,
                telephone7: record.telephone7,
                telephone8: record.telephone8,
                telephone9: record.telephone9,
                telephone10: record.telephone10,
                notes: [`Account Number: ${record.account_number}
                Account Age: ${record.age}
                Balance: ${record.balance}
                Current Value: ${record.current_value}
                Balouts: ${record.balouts}
                Value 30 Days: ${record.Value_30_days}
                Value 60 Days: ${record.Value_60_days}
                Value 90 Days: ${record.Value_90_days}
                Value 120 Days: ${record.Value_120_days}
                Debit Order Date: ${record.debit_order_date}
                Dialler Comments: ${record.dialler_comments}`]
            })
        })

        for (let index = 0; index < clients.length; index++) {
            await this.saveClient(clients[index], tickets[index]);
            this.setState({ propgress: index + 1 })
        }
    }

    async saveClient(newClient, ticket) {

        try {
            let result = await this.dataLayer.Post('/addclient', newClient);

            if (result == null) {
                alert('Error occurred. Client saving failed.');
                return;
            }

            ticket.clientId = newClient.id;
            ticket.clientCell = newClient.cell;
            this.saveTicket(ticket);

        } catch (error) {
            alert('Error occurred. Please check the console.');
            console.log('-> ', error)
        }
    }

    async saveTicket(ticket) {

        try {
            let result = await this.dataLayer.Post('/addticket', ticket);

            if (result == null) {
                alert('Error occurred. Client saving faled.');
            }

        } catch (error) {
            alert('Error occurred. Please check the console.');
            console.log('-> ', error)
        }
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

    async killTickets() {
        let tickets;
        let counter = 0;
        let records = this.state.uploadedRecords;
        try {

            for (let index = 0; index < records.length; index++) {

                if (!records[index].account_number) {
                    continue;
                }

                tickets = await this.dataLayer.Get(`/searchticketsbyhostref/${records[index].account_number}`);

                if (tickets) {
                    for (let tIindex = 0; tIindex < tickets.length; tIindex++) {

                        if (tickets[tIindex].status !== "closed") {
                            tickets[tIindex].resolution = records[index].resolution;
                            (tickets[tIindex].notes == null) ? tickets[tIindex].notes = [records[index].notes] : tickets[tIindex].notes.push(records[index].notes);
                            tickets[tIindex].killFileUploadedBy = sessionStorage.getItem("foneBookUser");
                            tickets[tIindex].closed = new Date();
                            tickets[tIindex].status = "closed";

                            await this.dataLayer.Post('/updateticket', tickets[tIindex]);
                        }
                    }
                    this.setState({ propgress: counter + 1 })
                    counter = this.state.propgress;
                }
            }

            // this.state.uploadedRecords.map(async (record) => {
            //     tickets = await this.dataLayer.Get(`/searchticketsbyhostref/${record.account_number}`);

            //     if (tickets) {
            //         await tickets.map(async (ticket) => {
            //             ticket.resolution = record.resolution;
            //             (ticket.notes == null) ? ticket.notes = [record.notes] : ticket.notes.push(record.notes);
            //             ticket.killFileUploadedBy = sessionStorage.getItem("foneBookUser");
            //             ticket.closed = new Date();
            //             ticket.status = "closed";

            //             await this.dataLayer.Post('/updateticket', ticket);
            //         });
            //         this.setState({ propgress: counter + 1 })
            //         counter = this.state.propgress;
            //     }
            // })
        } catch (error) {
            debugger
            alert('Error occurred. Please check the console.');
            console.log('-> ', error)
        }
    }

    render() {
        return (
            <div>
                <h1>Import CSV</h1>
                <h4>New Tickets</h4>
                <input
                    type="file"
                    onChange={event => this.handleFileChosenNewTickets(event.target.files[0])}
                    accept=".csv"
                />
                <br /><br />
                <h4>Kill List</h4>
                <input
                    type="file"
                    onChange={event => this.handleFileChosenKillList(event.target.files[0])}
                    accept=".csv"
                />
                <br /><br />
                {
                    (this.state.entryCount) === 0 ?
                        (<span></span>) :
                        (<h4>Processed {this.state.propgress} / {this.state.entryCount}</h4>)
                }
            </div>
        )
    }
}
