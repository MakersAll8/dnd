import { CarouselWidget, HEIGHT_COEFFICIENT, Widget, layout } from "./state";
import { ReactNode, useMemo, useRef, useState } from "react";

import { Carousel } from "./Carousel";
import Container from "./Container";
import { CustomDragLayer } from "./CustomDragLayer";
import { DraggableWidget } from "./DraggableWidget";
import { WidgetThumbnail } from "./WidgetThumbnail";
import { useSnapshot } from "valtio";

interface WidgetBoardProps {
  children?: ReactNode;
  widgets: Widget[];
  carouselWidgets: CarouselWidget[];
}

export default function WidgetBoard({
  widgets,
  carouselWidgets,
}: WidgetBoardProps): JSX.Element {
  const [edit, setEdit] = useState(false);
  const layoutSnap = useSnapshot(layout);
  const dashboardRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="testPoint" />
      <div style={{ height: "100%" }}>
        <button
          onClick={() => {
            setEdit((toggle) => !toggle);
          }}
        >
          {edit ? "Collapse" : "Show carousel"}
        </button>
        {edit && (
          <Carousel>
            <div style={{ display: "flex", gap: "8px" }}>
              {carouselWidgets.map((widget) => {
                const { name, children, width, height } = widget;
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
        )}

        <div style={{ height: "100%", position: "relative" }}>
          <Container title="Widgets" snapToGrid={true}>
            {widgets.map((availableWidget) => {
              const { name, top, left, children, height, width } =
                availableWidget;
              return (
                <DraggableWidget
                  key={name}
                  name={name}
                  left={left * layoutSnap.getColumnWidth()}
                  top={top * HEIGHT_COEFFICIENT}
                  hideSourceOnDrag={true}
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
    </>
  );
}
