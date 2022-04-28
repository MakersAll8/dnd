import {
  CSSProperties,
  ReactNode,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import { carouselWidgets, layout, widgets } from "./state";
import { compactWidget, moveElement } from "./utils/utlis";

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
  width: number;
  height: number;
}

// export interface DropReturn {
//   container: string;
//   offsetTop: number | null;
//   left: number;
//   top: number;
//   currentDropZone: string;
//   widgetIndex: number;
//   clientOffset: XYCoord | null;
// }

const Container = forwardRef(
  ({ children, title, snapToGrid }: ContainerProps, ref): JSX.Element => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetSnap = useSnapshot(widgets);
    const thumbnailSnap = useSnapshot(carouselWidgets);
    const layoutSnap = useSnapshot(layout);
    const dropRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => {
      const containerOffsetTop =
        (containerRef.current?.getBoundingClientRect().top || 0) +
        window.scrollY +
        (containerRef.current?.scrollTop || 0);
      return { containerOffsetTop };
    });

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
          const containerOffsetTop =
            (containerRef.current?.getBoundingClientRect().top || 0) +
            window.scrollY +
            (containerRef.current?.scrollTop || 0);

          const { x, y } = monitor.getSourceClientOffset() as XYCoord;
          let left = x;
          let top = y - containerOffsetTop;
          if (snapToGrid) {
            // console.log("Container triggers snapToGrid()");
            [left, top] = doSnapToGrid({
              x: left,
              y: top,
              columns: layoutSnap.columns,
            });
          }
          const itemType = monitor.getItemType();
          let newWidgets: Widgets = [];
          if (itemType === ItemTypes.WIDGET) {
            const moveWidgets = Array.from(widgetSnap, (item) => ({ ...item }));
            const index = moveWidgets.findIndex(
              (widget) => widget.name === item.name
            );
            const cW = { ...moveWidgets[index], top: top - 1, left };
            moveWidgets.splice(index, 1);
            moveWidgets.push(cW);
            newWidgets = moveWidgets;
          }

          if (itemType === ItemTypes.WIDGET_THUMBNAIL) {
            const index = thumbnailSnap.findIndex(
              (widget) => widget.name === item.name
            );
            const [carouselWidget] = carouselWidgets.splice(index, 1);
            const cW = { ...carouselWidget, top, left };
            const moveWidgets = [
              ...Array.from(widgetSnap, (item) => ({ ...item })),
              cW,
            ];
            newWidgets = moveWidgets;
          }
          widgets.splice(0, widgetSnap.length, ...compactWidget(newWidgets, 3));
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
);

export default Container;
