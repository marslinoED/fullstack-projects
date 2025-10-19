import './ScreenCloser.css';

const ScreenCloser = ({ transitionStep, }) => {
    let content = null;

    switch (transitionStep) {
        case 1:
            /* Closing Animation Sequence */
            content = <div className="green-flash flash-active" />;
            break;
        case 2:
            /* Powering Off Animation Sequence */
            content = <div className="crt-shutdown shutdown-active" />;
            break;
        case 3:
            /* Black Screen */
            content = <div className="black-screen" />;
            break;
        case 4:
            /* Powering On Animation Sequence */
            content = <div className="green-flash flash-active-open" />;
            break;
        case 5:
            /* Opening Animation Sequence */
            content = <div className="crt-startup startup-active" />;
            break;
        case 6:
            /* Press PWR button message */
            content = (
                <div 
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: '#00ff00',
                        fontFamily: 'Monaco, "Lucida Console", monospace',
                        fontSize: '14px',
                        textAlign: 'center',
                        textShadow: '0 0 5px #00ff00'
                    }}
                >
                    Press the PWR button to open.
                </div>
            );
            break;
        case 0:
            return null;
        default:
            break;
    }

    return <div className="screen-closer-overlay">{content}</div>;
};

export default ScreenCloser;