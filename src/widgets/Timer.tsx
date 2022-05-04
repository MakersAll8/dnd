import { useEffect, useState } from 'react';

export default function Timer(): JSX.Element {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCount((curCount) => curCount + 1);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [count]);
  return (
    <div>
      <p>this is a timer</p>
      <p>{count}</p>
    </div>
  );
}
