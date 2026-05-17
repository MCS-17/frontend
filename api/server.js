import { default as handler } from '../dist/server/server.js'

export default async function (req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`)
  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
  })
  
  const response = await handler.fetch(request)
  
  res.statusCode = response.status
  response.headers.forEach((value, key) => res.setHeader(key, value))
  const text = await response.text()
  res.end(text)
}