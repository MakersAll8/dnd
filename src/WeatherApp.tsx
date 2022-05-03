export function WeatherApp(): JSX.Element {
  return (
    <div>
      <p>this is the weather app</p>
      <button
        onClick={() => {
          alert('weather');
        }}
      >
        alert weather
      </button>
    </div>
  );
}
