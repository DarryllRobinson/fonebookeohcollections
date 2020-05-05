import React from 'react';
import { Route, Switch } from 'react-router-dom';
import AgentWorkspace from '../Components/AgentWorkspace';
import Login from '../Components/Login';

const WorkspaceRoutes = () => {
    return (
        <Switch>
            <Route exact path="/" component={Login} />
            <Route exact path="/workspace" component={AgentWorkspace} />
        </Switch>
    );
}

export default WorkspaceRoutes