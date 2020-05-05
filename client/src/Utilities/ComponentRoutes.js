import React from 'react';
import { Route, Switch } from 'react-router-dom';
import LogTicket from '../Components/LogTicket';
import EscalatedTicket from '../Components/EscalatedTicket';
import AdminPanel from '../Components/AdminPanel';
import Report from '../Components/Report';
import Dashboard from '../Components/Dashboard';
import StoreAdmin from '../Components/StoreAdmin';
import UserAdmin from '../Components/UserAdmin';
import ImportCSV from '../Components/ImportCSV';

const ComponentRoutes = (props) => {
    let localProps = props;
    let userType = sessionStorage.getItem('foneBookUserType');

    function getAccessPaths() {
        switch (userType) {
            case 'agent':
                return (
                    <div>
                        <Route exact path="/workspace" render={(props) => < Dashboard {...props} notify={localProps.notify} loaderOn={localProps.loaderOn} loaderOff={localProps.loaderOff} />} />
                        <Route path="/workspace/logticket" render={(props) => < LogTicket {...props} notify={localProps.notify} loaderOn={localProps.loaderOn} loaderOff={localProps.loaderOff} />} />
                    </div>
                )
            case 'supervisor':
                return (
                    <div>
                        <Route exact path="/workspace" render={(props) => < Dashboard {...props} notify={localProps.notify} loaderOn={localProps.loaderOn} loaderOff={localProps.loaderOff} />} />
                        <Route path="/workspace/escalatedticket" render={(props) => <EscalatedTicket {...props} notify={localProps.notify} loaderOn={localProps.loaderOn} loaderOff={localProps.loaderOff} />} />
                        <Route path="/workspace/report" render={(props) => <Report {...props} notify={localProps.notify} loaderOn={localProps.loaderOn} loaderOff={localProps.loaderOff} />} />
                    </div>
                )
            case 'supervisoragent':
                return (
                    <div>
                        <Route exact path="/workspace" render={(props) => < Dashboard {...props} notify={localProps.notify} loaderOn={localProps.loaderOn} loaderOff={localProps.loaderOff} />} />
                        <Route path="/workspace/logticket" render={(props) => < LogTicket {...props} notify={localProps.notify} loaderOn={localProps.loaderOn} loaderOff={localProps.loaderOff} />} />
                        <Route path="/workspace/escalatedticket" render={(props) => <EscalatedTicket {...props} notify={localProps.notify} loaderOn={localProps.loaderOn} loaderOff={localProps.loaderOff} />} />
                        <Route path="/workspace/report" render={(props) => <Report {...props} notify={localProps.notify} loaderOn={localProps.loaderOn} loaderOff={localProps.loaderOff} />} />
                    </div>
                )
            case 'admin':
                return (
                    <div>
                        <Route exact path="/workspace" render={(props) => <AdminPanel {...props} notify={localProps.notify} loaderOn={localProps.loaderOn} loaderOff={localProps.loaderOff} />} />
                        <Route path="/workspace/adminpanel" render={(props) => <AdminPanel {...props} notify={localProps.notify} loaderOn={localProps.loaderOn} loaderOff={localProps.loaderOff} />} />
                        <Route path="/workspace/storeadmin" render={(props) => <StoreAdmin {...props} notify={localProps.notify} loaderOn={localProps.loaderOn} loaderOff={localProps.loaderOff} />} />
                        <Route path="/workspace/useradmin" render={(props) => <UserAdmin {...props} notify={localProps.notify} loaderOn={localProps.loaderOn} loaderOff={localProps.loaderOff} />} />
                        <Route path="/workspace/import" render={(props) => <ImportCSV {...props} notify={localProps.notify} loaderOn={localProps.loaderOn} loaderOff={localProps.loaderOff} />} />
                    </div>
                )
            default:
                return <h1>Access Denied</h1>
        }
    }

    return (
        <Switch>
            {
                getAccessPaths()
            }
        </Switch>
    );
}

export default ComponentRoutes