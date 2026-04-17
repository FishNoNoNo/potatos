interface Watermark {
  text: string
  fontSize: number
  gap: number
  rotate?: number
  opacity?: number
}

interface Bg {
  size: number
  base64: string
}

export default function useWatermarkBg(params: Watermark): Bg {
  const { text, fontSize, gap, rotate = -45, opacity = 0.1 } = params

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return { size: 0, base64: '' }
  }

  // 1. 测量文字尺寸
  ctx.font = `${fontSize}px sans-serif`
  const textMetrics = ctx.measureText(text)
  const textWidth = textMetrics.width
  const textHeight = fontSize

  // 2. 计算单元尺寸（含间距）
  const unitWidth = textWidth + gap
  const unitHeight = textHeight + gap

  // 3. 【关键】计算旋转后的外接矩形尺寸
  // 这是保证无缝衔接的核心：Canvas 必须等于旋转后图案的周期
  const angleRad = (rotate * Math.PI) / 180
  const absCos = Math.abs(Math.cos(angleRad))
  const absSin = Math.abs(Math.sin(angleRad))

  // 旋转后的外接矩形尺寸
  const rotatedWidth = unitWidth * absCos + unitHeight * absSin
  const rotatedHeight = unitWidth * absSin + unitHeight * absCos

  // 4. 【关键】设置 Canvas 为外接矩形尺寸
  // 这样 repeat 时，图案的自然周期正好等于 Canvas 尺寸
  const canvasWidth = Math.ceil(rotatedWidth)
  const canvasHeight = Math.ceil(rotatedHeight)

  canvas.width = canvasWidth
  canvas.height = canvasHeight

  // 5. 绘制配置
  ctx.font = `${fontSize}px sans-serif`
  ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'

  // 6. 【关键】移动原点到中心并旋转
  ctx.translate(canvasWidth / 2, canvasHeight / 2)
  ctx.rotate(angleRad)

  // 7. 【关键】在旋转后的坐标系中，只绘制一个单元
  // 由于 Canvas 尺寸 = 旋转后的周期，一个单元正好填满
  // 在旋转坐标系中，(0,0) 是中心，我们需要偏移半个单元让文字居中
  ctx.fillText(text, 0, 0)

  // 8. 返回结果
  return {
    size: Math.max(canvasWidth, canvasHeight), // 返回正方形尺寸便于 CSS 使用
    base64: canvas.toDataURL('image/png'),
  }
}
