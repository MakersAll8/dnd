import {deepCopyWidgets, isOverFlow, sortInOneColumn, sortInTwoColumn} from '../utils/utils';

import type { Widgets } from "../state";

describe('testing utils function', () => {
  describe('isOverFlow',()=>{
    it('detect overflow correctly',()=>{
      expect(isOverFlow(1,2,3)).toBe(false);
      expect(isOverFlow(2,2,3)).toBe(true);
    })
  })

  describe('deepCopyWidgets',()=>{
    const Widgets=[
      {top:0,left:0,width:1,height:1,name:'a',children:()=>(<></>)},
      {top:0,left:1,width:1,height:1,name:'b',children:()=>(<></>)},
    ] as Widgets;
    it('copied and not same object',()=>{
    const copiedWidgets = deepCopyWidgets(Widgets);
    expect(copiedWidgets).toEqual(Widgets);
    expect(copiedWidgets).not.toBe(Widgets);
    })

    it('copied children attribute should be the same object after copy',()=>{
      const copiedWidgets = deepCopyWidgets(Widgets);
      const firstChild = Widgets[0].children;
      const CopiedFirstChild = copiedWidgets[0].children;
      expect(CopiedFirstChild).toBe(firstChild);
      })
  })

  describe('sortInOneColumn',()=>{
    const Widgets=[
      {top:0,left:1,width:3,height:1,name:'a',children:()=>(<></>)},
      {top:0,left:2,width:1,height:1,name:'b',children:()=>(<></>)},
    ] as Widgets;
    it('left and top value become expected',()=>{
      const sortedWidgets = sortInOneColumn(Widgets);
      expect(sortedWidgets[0]).toMatchObject({left:0,top:0});
      expect(sortedWidgets[1]).toMatchObject({left:0,top:2});
    })
  })

  describe('sortInTwoColumn',()=>{
    const Widgets=[
      {top:0,left:1,width:3,height:1,name:'a',children:()=>(<></>)},
      {top:0,left:3,width:1,height:1,name:'b',children:()=>(<></>)},
    ] as Widgets;
    it('left and top value become expected',()=>{
      const sortedWidgets = sortInTwoColumn(Widgets);
      expect(sortedWidgets[0]).toMatchObject({left:1,top:0});
      expect(sortedWidgets[1]).toMatchObject({left:0,top:0});
    })
  })
})
