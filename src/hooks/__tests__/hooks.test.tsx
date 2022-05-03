import type {CarouselWidget, Layout, Widgets} from '../../state'
import {act, renderHook} from '@testing-library/react-hooks'

import { proxy as mockedProxy } from "valtio";
import {useRemoveWidget} from '../useRemoveWidget';
import { waitFor } from '@testing-library/react';

jest.mock('../../state',()=>{
    return {
      carouselWidgets:mockedProxy<CarouselWidget[]>([
        {
          name: "sick bay students widget",
          width: 1,
          height: 15,
        },
        {
          name: "birthday today",
          width: 1,
          height: 10,
        }
      ]),
      widgets:mockedProxy<Widgets>([
        {
          name: "needed to remove widget",
          left: 1,
          top: 0,
          width: 2,
          height: 15,
          children: () => <div></div>,
        },
        {
          name: "to do list widget",
          left: 1,
          top: 16,
          width: 1,
          height: 30,
        },
      ]),
      layout:mockedProxy<Layout>({
        dropTargetWidth: 255,
        columns: 3,
        getColumnWidth() {
          return this.dropTargetWidth / this.columns;
        },
      })
    }
})
describe('useRemoveWidgets',()=>{
  test('remove widget correctly', async () => {
    const { result } = renderHook(() => useRemoveWidget());
    act(() => {
      result.current.removeWidget('needed to remove widget');
    })
    await waitFor(()=>{
      expect(result.current.widgetsSnap).toHaveLength(1);
      expect(result.current.widgetsSnap[0].name).toBe('to do list widget');
    });
  })
})