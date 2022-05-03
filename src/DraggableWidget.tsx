import { CSSProperties, FC, memo, useCallback, useEffect, useRef } from "react";

import { HEIGHT_COEFFICIENT } from "./state";
import { ItemTypes } from "./ItemTypes";
import { MediaColumns } from "./hooks/useMediaQuery";
import { Widget } from "./Widget";
import { getEmptyImage } from "react-dnd-html5-backend";
import styles from "./DraggableWidget.module.css";
import { useDrag } from "react-dnd";
import { useRemoveWidget } from "./hooks/useRemoveWidget";

export interface DraggableWidgetProps {
  name: string;
  width: MediaColumns;
  height: number;
  left: number;
  top: number;
  hideSourceOnDrag?: boolean;
  hidden?: boolean;
  children?: () => JSX.Element;
}

export const DraggableWidget: FC<DraggableWidgetProps> = memo(
  function DraggableWidget(props) {
    const { removeWidget, layoutSnap } = useRemoveWidget();
    const columnWidth = layoutSnap.getColumnWidth();
    function getStyles(
      left: number,
      top: number,
      isDragging: boolean,
      height: number,
      width: MediaColumns
    ): CSSProperties {
      const transform = `translate3d(${left}px, ${top}px, 0)`;
      return {
        boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
        position: "absolute",
        transform,
        WebkitTransform: transform,
        opacity: isDragging ? 0 : 1,
        height: height * HEIGHT_COEFFICIENT,
        width: Math.min(layoutSnap.columns, width) * columnWidth - 20,
        margin: "10px",
        borderRadius: "8px",
        outline: "1px solid red",
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
          children,
        },
        collect: (monitor) => ({
          isDragging: monitor.isDragging(),
        }),
      }),
      [name, left, top]
    );

    const removeWidgetAction = useCallback(() => {
      removeWidget(name);
    }, [name, removeWidget]);

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
        <button
          onClick={removeWidgetAction}
          className={styles.WidgetRemoveButton}
        >
          X
        </button>
        <Widget name={name}>{children}</Widget>
      </div>
    );
  }
);
