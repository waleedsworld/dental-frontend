import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Activity } from "lucide-react";
import { DashboardCard } from "@/components/DashboardCard";

describe("DashboardCard", () => {
  it("renders the title", () => {
    render(<DashboardCard title="Engagement" />);
    expect(screen.getByText("Engagement")).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    render(<DashboardCard title="Engagement" description="Last 7 days" />);
    expect(screen.getByText("Last 7 days")).toBeInTheDocument();
  });

  it("omits the description node when none is given", () => {
    render(<DashboardCard title="Engagement" />);
    expect(screen.queryByText("Last 7 days")).not.toBeInTheDocument();
  });

  it("renders children inside the card body", () => {
    render(
      <DashboardCard title="Engagement">
        <p>Chart goes here</p>
      </DashboardCard>,
    );
    expect(screen.getByText("Chart goes here")).toBeInTheDocument();
  });

  it("renders an icon when supplied", () => {
    const { container } = render(<DashboardCard title="Engagement" icon={Activity} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("forwards a custom class name to the card", () => {
    const { container } = render(<DashboardCard title="Engagement" className="col-span-2" />);
    expect(container.firstChild).toHaveClass("col-span-2");
  });
});
