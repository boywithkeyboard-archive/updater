import { setFailed, setOutput } from '@actions/core'
import { availableParallelism } from 'node:os'
import cluster from 'node:cluster'

try {
  async function executeAction() {
    // const changelog = ''

    // setOutput('changelog', changelog)

    let num = availableParallelism()

    if (cluster.isPrimary) {
      while (num--) {
        cluster.fork()
      }

      cluster.on('exit', (worker) => {
        console.error(`WORKER ${worker.process.pid} DIED`)
      })

      console.log(`WORKER ${process.pid} STARTED`)
    }
  }

  executeAction()
} catch (err) {
  setFailed(
    err instanceof Error
      ? err.message
      : 'Something unexpected happened.'
  )
}
