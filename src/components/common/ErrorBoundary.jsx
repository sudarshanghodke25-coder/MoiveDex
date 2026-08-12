/**
 * components/common/ErrorBoundary.jsx
 * React class-based error boundary — catches render-time errors in children.
 * Use as a wrapper around any component that may throw.
 */

import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback(this.state.error);
      return (
        <div style={{
          padding: '2rem',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '12px',
          color: '#ef4444',
          fontSize: '0.9rem',
        }}>
          <strong>Something went wrong in this section.</strong>
          <br />
          {this.state.error?.message}
        </div>
      );
    }
    return this.props.children;
  }
}
