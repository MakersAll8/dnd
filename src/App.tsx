import "./styles.css";
import WidgetBoard from "./WidgetBoard";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { useSnapshot } from "valtio";
import { widgets, carouselWidgets, layout } from "./state";
import { isTouchScreen } from "./detectScreen";
import { useDropTargetColumns } from "./hooks/useMediaQuery";
import { useLayoutEffect } from "react";

const touchScreen = isTouchScreen();

export default function App() {
  const widgetsSnap = useSnapshot(widgets);
  const carouselSnap = useSnapshot(carouselWidgets);
  const { columns } = useDropTargetColumns();
  useLayoutEffect(() => {
    layout.columns = columns;
  }, [columns]);

  return (
    <>
      <DndProvider backend={touchScreen ? TouchBackend : HTML5Backend}>
        <WidgetBoard widgets={widgetsSnap} carouselWidgets={carouselSnap} />
      </DndProvider>
    </>
  );
}
