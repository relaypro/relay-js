// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { version } from '../package.json'

// TODO: explore for efficent ways to get the version at run-time
//       perhaps by reading from package.json at build time and
//       re-writing this file as a cache
export { version }
