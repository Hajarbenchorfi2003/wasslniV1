// components/utils/react-select-styles.js (or directly in your ModalParent)

import { cva } from "class-variance-authority"; // Assuming cva is available
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config.js'; // Adjust path to your tailwind.config.js

const fullConfig = resolveConfig(tailwindConfig);
const themeColors = fullConfig.theme.colors;

// Helper to get HSL values from your Tailwind config (if defined using HSL)
const getTailwindColor = (variable) => {
  // This is a simplified helper. In a real scenario, you'd parse your Tailwind config
  // to get the actual HSL values or direct color codes.
  // For shadcn/ui, colors are often defined as CSS variables like hsl(--primary).
  // You might need a more sophisticated way to read these.
  // For demonstration, let's assume direct color names or you'd fetch from actual CSS.
  switch (variable) {
    case 'background': return 'hsl(var(--background))';
    case 'input': return 'hsl(var(--input))';
    case 'primary': return 'hsl(var(--primary))';
    case 'primary-foreground': return 'hsl(var(--primary-foreground))';
    case 'secondary': return 'hsl(var(--secondary))';
    case 'secondary-foreground': return 'hsl(var(--secondary-foreground))';
    case 'accent': return 'hsl(var(--accent))';
    case 'accent-foreground': return 'hsl(var(--accent-foreground))';
    case 'destructive': return 'hsl(var(--destructive))';
    case 'destructive-foreground': return 'hsl(var(--destructive-foreground))';
    case 'popover': return 'hsl(var(--popover))';
    case 'popover-foreground': return 'hsl(var(--popover-foreground))';
    case 'default-300': return 'hsl(var(--default-300))'; // Assuming you have these custom default colors
    case 'default-500': return 'hsl(var(--default-500))';
    case 'default-600': return 'hsl(var(--default-600))';
    case 'default-200': return 'hsl(var(--default-200))';
    case 'default-100': return 'hsl(var(--default-100))';
    case 'info': return 'hsl(var(--info))';
    case 'warning': return 'hsl(var(--warning))';
    case 'success': return 'hsl(var(--success))';
    // Add other colors as needed from your shadcn/ui setup
    default: return 'gray'; // Fallback
  }
};


export const getReactSelectStyles = ({ color, size, radius, variant }) => {
  // Apply cva variants for common styling properties
  // Note: This won't work directly with react-select's internal structure for all properties.
  // We'll primarily focus on colors, borders, and basic sizing.
  const baseClasses = cva(
    "relative flex w-full", // Adjusted for react-select's wrapper
    {
      variants: {
        color: {
          default: "border-default-300 text-default-500 [&>svg]:stroke-default-600",
          primary: "border-primary text-primary [&>svg]:stroke-primary",
          info: "border-info/50 text-info",
          warning: "border-warning/50 text-warning",
          success: "border-success/50 text-success",
          destructive: "border-destructive/50 text-destructive",
        },
        variant: {
          flat: "bg-default-500/10", // This will be hard to map exactly
          underline: "border-b",
          bordered: "border",
          faded: "border border-default-300 bg-default-100",
          ghost: "border-0",
          "flat-underline": "bg-default-100 border-b",
        },
        radius: {
          none: "rounded-none",
          sm: "rounded",
          md: "rounded-lg",
          lg: "rounded-xl",
          xl: "rounded-[20px]",
        },
        // Size will mostly be handled by height and padding in the control styles
      },
      defaultVariants: {
        color: "default",
        variant: "bordered",
        radius: "md",
      },
    }
  )({ color, variant, radius });

  // Map your size variant to actual height and padding values
  const getSizeStyles = (sizeVariant) => {
    switch (sizeVariant) {
      case 'sm': return { height: '2rem', fontSize: '0.75rem' }; // h-8 text-xs
      case 'md': return { height: '2.25rem', fontSize: '0.75rem' }; // h-9 text-xs
      case 'lg': return { height: '2.5rem', fontSize: '0.875rem' }; // h-10 text-sm (default)
      case 'xl': return { height: '3rem', fontSize: '1rem' }; // h-12 text-base
      default: return { height: '2.5rem', fontSize: '0.875rem' };
    }
  };

  const { height, fontSize } = getSizeStyles(size);


  return {
    // Control (the main input box)
    control: (provided, state) => ({
      ...provided,
      backgroundColor: getTailwindColor('background'),
      borderColor: getTailwindColor('input'),
      boxShadow: 'none', // Remove default react-select shadow
      minHeight: height, // Use minHeight to respect h-xx
      height: 'auto', // Allow height to adjust for multiValue badges
      borderRadius: fullConfig.theme.borderRadius[radius] || provided.borderRadius, // Use radius from Tailwind config
      borderWidth: variant === 'underline' ? 0 : (variant === 'ghost' ? 0 : 1), // Only border-b for underline, no border for ghost
      borderBottomWidth: variant === 'underline' || variant === 'flat-underline' ? '1px' : (variant === 'ghost' ? 1 : provided.borderBottomWidth), // Ensure bottom border for underline
      fontSize: fontSize,
      paddingLeft: '0.75rem', // px-3
      paddingRight: '0.75rem', // px-3
      display: 'flex',
      flexWrap: 'wrap', // Allow selected items to wrap
      alignItems: 'center',
      transition: 'border-color 0.3s',
      color: getTailwindColor('default-500'), // Default text color

      // Focus styles
      '&:hover': {
        borderColor: state.isFocused ? getTailwindColor(color) : getTailwindColor('input'),
      },
      borderColor: state.isFocused ? getTailwindColor(color) : getTailwindColor('input'),
      outline: state.isFocused ? 'none' : provided.outline,
      boxShadow: state.isFocused ? `0 0 0 1px ${getTailwindColor(color)}` : 'none', // Simple focus ring

      // Disabled styles
      opacity: state.isDisabled ? 0.5 : 1,
      cursor: state.isDisabled ? 'not-allowed' : 'default',
      backgroundColor: state.isDisabled ? getTailwindColor('default-200') : getTailwindColor('background'),
    }),

    // IndicatorsContainer (where the dropdown arrow is)
    indicatorsContainer: (provided) => ({
      ...provided,
      height: '100%',
      alignSelf: 'stretch', // Stretch to the height of the control
    }),

    // DropdownIndicator (the chevron icon)
    dropdownIndicator: (provided) => ({
      ...provided,
      color: getTailwindColor('default-600'), // Default stroke color
      padding: '0 8px', // Adjust padding if needed
      '&:hover': {
        color: getTailwindColor(color), // Change color on hover based on selected color
      },
      // Apply the SVG styling from your original SelectTrigger here if possible
      // This is tricky as react-select uses an SVG directly, not a wrapper for your icon prop
    }),

    // ClearIndicator (the X button when value exists)
    clearIndicator: (provided) => ({
      ...provided,
      color: getTailwindColor('default-500'),
      '&:hover': {
        color: getTailwindColor('destructive'),
      },
    }),

    // ValueContainer (where selected values/placeholder go)
    valueContainer: (provided) => ({
      ...provided,
      padding: '0', // Remove default padding to allow badges to use full space
      flexWrap: 'wrap',
      gap: '0.25rem', // gap-1 for badges
    }),

    // SingleValue (for single select mode, not directly used in multi-select)
    singleValue: (provided) => ({
      ...provided,
      color: getTailwindColor('foreground'),
    }),

    // Placeholder
    placeholder: (provided) => ({
      ...provided,
      color: getTailwindColor('accent-foreground/50'),
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),

    // Input (the search input inside the control)
    input: (provided) => ({
      ...provided,
      margin: '0',
      padding: '0', // Remove default padding
      color: getTailwindColor('foreground'),
    }),

    // MultiValue (individual selected item/badge)
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: getTailwindColor('secondary'), // bg-secondary
      borderRadius: '0.25rem', // rounded-md
      display: 'flex',
      alignItems: 'center',
      color: getTailwindColor('secondary-foreground'), // text-secondary-foreground
      padding: '0.25rem 0.5rem', // Adjust padding for badges
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'inherit', // Inherit from multiValue
      fontSize: '0.75rem', // text-xs for badge text
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'inherit',
      cursor: 'pointer',
      padding: '0.25rem',
      borderRadius: '50%',
      '&:hover': {
        backgroundColor: getTailwindColor('destructive'), // bg-destructive
        color: getTailwindColor('destructive-foreground'), // text-destructive-foreground
      },
    }),

    // Menu (the dropdown list container)
    menu: (provided) => ({
      ...provided,
      borderRadius: fullConfig.theme.borderRadius['md'] || '0.375rem', // rounded-md
      border: `1px solid ${getTailwindColor('border')}`, // border
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', // shadow-md
      backgroundColor: getTailwindColor('popover'), // bg-popover
      color: getTailwindColor('popover-foreground'), // text-popover-foreground
      zIndex: 99999, // Ensure it's above other elements
      marginTop: '0.5rem', // Adjust margin to visually separate from trigger
    }),

    // MenuList (the scrollable part of the menu)
    menuList: (provided) => ({
      ...provided,
      padding: '0.25rem', // p-1
      maxHeight: '200px', // max-h-[200px]
      overflowY: 'auto',
      '::-webkit-scrollbar': {
        width: '6px',
      },
      '::-webkit-scrollbar-thumb': {
        backgroundColor: getTailwindColor('accent'), // Example: use accent color for scrollbar thumb
        borderRadius: '3px',
      },
      '::-webkit-scrollbar-track': {
        backgroundColor: getTailwindColor('background'),
      },
    }),

    // Option (individual item in the dropdown list)
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? getTailwindColor(color) // Use primary color if selected
        : state.isFocused
          ? getTailwindColor('accent') // bg-accent on hover
          : getTailwindColor('background'), // bg-background normally
      color: state.isSelected
        ? getTailwindColor('primary-foreground') // text-primary-foreground if selected
        : getTailwindColor('foreground'), // text-foreground normally
      padding: '0.375rem 0.5rem', // py-1.5 px-2 (adjust for Check icon)
      borderRadius: '0.125rem', // rounded-sm
      display: 'flex',
      alignItems: 'center',
      cursor: 'default',
      // Data attributes for disabled not directly mapped, handle via isSelected/isDisabled
    }),
  };
};