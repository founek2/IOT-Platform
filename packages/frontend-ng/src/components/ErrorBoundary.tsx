import { logger } from 'framework-ui/src/logger';
import React from 'react';
/* global umami */

interface ErrorBoundaryProps {
    onError?: () => void;
    actionText?: string;
    children: React.ReactNode;
}
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true };

        // Update state so the next render will show the fallback UI.
        // if (process.env.NODE_ENV === 'production') return { hasError: true };
        // else return { hasError: false };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        // Display fallback UI
        if (process.env.NODE_ENV === 'production') {
            // this.setState({ hasError: true });
            logger.error(error, info);
            // @ts-ignore
            if (typeof umami != 'undefined')
                // @ts-ignore
                umami.trackEvent(JSON.stringify(info), error.message);
        }
    }

    render() {
        if (this.state.hasError) {
            // if (this.props.onError)

            // You can render any custom fallback UI
            return (
                <div className="utils--center">
                    <h1>Nastala chyba při vytváření rozhraní.</h1>
                    <br />
                    <a className="pure-material-button-contained" onClick={() => document.location.reload()}>
                        Restartovat rozhraní
                    </a>
                    <br />
                    <br />
                    {this.props.onError && (
                        <a
                            className="pure-material-button-contained"
                            style={{ backgroundColor: '#ff1744' }}
                            onClick={this.props.onError}
                        >
                            {this.props.actionText}
                        </a>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}