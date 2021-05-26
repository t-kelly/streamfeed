export default function handler(req, res) {
  const { fixtures } = req.query
  const payload = require(`../../../test/fixtures/${fixtures.join('/')}.json`)
  res.json(payload)
}