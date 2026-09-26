import { logger } from 'common/logger';
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
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        if (process.env.NODE_ENV !== 'production') return

        // log the error 
        logger.error(error, info);
        // @ts-ignore
        if (typeof umami != 'undefined' && "track" in umami) {
            try {
                // @ts-ignore
                umami.track(error.name, { ...error, componentStack: info.componentStack });
            } catch (err) {
                logger.error(err)
            }
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
