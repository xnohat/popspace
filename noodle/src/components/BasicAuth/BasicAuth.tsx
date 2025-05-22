import * as React from 'react';
import { RouteComponentProps } from 'react-router';

interface BasicAuthProps {
  children: React.ReactNode;
}

interface BasicAuthState {
  isAuthenticated: boolean;
}

export class BasicAuth extends React.Component<BasicAuthProps, BasicAuthState> {
  constructor(props: BasicAuthProps) {
    super(props);
    this.state = {
      isAuthenticated: false,
    };
  }

  componentDidMount() {
    this.authenticate();
  }

  authenticate = () => {
    // Get credentials from environment variables
    const expectedUsername = process.env.REACT_APP_AUTH_USER;
    const expectedPassword = process.env.REACT_APP_AUTH_PASSWORD;

    // Skip authentication if credentials are not set
    if (!expectedUsername || !expectedPassword) {
      this.setState({ isAuthenticated: true });
      return;
    }

    const username = prompt('Username:');
    const password = prompt('Password:');

    if (username === expectedUsername && password === expectedPassword) {
      this.setState({ isAuthenticated: true });
    } else {
      alert('Invalid credentials');
      this.authenticate();
    }
  };

  render() {
    if (!this.state.isAuthenticated) {
      return <div>Authenticating...</div>;
    }

    return <>{this.props.children}</>;
  }
}

export const withBasicAuth = <P extends RouteComponentProps>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return (props) => (
    <BasicAuth>
      <Component {...props} />
    </BasicAuth>
  );
};
