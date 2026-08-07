// Business-facing guide to working with Claude Code on this app: what a
// session already knows, how to use Claude as a thought partner, and how to
// validate what it asserts. Same altitude as the Design and Architecture
// tabs -- outcomes and habits, not tooling internals.

const REPO = 'https://github.com/travbetravelin/claude-nextjs-boilerplate'

function Code({ children }: { children: React.ReactNode }) {
  return <code className="doc-code">{children}</code>
}

function RepoLink({ path, children }: { path: string; children: React.ReactNode }) {
  return (
    <a href={`${REPO}/${path}`} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {children}
    </div>
  )
}

export default function ClaudeWorkflowGuide() {
  return (
    <div>
      <div className="card" style={{ marginBottom: 16, background: 'var(--primary-bg)', border: '1px solid var(--primary-200)' }}>
        <p style={{ margin: 0 }}>
          Claude Code does the implementation work on this app. This page is about your side of it — what Claude
          already knows, how to use it as a thought partner and not just a builder, and how to check what it tells
          you.
        </p>
      </div>

      <Section title="What Claude already knows">
        <p>
          Every session starts <strong>connected to{' '}
          <RepoLink path="">the repository</RepoLink></strong> — the complete, current codebase. Claude isn&apos;t
          briefed from memory or from your description; it has the actual app in front of it: every screen, every
          rule, every change ever made.
        </p>
        <p>
          On top of that sit two curated knowledge sources.{' '}
          <RepoLink path="blob/main/CLAUDE.md"><Code>CLAUDE.md</Code></RepoLink> is the app&apos;s memory — the
          rules of the road, the stack, and the <em>reasoning</em> behind past decisions. It&apos;s loaded
          automatically when a session starts, so nothing in it needs re-explaining in a request.
        </p>
        <p>
          <strong>The design standard</strong>{' '}
          (<RepoLink path="blob/main/docs/design-system.md"><Code>docs/design-system.md</Code></RepoLink>) is the
          technical version of this page&apos;s Design tab — the colors, building blocks, and page patterns Claude
          builds with.
        </p>
        <p style={{ marginBottom: 0 }}>
          Both are living documents: sessions update them as decisions get made. If something in either looks stale
          or wrong, flagging it is a real contribution.
        </p>
      </Section>

      <Section title="An imperfect partner">
        <p style={{ marginBottom: 0 }}>
          Claude, like a person, is imperfect — it can be confidently wrong, and it can pattern-match to the{' '}
          <em>usual</em> answer when your situation is the unusual one. Two habits sharpen it noticeably:{' '}
          <strong>point it back at the knowledge sources</strong> (&ldquo;check CLAUDE.md before answering&rdquo;)
          and <strong>question the obvious</strong> (&ldquo;that seems too easy — what are we missing?&rdquo;).
          Pushback doesn&apos;t offend it; it focuses it.
        </p>
      </Section>

      <Section title="Thinking it through together">
        <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <li><strong>Start with questions, not builds.</strong> &ldquo;What would this take?&rdquo; or &ldquo;does something like this already exist?&rdquo; costs nothing and often reshapes the ask before anything is built.</li>
          <li><strong>Ask for options with trade-offs.</strong> &ldquo;Give me two or three ways to do this and a recommendation&rdquo; — then choose, rather than accepting the first plan as the only plan.</li>
          <li><strong>Make it argue the other side.</strong> &ldquo;What&apos;s wrong with this plan? What breaks first?&rdquo; Then ask: what can this inform in your plan — has it exposed something more important than previously thought?</li>
          <li><strong>Sort decisions by reversibility.</strong> A screen tweak is cheap to redo; database structure and money math are not. Spend the scrutiny where undoing is expensive — and say so out loud: &ldquo;this one&apos;s permanent, slow down.&rdquo;</li>
        </ul>
      </Section>

      <Section title="Checking what it tells you">
        <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <li><strong>Ask &ldquo;how do you know?&rdquo;</strong> A claim should come with where it looked or what it ran — and &ldquo;I didn&apos;t verify that&rdquo; is a legitimate, useful answer that tells you what to check.</li>
          <li><strong>Passing checks mean the code runs, not that it&apos;s right.</strong> Claude routinely runs the app&apos;s automated checks (types, tests, a production build) before calling work done — those catch <em>broken</em>, not <em>wrong</em>. A change can pass everything and still not do what you meant.</li>
          <li><strong>Stage is the truth.</strong> &ldquo;Does it do what I asked&rdquo; is settled by clicking through the stage site yourself, not by any report. For claims about behavior, ask for a walkthrough on stage or a concrete example record.</li>
        </ul>
      </Section>

      <Section title="How a change ships">
        <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>Claude works on its own branch of the code — never directly on the live version — and pushes as it goes. Every branch gets its own <strong>stage</strong> site automatically.</li>
          <li>Review it on stage. Anything that needs adjusting is just another message in the same conversation.</li>
          <li><strong>Going live always needs an explicit yes.</strong> Releasing to production is a single, deliberate step, and Claude asks every time — no matter how many earlier releases were approved in the same conversation.</li>
          <li>Database changes are additive: each one is a new script with a matching undo script in a rollbacks folder, applied in order — history is never rewritten.</li>
        </ol>
      </Section>

      <Section title="Asking well">
        <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li><strong>Name the page if you know it</strong> (&ldquo;the sign-in screen&rdquo;, not &ldquo;the account thing&rdquo;).</li>
          <li><strong>One topic at a time</strong> for anything substantial; a short punch-list of small independent items works fine.</li>
          <li><strong>Screenshots help</strong> for anything about how something looks, or a bug that&apos;s hard to put into words.</li>
        </ul>
      </Section>

      <Section title="One thing to ignore">
        <p style={{ marginBottom: 0 }}>
          GitHub shows commits from Claude sessions as <strong>&ldquo;Unverified&rdquo;</strong>. This is cosmetic —
          the signing identity isn&apos;t registered to a GitHub account, so the green badge can never appear for
          them regardless of what&apos;s committed. It doesn&apos;t affect the code and isn&apos;t a bug to raise.
        </p>
      </Section>
    </div>
  )
}
