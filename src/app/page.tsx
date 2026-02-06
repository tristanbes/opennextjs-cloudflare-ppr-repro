export default function Home() {
  return (
    <div>
      <h2>Home Page</h2>
      <p>
        This is a minimal reproduction for{" "}
        <a href="https://github.com/opennextjs/opennextjs-cloudflare/issues/1115">
          opennextjs-cloudflare#1115
        </a>
        .
      </p>

      <h3>Expected behavior</h3>
      <p>
        Every request should show the full page with the header (including
        timestamp and theme). The &quot;Loading shell...&quot; fallback should
        only flash briefly while the dynamic shell streams in.
      </p>

      <h3>Actual behavior (on Cloudflare Workers)</h3>
      <ul>
        <li>
          <strong>First request (cache MISS):</strong> Works correctly — full
          page renders with header and timestamp.
        </li>
        <li>
          <strong>Second+ request (cache HIT):</strong> Only shows
          &quot;Loading shell...&quot; permanently. The dynamic content never
          streams in. Browser shows &quot;Connection closed&quot; error.
        </li>
      </ul>

      <h3>How to verify</h3>
      <ol>
        <li>Deploy to Cloudflare Workers</li>
        <li>Open the page — should work (cache MISS)</li>
        <li>
          Refresh — stuck on &quot;Loading shell...&quot; forever (cache HIT
          bug)
        </li>
      </ol>
    </div>
  );
}
