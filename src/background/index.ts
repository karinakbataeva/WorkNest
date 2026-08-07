import { FOCUS_ALARM_NAME } from '../services/focusService'
import { getFocusSession, setFocusSession } from '../services/storageService'
import { playNotificationSound } from '../services/audioService'

console.log('WorkNest background service worker initialized')

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== FOCUS_ALARM_NAME) return

  const current = await getFocusSession()

  if (current.phase === 'focus') {
    const endTime = Date.now() + current.breakMinutes * 60 * 1000
    const nextBreakCount = current.breakCount + 1

    await setFocusSession({
      ...current,
      phase: 'break',
      endTime,
      breakCount: nextBreakCount,
    })
    await chrome.alarms.create(FOCUS_ALARM_NAME, { when: endTime })

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'src/assets/icons/icon128.png',
      title: 'Focus session complete',
      message: `Nice work! Time for a ${current.breakMinutes}-minute break.`,
    })
    await playNotificationSound()
  } else if (current.phase === 'break') {
    await setFocusSession({ ...current, phase: 'idle', endTime: null })

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'src/assets/icons/icon128.png',
      title: 'Break over',
      message: 'Ready to start another focus session?',
    })
    await playNotificationSound()
  }
})
