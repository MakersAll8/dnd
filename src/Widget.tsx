import React, { CSSProperties, FC, memo, ReactNode } from "react";

export interface WidgetProps {
  children?: ReactNode;
  preview?: boolean;
  name: string;
  highlight?: boolean;
}

export const Widget: FC<WidgetProps> = memo(function Widget({
  name,
  children,
  preview,
  highlight
}) {
  const Component = children;
  const styles: CSSProperties = {
    padding: "0.5rem 1rem",
    cursor: "move",
    overflow: "auto",
    backgroundColor: highlight ? "yellow" : "lightyellow",
    height: "100%",
    borderRadius: "8px"
  };
  return (
    <div style={{ ...styles }} role={preview ? "WidgetPreview" : "Widget"}>
      {Component ? <Component /> : name}
    </div>
  );
});
