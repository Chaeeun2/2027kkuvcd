import { Component } from "react";

/* 화면 하나가 렌더링 중에 깨져도 빈 화면 대신 안내를 띄우고, 다른 메뉴로 가면 다시 그린다. */
class AdminErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(previousProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="admin-screen-message admin-error">
        <p>화면을 그리는 중 오류가 발생했습니다: {this.state.error.message}</p>
        <button className="admin-button" onClick={() => window.location.reload()} type="button">
          새로고침
        </button>
      </div>
    );
  }
}

export default AdminErrorBoundary;
