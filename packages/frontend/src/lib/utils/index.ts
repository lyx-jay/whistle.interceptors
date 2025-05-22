export function listenPageVisibility(callback?: () => void) {
  document.addEventListener('visibilitychange', (res) => {
    console.log('res', document.visibilityState)
    if (document.visibilityState === 'visible') {
      callback && callback()
    }
  })
}