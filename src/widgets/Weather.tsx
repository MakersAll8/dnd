export function WeatherApp(): JSX.Element {
  return (
    <div>
      <p>this is the weather app</p>
      <button
        type="button"
        onClick={() => {
          // eslint-disable-next-line no-alert
          alert('weather');
        }}
      >
        alert weather
      </button>
    </div>
  );
}
