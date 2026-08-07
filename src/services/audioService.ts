const OFFSCREEN_DOCUMENT_PATH = 'src/offscreen/index.html'

/**
 * Ensures the offscreen document exists (creating it if needed), then
 * sends it a message to play the notification sound.
 */
export async function playNotificationSound(): Promise<void> {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
  })

  if (existingContexts.length === 0) {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
      justification: 'Play a short sound when a focus/break session ends.',
    })
  }

  await chrome.runtime.sendMessage({ type: 'PLAY_NOTIFICATION_SOUND' })
}
