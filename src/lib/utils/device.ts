const deveiceStats = {
  isMobileDevice: false,
  initialized: false,
}

export function isMobile() {
  if (deveiceStats.initialized) {
    return deveiceStats.isMobileDevice
  }
  const userAgentJudgment = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  )
  const windowSizeJudgment = window.screen.width < 768

  deveiceStats.isMobileDevice = userAgentJudgment || windowSizeJudgment
  deveiceStats.initialized = true
  return deveiceStats.isMobileDevice
}
