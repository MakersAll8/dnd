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
    const [, drag, preview] = useDrag(() => ({
      type: ItemTypes.WIDGET_THUMBNAIL,
      item: { name, width, height, children },
    }));
    // hide default preview provided by DOM dnd api
    useEffect(() => {
      preview(getEmptyImage(), { captureDraggingState: true });
    }, [preview]);
    return (
      <div
        ref={(node) => drag(node)}
        style={{ width: "200px", border: "1px solid black", cursor: "move" }}
      >
        {name}
      </div>
    );
  }
);
