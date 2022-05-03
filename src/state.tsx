import { proxy } from 'valtio';
import { MediaColumnIndex, MediaColumns } from './hooks/useMediaQuery';
import { WeatherApp } from './WeatherApp';

export const HEIGHT_COEFFICIENT = 17;
export interface CarouselWidget {
  name: string;
  children?: () => JSX.Element;
  height: number;
  width: MediaColumns;
}
export interface Widget extends CarouselWidget {
  left: MediaColumnIndex;
  top: number;
  moved?: boolean;
  isDragging?: boolean;
}

export type Widgets = Widget[];

export interface Layout {
  dropTargetWidth: number;
  columns: MediaColumns;
  getColumnWidth: () => number;
}

export interface Placeholder {
  name: string;
  left: number;
  top: number;
  height: number;
  width: MediaColumns | 0;
  isPlaceholder: true;
}

export const carouselWidgets = proxy<CarouselWidget[]>([
  {
    name: 'sick bay students widget',
    width: 1,
    height: 15,
  },
  {
    name: 'favorite pages',
    width: 1,
    height: 25,
  },
  {
    name: 'birthday today',
    width: 1,
    height: 10,
  },
]);

export const widgets = proxy<Widgets>([
  {
    name: 'weather widget',
    left: 0,
    top: 0,
    width: 2,
    height: 15,
    children: () => <WeatherApp />,
  },
  {
    name: 'to do list widget',
    left: 1,
    top: 16,
    width: 1,
    height: 30,
  },
]);

export const layout: Layout = proxy<Layout>({
  dropTargetWidth: 0,
  columns: 1,
  getColumnWidth() {
    return this.dropTargetWidth / this.columns;
  },
});
