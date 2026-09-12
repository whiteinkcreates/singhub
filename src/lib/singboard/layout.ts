export type SingBoardPlacement = {
  x: number;
  y: number;
  rotation: number;
};

export type SingBoardSlot = SingBoardPlacement & {
  id: string;
  width: number;
  height: number;
};

export const SINGBOARD_SLOTS: SingBoardSlot[] = [
  { id: "A1", x: 29, y: 20, width: 22, height: 25, rotation: -2 },
  { id: "A2", x: 53, y: 20, width: 22, height: 25, rotation: 2 },
  { id: "B1", x: 3, y: 47, width: 22, height: 25, rotation: -2 },
  { id: "B2", x: 27, y: 48, width: 22, height: 25, rotation: 1 },
  { id: "B3", x: 51, y: 48, width: 22, height: 25, rotation: -1 },
  { id: "B4", x: 75, y: 40, width: 22, height: 25, rotation: 2 },
  { id: "C1", x: 3, y: 73, width: 22, height: 25, rotation: 1 },
  { id: "C2", x: 76, y: 70, width: 22, height: 25, rotation: -2 },
];

type BoardRect = { x: number; y: number; width: number; height: number };

function overlapRatio(a: BoardRect, b: BoardRect) {
  const left = Math.max(a.x, b.x);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const top = Math.max(a.y, b.y);
  const bottom = Math.min(a.y + a.height, b.y + b.height);

  if (right <= left || bottom <= top) return 0;
  return ((right - left) * (bottom - top)) / (a.width * a.height);
}

export function findSingBoardSlot(placement: SingBoardPlacement) {
  return SINGBOARD_SLOTS.find(
    (slot) =>
      Math.abs(slot.x - placement.x) < 0.01 &&
      Math.abs(slot.y - placement.y) < 0.01 &&
      Math.abs(slot.rotation - placement.rotation) < 0.01,
  );
}

export function isSingBoardSlotOccupied(
  slot: SingBoardSlot,
  posts: Array<{ x: number; y: number }>,
) {
  return posts.some((post) =>
    overlapRatio(slot, { x: post.x, y: post.y, width: 24, height: 27 }) > 0.2,
  );
}
