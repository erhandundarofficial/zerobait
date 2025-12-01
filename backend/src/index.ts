import express from 'express'
import type { Request, Response } from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import scanRouter from './routes/scan'

dotenv.config()

const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.use('/api', scanRouter)

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'zerobait-backend' })
})

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`)
})
