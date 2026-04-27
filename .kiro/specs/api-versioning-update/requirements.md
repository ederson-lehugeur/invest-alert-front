# Documento de Requisitos

## Introducao

O backend invest-alert-api foi versionado. Todos os endpoints agora incluem `/v1/` no caminho (ex: `/api/v1/rules` em vez de `/api/rules`). O frontend Angular precisa ser atualizado para que todos os servicos de infraestrutura apontem para os novos caminhos versionados, mantendo o comportamento funcional identico.

## Glossario

- **Frontend**: Aplicacao Angular 21 (invest-alert-front) que consome a API REST do backend.
- **Backend**: API REST invest-alert-api que fornece os endpoints versionados.
- **Servico_de_Infraestrutura**: Classe Angular `@Injectable` na camada de infraestrutura responsavel por realizar chamadas HTTP ao backend.
- **Caminho_Base_Versionado**: Prefixo `/api/v1` que deve preceder todos os caminhos de recurso nos endpoints da API.
- **AlertsApiService**: Servico de infraestrutura responsavel pelas chamadas HTTP relacionadas a alertas.
- **AssetsApiService**: Servico de infraestrutura responsavel pelas chamadas HTTP relacionadas a ativos.
- **AuthApiService**: Servico de infraestrutura responsavel pelas chamadas HTTP de autenticacao (registro e login).
- **RulesApiService**: Servico de infraestrutura responsavel pelas chamadas HTTP relacionadas a regras individuais.
- **RuleGroupsApiService**: Servico de infraestrutura responsavel pelas chamadas HTTP relacionadas a grupos de regras.
- **Teste_Unitario**: Arquivo `.spec.ts` que valida o comportamento do servico correspondente usando `HttpTestingController`.

## Requisitos

### Requisito 1: Atualizar caminhos do AlertsApiService

**User Story:** Como desenvolvedor frontend, eu quero que o AlertsApiService utilize o caminho versionado `/api/v1/alerts`, para que as chamadas HTTP sejam compativeis com o backend versionado.

#### Criterios de Aceitacao

1. WHEN o AlertsApiService realizar uma requisicao de listagem de alertas, THE AlertsApiService SHALL enviar a requisicao GET para o caminho `/api/v1/alerts` com os parametros de paginacao e filtro.
2. WHEN o Teste_Unitario do AlertsApiService for executado, THE Teste_Unitario SHALL validar que todas as requisicoes HTTP utilizam o prefixo `/api/v1/alerts`.

### Requisito 2: Atualizar caminhos do AssetsApiService

**User Story:** Como desenvolvedor frontend, eu quero que o AssetsApiService utilize os caminhos versionados `/api/v1/assets` e `/api/v1/assets/{ticker}`, para que as chamadas HTTP sejam compativeis com o backend versionado.

#### Criterios de Aceitacao

1. WHEN o AssetsApiService realizar uma requisicao de listagem de ativos, THE AssetsApiService SHALL enviar a requisicao GET para o caminho `/api/v1/assets` com os parametros de paginacao.
2. WHEN o AssetsApiService realizar uma requisicao de busca por ticker, THE AssetsApiService SHALL enviar a requisicao GET para o caminho `/api/v1/assets/{ticker}`.
3. WHEN o Teste_Unitario do AssetsApiService for executado, THE Teste_Unitario SHALL validar que todas as requisicoes HTTP utilizam o prefixo `/api/v1/assets`.

### Requisito 3: Atualizar caminhos do AuthApiService

**User Story:** Como desenvolvedor frontend, eu quero que o AuthApiService utilize os caminhos versionados `/api/v1/auth/register` e `/api/v1/auth/login`, para que as chamadas HTTP de autenticacao sejam compativeis com o backend versionado.

#### Criterios de Aceitacao

1. WHEN o AuthApiService realizar uma requisicao de registro, THE AuthApiService SHALL enviar a requisicao POST para o caminho `/api/v1/auth/register`.
2. WHEN o AuthApiService realizar uma requisicao de login, THE AuthApiService SHALL enviar a requisicao POST para o caminho `/api/v1/auth/login`.
3. WHEN o Teste_Unitario do AuthApiService for executado, THE Teste_Unitario SHALL validar que todas as requisicoes HTTP utilizam o prefixo `/api/v1/auth`.

### Requisito 4: Atualizar caminhos do RulesApiService

**User Story:** Como desenvolvedor frontend, eu quero que o RulesApiService utilize os caminhos versionados `/api/v1/rules` e `/api/v1/rules/{id}`, para que as chamadas HTTP de regras sejam compativeis com o backend versionado.

#### Criterios de Aceitacao

1. WHEN o RulesApiService realizar uma requisicao de listagem de regras, THE RulesApiService SHALL enviar a requisicao GET para o caminho `/api/v1/rules`.
2. WHEN o RulesApiService realizar uma requisicao de criacao de regra, THE RulesApiService SHALL enviar a requisicao POST para o caminho `/api/v1/rules`.
3. WHEN o RulesApiService realizar uma requisicao de atualizacao de regra, THE RulesApiService SHALL enviar a requisicao PUT para o caminho `/api/v1/rules/{id}`.
4. WHEN o RulesApiService realizar uma requisicao de exclusao de regra, THE RulesApiService SHALL enviar a requisicao DELETE para o caminho `/api/v1/rules/{id}`.
5. WHEN o Teste_Unitario do RulesApiService for executado, THE Teste_Unitario SHALL validar que todas as requisicoes HTTP utilizam o prefixo `/api/v1/rules`.

### Requisito 5: Atualizar caminhos do RuleGroupsApiService

**User Story:** Como desenvolvedor frontend, eu quero que o RuleGroupsApiService utilize o caminho versionado `/api/v1/rule-groups`, para que as chamadas HTTP de grupos de regras sejam compativeis com o backend versionado.

#### Criterios de Aceitacao

1. WHEN o RuleGroupsApiService realizar uma requisicao de listagem de grupos de regras, THE RuleGroupsApiService SHALL enviar a requisicao GET para o caminho `/api/v1/rule-groups`.
2. WHEN o RuleGroupsApiService realizar uma requisicao de criacao de grupo de regras, THE RuleGroupsApiService SHALL enviar a requisicao POST para o caminho `/api/v1/rule-groups`.
3. WHEN o Teste_Unitario do RuleGroupsApiService for executado, THE Teste_Unitario SHALL validar que todas as requisicoes HTTP utilizam o prefixo `/api/v1/rule-groups`.

### Requisito 6: Garantir compatibilidade completa com o backend versionado

**User Story:** Como desenvolvedor frontend, eu quero que todos os testes unitarios dos servicos de infraestrutura passem apos a atualizacao, para que eu tenha confianca de que a migracao foi realizada corretamente.

#### Criterios de Aceitacao

1. WHEN todos os Teste_Unitario dos servicos de infraestrutura forem executados, THE Frontend SHALL apresentar todos os testes passando sem falhas.
2. THE Frontend SHALL manter o comportamento funcional identico ao anterior, alterando exclusivamente os caminhos das URLs de `/api/` para `/api/v1/`.
