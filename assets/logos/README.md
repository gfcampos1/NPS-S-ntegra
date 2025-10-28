# 📁 Logos Síntegra

## Instruções

Coloque nesta pasta os logos da Síntegra nos seguintes formatos:

### Arquivos Necessários

```
logos/
├── sintegra-logo.svg          # Versão vetorial (preferencial)
├── sintegra-logo.png          # 120x120px (mínimo)
├── sintegra-logo@2x.png       # 240x240px (retina)
├── sintegra-logo@3x.png       # 360x360px (retina)
├── sintegra-icon.svg          # Apenas o ícone (sem texto)
└── sintegra-favicon.ico       # 32x32px para navegador
```

## Especificações

### Dimensões Recomendadas
- **Logo Principal**: 120x120px (mínimo)
- **Retina 2x**: 240x240px
- **Retina 3x**: 360x360px
- **Favicon**: 32x32px

### Formatos
- **Preferencial**: SVG (escalável, peso leve)
- **Alternativo**: PNG com fundo transparente
- **Favicon**: ICO ou PNG

## Variações de Cor

Com base na identidade visual anexada, o logo possui as seguintes variações:

1. **Azul Claro** (#5BA4D9) - Fundo claro
2. **Azul Escuro** (#4169B1) - Fundo escuro
3. **Cinza Claro** (#A8A8A8) - Versão neutra
4. **Cinza Escuro** (#3D3D3D) - Alto contraste

## Uso no Projeto

```tsx
// Exemplo de uso no Next.js
import Image from 'next/image';
import logo from '@/assets/logos/sintegra-logo.svg';

<Image 
  src={logo} 
  alt="Síntegra" 
  width={120} 
  height={120}
  priority
/>
```

## Otimização

Antes de adicionar as imagens:
- ✅ Comprima PNGs (TinyPNG, ImageOptim)
- ✅ Otimize SVGs (SVGO, SVGOMG)
- ✅ Mantenha transparência
- ✅ Remova metadados desnecessários

---

**Nota**: Após adicionar os logos, remova este arquivo README.md
