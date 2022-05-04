import './styles.css';
import { useLayoutEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { useSnapshot } from 'valtio';
import { carrouselWidgets, layout, widgets } from './state';

import WidgetBoard from './WidgetBoard';
import { isTouchScreen } from './detectScreen';
import { useDropTargetColumns } from './hooks/useMediaQuery';

const touchScreen = isTouchScreen();

export default function App() {
  const widgetsSnap = useSnapshot(widgets);
  const carouselSnap = useSnapshot(carrouselWidgets);
  const { columns } = useDropTargetColumns();
  useLayoutEffect(() => {
    layout.columns = columns;
  }, [columns]);

  return (
    <DndProvider backend={touchScreen ? TouchBackend : HTML5Backend}>
      <WidgetBoard widgets={widgetsSnap} carouselWidgets={carouselSnap} />
    </DndProvider>
  );
}
