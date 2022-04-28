import { ReactNode } from "react";
import { proxy } from "valtio";
import { WeatherApp } from "./WeatherApp";

export const HEIGHT_COEFFICIENT = 10;

export interface Widget {
  name: string;
  left: number;
  top: number;
  children?: ReactNode;
  height: number;
  width: number;
  moved?: boolean;
  isDragging?: boolean;
}

export type Widgets = Widget[];

export interface CarouselWidget {
  name: string;
  children?: ReactNode;
  height: number;
  width: number;
}

export interface Layout {
  dropTargetWidth: number;
  columns: number;
  getColumnWidth: () => number;
}

export interface Placeholder {
  name: string;
  left: number;
  top: number;
  height: number;
  width: number;
  isPlaceholder: true;
}

export const carouselWidgets = proxy<CarouselWidget[]>([
  {
    name: "sick bay students widget",
    width: 1,
    height: 15
  },
  {
    name: "favorite pages",
    width: 1,
    height: 25
  },
  {
    name: "birthday today",
    width: 1,
    height: 10
  }
]);

export const widgets = proxy<Widgets>([
  {
    name: "weather widget",
    left: 0,
    top: 0,
    width: 2,
    height: 15,
    children: () => <WeatherApp />
  },
  {
    name: "to do list widget",
    left: 1,
    top: 16,
    width: 1,
    height: 30
  }
]);

export const layout: Layout = proxy<Layout>({
  dropTargetWidth: 0,
  columns: 1,
  getColumnWidth() {
    return this.dropTargetWidth / this.columns;
  }
});

export const currentDraggingWidget = proxy<Placeholder>({
  isPlaceholder: true,
  name: "Placeholder",
  left: 0,
  top: 0,
  width: 0,
  height: 0
});
