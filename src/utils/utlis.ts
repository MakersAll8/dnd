import type { Widget, Widgets } from "../state";

import { MediaColumns } from "../hooks/useMediaQuery";
import { off } from "process";

const DEBUG = false;
function log(message: string) {
  if (!DEBUG) return;
  console.log(message);
}
export function collides(w1: Widget, w2: Widget): boolean {
  // console.log({
  //   w1,
  //   w2
  // 1: w1.name === w2.name,
  // 2: w1.left + w1.width <= w2.left,
  // 3: w1.left >= w2.left + w2.width,
  // 4: w1.top + w1.height <= w2.top,
  // 5: w1.top >= w2.top + w2.top
  // });
  if (w1.name === w2.name) return false; // same element
  if (w1.left + w1.width <= w2.left) return false; // w1 is left of w2
  if (w1.left >= w2.left + w2.width) return false; // w1 is right of w2
  if (w1.top + w1.height <= w2.top) return false; // w1 is above w2
  if (w1.top >= w2.top + w2.height) return false; // w1 is below w2
  return true; // boxes overlap
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

export function getAllCollisions(widgets: Widgets, widget: Widget): Widgets {
  return widgets.filter((w) => collides(w, widget));
}

export function getFirstCollision(
  widgets: Widgets,
  widget: Widget
): Widget | undefined {
  for (let i = 0, len = widgets.length; i < len; i++) {
    if (collides(widgets[i], widget)) return widgets[i];
  }
  return undefined;
}

export function moveElement(
  widgets: Widgets,
  widget: Widget,
  left?: number,
  top?: number,
  isUserAction?: boolean,
  columns?: number
): Widgets {
  if (widget.top === top && widget.left === left) return widgets;
  const oldLeft = widget.left;
  const oldTop = widget.top;
  if (typeof left === "number") widget.left = left;
  if (typeof top === "number") widget.top = top;
  widget.moved = true;

  let sorted = sortLayoutItemsByRowCol(widgets);
  const movingUp = oldTop >= Number(top);
  if (movingUp) sorted = sorted.reverse();
  const collisions = getAllCollisions(sorted, widget);
  const hasCollisions = collisions.length > 0;

  if (hasCollisions) {
    widget.left = oldLeft;
    widget.top = oldTop;
    widget.moved = false;
    return widgets;
  }
  // Move each item that collides away from this element.
  for (let i = 0, len = collisions.length; i < len; i++) {
    const collision = collisions[i];

    // Short circuit so we can't infinite loop
    if (collision.moved) continue;

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    widgets = moveElementAwayFromCollision(
      widgets,
      widget,
      collision,
      isUserAction,
      columns
    );
  }
  return widgets;
}

function moveElementAwayFromCollision(
  widgets: Widgets,
  collidesWith: Widget,
  itemToMove: Widget,
  isUserAction?: boolean,
  columns?: number
): Widgets {
  if (isUserAction) {
    // Reset isUserAction flag because we're not in the main collision anymore.
    isUserAction = false;

    // Make a mock item so we don't modify the item here, only modify in moveElement.
    const fakeItem: Widget = {
      left: itemToMove.left,
      top: Math.max(collidesWith.top - itemToMove.height, 0),
      width: itemToMove.width,
      height: itemToMove.height,
      name: "-1"
    };

    // No collision? If so, we can go up there; otherwise, we'll end up moving down as normal
    if (!getFirstCollision(widgets, fakeItem)) {
      return moveElement(
        widgets,
        itemToMove,
        undefined,
        fakeItem.top,
        isUserAction,
        columns
      );
    }
  }

  return moveElement(
    widgets,
    itemToMove,
    undefined,
    itemToMove.top + 1,
    isUserAction,
    columns
  );
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

function calculateTopDistance(widgets: Widgets, columns: number){
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
      let newWidget;
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
  columnsWidgets.reverse();
  calculateTopLayout(columnsWidgets);
  return Array.from(new Set(columnsWidgets.flat(2)));
}

export function compactWidget(widgets: Widgets, columns: number) {
  if(columns===3)
    return calculateTopDistance(widgets, columns);
  else if(columns===2){
    return sortInTwoColumn(widgets);
  }else{
    return sortInOneColumn(widgets);
  }
}

export function getSnapToPlace(PlacedWidgets: Widgets) {
  return PlacedWidgets.find((w) => w.name === "snap") || { top: 0, left: 0 };
}

export function copyWidgets(widgets:Widgets):Widgets{
  return Array.from(widgets,item=>({...item}));
}

export function isOverFlow(left:number,width:number,columnsNumber:number):boolean{
  return left+width>columnsNumber;
}

export function truncateWidget(widget: Widget, columns: number) {
    widget.width = columns - widget.left as MediaColumns;
}

export function sortInOneColumn(widgets:Widgets){
  widgets.forEach(
    widget=>{
      widget.left=0
    }
  );
  const sortedWidgets = sortLayoutItemsByRowCol(widgets);
  const layoutWidgets = calculateTopDistance(sortedWidgets,1);
  return layoutWidgets;
}

export function sortInTwoColumn(widgets:Widgets){
  widgets.forEach(
    widget=>{
      if(widget.left===3){
        widget.left=0
      }
      if(isOverFlow(widget.left,widget.width,2)){
        truncateWidget(widget,2);
      }
    }
  );
  const sortedWidgets = sortLayoutItemsByRowCol(widgets);
  const layoutWidgets = calculateTopDistance(sortedWidgets,2);
  return layoutWidgets;
}