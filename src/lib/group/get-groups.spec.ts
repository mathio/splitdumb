import { getGroups } from "./get-groups";
import { prismaMock } from "../../../test/prisma-mock";
describe("getGroups", () => {
  it("should return an array of groups", async () => {
    const groups: any[] = [1, 2, 3];
    prismaMock.group.findMany.mockResolvedValue(groups);
    expect(await getGroups({}, {}, { user: { id: 1 } })).toBe(groups);
  });
});
