import { CSSProperties, ReactNode, useLayoutEffect, useRef } from "react";
import { MediaColumnIndex, MediaColumns } from "./hooks/useMediaQuery";
import { Widget, carouselWidgets, layout, widgets } from "./state";
import { compactWidget, copyWidgets } from "./utils/utils";

import { ItemTypes } from "./ItemTypes";
import type { Widgets } from "./state";
import type { XYCoord } from "react-dnd";
import { snapToGrid as doSnapToGrid } from "./snapToGrid";
import { useDrop } from "react-dnd";
import { useSnapshot } from "valtio";

interface ContainerProps {
  children?: ReactNode;
  title: string;
  snapToGrid?: boolean;
}

interface DragWidget {
  type: string;
  name: string;
  top?: number;
  left?: number;
  width: MediaColumns;
  height: number;
}

export default function Container({
  children,
  title,
  snapToGrid,
}: ContainerProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetSnap = useSnapshot(widgets);
  const thumbnailSnap = useSnapshot(carouselWidgets);
  const layoutSnap = useSnapshot(layout);
  const dropRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const updateContainerWidth = () => {
      if (!containerRef.current) {
        return;
      }
      layout.dropTargetWidth = containerRef.current.clientWidth;
    };
    const ro = new ResizeObserver(updateContainerWidth);
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    return () => {
      ro.disconnect();
    };
  }, []);

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: [ItemTypes.WIDGET, ItemTypes.WIDGET_THUMBNAIL],
      drop(item: DragWidget, monitor): void {
        const containerOffsetTop = (
          containerRef.current?.parentNode as HTMLDivElement
        )?.offsetTop;

        const { x, y } = monitor.getSourceClientOffset() as XYCoord;
        let left = x;
        let top = y - containerOffsetTop + (window.scrollY + 0);
        // console.log("Container triggers snapToGrid()");
        const [snappedX, snappedY] = doSnapToGrid({
          x: left,
          y: top,
          columns: layoutSnap.columns,
          containerWidth: layoutSnap.dropTargetWidth,
          itemWidth: item.width,
        });
        const itemType = monitor.getItemType();
        let moveWidgets: Widget[] = [];
        if (itemType === ItemTypes.WIDGET) {
          const moveWidgets = copyWidgets(widgetSnap);
          const index = moveWidgets.findIndex(
            (widget) => widget.name === item.name
          );
          moveWidgets[index].top = snappedY;
          moveWidgets[index].left = snappedX;
        }

        if (itemType === ItemTypes.WIDGET_THUMBNAIL) {
          const index = thumbnailSnap.findIndex(
            (widget) => widget.name === item.name
          );
          const [carouselWidget] = carouselWidgets.splice(index, 1);
          const cW = { ...carouselWidget, top: snappedY, left: snappedX };
          moveWidgets = [
            ...Array.from(widgetSnap, (item) => ({ ...item })),
            cW,
          ];
        }
        widgets.splice(
          0,
          widgetSnap.length,
          ...compactWidget(moveWidgets, layoutSnap.columns)
        );
      },
      collect(monitor) {
        return { isOver: !!monitor.isOver(), canDrop: !!monitor.canDrop() };
      },
    }),
    [widgetSnap, thumbnailSnap, layoutSnap]
  );

  const styles: CSSProperties = {
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 1)",
    position: "relative",
    border: "1px solid red",
    overflow: "auto",
  };
  drop(dropRef);
  return (
    <div ref={containerRef} style={{ height: "100%" }}>
      <div ref={dropRef} style={{ ...styles }}>
        {children}
      </div>
    </div>
  );
}
