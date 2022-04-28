import { memo, FC, CSSProperties, useEffect, ReactNode, useRef } from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "./ItemTypes";
import { HEIGHT_COEFFICIENT, layout } from "./state";
import { Widget } from "./Widget";
import { getEmptyImage } from "react-dnd-html5-backend";
import { useSnapshot } from "valtio";

export interface DraggableWidgetProps {
  name: string;
  width: number;
  height: number;
  left: number;
  top: number;
  hideSourceOnDrag?: boolean;
  hidden?: boolean;
  children?: ReactNode;
}

export const DraggableWidget: FC<DraggableWidgetProps> = memo(
  function DraggableWidget(props) {
    const layoutSnap = useSnapshot(layout);
    const columnWidth = layoutSnap.getColumnWidth();
    function getStyles(
      left: number,
      top: number,
      isDragging: boolean,
      height: number,
      width: number
    ): CSSProperties {
      const transform = `translate3d(${left}px, ${top}px, 0)`;
      // const transform = `translate3d(${0}px, ${0}px, 0)`;
      return {
        boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
        position: "absolute",
        transform,
        WebkitTransform: transform,
        // IE fallback: hide the real node using CSS when dragging
        // because IE will ignore our custom "empty image" drag preview.
        opacity: isDragging ? 0 : 1,
        height: height * HEIGHT_COEFFICIENT,
        width: Math.min(layoutSnap.columns, width) * columnWidth,
        borderRadius: "8px"
      };
    }

    const widgetRef = useRef<HTMLDivElement>(null);
    const { name, left, top, children, height, width } = props;
    const [{ isDragging }, drag, preview] = useDrag(
      () => ({
        type: ItemTypes.WIDGET,
        item: {
          name,
          left,
          top,
          height,
          width,
          children
        },
        collect: (monitor) => ({
          isDragging: monitor.isDragging()
        })
      }),
      [name, left, top]
    );

    // hide default preview provided by DOM dnd api
    useEffect(() => {
      preview(getEmptyImage(), { captureDraggingState: true });
    }, [preview]);

    drag(widgetRef);
    return (
      <div
        ref={widgetRef}
        style={getStyles(left, top, isDragging, height, width)}
        role="DraggableBox"
      >
        <Widget name={name}>{children}</Widget>
      </div>
    );
  }
);
