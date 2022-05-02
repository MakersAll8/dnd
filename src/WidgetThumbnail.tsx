import { FC, memo, useEffect } from "react";

import { ItemTypes } from "./ItemTypes";
import { MediaColumns } from "./hooks/useMediaQuery";
import { getEmptyImage } from "react-dnd-html5-backend";
import { useDrag } from "react-dnd";

export interface WidgetThumbnailProps {
  name: string;
  hideSourceOnDrag?: boolean;
  width: MediaColumns;
  height: number;
}
export const WidgetThumbnail: FC<WidgetThumbnailProps> = memo(
  function WidgetThumbnail({ name, width, height, children }) {
    const [{ isDragging }, drag, preview] = useDrag(() => ({
      type: ItemTypes.WIDGET_THUMBNAIL,
      item: { name, width, height, children },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));
    // hide default preview provided by DOM dnd api
    useEffect(() => {
      preview(getEmptyImage(), { captureDraggingState: true });
    }, [preview]);
    return (
      <div
        ref={(node) => drag(node)}
        style={{
          width: "170px",
          height: "85px",
          border: "2px solid grey",
          borderRadius: "5px",
          background: "lightblue",
          cursor: "move",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {name}
      </div>
    );
  }
);
