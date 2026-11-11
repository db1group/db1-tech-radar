import fs from "fs";
import path from "path";

const stylesheet = fs.readFileSync(
  path.join(__dirname, "radar-grid.scss"),
  "utf8"
);

const slots = [1, 2, 3, 4, 5, 6];

const countsWithOwnCase = [1, 2, 3, 5, 6];

describe("radar-grid.scss", () => {
  it.each(slots)("should declare a place for the block on slot %i", (slot) => {
    expect(stylesheet).toContain(`.quadrant-label--slot-${slot}`);
  });

  it.each(countsWithOwnCase)(
    "should declare a case for a taxonomy of %i quadrants",
    (count) => {
      expect(stylesheet).toContain(`[data-quadrants="${count}"]`);
    }
  );

  it("should leave the taxonomy of four quadrants to the base rules", () => {
    expect(stylesheet).not.toContain('[data-quadrants="4"]');
  });
});
