import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import axios from 'axios';

interface BasicAuthProps {
  children: React.ReactNode;
}

interface BasicAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  apiAvailable: boolean;
}

export class BasicAuth extends React.Component<BasicAuthProps, BasicAuthState> {
  constructor(props: BasicAuthProps) {
    super(props);
    this.state = {
      isAuthenticated: false,
      isLoading: true,
      apiAvailable: true
    };
  }

  componentDidMount() {
    // Clear any existing token to force authentication
    localStorage.removeItem('auth_token');
    this.checkApiAvailability();
  }

  checkApiAvailability = async () => {
    const apiHost = process.env.REACT_APP_API_HOST;
    const apiPort = process.env.REACT_APP_API_PORT;
    
    if (!apiHost || !apiPort) {
      console.warn('API host or port not configured');
      this.setState({ apiAvailable: false, isLoading: false });
      this.authenticate();
      return;
    }

    try {
      // Use secure protocol if port is 443, otherwise use http
      const protocol = apiPort === '443' ? 'https' : 'http';
      const apiUrl = `${protocol}://${apiHost}:${apiPort}/health`;

      console.log('apiUrl', apiUrl);
      
      // Try to reach the API health endpoint
      await axios.get(apiUrl, { timeout: 3000 });
      
      // API is available, proceed with authentication
      this.setState({ apiAvailable: true, isLoading: false });
      this.authenticate();
    } catch (error) {
      console.error('API not available:', error);
      this.setState({ apiAvailable: false, isLoading: false });
      this.authenticate();
    }
  };

  authenticate = async () => {
    const username = prompt('Username:');
    // If user cancels the prompt, username will be null
    if (username === null) {
      this.authenticate();
      return;
    }
    
    const password = prompt('Password:');
    // If user cancels the prompt, password will be null
    if (password === null) {
      this.authenticate();
      return;
    }

    // If API is not available, fall back to local validation
    if (!this.state.apiAvailable) {
      console.log('API for Authenticate REQUIRED');
      return;
    }

    try {
      const apiHost = process.env.REACT_APP_API_HOST;
      const apiPort = process.env.REACT_APP_API_PORT;
      const protocol = apiPort === '443' ? 'https' : 'http';
      const apiUrl = `${protocol}://${apiHost}:${apiPort}/auth/validate`;
      
      try {
        const response = await axios.post(apiUrl, { username, password }, { timeout: 5000 });
        
        if (response.data && response.data.authenticated) {
          // Store authentication token in localStorage
          localStorage.setItem('auth_token', 'authenticated');
          this.setState({ isAuthenticated: true });
        } else {
          alert('Invalid credentials');
          this.authenticate();
        }
      } catch (apiError: any) {
        // Check if this is a 401 Unauthorized response (invalid credentials)
        if (apiError.response && apiError.response.status === 401) {
          alert('Invalid credentials');
          this.authenticate();
          return;
        }
        
        // For other API errors, rethrow to be caught by the outer catch
        throw apiError;
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  render() {
    if (this.state.isLoading) {
      return <div>Loading...</div>;
    }
    
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

// HOC for non-route components that need authentication
export const withComponentAuth = <P,>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return (props) => (
    <BasicAuth>
      <Component {...props} />
    </BasicAuth>
  );
};
