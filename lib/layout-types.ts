export type PageBlock = {
  id: string
  type: "text" | "image"

  // position and size in px, relative to page
  x: number
  y: number
  w: number
  h: number
  z?: number

  // text
  text?: string
  fontSize?: number
  align?: "left" | "center" | "right"
  color?: string
  fontFamily?: string
  listType?: "none" | "bullet" | "numbered"

  // image
  image?: string | null
  zoom?: number // 1..3
  offsetX?: number // pan offset in px (positive = right)
  offsetY?: number // pan offset in px (positive = down)
}

export type PageContent = {
  // legacy fields (kept for compatibility)
  text: string
  image: string | null
  fontSize: number
  align: "left" | "center" | "right"
  textColor: string
  padding: number

  // blocks-based layout
  blocks?: PageBlock[]
}

export type Spread = {
  id: string
  left: PageContent
  right: PageContent
}

export type FixedPage = {
  id: string
  type: "cover" | "title" | "ending"
  content: PageContent
}

export type BookLayout = {
  cover: FixedPage
  title: FixedPage
  spreads: Spread[]
  ending: FixedPage
}
