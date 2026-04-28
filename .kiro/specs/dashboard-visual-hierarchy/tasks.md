# Implementation Plan: Dashboard Visual Hierarchy

## Overview

Aplicar melhorias de hierarquia visual ao layout shell via SCSS puro. Nenhuma lógica TypeScript nova é necessária. As mudanças se restringem a três arquivos SCSS de componentes e, opcionalmente, `src/styles.scss` para aliases semânticos de variáveis.

## Tasks

- [x] 1. Adicionar variáveis CSS de alias semântico em `styles.scss`
  - Adicionar bloco de variáveis `--layout-sidebar-bg` e `--layout-topbar-bg` como aliases de `--mat-sys-surface-container` e `--mat-sys-surface-container-high` no escopo `:root`
  - Não adicionar fallbacks hexadecimais - os tokens M3 já estão disponíveis via `mat.all-component-themes()`
  - Inserir o bloco após a seção `Financial Indicator Custom Properties`, antes do CSS Reset
  - _Requirements: 6.1, 6.4_

- [x] 2. Implementar separação visual e background da Sidebar
  - [x] 2.1 Aplicar background e altura total no `:host` do `sidebar.component.scss`
    - Adicionar `:host { display: block; height: 100%; background-color: var(--layout-sidebar-bg, var(--mat-sys-surface-container)); }`
    - Atualizar `.sidebar-nav` para incluir `height: 100%`
    - _Requirements: 1.1, 1.4_

  - [x] 2.2 Aplicar tipografia e espaçamento nos nav items em `sidebar.component.scss`
    - Adicionar seletor `a[mat-list-item]` com `margin-bottom: 2px`
    - Adicionar seletor `[matListItemTitle]` com `font-weight: 500` e `font-size: 14px`
    - _Requirements: 2.2, 2.4_

  - [x] 2.3 Implementar hover state nos nav items em `sidebar.component.scss`
    - Adicionar `a[mat-list-item]:not(.active-link):hover` com `background-color: var(--mat-sys-surface-container-highest)` e `transition: background-color 150ms ease`
    - _Requirements: 2.3_

  - [x] 2.4 Adicionar border-left indicator no `.active-link` em `sidebar.component.scss`
    - Adicionar `border-left: 3px solid var(--mat-sys-secondary)` ao seletor `.active-link` existente
    - _Requirements: 3.3, 3.4_

- [x] 3. Implementar separação visual da Topbar em `topbar.component.scss`
  - Atualizar `.topbar` com `background-color: var(--layout-topbar-bg, var(--mat-sys-surface-container-high))`
  - Adicionar `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)` ao `.topbar`
  - Atualizar `z-index` de `1` para `10` no `.topbar`
  - Atualizar `.app-name` com `font-size: 1rem` (16px)
  - _Requirements: 4.1, 4.2, 4.4, 7.3_

- [x] 4. Aplicar box-shadow lateral no `mat-sidenav` em `layout-shell.component.scss`
  - Adicionar `box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15)` ao seletor `mat-sidenav` existente
  - _Requirements: 1.2, 5.2, 5.3_

- [x] 5. Checkpoint - Verificar consistência visual e ausência de valores hardcoded
  - Confirmar que nenhum arquivo SCSS de layout contém valores hexadecimais ou RGB para cores de superfície (apenas sombras `rgba` são permitidas)
  - Confirmar que sidebar usa `--mat-sys-surface-container` e topbar usa `--mat-sys-surface-container-high` (mesma família de tokens)
  - Confirmar que ambos os separadores usam `box-shadow` (consistência de linguagem visual)
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 5.1, 5.2, 6.1_

## Notes

- Nenhuma lógica TypeScript nova é necessária - todas as mudanças são exclusivamente SCSS
- Os tokens `--mat-sys-*` são resolvidos automaticamente pelo browser quando `ThemeService` alterna a classe `html.light-theme`, garantindo compatibilidade com ambos os temas sem código adicional
- O `box-shadow` da topbar usa `rgba` para a sombra (não para cor de superfície), o que é aceitável pois sombras não fazem parte do sistema de tokens de cor M3
- Tasks 2.1 a 2.4 modificam o mesmo arquivo (`sidebar.component.scss`) e devem ser executadas em sequência para evitar conflitos de seletor
