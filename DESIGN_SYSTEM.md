# Admin Panel - Design Specifications

## 🎨 Color Palette

### Primary Colors
- **Primary Blue**: `#1e3a8a` (Dark)
- **Accent Blue**: `#3b82f6` (Bright)
- **Gradient**: `linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)`

### Semantic Colors
- **Success**: `#d1fae5` (background), `#065f46` (text)
- **Error**: `#fee2e2` (background), `#991b1b` (text)
- **Info**: `#dbeafe` (background), `#0c4a6e` (text)
- **Warning**: `#fef3c7` (background), `#92400e` (text)

### Neutral Colors
- **Text Primary**: `#1f2937` (Dark gray)
- **Text Secondary**: `#6b7280` (Medium gray)
- **Border**: `#e5e7eb` (Light gray)
- **Background Secondary**: `#f3f4f6` (Very light gray)
- **Background**: `#ffffff` (White)

## 📐 Typography

### Font Family
- **Primary**: Inter (Google Fonts)
- **Fallback**: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif

### Font Sizes
```
h1: 1.8rem (28.8px)
h2: 1.3rem (20.8px)
h3: 1.1rem (17.6px)
Body: 0.95rem (15.2px)
Small: 0.85rem (13.6px)
Label: 0.9rem (14.4px)
```

### Font Weights
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

## 🎯 Component Specs

### Buttons

#### Primary Button
```css
background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
color: white;
padding: 10px 20px;
border-radius: 6px;
font-weight: 500;
font-size: 0.95rem;
cursor: pointer;
transition: all 0.3s ease;
```
**Hover**: `transform: translateY(-2px)`, `box-shadow: 0 10px 20px rgba(30, 58, 138, 0.2)`

#### Secondary Button
```css
background: #f3f4f6;
color: #1f2937;
border: 1px solid #e5e7eb;
padding: 10px 20px;
border-radius: 6px;
font-weight: 500;
```
**Hover**: `background: #e5e7eb`

#### Danger Button
```css
background: #ef4444;
color: white;
padding: 10px 20px;
border-radius: 6px;
font-weight: 500;
```
**Hover**: `background: #dc2626`

#### Small Button
```css
padding: 8px 12px;
font-size: 0.85rem;
flex: 1;
text-align: center;
```

### Form Elements

#### Input Field
```css
width: 100%;
padding: 10px 12px;
border: 1px solid #e5e7eb;
border-radius: 6px;
font-family: inherit;
font-size: 0.95rem;
color: #1f2937;
transition: all 0.3s ease;
```
**Focus**: 
- `border-color: #3b82f6`
- `box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1)`

#### Textarea
```css
/* Same as input */
resize: vertical;
min-height: 100px;
```

#### Select/Dropdown
```css
/* Same as input */
```

### Tag Chip
```css
background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(59, 130, 246, 0.1));
padding: 6px 12px;
border-radius: 4px;
display: flex;
align-items: center;
gap: 8px;
font-size: 0.9rem;
color: #3b82f6;
border: 1px solid rgba(37, 99, 235, 0.2);
```

### Card Component
```css
background: white;
padding: 20px;
border-radius: 10px;
border: 1px solid #e5e7eb;
transition: all 0.3s ease;
```
**Hover**: 
- `border-color: #3b82f6`
- `box-shadow: 0 10px 20px rgba(37, 99, 235, 0.1)`
- `transform: translateY(-5px)`

### Alert/Toast
```css
padding: 14px 18px;
border-radius: 8px;
margin-bottom: 20px;
font-size: 0.95rem;
animation: slideDown 0.3s ease-out;
```

**Success Alert**:
- `background: #d1fae5`
- `color: #065f46`
- `border: 1px solid #6ee7b7`

**Error Alert**:
- `background: #fee2e2`
- `color: #991b1b`
- `border: 1px solid #fca5a5`

**Info Alert**:
- `background: #dbeafe`
- `color: #0c4a6e`
- `border: 1px solid #93c5fd`

### Modal
```css
position: fixed;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: rgba(0, 0, 0, 0.5);
backdrop-filter: blur(4px);
display: flex;
align-items: center;
justify-content: center;
z-index: 1000;
```

**Modal Content**:
```css
background: white;
padding: 30px;
border-radius: 12px;
max-width: 500px;
width: 90%;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
```

## 🎬 Animations

### Slide Down (Alerts)
```css
@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```
**Duration**: 0.3s ease-out

### Loading Spinner
```css
@keyframes spin {
    to { transform: rotate(360deg); }
}
```
**Duration**: 0.8s linear infinite

### Button Hover Lift
```css
transform: translateY(-2px);
transition: all 0.3s ease;
```

### Card Hover Transform
```css
transform: translateY(-5px);
transition: all 0.3s ease;
```

## 📐 Spacing System

### Standard Spacing Values
- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 20px
- **2xl**: 24px
- **3xl**: 30px
- **4xl**: 40px

### Padding
- Form Section: 30px
- Cards: 20px
- Buttons: 10px 20px
- Form Groups: Bottom margin 20px

### Gaps
- Form Groups: 15px
- Buttons: 10px
- Tags: 8px
- Elements: 12px-30px depending on context

### Border Radius
- Large (modals, cards): 12px
- Medium (buttons, inputs): 6px
- Small (tags, badges): 4px
- Circular (avatars): 50%

## 📱 Responsive Design

### Desktop (>768px)
- 2-column layout: Form (1fr) | Posts (2fr)
- Gap: 30px
- Full width inputs
- Sticky form section

### Tablet (480px - 768px)
- Single column layout
- Adjusted spacing
- Form unsticks
- Cards in grid

### Mobile (<480px)
- Single column
- Reduced padding (20px → 15px)
- Smaller font sizes where possible
- Touch-friendly button heights (44px minimum)
- Full-width modals with 20px margin

## 🌈 Gradient Usage

### Primary Gradient (CTAs)
```css
background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
```

### Background Gradient
```css
background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
```

### Auth Screen Background
```css
background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
```

### Category Badge
```css
background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(59, 130, 246, 0.1));
```

### Section Header Accent
```css
background: linear-gradient(180deg, #1e3a8a, #3b82f6);
width: 4px;
height: 24px;
border-radius: 2px;
```

## 🎯 Focus States

### Keyboard Focus (Tab)
```css
outline: none;
border-color: #3b82f6;
box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
```

## 🖱️ Hover States

### Link/Button Hover
```css
opacity: increased;
color/background: adjusted;
transform: translateY(-2px);
box-shadow: elevated;
```

### Card Hover
```css
border-color: #3b82f6;
box-shadow: 0 10px 20px rgba(37, 99, 235, 0.1);
transform: translateY(-5px);
```

## 📏 Shadow System

```css
/* Small */
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

/* Medium */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

/* Large */
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

/* Modal */
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
```

## ♿ Accessibility

### Color Contrast
- Text on background: 7:1 ratio (AAA)
- Button text: 4.5:1 ratio (AA+)
- Labels: 4.5:1 ratio (AA+)

### Touch Targets
- Minimum 44×44px for mobile
- Spacing between clickable elements

### Focus Indicators
- Clear blue outline on focus
- Visible focus state for keyboard navigation

### Labels
- All form fields have associated labels
- Labels positioned above fields
- Placeholder text is not a substitute for labels

---

**Design System Version**: 1.0  
**Last Updated**: February 9, 2025  
**Framework**: CSS3 with Modern Standards
