import type { Widget, Widgets } from '../../state';
import {
  calculateTopDistance, deepCopyWidgets, isOverFlow,
  sortInOneColumn, sortInTwoColumn, sortLayoutItemsByRowCol,
} from '../utils';

function getWidgetAccordingToName(widgets:Widgets, name:string):Widget|undefined {
  const namedWidget = widgets.find((widget) => widget.name === name);
  return namedWidget;
}

function transformWidgetArrayToObject(widgets:Widgets) {
  return widgets.reduce<{[name:string]:Widget}>((allWidgets, currWidget) => {
    const { name } = currWidget;
    allWidgets[name] = currWidget;
    return allWidgets;
  }, {});
}
describe('testing utils function', () => {
  /*
          layout    height
          |b|b| |     15
          | |a| |     10
          | |c|c|     20
          | | |d|     25
    */
  const widgets = [
    {
      top: 2, left: 1, width: 1, height: 10, name: 'a', children: () => (<div />),
    },
    {
      top: 0, left: 0, width: 2, height: 15, name: 'b', children: () => (<div />),
    },
    {
      top: 5, left: 1, width: 2, height: 20, name: 'c', children: () => (<div />),
    },
    {
      top: 6, left: 2, width: 1, height: 25, name: 'd', children: () => (<div />),
    },
  ] as Widgets;

  describe('isOverFlow', () => {
    it('detect overflow correctly', () => {
      expect(isOverFlow(1, 2, 3)).toBe(false);
      expect(isOverFlow(2, 2, 3)).toBe(true);
    });
  });

  describe('deepCopyWidgets', () => {
    const Widgets = [
      {
        top: 0, left: 0, width: 1, height: 1, name: 'a', children: () => (<div />),
      },
      {
        top: 0, left: 1, width: 1, height: 1, name: 'b', children: () => (<div />),
      },
    ] as Widgets;
    it('copied and not same object', () => {
      const copiedWidgets = deepCopyWidgets(Widgets);
      expect(copiedWidgets).toEqual(Widgets);
      expect(copiedWidgets).not.toBe(Widgets);
    });

    it('copied children attribute should be the same object after copy', () => {
      const copiedWidgets = deepCopyWidgets(Widgets);
      const firstChild = Widgets[0].children;
      const CopiedFirstChild = copiedWidgets[0].children;
      expect(CopiedFirstChild).toBe(firstChild);
    });
  });

  describe('sortInOneColumn', () => {
    const Widgets = [
      {
        top: 0, left: 1, width: 3, height: 1, name: 'a', children: () => (<div />),
      },
      {
        top: 0, left: 2, width: 1, height: 1, name: 'b', children: () => (<div />),
      },
    ] as Widgets;
    it('left and top value become expected', () => {
      const sortedWidgets = sortInOneColumn(Widgets);
      const widgetA = getWidgetAccordingToName(sortedWidgets, 'a');
      const widgetB = getWidgetAccordingToName(sortedWidgets, 'b');
      expect(widgetA).toMatchObject({ left: 0, top: 0 });
      expect(widgetB).toMatchObject({ left: 0, top: 2 });
    });
  });

  describe('sortInTwoColumn', () => {
    const Widgets = [
      {
        top: 0, left: 1, width: 3, height: 1, name: 'a', children: () => (<div />),
      },
      {
        top: 0, left: 3, width: 1, height: 1, name: 'b', children: () => (<div />),
      },
    ] as Widgets;
    it('left and top value become expected', () => {
      const sortedWidgets = sortInTwoColumn(Widgets);
      const widgetA = getWidgetAccordingToName(sortedWidgets, 'a');
      const widgetB = getWidgetAccordingToName(sortedWidgets, 'b');
      expect(widgetA).toMatchObject({ left: 1, top: 0 });
      expect(widgetB).toMatchObject({ left: 0, top: 0 });
    });
  });

  describe('calculateTopDistance', () => {
    it('calculate the right top value correctly', () => {
      const sortedWidgets = calculateTopDistance(widgets, 3);
      const widgetsObject = transformWidgetArrayToObject(sortedWidgets);
      expect(widgetsObject.a).toMatchObject({ left: 1, top: 16 });
      expect(widgetsObject.b).toMatchObject({ left: 0, top: 0 });
      expect(widgetsObject.c).toMatchObject({ left: 1, top: 27 });
      expect(widgetsObject.d).toMatchObject({ left: 2, top: 48 });
    });
  });

  describe('sortLayoutItemsByRowCol', () => {
    it('sort the widget array correctly', () => {
      const WidgetObject = transformWidgetArrayToObject(widgets);
      const sortedWidgets = sortLayoutItemsByRowCol(widgets);
      expect(sortedWidgets[0]).toBe(WidgetObject.b);
      expect(sortedWidgets[1]).toBe(WidgetObject.a);
      expect(sortedWidgets[2]).toBe(WidgetObject.c);
      expect(sortedWidgets[3]).toBe(WidgetObject.d);
    });
  });
});
