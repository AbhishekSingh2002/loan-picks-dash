import { getServerSession } from 'next-auth'
export { authOptions } from '../auth'
export const auth = getServerSession
