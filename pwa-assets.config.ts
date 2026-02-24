import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: {
    ...minimal2023Preset,
    // Regular icons: tiny transparent padding, SVG provides its own solid bg
    transparent: {
      ...minimal2023Preset.transparent,
      padding: 0.05,
      resizeOptions: { fit: 'contain', background: 'transparent' },
    },
    // Maskable (Android adaptive icon): 10% safe-zone padding, bg matches app bg
    maskable: {
      ...minimal2023Preset.maskable,
      padding: 0.1,
      resizeOptions: { fit: 'contain', background: '#0f172a' },
    },
    // Apple touch icon: same treatment
    apple: {
      ...minimal2023Preset.apple,
      padding: 0.1,
      resizeOptions: { fit: 'contain', background: '#0f172a' },
    },
  },
  images: ['public/icon.svg'],
})
