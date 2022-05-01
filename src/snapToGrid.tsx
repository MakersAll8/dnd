import { MediaColumnIndex, MediaColumns } from "./hooks/useMediaQuery";

import { HEIGHT_COEFFICIENT } from "./state";

export interface SnapToGridProps {
  x: number;
  y: number;
  columns: MediaColumns;
  containerWidth: number;
  itemWidth: MediaColumns;
}

export function snapToGrid({
  x,
  y,
  columns,
  containerWidth,
  itemWidth,
}: SnapToGridProps): [MediaColumnIndex, number] {
  let snappedX;
  const columnPixelWidth = Math.floor(containerWidth / columns);
  switch (columns) {
    case 1:
      snappedX = 0;
      break;
    case 2:
      snappedX = x < columnPixelWidth ? 0 : columnPixelWidth;
      break;
    case 3:
      const columnOneEnd = Math.round(containerWidth / columns);
      const columnTwoEnd = 2 * columnOneEnd;
      snappedX =
        x < columnOneEnd ? 0 : x < columnTwoEnd ? columnOneEnd : columnTwoEnd;
      break;
    default:
      snappedX = 0;
  }

  const snappedY = Math.floor(y / HEIGHT_COEFFICIENT);
  snappedX = Math.floor(snappedX / columnPixelWidth);

  snappedX = itemWidth + snappedX > columns ? columns - itemWidth : snappedX;

  return [snappedX as MediaColumnIndex, snappedY];
}
