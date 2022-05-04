import { useRef, useState } from 'react';
import { useSnapshot } from 'valtio';
import { HEIGHT_COEFFICIENT, Widget, layout } from './state';
import type { CarrouselWidgets } from './state';
import { Carousel } from './Carousel';
import Container from './Container';
import { CustomDragLayer } from './CustomDragLayer';
import { DraggableWidget } from './DraggableWidget';
import { WidgetThumbnail } from './WidgetThumbnail';

interface WidgetBoardProps {
  widgets: Widget[];
  carouselWidgets: CarrouselWidgets[];
}

export default function WidgetBoard({
  widgets,
  carouselWidgets,
}: WidgetBoardProps): JSX.Element {
  const [edit, setEdit] = useState(false);
  const layoutSnap = useSnapshot(layout);
  const dashboardRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <button
        type="button"
        onClick={() => {
          setEdit((toggle) => !toggle);
        }}
      >
        {edit ? 'Collapse' : 'Show carousel'}
      </button>
      <Carousel edit={edit}>
        <div style={{ display: 'flex', gap: '8px', padding: '8px' }}>
          {carouselWidgets.map((widget) => {
            const {
              name, children, width, height,
            } = widget;
            return (
              <WidgetThumbnail
                key={name}
                name={name}
                width={width}
                height={height}
              >
                {children}
              </WidgetThumbnail>
            );
          })}
        </div>
      </Carousel>

      <div ref={dashboardRef} style={{ flexGrow: 1, position: 'relative' }}>
        <Container>
          {widgets.map((availableWidget) => {
            const {
              name, top, left, children, height, width,
            } = availableWidget;
            return (
              <DraggableWidget
                key={name}
                name={name}
                left={left * layoutSnap.getColumnWidth()}
                top={top * HEIGHT_COEFFICIENT}
                hideSourceOnDrag
                width={width}
                height={height}
              >
                {children}
              </DraggableWidget>
            );
          })}
        </Container>
        <CustomDragLayer dashboardRef={dashboardRef} />
      </div>
    </div>
  );
}
