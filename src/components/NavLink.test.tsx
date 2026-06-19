import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NavLink } from "@/components/NavLink";

function renderAt(path: string, ui: React.ReactNode) {
  return render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);
}

describe("NavLink", () => {
  it("renders an anchor pointing at the target route", () => {
    renderAt("/", <NavLink to="/topics">Topics</NavLink>);
    const link = screen.getByRole("link", { name: "Topics" });
    expect(link).toHaveAttribute("href", "/topics");
  });

  it("applies the base class name", () => {
    renderAt("/", <NavLink to="/topics" className="nav-item">Topics</NavLink>);
    expect(screen.getByRole("link", { name: "Topics" })).toHaveClass("nav-item");
  });

  it("adds the active class only on the matching route", () => {
    renderAt(
      "/topics",
      <NavLink to="/topics" className="nav-item" activeClassName="is-active">
        Topics
      </NavLink>,
    );
    expect(screen.getByRole("link", { name: "Topics" })).toHaveClass("is-active");
  });

  it("omits the active class on a non-matching route", () => {
    renderAt(
      "/analytics",
      <NavLink to="/topics" className="nav-item" activeClassName="is-active">
        Topics
      </NavLink>,
    );
    expect(screen.getByRole("link", { name: "Topics" })).not.toHaveClass("is-active");
  });
});
