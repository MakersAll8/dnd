import {
  CSSProperties, ReactNode, useLayoutEffect, useRef,
} from 'react';
import type { XYCoord } from 'react-dnd';
import { useDrop } from 'react-dnd';
import { useSnapshot } from 'valtio';
import {
  Widget, carrouselWidgets, layout, widgets,
} from './state';
import { compactWidget, deepCopyWidgets } from './utils/utils';

import { ItemTypes } from './ItemTypes';
import { MediaColumns } from './hooks/useMediaQuery';
import { snapToGrid as doSnapToGrid } from './snapToGrid';

interface ContainerProps {
  children: ReactNode;
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
}: ContainerProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetSnap = useSnapshot(widgets);
  const thumbnailSnap = useSnapshot(carrouselWidgets);
  const layoutSnap = useSnapshot(layout);
  const dropRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef<number>(0);

  useLayoutEffect(() => {
    const updateContainerWidth = () => {
      if (!containerRef.current) {
        return;
      }
      // ResizeObserver will trigger even width has not changed.
      if (widthRef.current === containerRef.current.clientWidth) {
        return;
      }
      layout.dropTargetWidth = containerRef.current.clientWidth;
      const compactResult = compactWidget(
        [...deepCopyWidgets(widgetSnap)],
        layoutSnap.columns,
      );
      widgets.splice(0, widgetSnap.length, ...compactResult);
      widthRef.current = containerRef.current.clientWidth;
    };
    const ro = new ResizeObserver(updateContainerWidth);
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    return () => {
      ro.disconnect();
    };
  }, [layoutSnap, widgetSnap]);

  const [, drop] = useDrop(
    () => ({
      accept: [ItemTypes.WIDGET, ItemTypes.WIDGET_THUMBNAIL],
      drop(item: DragWidget, monitor): void {
        const containerOffsetTop = (
          containerRef.current?.parentNode as HTMLDivElement
        )?.offsetTop;

        const { x, y } = monitor.getSourceClientOffset() as XYCoord;
        const left = x;
        const top = y - containerOffsetTop + (window.scrollY + 0);
        if (top < 0) return;

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
          moveWidgets = deepCopyWidgets(widgetSnap);
          const index = moveWidgets.findIndex(
            (widget) => widget.name === item.name,
          );
          moveWidgets[index].top = snappedY;
          moveWidgets[index].left = snappedX;
        }

        if (itemType === ItemTypes.WIDGET_THUMBNAIL) {
          const index = thumbnailSnap.findIndex(
            (widget) => widget.name === item.name,
          );
          const [carouselWidget] = carrouselWidgets.splice(index, 1);
          const cW = { ...carouselWidget, top: snappedY, left: snappedX };
          moveWidgets = [...deepCopyWidgets(widgetSnap), cW];
        }

        const compactResult = compactWidget(moveWidgets, layoutSnap.columns);
        widgets.splice(0, widgetSnap.length, ...compactResult);
      },
      collect(monitor) {
        return { isOver: !!monitor.isOver(), canDrop: !!monitor.canDrop() };
      },
    }),
    [widgetSnap, thumbnailSnap, layoutSnap],
  );

  const styles: CSSProperties = {
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    position: 'relative',
    border: '1px solid red',
    overflow: 'auto',
    paddingTop: '20px',
  };
  drop(dropRef);
  return (
    <div ref={containerRef} style={{ height: '100%' }}>
      <div ref={dropRef} style={{ ...styles }}>
        {children}
      </div>
    </div>
  );
}
