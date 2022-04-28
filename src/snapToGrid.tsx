import { HEIGHT_COEFFICIENT } from "./state";
import { MediaColumns } from "./hooks/useMediaQuery";
export interface SnapToGridProps {
  x: number;
  y: number;
  columns: MediaColumns;
}

export function snapToGrid({
  x,
  y,
  columns,
}: SnapToGridProps): [number, number] {
  const windowWidth = window.innerWidth;
  let snappedX;
  // !important need to fix the width unit since we should use
  //drop target's width but not windows'
  const midPoint = Math.floor(windowWidth / columns);
  switch (columns) {
    case 1:
      snappedX = 0;
      break;
    case 2:
      snappedX = x < midPoint ? 0 : midPoint;
      break;
    case 3:
      const columnOneEnd = Math.round(windowWidth / columns);
      const columnTwoEnd = 2 * columnOneEnd;
      snappedX =
        x < columnOneEnd ? 0 : x < columnTwoEnd ? columnOneEnd : columnTwoEnd;
      break;
    default:
      snappedX = 0;
  }

  const snappedY = Math.floor(y / HEIGHT_COEFFICIENT);
  snappedX = Math.floor(snappedX / midPoint);
  // console.log({ snappedX, snappedY });
  return [snappedX, snappedY];
}
