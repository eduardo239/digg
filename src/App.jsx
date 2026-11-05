import { useState } from 'react'

const RESOLVERS = {
  Cloudflare: 'https://cloudflare-dns.com/dns-query',
  Google: 'https://dns.google/resolve',
  'DNS.SB': 'https://doh.dns.sb/dns-query',
  AliDNS: 'https://dns.alidns.com/resolve',
}
const TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT', 'SOA']
const RCODES = ['NOERROR', 'FORMERR', 'SERVFAIL', 'NXDOMAIN', 'NOTIMP', 'REFUSED']

async function query(resolverUrl, name, type) {
  const url = `${resolverUrl}?name=${encodeURIComponent(name)}&type=${type}`
  const start = performance.now()
  const res = await fetch(url, { headers: { accept: 'application/dns-json' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return { data, ms: Math.round(performance.now() - start) }
}

export default function App() {
  const [domain, setDomain] = useState('example.com')
  const [type, setType] = useState('A')
  const [selected, setSelected] = useState(Object.keys(RESOLVERS))
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const toggle = (name) =>
    setSelected((s) => (s.includes(name) ? s.filter((n) => n !== name) : [...s, name]))

  async function run(e) {
    e.preventDefault()
    const name = domain.trim()
    if (!name || !selected.length) return
    setLoading(true)
    const out = await Promise.all(
      selected.map(async (resolver) => {
        try {
          const { data, ms } = await query(RESOLVERS[resolver], name, type)
          return { resolver, ms, status: RCODES[data.Status] ?? data.Status, answers: data.Answer ?? [] }
        } catch (err) {
          return { resolver, error: err.message }
        }
      })
    )
    setResults(out)
    setLoading(false)
  }

  return (
    <main>
      <h1>Teste de DNS</h1>
      <p className="hint">Consultas via DNS-over-HTTPS direto do navegador.</p>

      <form onSubmit={run}>
        <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="dominio.com" />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <button disabled={loading}>{loading ? 'Consultando…' : 'Consultar'}</button>
        <div className="resolvers">
          {Object.keys(RESOLVERS).map((r) => (
            <label key={r}>
              <input type="checkbox" checked={selected.includes(r)} onChange={() => toggle(r)} /> {r}
            </label>
          ))}
        </div>
      </form>

      {results.map((r) => (
        <section key={r.resolver} className="card">
          <h2>
            {r.resolver} {r.ms != null && <span className="ms">{r.ms} ms</span>}
          </h2>
          {r.error ? (
            <p className="err">Erro: {r.error}</p>
          ) : (
            <>
              <p>Status: <strong className={r.status === 'NOERROR' ? 'ok' : 'err'}>{r.status}</strong></p>
              {r.answers.length ? (
                <table>
                  <thead><tr><th>Nome</th><th>Tipo</th><th>TTL</th><th>Dados</th></tr></thead>
                  <tbody>
                    {r.answers.map((a, i) => (
                      <tr key={i}><td>{a.name}</td><td>{a.type}</td><td>{a.TTL}</td><td>{a.data}</td></tr>
                    ))}
                  </tbody>
                </table>
              ) : <p>Sem registros.</p>}
            </>
          )}
        </section>
      ))}
    </main>
  )
}
