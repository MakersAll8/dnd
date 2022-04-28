import { CSSProperties, FC, memo } from "react";
import { HEIGHT_COEFFICIENT, layout } from "./state";

import { Widget } from "./Widget";
import { useSnapshot } from "valtio";

export interface WidgetDragPreviewProps {
  name: string;
  children?: () => JSX.Element;
  shadowPosition: { left: number; top: number };
  height: number;
  width: number;
}

export const WidgetDragPreview: FC<WidgetDragPreviewProps> = memo(
  function WidgetDragPreview(props) {
    const layoutSnap = useSnapshot(layout);
    const columnWidth = layoutSnap.getColumnWidth();
    const { name, children, height, width } = props;
    const styles: CSSProperties = {
      display: "inline-block",
      height: height * HEIGHT_COEFFICIENT,
      width: Math.min(layoutSnap.columns, width) * columnWidth,
    };

    return (
      <>
        <div style={styles}>
          <Widget name={name} preview>
            {children}
          </Widget>
        </div>
      </>
    );
  }
);
