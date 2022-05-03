import type { Layout, Widgets } from "../state";
import { carouselWidgets, layout, widgets } from "../state";
import {compactWidget, deepCopyWidgets} from "../utils/utils";

import { useCallback } from "react";
import { useSnapshot } from "valtio";

interface TUseRemoveWidgetReturn {
  removeWidget:(name:string)=>void;
  widgetsSnap:Widgets;
  layoutSnap:Layout
}
/**
 *  hook help to remove widget from global state
 * */
export function useRemoveWidget(): TUseRemoveWidgetReturn{
  const widgetsSnap = useSnapshot(widgets);
  const layoutSnap = useSnapshot(layout);
  const removeWidget = useCallback((name:string)=>{
    const dragItemIndex = widgetsSnap.findIndex(
    (widget) => widget.name === name);
    const { width, height, children } = widgetsSnap[dragItemIndex];
    carouselWidgets.push({ name, width, height, children });
    const copyWidget = deepCopyWidgets(widgetsSnap);
    // remove 1 element at dragItemIndex from copyWidget, mutating it.
    copyWidget.splice(dragItemIndex, 1);
    // mutating widgets directly to trigger state update in valtio state.
    widgets.splice(
      0,
      widgets.length,
      ...compactWidget(copyWidget, layoutSnap.columns));},[layoutSnap,widgetsSnap]);

  return {removeWidget,
        widgetsSnap,
        layoutSnap
      }
  }
