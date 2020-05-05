import React from 'react';
import { MDBBtn, MDBRow } from 'mdbreact';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import { CSVLink } from "react-csv";
import _ from 'lodash';
import DataLayer from '../Utilities/DataLayer';

export default class Report extends React.Component {

    reportData = [{
        "dummy": "dummy"
    }];

    constructor(props) {
        super(props);
        this.state = props;

        this.loadOpenTickets = this.loadOpenTickets.bind(this);
        this.loadClosedTickets = this.loadClosedTickets.bind(this);
        this.setExportData = this.setExportData.bind(this);
        this.dataLayer = new DataLayer();
    }

    componentWillMount() {
        this.loadOpenTickets();
    }

    async loadOpenTickets() {
        this.props.loaderOn();
        this.reportData = await this.dataLayer.Get('/getopenticketssql');
        this.processReportData();
        this.props.loaderOff();
        this.setState({ staticContext: this.state.staticContext });
    }

    async loadClosedTickets() {
        this.props.loaderOn();
        this.reportData = await this.dataLayer.Get('/getclosedticketssql');
        this.processReportData();
        this.props.loaderOff();
        this.setState({ staticContext: this.state.staticContext });
    }

    processReportData() {
        if (this.reportData == null) {
            this.reportData = []
        }

        _.forEach(this.reportData, function (obj) {

            if (obj.opened) {
                _.set(obj, 'openedTime', new Date(obj.opened).toLocaleTimeString());
                _.set(obj, 'opened', obj.opened.substring(0, 10));
            }

            if (obj.closed) {
                _.set(obj, 'closedTime', new Date(obj.closed).toLocaleTimeString());
                _.set(obj, 'closed', obj.closed.substring(0, 10));
            }

            if (obj.promiseToPayDate) {
                _.set(obj, 'promiseToPayDate', obj.promiseToPayDate.substring(0, 10));
            }

            if (obj.debitOrderResubmissionsDate) {
                _.set(obj, 'debitOrderResubmissionsDate', obj.debitOrderResubmissionsDate.substring(0, 10));
            }

            if (obj.notes) {
              _.set(obj, 'note', obj.note);
            }

            /*if (obj.notes) {
                let n = "";

                obj.notes.forEach(note =>{
                    n += `${note}; `
                });

                _.set(obj, 'notes', n);
            }*/
        });
    }

    setExportData(tableChangeEvent) {
        this.props.loaderOn();
        let table = document.getElementsByTagName('table');
        let exportData = [];
        for (var r = 0, n = table[1].rows.length; r < n; r++) {
            let row = [];
            for (var c = 0, m = table[1].rows[r].cells.length; c < m; c++) {
                row.push(table[1].rows[r].cells[c].innerHTML);
            }
            this.exportData.push(row);
        }
        this.props.loaderOff();
        this.setState({ exportData });
    }

    render() {
        let table = document.getElementsByTagName('table');
        let exportData = [];

        if (table[1] != null) {
            for (var r = 0, n = table[1].rows.length; r < n; r++) {
                let row = [];
                for (var c = 0, m = table[1].rows[r].cells.length; c < m; c++) {
                    row.push(table[1].rows[r].cells[c].innerHTML);
                }
                exportData.push(row);
            }
        }

        return (
            <div>
                <h3 className="mb-3">Report</h3>
                <MDBRow className="mb-3">
                    <MDBBtn color="mdb-color" onClick={this.loadOpenTickets}>Load Open Ticket Data</MDBBtn>
                    <MDBBtn color="mdb-color" onClick={this.loadClosedTickets}>Load Closed Ticket Data</MDBBtn>
                    <CSVLink data={exportData} filename={"fonebookDataExport.csv"}>
                        <MDBBtn color="mdb-color">Export</MDBBtn>
                    </CSVLink>
                </MDBRow>
                <PivotTableUI
                    id="pivotTable"
                    data={this.reportData}
                    onChange={(s) => {
                        this.setState(s);
                        this.setState(s); //DO NOT DELETE THIS LINE, it makes sure that the export data is not one entry behind.
                    }}
                    {...this.state}
                />
            </div>
        );
    }
}
