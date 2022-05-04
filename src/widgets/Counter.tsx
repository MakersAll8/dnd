import { useState } from 'react';

export default function Counter(): JSX.Element {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>this is a Counter</p>
      <p>{count}</p>
      <button type="button" onClick={() => setCount((curCount) => curCount + 1)}>
        increment count
      </button>
      <button type="button" onClick={() => setCount((curCount) => curCount - 1)}>
        decrement count
      </button>
    </div>
  );
}
