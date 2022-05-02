import {isOverFlow} from '../utils/utils';
describe('testing utils function', () => {
  it('isOverFlow work correctly',()=>{
    expect(isOverFlow(1,2,3)).toBe(false);
    expect(isOverFlow(2,2,3)).toBe(true);
  })
})
