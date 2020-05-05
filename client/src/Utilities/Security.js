
export default class Security {

    writeLoginSession() {
        sessionStorage.setItem('foneBookSession', new Date().toString());
    }

    validateSession() {
        let sessionAgeMilliseconds = (new Date()) - (new Date(sessionStorage.getItem('foneBookSession')));
        let sessionAgeSeconds = Math.floor(sessionAgeMilliseconds / 1000);

        //30 Minute Time-Out (1800 seconds)
        if (sessionAgeSeconds >= 1800) {
            this.terminateSession();
            window.location = '/';
        }
        else {
            this.extendSession();
        }
    }

    extendSession() {
        sessionStorage.setItem('foneBookSession', new Date().toString());
    }

    terminateSession() {
        sessionStorage.setItem('foneBookSession', null);
    }
}