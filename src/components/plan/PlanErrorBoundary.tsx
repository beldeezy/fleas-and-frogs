// src/components/plan/PlanErrorBoundary.tsx
"use client";

import React from "react";

type PlanErrorBoundaryProps = {
  children: React.ReactNode;
};

type PlanErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class PlanErrorBoundary extends React.Component<
  PlanErrorBoundaryProps,
  PlanErrorBoundaryState
> {
  constructor(props: PlanErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): PlanErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[PlanErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="ff-error-panel">
          <h2>Something went wrong in the planner.</h2>
          <p className="ff-muted">
            Here&apos;s the error message. Copy this into ChatGPT so we can fix
            it.
          </p>
          {this.state.error && (
            <pre className="ff-error-panel-message">
              {this.state.error.name}: {this.state.error.message}
            </pre>
          )}
          <button
            type="button"
            className="ff-button"
            onClick={this.handleReset}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
