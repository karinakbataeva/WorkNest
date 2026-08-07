// This offscreen document exists solely to play a notification sound,
// since Manifest V3 service workers have no DOM / <audio> element.

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === 'PLAY_NOTIFICATION_SOUND') {
    const audio = new Audio(chrome.runtime.getURL('src/assets/sounds/notification.wav'))
    audio.play().catch((err) => {
      console.error('Failed to play notification sound:', err)
    })
  }
})
