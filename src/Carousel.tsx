import { CSSProperties, ReactNode, useRef } from "react";
import { carouselWidgets, widgets } from "./state";
import { compactWidget, copyWidgets } from "./utils/utils";

import { ItemTypes } from "./ItemTypes";
import { useDrop } from "react-dnd";
import { useSnapshot } from "valtio";

interface ContainerProps {
  children?: ReactNode;
}

interface DragWidget {
  type: string;
  name: string;
  top: number;
  left: number;
}

export function Carousel({ children }: ContainerProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetsSnap = useSnapshot(widgets);

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ItemTypes.WIDGET,
      drop(item: DragWidget, monitor) {
        const dragItemIndex = widgetsSnap.findIndex(
          (widget) => widget.name === item.name
        );
        const { width, height, name, children } = widgetsSnap[dragItemIndex];
        carouselWidgets.push({ name, width, height, children });
        const copyWidget = copyWidgets(widgetsSnap);
        copyWidget.splice(dragItemIndex, 1);
        widgets.splice(0, widgets.length, ...compactWidget(copyWidget, 3));
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
    <div ref={containerRef} style={{ height: "150px" }}>
      <div ref={drop} style={{ ...styles }}>
        {children}
      </div>
    </div>
  );
}
