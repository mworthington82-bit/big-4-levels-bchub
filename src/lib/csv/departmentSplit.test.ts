import { describe, expect, test } from "bun:test";
import { applyCleaningRules } from "./clean";
import type { RawRow } from "./types";

describe("department split", () => {
  for (const department of ["Professional services", "CPS"]) {
    test(`accepts ${department} without changing assessment scores`, () => {
      const input: RawRow = {
        name: "Example Staff", email: "example@bradfordcollege.ac.uk", department,
        teams_score: "2", forms_score: "4", canva_score: "1",
        edpuzzle_score: "4", copilot_score: "2", xr_score: "0",
      };
      const result = applyCleaningRules([input]);
      expect(result.rows).toEqual([{ ...input, teams_score: 2, forms_score: 4,
        canva_score: 1, edpuzzle_score: 4, copilot_score: 2, xr_score: 0 }]);
      expect(result.warnings).toEqual([]);
    });
  }
});