import { EventEmitter } from 'node:events'
import { createAlert } from '../../../../../Downloads/s0kdf6rt6e/utils/createAlert.js'

export const sightingEvents = new EventEmitter()

sightingEvents.on('sighting-added', createAlert)
 