import React from 'react';
import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import WorkspaceRoutes from './Utilities/WorkspaceRoutes';

//MDBootstrap
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap-css-only/css/bootstrap.min.css";
import "mdbreact/dist/css/mdb.css";

function App() {
    return (
        <Router>
            <WorkspaceRoutes />
        </Router>
    );
}

export default App;