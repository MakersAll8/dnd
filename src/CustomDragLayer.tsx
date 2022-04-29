import { CSSProperties, FC, RefObject, useMemo, useRef } from "react";
import {
  CarouselWidget,
  HEIGHT_COEFFICIENT,
  Widget,
  currentDraggingWidget,
  layout,
  widgets,
} from "./state";
import { compactWidget, copyWidgets, getSnapToPlace } from "./utils/utlis";

import { ItemTypes } from "./ItemTypes";
import { MediaColumns } from "./hooks/useMediaQuery";
import { WidgetDragPreview } from "./WidgetDragPreview";
import { WidgetThumbnail } from "./WidgetThumbnail";
import type { XYCoord } from "react-dnd";
import { snapToGrid } from "./snapToGrid";
import { useDragLayer } from "react-dnd";
import { useSnapshot } from "valtio";

const layerStyles: CSSProperties = {
  // position: "fixed",
  position: "absolute",
  pointerEvents: "none",
  zIndex: 100,
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
};

export interface CustomDragLayerProps {
  snapToGrid?: boolean;
  dashboardRef: RefObject<HTMLDivElement>;
}

// drag layer draws over drop target and return a custom drag preview to
// replace default drag preview provided by DOM dnd api.
export const CustomDragLayer: FC<CustomDragLayerProps> = ({
  dashboardRef,
  snapToGrid: snapToGridProp,
}) => {
  function getItemStyles(
    initialOffset: XYCoord | null,
    currentOffset: XYCoord | null,
    isSnapToGrid: boolean,
    columns: number
  ) {
    if (!initialOffset || !currentOffset) {
      return {
        display: "none",
      };
    }

    let { x, y } = currentOffset;

    // if (isSnapToGrid) {
    //   console.log(
    //     "CustomDragLayer.getItemStyles triggers snapToGrid() for final drop position"
    //   );
    //   [x, y] = snapToGrid({ x, y, columns });
    // }

    const transform = `translate(${x}px, ${
      y - (dashboardRef.current?.offsetTop || 0) + (window.scrollY || 0)
    }px)`;
    return {
      transform,
      WebkitTransform: transform,
      zIndex: 999,
    };
  }

  const { itemType, isDragging, item, initialOffset, currentOffset } =
    useDragLayer((monitor) => ({
      item: monitor.getItem() as Widget | CarouselWidget,
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    }));
  const currentDraggingItemName = useRef({ name: "", left: 0, top: 0 });

  const layoutSnap = useSnapshot(layout);
  const widgetsSnap = useSnapshot(widgets);
  const columnWidth = layoutSnap.getColumnWidth();
  // initialOffset and currentOffset are relative to the entire document flow
  const [left, top] = snapToGrid({
    x: currentOffset?.x || 0,
    y:
      currentOffset?.y ||
      0 - (dashboardRef.current?.offsetTop || 0) + (window.scrollY || 0),
    columns: layoutSnap.columns,
  });

  function renderItem() {
    switch (itemType) {
      case ItemTypes.WIDGET:
        return (
          <WidgetDragPreview {...item} shadowPosition={{ left, top }}>
            {item.children}
          </WidgetDragPreview>
        );
      case ItemTypes.WIDGET_THUMBNAIL:
        return <WidgetThumbnail {...item}>{item.children}</WidgetThumbnail>;
      default:
        return null;
    }
  }

  if (!isDragging) {
    return null;
  }

  const _snapWidgetDim = {
    name: "snap",
    left: left,
    top: top,
    height: item.height,
    width: Math.min(layoutSnap.columns, item.width) as MediaColumns,
  };

  // we need to calculate the right place position of the snap
  let newWidgetsSnap = copyWidgets(widgetsSnap);
  const oldWidget = newWidgetsSnap.find((_item) => _item.name === item.name);
  newWidgetsSnap = newWidgetsSnap.filter((_item) => _item.name !== item.name);
  newWidgetsSnap.push(_snapWidgetDim);
  newWidgetsSnap = compactWidget(newWidgetsSnap, 3);
  const { left: _left, top: _top } = getSnapToPlace(newWidgetsSnap);
  const { name, left: oldLeft, top: oldTop } = currentDraggingItemName.current;
  if (
    (name !== item.name || oldLeft !== _left || oldTop !== _top)
  ) {
    const newWidgetList = newWidgetsSnap.filter((i) => i.name !== "snap");
    if(oldWidget){newWidgetList.push(oldWidget)}
    currentDraggingItemName.current = {
      name: item.name,
      left: _left,
      top: _top,
    };
    widgets.splice(0, widgets.length, ...newWidgetList);
  }

  const isCollision = false;
  const snapWidgetDim = {
    name: "snap",
    left: _left * layoutSnap.getColumnWidth(),
    top: _top * HEIGHT_COEFFICIENT,
    height: item.height * HEIGHT_COEFFICIENT,
    width: Math.min(layoutSnap.columns, item.width) * columnWidth,
  };
  return (
    <>
      <div style={layerStyles}>
        {!isCollision && left >= 0 && top >= 0 && (
          <div
            style={{
              backgroundColor: "gray",
              position: "absolute",
              ...snapWidgetDim,
            }}
          >
            snap to
          </div>
        )}
        <div
          style={getItemStyles(
            initialOffset,
            currentOffset,
            snapToGridProp || false,
            layout.columns
          )}
        >
          {renderItem()}
        </div>
      </div>
    </>
  );
};
