import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Section render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div className="min-h-[100px]" />;
    }
    return this.props.children;
  }
}

export default SectionErrorBoundary;
