import axios from 'axios';
import AppSettings from '../appsettings';
import Security from './Security';

export default class DataLayer {

    security = new Security();

    async Get(path) {
        this.security.validateSession();
        if (path.includes('sql')) AppSettings.serverEndpoint = 'http://localhost:8081';
        try {
          //console.log(`Getting from ${AppSettings.serverEndpoint}${path}`);
            let response = await axios.get(`${AppSettings.serverEndpoint}${path}`, this.setHeaders());
            this.resetServerEndpoint();
            //console.log('response data: ', response.data);
            return response.data;
        } catch (exception) {
            if (exception.response.status === 500) {
              this.resetServerEndpoint();
                alert(`An error occurred. ${exception.response.data.message}`);
            }
            else {
              this.resetServerEndpoint();
                alert(`An error occurred. ${exception}`);
            }
        }
    }

    async Post(path, object) {
        this.security.validateSession();
        if (path.includes('sql')) AppSettings.serverEndpoint = 'http://localhost:8081';
        try {
          //console.log(`Posting to ${AppSettings.serverEndpoint}${path}`);
          //console.log('JSON.stringify(object): ', JSON.stringify(object));
            //let response = await axios.post(`${AppSettings.serverEndpoint}${path}`, JSON.stringify(object), this.setHeaders());
            let response = await axios.post(`${AppSettings.serverEndpoint}${path}`, object, this.setHeaders());
            //console.log('response.data: ', response.data);
            this.resetServerEndpoint();
            return response.data;
        } catch (exception) {
            if (exception.response.status === 500) {
              this.resetServerEndpoint();
                alert(`An error occurred. ${exception.response.data.message}`);
            }
            else {
              this.resetServerEndpoint();
                alert(`An error occurred. ${exception}`);
            }
        }
    }

    setHeaders() {
        const https = require('https');
        return {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
            , httpsAgent: new https.Agent({ rejectUnauthorized: false })
        }
    }

    resetServerEndpoint() {
      AppSettings.serverEndpoint = "https://eohcollections.sabco.za.com/integration";
    }
}
