import mitt from 'mitt'

export const SHOW_ERROR_DIALOG = 'SHOW_ERROR_DIALOG'
export const SHOW_NOTIFICATION = 'SHOW_NOTIFICATION'
export const CLOSE_ALL_CARD_TICKETS = 'CLOSE_ALL_CARD_TICKETS'
export const emitter = mitt()

export function showErrorDialog(message) {
    emitter.emit(SHOW_ERROR_DIALOG, {message})
}

export function showSuccessNotification(message) {
    emitter.emit(SHOW_NOTIFICATION, {type: 'success', message})
}
export function showErrorNotification(message) {
    emitter.emit(SHOW_NOTIFICATION, {type: 'error', message})
}

export function showInfoNotification(message) {
    emitter.emit(SHOW_NOTIFICATION, {type: 'info', message})
}

export function closeAllCards(){
    emitter.emit(CLOSE_ALL_CARD_TICKETS)
}
