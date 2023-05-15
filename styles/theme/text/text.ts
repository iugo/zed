import chroma from "chroma-js"
import { Interactive } from "@theme/state"
import {
  Intensity,
  IntensitySet,
  resolveThemeColorIntensity,
} from "@theme/intensity/intensity"
import { Prettify } from "@theme/types/utility"
import { Theme, ThemeColor } from "@theme/config"
import { useColors } from "@theme/color/colors"
import {
  ContainedText,
  ContainedTextOptions,
  containedText,
} from "@theme/container/containedElement"
import { DEFAULT_CONTAINER_OPTIONS } from "@theme/container"
import { buildIntensitiesForStates } from "@theme/state/buildIntensitiesForStates"
type Font = "Zed Mono" | "Zed Sans"

export interface Families {
  mono: Font
  sans: Font
  ui: Font
  terminal: Font
}

export const family: Families = {
  mono: "Zed Mono",
  sans: "Zed Sans",
  ui: "Zed Sans",
  terminal: "Zed Mono",
}

export type Size = "xs" | "sm" | "md" | "lg" | "xl"

export type Sizes = Record<Size, number>

export const size: Sizes = {
  xs: 0.75, // 9.75px (10px)
  sm: 0.875, // 11.375px (11px)
  md: 1, // 13px
  lg: 1.125, // 14.625px (15px)
  xl: 1.25, // 16.25px (16px)
}

export type Weight = "normal" | "bold"

export interface Weights {
  regular: Weight
  bold: Weight
}

export const weight: Weights = {
  regular: "normal",
  bold: "bold",
}

export interface Features {
  /** Contextual Alternates: Applies a second substitution feature based on a match of a character pattern within a context of surrounding patterns */
  calt?: boolean
  /** Case-Sensitive Forms: Shifts various punctuation marks up to a position that works better with all-capital sequences */
  case?: boolean
  /** Capital Spacing: Adjusts inter-glyph spacing for all-capital text */
  cpsp?: boolean
  /** Fractions: Replaces figures separated by a slash with diagonal fractions */
  frac?: boolean
  /** Standard Ligatures: Replaces a sequence of glyphs with a single glyph which is preferred for typographic purposes */
  liga?: boolean
  /** Oldstyle Figures: Changes selected figures from the default or lining style to oldstyle form. */
  onum?: boolean
  /** Ordinals: Replaces default alphabetic glyphs with the corresponding ordinal forms for use after figures */
  ordn?: boolean
  /** Proportional Figures: Replaces figure glyphs set on uniform (tabular) widths with corresponding glyphs set on proportional widths */
  pnum?: boolean
  /** Subscript: Replaces default glyphs with subscript glyphs */
  subs?: boolean
  /** Superscript: Replaces default glyphs with superscript glyphs */
  sups?: boolean
  /** Swash: Replaces default glyphs with swash glyphs for stylistic purposes */
  swsh?: boolean
  /** Titling: Replaces default glyphs with titling glyphs for use in large-size settings */
  titl?: boolean
  /** Tabular Figures: Replaces figure glyphs set on proportional widths with corresponding glyphs set on uniform (tabular) widths */
  tnum?: boolean
  /** Slashed Zero: Replaces default zero with a slashed zero for better distinction between "0" and "O" */
  zero?: boolean
  /** Stylistic sets 01 - 20 */
  ss01?: boolean
  ss02?: boolean
  ss03?: boolean
  ss04?: boolean
  ss05?: boolean
  ss06?: boolean
  ss07?: boolean
  ss08?: boolean
  ss09?: boolean
  ss10?: boolean
  ss11?: boolean
  ss12?: boolean
  ss13?: boolean
  ss14?: boolean
  ss15?: boolean
  ss16?: boolean
  ss17?: boolean
  ss18?: boolean
  ss19?: boolean
  ss20?: boolean
}

export interface TextStyle {
  family: Font
  size: number
  weight: Weight
  color: string
  lineHeight: number
  underline?: boolean
}

export interface TextOptions {
  family: Font
  // The relative font size
  fontSize: number
  weight: Weight
  lineHeight: number
  underline?: boolean
  // The number relative font sizes are multiplied by to get the actual font size
  baseFontSize: number
  intensity: Intensity
  /** A color family from the theme */
  themeColor: ThemeColor
}

export function extractTextOptions(
  input: unknown
): Partial<TextOptions> | null {
  if (typeof input !== "object" || input === null) {
    return null
  }

  const textOptionsKeys: (keyof TextOptions)[] = [
    "family",
    "fontSize",
    "weight",
    "lineHeight",
    "underline",
    "baseFontSize",
    "intensity",
    "themeColor",
  ]

  const result: Record<string, any> = {}

  for (const key of textOptionsKeys) {
    if (key in (input as Record<string, any>)) {
      result[key] = (input as Record<string, any>)[key]
    }
  }

  const validatedResult: Partial<TextOptions> = result

  return Object.keys(validatedResult).length > 0
    ? (result as Partial<TextOptions>)
    : null
}

export const DEFAULT_TEXT_OPTIONS: TextOptions = {
  family: family.sans,
  baseFontSize: 13,
  fontSize: size.md,
  weight: weight.regular,
  themeColor: "neutral",
  intensity: 100,
  lineHeight: 1,
}

export function textStyle(
  theme: Theme,
  options?: Partial<TextOptions>
): TextStyle {
  const color = useColors(theme)

  const mergedOptions: Partial<TextOptions> = {
    ...DEFAULT_TEXT_OPTIONS,
    ...options,
  }

  const properties = extractTextOptions(mergedOptions)

  const {
    family,
    weight,
    fontSize,
    baseFontSize,
    lineHeight,
    themeColor,
    intensity,
  } = properties

  const resolvedIntensity = resolveThemeColorIntensity(theme, intensity)
  const textColor = color[themeColor](resolvedIntensity)

  // Ensure the color is valid
  chroma.valid(color)

  /** Calculate the final font size, rounded to the nearest whole number */
  const size = Math.round(fontSize * baseFontSize)

  const text: TextStyle = {
    family,
    weight,
    size,
    lineHeight,
    color: textColor,
  }

  if (!text.color) {
    throw new Error(`No text color provided`)
  }

  if (fontSize > 32) {
    console.log(`
      size: ${size}
      baseFontSize: ${baseFontSize}
      fontSize: ${fontSize}`)
  }

  if (intensity !== 100) {
    console.log(`============
    intensity: ${intensity}
    text: ${text.color}
    options: ${JSON.stringify(options)}
    mergedOptions: ${JSON.stringify(mergedOptions)}
    `)
  }

  return text
}

export type InteractiveTextStyle = Prettify<Interactive<TextStyle>>

export function interactiveTextStyle(
  theme: Theme,
  options?: ContainedTextOptions
): Interactive<ContainedText> {
  const DEFAULT_INTENSITIES: IntensitySet = {
    bg: 1,
    border: 15,
    fg: 100,
  } as const

  const mergedOptions = {
    ...DEFAULT_TEXT_OPTIONS,
    ...DEFAULT_CONTAINER_OPTIONS,
    underline: true,
    ...options,
  }

  const states = buildIntensitiesForStates(
    theme,
    "interactiveText",
    DEFAULT_INTENSITIES
  )

  const stateStyle = (
    theme: Theme,
    options: ContainedTextOptions,
    intensities: IntensitySet
  ) => {
    const color = useColors(theme)
    const stateOptions: ContainedTextOptions = {
      ...options,
      intensity: intensities.fg,
      border: {
        ...options.border,
        width: options.border?.width ?? 1,
        color: color[options.themeColor](intensities.border),
      },
      background: color[options.themeColor](intensities.bg),
    }

    const style = containedText({
      theme,
      options: stateOptions,
    })

    return style
  }

  const text = {
    default: stateStyle(theme, mergedOptions, states.default),
    hovered: stateStyle(theme, mergedOptions, states.hovered),
    pressed: stateStyle(theme, mergedOptions, states.pressed),
  }

  return text
}
