# Requirements Document

## Introduction

A tela de criação de conta (`RegisterPageComponent`) atualmente usa HTML nativo com CSS customizado, enquanto o restante do projeto (ex: `LoginPageComponent`, dashboard) já utiliza Angular Material com tema M3 (violet/cyan, dark/light). Esta feature migra a tela de registro para Angular Material, replicando o padrão visual e de interação já estabelecido no projeto, garantindo consistência de UI, acessibilidade e suporte ao toggle de tema.

## Glossary

- **Register_Page**: O componente `RegisterPageComponent` localizado em `src/app/features/auth/presentation/register-page/`.
- **Login_Page**: O componente `LoginPageComponent`, referência visual e de implementação para esta feature.
- **Material_Theme**: O tema Angular Material M3 definido em `src/styles.scss`, com paleta violet/cyan, suporte a dark e light mode, e tipografia Inter.
- **AuthFacade**: Serviço de aplicação `AuthFacade` que expõe os signals `loading`, `error` e o método `register()`.
- **ThemeService**: Serviço `ThemeService` que expõe `isDarkMode()` e `toggleTheme()`, responsável pelo controle do tema dark/light.
- **mat-form-field**: Componente Angular Material `MatFormFieldModule` com `appearance="outline"`.
- **mat-error**: Elemento filho de `mat-form-field` que exibe mensagens de validação integradas ao Material.
- **mat-flat-button**: Diretiva `mat-flat-button` do `MatButtonModule`, usada para o botão de submit primário.
- **mat-progress-bar**: Componente `MatProgressBarModule` com `mode="indeterminate"`, usado para indicar carregamento.
- **mat-card**: Componente `MatCardModule` que envolve o conteúdo do formulário.

---

## Requirements

### Requirement 1: Substituição da estrutura visual por Angular Material

**User Story:** Como usuário, quero que a tela de criação de conta tenha a mesma aparência do restante do aplicativo, para que eu tenha uma experiência visual consistente.

#### Acceptance Criteria

1. THE Register_Page SHALL renderizar o formulário de criação de conta dentro de um `mat-card` com `mat-card-content`.
2. THE Register_Page SHALL utilizar `mat-form-field` com `appearance="outline"` para cada campo do formulário (nome, email, senha).
3. THE Register_Page SHALL utilizar `matInput` como diretiva nos elementos `<input>` dentro de cada `mat-form-field`.
4. THE Register_Page SHALL utilizar `mat-flat-button` como diretiva no botão de submit.
5. THE Register_Page SHALL remover todos os estilos CSS hardcoded de cores (ex: `#1976d2`, `#fff`, `#f5f5f5`) e substituir por CSS custom properties do Material Theme (ex: `--mat-sys-surface`, `--mat-sys-on-surface`).

---

### Requirement 2: Consistência com o tema Material do projeto

**User Story:** Como desenvolvedor, quero que a Register_Page consuma o mesmo Material_Theme já configurado globalmente, para que mudanças de tema se reflitam automaticamente na tela de registro.

#### Acceptance Criteria

1. THE Register_Page SHALL aplicar `background: var(--mat-sys-surface)` e `color: var(--mat-sys-on-surface)` no container da página, replicando o padrão da Login_Page.
2. WHEN o usuário alterna entre dark mode e light mode, THE Register_Page SHALL refletir a mudança de tema sem recarregamento de página.
3. THE Register_Page SHALL importar apenas módulos Angular Material já utilizados no projeto (`MatCardModule`, `MatFormFieldModule`, `MatInputModule`, `MatButtonModule`, `MatIconModule`, `MatProgressBarModule`), sem introduzir novas dependências de UI.

---

### Requirement 3: Toggle de tema dark/light

**User Story:** Como usuário, quero poder alternar entre dark mode e light mode diretamente na tela de criação de conta, assim como posso fazer na tela de login.

#### Acceptance Criteria

1. THE Register_Page SHALL injetar o `ThemeService` e expô-lo ao template.
2. THE Register_Page SHALL renderizar um `mat-icon-button` posicionado no canto superior direito do `mat-card`, replicando o posicionamento da Login_Page.
3. WHEN o usuário clica no botão de toggle de tema, THE Register_Page SHALL invocar `themeService.toggleTheme()`.
4. THE Register_Page SHALL exibir o ícone `dark_mode` quando `themeService.isDarkMode()` retornar `true`, e o ícone `light_mode` quando retornar `false`.
5. THE Register_Page SHALL definir o atributo `aria-label` do botão de toggle com o valor `'Switch to light mode'` quando em dark mode e `'Switch to dark mode'` quando em light mode.

---

### Requirement 4: Feedback de carregamento

**User Story:** Como usuário, quero ver um indicador visual enquanto minha conta está sendo criada, para que eu saiba que a ação está em progresso.

#### Acceptance Criteria

1. WHEN `authFacade.loading()` retornar `true`, THE Register_Page SHALL renderizar um `mat-progress-bar` com `mode="indeterminate"`.
2. WHEN `authFacade.loading()` retornar `false`, THE Register_Page SHALL ocultar o `mat-progress-bar`.
3. WHILE `authFacade.loading()` retornar `true`, THE Register_Page SHALL manter o botão de submit com o atributo `disabled`.

---

### Requirement 5: Exibição de erros de validação via Material

**User Story:** Como usuário, quero ver mensagens de erro de validação integradas aos campos do formulário, para que eu saiba exatamente qual campo precisa ser corrigido.

#### Acceptance Criteria

1. WHEN o usuário submete o formulário com o campo nome vazio, THE Register_Page SHALL exibir um `mat-error` com a mensagem `'Name is required'` dentro do `mat-form-field` correspondente.
2. WHEN o usuário submete o formulário com o campo email vazio, THE Register_Page SHALL exibir um `mat-error` com a mensagem `'Email is required'` dentro do `mat-form-field` correspondente.
3. WHEN o usuário submete o formulário com um valor no campo email que não satisfaz o validador `Validators.email`, THE Register_Page SHALL exibir um `mat-error` com a mensagem `'Enter a valid email address'` dentro do `mat-form-field` correspondente.
4. WHEN o usuário submete o formulário com o campo senha vazio, THE Register_Page SHALL exibir um `mat-error` com a mensagem `'Password is required'` dentro do `mat-form-field` correspondente.
5. IF `authFacade.error()` retornar um valor não nulo, THEN THE Register_Page SHALL exibir a mensagem de erro com a cor `var(--mat-sys-error)`, replicando o padrão da Login_Page.

---

### Requirement 6: Remoção de componentes customizados substituídos

**User Story:** Como desenvolvedor, quero que os componentes de UI customizados (`LoadingIndicatorComponent`, `ErrorMessageComponent`) sejam removidos da Register_Page após a migração, para evitar duplicidade e manter o código limpo.

#### Acceptance Criteria

1. THE Register_Page SHALL remover `LoadingIndicatorComponent` dos imports do componente após a migração para `mat-progress-bar`.
2. THE Register_Page SHALL remover `ErrorMessageComponent` dos imports do componente após a migração para exibição de erro via elemento `<p>` com `var(--mat-sys-error)`, replicando o padrão da Login_Page.
3. THE Register_Page SHALL manter `ChangeDetectionStrategy.OnPush` e o uso de signals (`signal`, `inject`) sem alterações na lógica de negócio existente.

---

### Requirement 7: Layout responsivo e acessibilidade

**User Story:** Como usuário, quero que a tela de criação de conta seja utilizável em diferentes tamanhos de tela e acessível via teclado e leitores de tela.

#### Acceptance Criteria

1. THE Register_Page SHALL centralizar o `mat-card` vertical e horizontalmente na viewport com `min-height: 100vh`.
2. THE Register_Page SHALL limitar a largura do `mat-card` a `420px` como largura máxima, com `width: 100%` para telas menores.
3. THE Register_Page SHALL aplicar `padding: 1rem` no container da página para evitar que o card toque as bordas em telas pequenas.
4. THE Register_Page SHALL manter o atributo `autocomplete` nos campos de input (`name`, `email`, `new-password`) para suporte a gerenciadores de senha.
5. THE Register_Page SHALL manter o atributo `novalidate` no elemento `<form>` para delegar a validação ao Angular.
