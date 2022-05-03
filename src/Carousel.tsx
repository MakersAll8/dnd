import { CSSProperties, useRef } from 'react';
import type { ReactNode } from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes } from './ItemTypes';
import { useRemoveWidget } from './hooks/useRemoveWidget';

interface ContainerProps {
  children: ReactNode;
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
  const { removeWidget, widgetsSnap } = useRemoveWidget();

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ItemTypes.WIDGET,
      drop(item: DragWidget, monitor) {
        removeWidget(item.name);
      },
      collect(monitor) {
        return { isOver: !!monitor.isOver(), canDrop: !!monitor.canDrop() };
      },
    }),
    [widgetsSnap, removeWidget],
  );

  const styles: CSSProperties = {
    height: '100%',
    width: '100%',
    backgroundColor: isOver ? 'darkkhaki' : canDrop ? 'darkgreen' : 'lightblue',
    position: 'relative',
  };
  return (
    <div
      ref={containerRef}
      style={{ height: edit ? '150px' : '0px', transition: 'height 0.5s' }}
    >
      <div ref={drop} style={{ ...styles }}>
        {children}
      </div>
    </div>
  );
}
