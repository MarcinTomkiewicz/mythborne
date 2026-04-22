import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const mg = {
  primary: 'var(--mg-color-primary)',
  secondary: 'var(--mg-color-secondary)',
  bg: 'var(--mg-color-bg)',
  surface: 'var(--mg-color-bg-surface)',
  border: 'var(--mg-color-border)',
  text: 'var(--mg-color-text)',
  textMuted: 'var(--mg-color-text-muted)',
  ink: 'var(--mg-color-ink)',
  white: 'var(--mg-color-white)',
  black: 'var(--mg-color-black)',
  info: 'var(--mg-color-info)',
  success: 'var(--mg-color-success)',
  danger: 'var(--mg-color-danger)',
  warn: 'var(--mg-color-warn)',
  help: 'var(--mg-color-help)',
};

function tint(color: string, percentToWhite: number): string {
  return `color-mix(in srgb, ${color} ${100 - percentToWhite}%, white)`;
}

function shade(color: string, percentToBlack: number): string {
  return `color-mix(in srgb, ${color} ${100 - percentToBlack}%, black)`;
}

const primaryScale = {
  50: tint(mg.primary, 92),
  100: tint(mg.primary, 84),
  200: tint(mg.primary, 72),
  300: tint(mg.primary, 58),
  400: tint(mg.primary, 36),
  500: mg.primary,
  600: shade(mg.primary, 14),
  700: shade(mg.primary, 26),
  800: shade(mg.primary, 40),
  900: shade(mg.primary, 56),
  950: shade(mg.primary, 70),
};

const surfaceScaleLight = {
  0: mg.surface,
  50: tint(mg.surface, 65),
  100: tint(mg.surface, 52),
  200: tint(mg.surface, 38),
  300: tint(mg.surface, 22),
  400: tint(mg.surface, 10),
  500: mg.surface,
  600: shade(mg.surface, 10),
  700: shade(mg.surface, 22),
  800: shade(mg.surface, 38),
  900: mg.ink,
  950: mg.black,
};

const surfaceScaleDark = {
  0: mg.text,
  50: `color-mix(in srgb, ${mg.text} 92%, ${mg.surface})`,
  100: `color-mix(in srgb, ${mg.text} 84%, ${mg.surface})`,
  200: `color-mix(in srgb, ${mg.text} 72%, ${mg.surface})`,
  300: `color-mix(in srgb, ${mg.text} 58%, ${mg.surface})`,
  400: `color-mix(in srgb, ${mg.text} 36%, ${mg.surface})`,
  500: `color-mix(in srgb, ${mg.text} 22%, ${mg.surface})`,
  600: `color-mix(in srgb, ${mg.text} 14%, ${mg.surface})`,
  700: `color-mix(in srgb, ${mg.text} 10%, ${mg.surface})`,
  800: `color-mix(in srgb, ${mg.text} 6%, ${mg.surface})`,
  900: mg.surface,
  950: shade(mg.surface, 18),
};

export const MgPrimePreset = definePreset(Aura, {
  semantic: {
    primary: primaryScale,

    focusRing: {
      width: '2px',
      style: 'solid',
      color: '{primary.color}',
      offset: '2px',
    },

    colorScheme: {
      light: {
        semantic: {
          surface: surfaceScaleLight,
          textColor: mg.text,
          textMutedColor: mg.textMuted,
          borderColor: mg.border,

          highlight: {
            background: tint(mg.primary, 88),
            color: mg.ink,
          },

          formField: {
            background: mg.bg,
            borderColor: mg.border,
            hoverBorderColor: '{primary.color}',
            focusBorderColor: '{primary.color}',
            color: mg.text,
            placeholderColor: mg.textMuted,
          },

          info: { color: mg.info },
          success: { color: mg.success },
          danger: { color: mg.danger },
          warn: { color: mg.warn },
          help: { color: mg.help },
        },
      },

      dark: {
        semantic: {
          surface: surfaceScaleDark,
          textColor: mg.text,
          textMutedColor: mg.textMuted,
          borderColor: mg.border,

          highlight: {
            background: tint(mg.primary, 78),
            color: mg.text,
          },

          formField: {
            background: mg.bg,
            borderColor: mg.border,
            hoverBorderColor: '{primary.color}',
            focusBorderColor: '{primary.color}',
            color: mg.text,
            placeholderColor: mg.textMuted,
          },

          info: { color: mg.info },
          success: { color: mg.success },
          danger: { color: mg.danger },
          warn: { color: mg.warn },
          help: { color: mg.help },
        },
      },
    },

    info: { color: mg.info },
    success: { color: mg.success },
    danger: { color: mg.danger },
    warn: { color: mg.warn },
    help: { color: mg.help },
  },

  components: {
    button: {
      root: {
        borderRadius: '10px',
      },
    },
    inputtext: {
      root: {
        borderRadius: '6px',
      },
    },
  },
});
