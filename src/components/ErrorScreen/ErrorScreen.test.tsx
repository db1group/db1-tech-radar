import { render, screen } from "@testing-library/react";

import ErrorScreen from "./ErrorScreen";

describe("ErrorScreen", () => {
  it("should render the title, the description and every problem", () => {
    const problems = [
      'Quadrant slug "tools" is declared in quadrants but missing from quadrantsMap.',
      "chartConfig.ringsAttributes radius must strictly increase.",
    ];

    render(
      <ErrorScreen
        title="Invalid configuration"
        description="Fix public/config.json."
        problems={problems}
      />
    );

    expect(screen.getByText("Invalid configuration")).toBeInTheDocument();
    expect(screen.getByText("Fix public/config.json.")).toBeInTheDocument();
    problems.forEach((problem) => {
      expect(screen.getByText(problem)).toBeInTheDocument();
    });
  });

  it("should render no list when there are no problems", () => {
    render(
      <ErrorScreen
        title="Could not load the radar"
        description="public/config.json could not be downloaded."
      />
    );

    expect(screen.getByText("Could not load the radar")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
