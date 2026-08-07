// Business-facing overview of how an app built from this template is put
// together: three layers in plain language, with a collapsible "Extended
// details" per layer for the next level of depth -- still plain language,
// no code vocabulary. Requests to Claude Code are framed as outcomes (see
// the closing card); the deep technical reference stays CLAUDE.md.

function Connector({ label }: { label: string }) {
  return (
    <>
      <div className="arch-connector" />
      <div className="arch-connector-label">{label}</div>
    </>
  )
}

function Details({ children }: { children: React.ReactNode }) {
  return (
    <details style={{ marginTop: 10, borderTop: '1px solid var(--border-light)', paddingTop: 8, textAlign: 'left' }}>
      <summary style={{ cursor: 'pointer', color: 'var(--muted)', fontWeight: 600, fontSize: 'var(--fs-label)' }}>
        Extended details
      </summary>
      <ul style={{ margin: '8px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 'var(--fs-label)', color: 'var(--text-cell)' }}>
        {children}
      </ul>
    </details>
  )
}

export default function ArchitectureGuide() {
  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ margin: 0 }}>
          The app is three pieces: the screens in your <strong>browser</strong>, the <strong>app</strong> that
          assembles them, and the <strong>database</strong> where everything lives. That&apos;s the whole system.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="arch-diagram">

          <div className="arch-box" style={{ textAlign: 'center' }}>
            <div className="arch-box-title">Browser</div>
            <div className="arch-box-detail">
              What you and your users see and touch. Nothing lives here permanently — closing the tab loses nothing.
            </div>
            <Details>
              <li>When you save something, the page sends it straight to the database over a secure connection carrying <strong>your key</strong> — your signed-in identity, which only opens the doors your account allows. It can&apos;t touch anything else.</li>
              <li>Every visit rebuilds the page fresh from the database — the phone or laptop stores nothing of record.</li>
            </Details>
          </div>

          <Connector label="secure connection" />

          <div className="arch-box" style={{ textAlign: 'center', borderColor: 'var(--primary-200)', background: 'var(--primary-bg)' }}>
            <div className="arch-box-title">The app</div>
            <div className="arch-box-detail">
              Builds each page with the right data for whoever is signed in, and turns away anyone who isn&apos;t.
              Every change lands on <strong>stage</strong> first; only an approved release goes to production.
            </div>
            <Details>
              <li>Hosted by <em>Vercel</em> — a service that runs the app&apos;s servers so we don&apos;t maintain any.</li>
              <li>Pages arrive already filled in: the app looks up your data first and sends the finished page down — like a report printed before it&apos;s handed to you, not a blank form that loads afterwards.</li>
              <li>A gatekeeper checks every visit — anyone not signed in lands on the login page (this landing page and the login screens are the deliberate exceptions).</li>
              <li>Almost everything runs on <strong>your key</strong>: every page load and every save carries your signed-in identity, and each key only opens the doors that account allows. Two people on the same screen can see different things for exactly this reason.</li>
              <li>A few sensitive actions can go through the app&apos;s own private doors, opened with a <strong>master key</strong> that opens everything and never leaves the server. That&apos;s why such actions can&apos;t be triggered any other way.</li>
              <li>Stage and production are fully separate — separate site, separate database — so nothing tried on stage can touch real data.</li>
            </Details>
          </div>

          <Connector label="your signed-in identity travels with every request" />

          <div className="arch-box" style={{ textAlign: 'center' }}>
            <div className="arch-box-title">The database</div>
            <div className="arch-box-detail">
              The single source of truth for every record the app keeps. It enforces permissions on its own —
              even a bug in the app can&apos;t make it hand over someone else&apos;s data.
            </div>
            <Details>
              <li>Runs on <em>Supabase</em>, a service built on the industry-standard Postgres database. It also handles sign-in.</li>
              <li>It checks permissions itself on every read and write. Even if the app had a bug, the database would still refuse.</li>
              <li>The template starts it with the essentials: accounts and a profile per user, each protected by those database-level rules from day one.</li>
              <li>Every change to its structure is a new numbered script with a matching undo script in a rollbacks folder, applied in order — history is never rewritten.</li>
            </Details>
          </div>

        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Who can do what</h2>
        <p style={{ marginBottom: 0 }}>
          Permissions are checked <strong>twice</strong> — once by the app, once by the database — so a mistake in
          one layer can&apos;t leak data. The template starts simple: signed in or not, and each person&apos;s own
          profile. When a project needs real roles (admin vs. member, per-page permissions), there&apos;s a
          ready-made pattern for it in <code className="doc-code">docs/recipes/roles-and-permissions.md</code> —
          it gets added deliberately, wired into both layers, not improvised per feature.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Asking for changes</h2>
        <p style={{ marginTop: 0 }}>
          Describe the outcome in business terms — placing the mechanics across the three layers is Claude&apos;s
          job, not part of the ask. Three shapes most requests take:
        </p>
        <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <li>
            <em>&ldquo;I want this new feature, and it shouldn&apos;t be available to all users.&rdquo;</em><br />
            Say who should have it. It gets wired into both permission layers (adding the roles recipe first if
            the project doesn&apos;t have one yet), so changing who holds it later is a setting, not a rebuild.
          </li>
          <li>
            <em>&ldquo;I want this new feature, but I can&apos;t quite envision how the logic comes together.&rdquo;</em><br />
            Describe what should happen in plain rules — &ldquo;when a manager approves, then…&rdquo; — and let
            Claude propose where the logic lives and walk you through the trade-offs before building.
          </li>
          <li>
            <em>&ldquo;I want this form to include this information and collect additional data.&rdquo;</em><br />
            Collecting something new moves all three layers together: the database stores a new field, the form
            collects it, and any page that shows it updates. One ask covers all of it — just add what older
            records (from before the field existed) should show.
          </li>
        </ul>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Built-in safety nets</h2>
        <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li><strong>Stage comes first.</strong> Every change deploys to a stage site before production, and going live is always a separate, explicit step.</li>
          <li><strong>Database changes can be undone.</strong> Each structural change ships with its matching undo script, so a bad change has a practiced way back.</li>
          <li><strong>Permissions are enforced twice.</strong> The database refuses on its own, even if the app makes a mistake.</li>
          <li><strong>Heavier nets are on the shelf, ready.</strong> An audit log (who changed what, when), archive-instead-of-delete, and a roles system are written up as ready-made recipes in <code className="doc-code">docs/recipes/</code>. They aren&apos;t running yet — each gets added, deliberately, when the project&apos;s data starts to warrant it.</li>
        </ul>
      </div>
    </div>
  )
}
