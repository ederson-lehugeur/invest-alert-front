# Requirements Document

## Introduction

Esta feature melhora a hierarquia visual e a separação entre os elementos de navegação (sidebar e topbar) e o conteúdo principal do dashboard da aplicação InvestAlert. O objetivo é eliminar a sensação de "bloco único" que o layout atual transmite, aplicando contraste de cor, sombras, tipografia e estados visuais consistentes com padrões modernos de dashboards SaaS. A implementação deve respeitar o sistema de temas claro/escuro já existente (Angular Material M3 com paleta violet/cyan) e as variáveis CSS definidas em `styles.scss`.

## Glossary

- **Sidebar**: Componente `SidebarComponent` - painel de navegação lateral esquerdo, implementado com `mat-sidenav` e `mat-nav-list`, largura fixa de 240px.
- **Topbar**: Componente `TopbarComponent` - barra superior fixa (`position: sticky`), implementada com `mat-toolbar`.
- **Layout_Shell**: Componente `LayoutShellComponent` - shell principal que orquestra `mat-sidenav-container`, Sidebar e Topbar.
- **Active_Link**: Item de navegação da Sidebar cujo `routerLinkActive` está ativo, indicando a rota atual.
- **Main_Content**: Área de conteúdo principal renderizada dentro de `mat-sidenav-content`, abaixo da Topbar.
- **Theme**: Estado de tema da aplicação (escuro por padrão, claro via classe `html.light-theme`), gerenciado pelo `ThemeService`.
- **Depth_Separator**: Elemento visual (sombra, borda ou variação de cor de fundo) que cria percepção de profundidade e separação entre regiões do layout.
- **Nav_Item**: Elemento `<a mat-list-item>` dentro da Sidebar que representa um link de navegação.

---

## Requirements

### Requirement 1: Separação visual da Sidebar em relação ao conteúdo principal

**User Story:** Como usuário do dashboard, quero que a sidebar seja visualmente distinta do conteúdo principal, para que eu consiga identificar rapidamente a área de navegação sem esforço cognitivo.

#### Acceptance Criteria

1. THE Sidebar SHALL aplicar uma cor de fundo (`background-color`) diferente da cor de fundo do Main_Content, utilizando tokens do sistema Material M3 (`--mat-sys-surface-container` ou equivalente) para garantir compatibilidade com ambos os Themes.
2. THE Sidebar SHALL exibir um Depth_Separator na borda direita - uma sombra lateral (`box-shadow`) ou borda sutil (`border-right`) - que crie percepção de profundidade sem sobrepor o conteúdo.
3. WHEN o Theme é alterado para claro ou escuro, THE Sidebar SHALL atualizar automaticamente as cores de fundo e do Depth_Separator sem recarregamento de página.
4. THE Sidebar SHALL ocupar 100% da altura do viewport disponível dentro do `mat-sidenav-container`.

---

### Requirement 2: Legibilidade e espaçamento dos itens de navegação da Sidebar

**User Story:** Como usuário do dashboard, quero que os itens de navegação sejam fáceis de ler e clicar, para que eu navegue com eficiência e conforto.

#### Acceptance Criteria

1. THE Sidebar SHALL aplicar padding interno horizontal de no mínimo 8px e vertical de no mínimo 4px em cada Nav_Item, garantindo área de toque adequada.
2. THE Sidebar SHALL exibir o label de cada Nav_Item com `font-weight` de no mínimo 500 e tamanho de fonte de no mínimo 14px.
3. WHEN o cursor é posicionado sobre um Nav_Item não ativo, THE Sidebar SHALL exibir um estado de hover com alteração de cor de fundo distinta do estado padrão e do estado ativo, com transição de no máximo 200ms.
4. THE Sidebar SHALL manter espaçamento vertical consistente entre Nav_Items, com gap ou padding que resulte em separação visual de no mínimo 2px entre itens adjacentes.

---

### Requirement 3: Identificação clara do item de navegação ativo

**User Story:** Como usuário do dashboard, quero saber claramente em qual seção estou navegando, para que eu mantenha orientação dentro da aplicação.

#### Acceptance Criteria

1. WHEN um Nav_Item corresponde à rota ativa, THE Sidebar SHALL aplicar ao Active_Link uma cor de fundo de alto contraste em relação ao fundo da Sidebar, utilizando `--mat-sys-secondary-container` ou token equivalente do Material M3.
2. WHEN um Nav_Item corresponde à rota ativa, THE Sidebar SHALL aplicar ao Active_Link uma cor de texto e ícone que contraste com o fundo do Active_Link, com razão de contraste mínima de 4.5:1 conforme WCAG 2.1 AA.
3. WHEN um Nav_Item corresponde à rota ativa, THE Sidebar SHALL exibir um indicador visual adicional - como borda esquerda destacada (`border-left`) ou borda arredondada no item - para reforçar o estado ativo além da mudança de cor de fundo.
4. WHEN o Theme é alterado, THE Sidebar SHALL manter a distinção visual do Active_Link em relação aos Nav_Items inativos em ambos os Themes.

---

### Requirement 4: Separação visual da Topbar em relação ao conteúdo principal

**User Story:** Como usuário do dashboard, quero que a barra superior seja claramente separada do conteúdo abaixo dela, para que eu identifique imediatamente os controles globais da aplicação.

#### Acceptance Criteria

1. THE Topbar SHALL aplicar uma cor de fundo distinta da cor de fundo do Main_Content, utilizando tokens do sistema Material M3 compatíveis com ambos os Themes.
2. THE Topbar SHALL exibir um Depth_Separator na borda inferior - uma sombra (`box-shadow`) ou linha divisória (`border-bottom`) - que delimite visualmente a Topbar do conteúdo abaixo.
3. WHEN o Theme é alterado, THE Topbar SHALL atualizar automaticamente as cores de fundo e do Depth_Separator sem recarregamento de página.
4. THE Topbar SHALL manter `position: sticky` e `z-index` superior ao do Main_Content, garantindo que permaneça visível durante a rolagem do conteúdo.

---

### Requirement 5: Consistência visual entre Sidebar e Topbar

**User Story:** Como usuário do dashboard, quero que a sidebar e a topbar formem um conjunto visual coeso, para que a interface transmita profissionalismo e consistência.

#### Acceptance Criteria

1. THE Layout_Shell SHALL garantir que as cores de fundo da Sidebar e da Topbar pertençam à mesma família de tokens do Material M3 (superfícies elevadas), criando coesão visual entre os dois elementos de navegação.
2. THE Layout_Shell SHALL garantir que os Depth_Separators da Sidebar e da Topbar utilizem a mesma abordagem técnica (ambos sombra ou ambos borda), mantendo consistência de linguagem visual.
3. WHEN o modo mobile está ativo (`max-width: 767.98px`) e a Sidebar opera em modo `over`, THE Layout_Shell SHALL garantir que a Sidebar sobreponha o Main_Content com sombra lateral adequada para indicar sobreposição de camada.

---

### Requirement 6: Compatibilidade com o sistema de temas claro e escuro

**User Story:** Como usuário do dashboard, quero que as melhorias visuais funcionem corretamente em ambos os temas (claro e escuro), para que a experiência seja consistente independentemente da minha preferência de tema.

#### Acceptance Criteria

1. THE Layout_Shell SHALL utilizar exclusivamente tokens CSS do sistema Material M3 (`--mat-sys-*`) ou variáveis CSS definidas em `styles.scss` para todas as propriedades de cor, proibindo valores hexadecimais ou RGB hardcoded nos arquivos SCSS dos componentes de layout.
2. WHEN a classe `html.light-theme` é aplicada, THE Sidebar SHALL exibir cores de fundo e separadores adequados ao tema claro, com contraste suficiente para leitura.
3. WHEN a classe `html.light-theme` é aplicada, THE Topbar SHALL exibir cores de fundo e separadores adequados ao tema claro, com contraste suficiente para leitura.
4. IF um token CSS do Material M3 não estiver disponível para um caso de uso específico, THEN THE Layout_Shell SHALL definir variáveis CSS customizadas com fallback explícito para ambos os Themes em `styles.scss`.

---

### Requirement 7: Acessibilidade e feedback visual dos controles da Topbar

**User Story:** Como usuário do dashboard, quero que os botões da topbar tenham feedback visual claro ao interagir com eles, para que eu saiba que minhas ações foram reconhecidas.

#### Acceptance Criteria

1. THE Topbar SHALL manter `aria-label` descritivo em todos os botões de ação (toggle de tema, logout, toggle de menu mobile).
2. WHEN o cursor é posicionado sobre um botão da Topbar, THE Topbar SHALL exibir estado de hover visível, aproveitando os estados ripple e hover nativos do Angular Material.
3. THE Topbar SHALL exibir o nome da aplicação ("InvestAlert") com `font-weight` de no mínimo 500 e tamanho de fonte de no mínimo 16px, garantindo legibilidade como elemento de identidade visual.
