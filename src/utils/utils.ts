import type { Widget, Widgets } from "../state";

import { MediaColumns } from "../hooks/useMediaQuery";

const DEBUG = false;
function log(message: string) {
  if (!DEBUG) return;
  console.log(message);
}

/**
 * Sort layout items by row ascending and column ascending.
 *
 * Does not modify Layout.
 */
export function sortLayoutItemsByRowCol(widgets: Widgets) {
  // Slice to clone array as sort modifies
  return widgets.slice(0).sort(function (w1: Widget, w2: Widget) {
    if (w1.top > w2.top || (w1.top === w2.top && w1.left > w2.left)) {
      return 1;
    } else if (w1.top === w2.top && w1.left === w2.left) {
      // Without this, we can get different sort results in IE vs. Chrome/FF
      return 0;
    }
    return -1;
  });
}
interface TCompactWidget extends Widget {
  computed?: boolean;
}

function calculateTopLayout(sortedWidgets: TCompactWidget[][]) {
  sortedWidgets.forEach((columnWidget) => {
    let initialTop = 0;
    columnWidget.forEach((item, index, array) => {
      if (index === 0 && !item.computed) {
        item.top = initialTop;
      } else if (index !== 0) {
        const requiredTop = array[index - 1].top + array[index - 1].height + 1;
        if (item.computed) item.top = Math.max(requiredTop, item.top);
        else {
          item.top = requiredTop;
        }
        item.computed = true;
      }
    });
  });
}

export function compactWidget(widgets: Widgets, columns: MediaColumns) {
  const sortedWidgets = sortLayoutItemsByRowCol(widgets);
  const columnsWidgets: Array<TCompactWidget[]> = Array.from(
    new Array(columns),
    () => []
  );
  // memory created object copy
  const widgetMap = new Map();
  sortedWidgets.forEach((widget) => {
    const columnScope = widget.left + widget.width;
    for (
      let columnIndex = widget.left;
      columnIndex < columnScope;
      columnIndex++
    ) {
      let newWidget: TCompactWidget;
      if (widgetMap.has(widget.name)) newWidget = widgetMap.get(widget.name);
      else {
        newWidget = { ...widget, computed: false };
        widgetMap.set(widget.name, newWidget);
      }
      columnsWidgets[columnIndex].push(newWidget);
    }
  });
  // TODO: need to improve the time complexity,
  // we don't want to calculate two
  // referenced pass and top has been changed in place
  calculateTopLayout(columnsWidgets);
  calculateTopLayout(columnsWidgets.reverse());
  return Array.from(new Set(columnsWidgets.flat(2)));
}

export function getSnapToPlace(PlacedWidgets: Widgets) {
  return PlacedWidgets.find((w) => w.name === "snap") || { top: 0, left: 0 };
}

export function copyWidgets(widgets: Widgets): Widgets {
  return Array.from(widgets, (item) => ({ ...item }));
}
