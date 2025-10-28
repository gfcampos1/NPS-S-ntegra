# 🎨 Design System - Síntegra NPS

Design system completo para o sistema de NPS, seguindo a identidade visual da Síntegra.

## 🎨 Paleta de Cores

### Cores Principais (Identidade Síntegra)

Baseadas nas imagens fornecidas da marca:

```css
/* Azuis - Cor principal da marca */
--sintegra-blue-light: #5BA4D9;    /* Azul claro - Fundos e destaques */
--sintegra-blue-primary: #4169B1;  /* Azul principal - CTAs e elementos principais */
--sintegra-blue-dark: #2E4A8F;     /* Azul escuro - Hover states */

/* Cinzas - Complementares */
--sintegra-gray-light: #A8A8A8;    /* Cinza claro - Bordas e texto secundário */
--sintegra-gray-medium: #6B6B6B;   /* Cinza médio - Ícones */
--sintegra-gray-dark: #3D3D3D;     /* Cinza escuro - Texto principal */
```

### Cores Funcionais (NPS e Feedback)

```css
/* NPS Scores */
--nps-promotor: #10B981;      /* Verde - Scores 9-10 */
--nps-neutro: #F59E0B;        /* Amarelo - Scores 7-8 */
--nps-detrator: #EF4444;      /* Vermelho - Scores 0-6 */

/* Status e Feedback */
--success: #10B981;           /* Sucesso, confirmações */
--warning: #F59E0B;           /* Avisos, atenção */
--error: #EF4444;             /* Erros, ações destrutivas */
--info: #3B82F6;              /* Informações */

/* Ratings (1-5) */
--rating-5: #10B981;          /* Excelente */
--rating-4: #84CC16;          /* Boa */
--rating-3: #F59E0B;          /* Regular */
--rating-2: #F97316;          /* Ruim */
--rating-1: #EF4444;          /* Péssima */
```

### Escala de Neutros (UI)

```css
/* Backgrounds */
--bg-primary: #FFFFFF;
--bg-secondary: #F9FAFB;
--bg-tertiary: #F3F4F6;

/* Borders */
--border-light: #E5E7EB;
--border-medium: #D1D5DB;
--border-dark: #9CA3AF;

/* Text */
--text-primary: #111827;
--text-secondary: #6B7280;
--text-tertiary: #9CA3AF;
--text-inverted: #FFFFFF;
```

## 🖌️ Tipografia

### Fontes

```css
/* Sistema de fontes */
--font-display: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Escala Tipográfica

```css
/* Headings */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */

/* Weights */
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

## 📐 Espaçamento

Sistema baseado em múltiplos de 4px:

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

## 🔲 Bordas e Sombras

### Border Radius

```css
--radius-sm: 0.25rem;   /* 4px - Small elements */
--radius-md: 0.5rem;    /* 8px - Inputs, buttons */
--radius-lg: 0.75rem;   /* 12px - Cards */
--radius-xl: 1rem;      /* 16px - Modals */
--radius-2xl: 1.5rem;   /* 24px - Hero sections */
--radius-full: 9999px;  /* Pills, avatars */
```

### Shadows

```css
/* Elevação */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

/* Sombra com cor da marca */
--shadow-brand: 0 10px 20px rgba(65, 105, 177, 0.15);
```

## 🎯 Componentes Base

### Botões

```tsx
// Primary (CTA principal)
<button className="
  bg-sintegra-blue-primary 
  hover:bg-sintegra-blue-dark 
  text-white 
  font-semibold 
  px-6 py-3 
  rounded-lg 
  shadow-md 
  transition-all 
  duration-200 
  hover:shadow-lg
">
  Enviar Formulário
</button>

// Secondary (Ações secundárias)
<button className="
  bg-white 
  border-2 
  border-sintegra-blue-primary 
  text-sintegra-blue-primary 
  hover:bg-sintegra-blue-primary 
  hover:text-white 
  font-semibold 
  px-6 py-3 
  rounded-lg 
  transition-all 
  duration-200
">
  Cancelar
</button>

// Danger (Ações destrutivas)
<button className="
  bg-error 
  hover:bg-red-600 
  text-white 
  font-semibold 
  px-6 py-3 
  rounded-lg 
  transition-all 
  duration-200
">
  Deletar
</button>
```

### Cards

```tsx
<div className="
  bg-white 
  rounded-lg 
  shadow-md 
  hover:shadow-lg 
  transition-shadow 
  duration-200 
  p-6 
  border 
  border-gray-100
">
  <h3 className="text-xl font-bold text-gray-900 mb-2">
    Título do Card
  </h3>
  <p className="text-gray-600">
    Descrição do conteúdo...
  </p>
</div>
```

### Inputs

```tsx
// Input padrão
<input 
  type="text"
  className="
    w-full 
    px-4 py-3 
    border-2 
    border-gray-200 
    rounded-lg 
    focus:border-sintegra-blue-primary 
    focus:outline-none 
    focus:ring-2 
    focus:ring-sintegra-blue-primary 
    focus:ring-opacity-20 
    transition-all 
    duration-200
  "
  placeholder="Digite aqui..."
/>

// Input com erro
<input 
  type="text"
  className="
    w-full 
    px-4 py-3 
    border-2 
    border-error 
    rounded-lg 
    focus:border-error 
    focus:outline-none 
    focus:ring-2 
    focus:ring-error 
    focus:ring-opacity-20
  "
/>
```

### Rating Scale (1-5)

```tsx
<div className="flex gap-2">
  {[1, 2, 3, 4, 5].map((value) => (
    <button
      key={value}
      className={`
        px-6 py-4 
        rounded-lg 
        font-bold 
        text-lg 
        transition-all 
        duration-200 
        ${selected === value 
          ? 'bg-sintegra-blue-primary text-white shadow-lg scale-105' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
      `}
    >
      {value}
    </button>
  ))}
</div>
```

### NPS Score Display

```tsx
<div className="text-center">
  <div className={`
    text-6xl 
    font-bold 
    mb-2
    ${score >= 50 ? 'text-nps-promotor' : 
      score >= 0 ? 'text-nps-neutro' : 
      'text-nps-detrator'}
  `}>
    {score}
  </div>
  <div className="text-gray-600 font-medium">
    NPS Score
  </div>
</div>
```

## 📱 Responsividade

### Breakpoints

```css
/* Mobile First */
--screen-sm: 640px;   /* Tablet portrait */
--screen-md: 768px;   /* Tablet landscape */
--screen-lg: 1024px;  /* Desktop */
--screen-xl: 1280px;  /* Large desktop */
--screen-2xl: 1536px; /* Extra large */
```

### Container

```css
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { max-width: 768px; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}
```

## 🎭 Animações

### Transitions

```css
/* Padrão */
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;

/* Específicas */
--transition-colors: color, background-color, border-color 200ms ease;
--transition-transform: transform 200ms ease;
--transition-shadow: box-shadow 200ms ease;
```

### Keyframes Úteis

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
```

## 📊 Gráficos e Visualizações

### Cores para Charts

```typescript
// Recharts configuration
export const chartColors = {
  primary: '#4169B1',      // Síntegra Blue
  secondary: '#5BA4D9',    // Síntegra Light Blue
  tertiary: '#A8A8A8',     // Síntegra Gray
  
  // NPS Segments
  promoters: '#10B981',
  passives: '#F59E0B',
  detractors: '#EF4444',
  
  // Multi-series
  series: [
    '#4169B1',  // Blue
    '#10B981',  // Green
    '#F59E0B',  // Orange
    '#8B5CF6',  // Purple
    '#EC4899',  // Pink
  ],
};
```

## 🌓 Dark Mode (Futuro)

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #111827;
    --bg-secondary: #1F2937;
    --bg-tertiary: #374151;
    
    --text-primary: #F9FAFB;
    --text-secondary: #D1D5DB;
    --text-tertiary: #9CA3AF;
    
    --border-light: #374151;
    --border-medium: #4B5563;
    --border-dark: #6B7280;
  }
}
```

## 🎨 Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        sintegra: {
          blue: {
            light: '#5BA4D9',
            DEFAULT: '#4169B1',
            dark: '#2E4A8F',
          },
          gray: {
            light: '#A8A8A8',
            medium: '#6B6B6B',
            dark: '#3D3D3D',
          },
        },
        nps: {
          promotor: '#10B981',
          neutro: '#F59E0B',
          detrator: '#EF4444',
        },
        rating: {
          1: '#EF4444',
          2: '#F97316',
          3: '#F59E0B',
          4: '#84CC16',
          5: '#10B981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'brand': '0 10px 20px rgba(65, 105, 177, 0.15)',
      },
    },
  },
}
```

## ✅ Checklist de Uso

- [ ] Usar cores da paleta Síntegra para elementos principais
- [ ] Aplicar cores NPS (verde/amarelo/vermelho) apenas em contextos de score
- [ ] Manter consistência de espaçamento (múltiplos de 4px)
- [ ] Garantir contraste mínimo 4.5:1 (WCAG AA)
- [ ] Testar responsividade em mobile (375px) e desktop (1920px)
- [ ] Aplicar animações sutis (200ms) para transições
- [ ] Usar shadow-brand para destacar elementos da Síntegra

---

**Desenvolvido para manter a identidade visual da Síntegra em todo o sistema**
