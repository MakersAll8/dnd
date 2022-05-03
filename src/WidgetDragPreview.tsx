import { CSSProperties, FC, memo } from 'react';
import { useSnapshot } from 'valtio';
import { HEIGHT_COEFFICIENT, layout } from './state';

import { MediaColumns } from './hooks/useMediaQuery';
import { Widget } from './Widget';

export interface WidgetDragPreviewProps {
  name: string;
  children?: () => JSX.Element;
  height: number;
  width: MediaColumns;
}

export const WidgetDragPreview: FC<WidgetDragPreviewProps> = memo(
  (props) => {
    const layoutSnap = useSnapshot(layout);
    const columnWidth = layoutSnap.getColumnWidth();
    const {
      name, children, height, width,
    } = props;
    const styles: CSSProperties = {
      display: 'inline-block',
      height: height * HEIGHT_COEFFICIENT,
      width: Math.min(layoutSnap.columns, width) * columnWidth,
    };

    return (
      <div style={styles}>
        <Widget name={name} preview>
          {children}
        </Widget>
      </div>
    );
  },
);
