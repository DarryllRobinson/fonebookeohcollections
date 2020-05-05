import React from 'react';
import { MDBNotification } from 'mdbreact';

const Notification = (props) => {
    //Type, Message
    let localProps = props;
    let notificationProps = {
        icon: '',
        title: '',
        message: localProps.message,
        color: ''
    };

    switch (props.type) {
        case 'success':
            notificationProps.icon = 'check-circle'
            notificationProps.title = 'Success'
            notificationProps.color = 'green accent-2 text-elegant-color'
            break;

        case 'error':
            notificationProps.icon = 'exclamation-circle'
            notificationProps.title = 'Failure'
            notificationProps.color = 'red accent-2 text-elegant-color'
            break;

        default:
            break;
    }


    return (
        <MDBNotification
            autohide={3000}
            show
            fade
            icon={notificationProps.icon}
            iconClassName="text-elegant-color"
            title={notificationProps.title}
            titleClassName={[notificationProps.color, notificationProps.textColor]}
            message={notificationProps.message}
            text=""
            className="float-right mr-4"
            style={{
                position: "fixed",
                top: "10%",
                right: "10px",
                zIndex: 9999,
                width: 500
            }}
        />
    );
}
export default Notification;