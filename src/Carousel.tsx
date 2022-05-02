import { CSSProperties, ReactNode, useRef } from "react";
import { carouselWidgets, layout, widgets } from "./state";
import { compactWidget, deepCopyWidgets } from "./utils/utils";

import { ItemTypes } from "./ItemTypes";
import { useDrop } from "react-dnd";
import { useSnapshot } from "valtio";

interface ContainerProps {
  children?: ReactNode;
  edit: boolean;
}

interface DragWidget {
  type: string;
  name: string;
  top: number;
  left: number;
}

export function Carousel({ children, edit }: ContainerProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetsSnap = useSnapshot(widgets);
  const layoutSnap = useSnapshot(layout);

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ItemTypes.WIDGET,
      drop(item: DragWidget, monitor) {
        const dragItemIndex = widgetsSnap.findIndex(
          (widget) => widget.name === item.name
        );
        const { width, height, name, children } = widgetsSnap[dragItemIndex];
        carouselWidgets.push({ name, width, height, children });
        const copyWidget = deepCopyWidgets(widgetsSnap);
        // remove 1 element at dragItemIndex from copyWidget, mutating it.
        copyWidget.splice(dragItemIndex, 1);
        // mutating widgets directly to trigger state update in valtio state.
        widgets.splice(
          0,
          widgets.length,
          ...compactWidget(copyWidget, layoutSnap.columns)
        );
      },
      collect(monitor) {
        return { isOver: !!monitor.isOver(), canDrop: !!monitor.canDrop() };
      },
    }),
    [widgetsSnap]
  );

  const styles: CSSProperties = {
    height: "100%",
    width: "100%",
    backgroundColor: isOver ? "darkkhaki" : canDrop ? "darkgreen" : "lightblue",
    position: "relative",
  };
  return (
    <div
      ref={containerRef}
      style={{ height: edit ? "150px" : "0px", transition: "height 0.5s" }}
    >
      <div ref={drop} style={{ ...styles }}>
        {children}
      </div>
    </div>
  );
}
