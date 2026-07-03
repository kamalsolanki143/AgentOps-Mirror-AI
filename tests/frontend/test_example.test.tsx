import { render, screen } from "@testing-library/react";
import DashboardPage from "../../frontend/app/dashboard/page";

describe("Dashboard", () => {
  it("renders the dashboard title", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Dashboard")).toBeTruthy();
  });
});
