import { serve } from '@hono/node-server'
import app from './app.js'

const port = Number(process.env.PORT) || 3004

serve({
  fetch: app.fetch,
  port: port
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
