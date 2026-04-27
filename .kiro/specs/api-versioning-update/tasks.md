# Plano de Implementacao: API Versioning Update

## Visao Geral

Atualizar todos os caminhos HTTP nos servicos de infraestrutura do frontend Angular de `/api/{recurso}` para `/api/v1/{recurso}`, incluindo os testes unitarios correspondentes. A abordagem e substituicao direta de strings, sem constante centralizada, mantendo o padrao existente do projeto.

## Tarefas

- [x] 1. Atualizar AlertsApiService e seus testes
  - [x] 1.1 Atualizar o caminho HTTP no `alerts-api.service.ts`
    - Substituir `/api/alerts` por `/api/v1/alerts` no metodo `list()`
    - Arquivo: `src/app/features/alerts/infrastructure/alerts-api.service.ts`
    - _Requisitos: 1.1_
  - [x] 1.2 Atualizar as URLs de expectativa no `alerts-api.service.spec.ts`
    - Substituir todas as ocorrencias de `/api/alerts` por `/api/v1/alerts` nos `httpTesting.expectOne()`
    - Arquivo: `src/app/features/alerts/infrastructure/alerts-api.service.spec.ts`
    - _Requisitos: 1.2_
  - [x] 1.3 Executar os testes do AlertsApiService e verificar que passam
    - Executar `npx vitest --run src/app/features/alerts/infrastructure/alerts-api.service.spec.ts`
    - _Requisitos: 1.2, 6.1_

- [x] 2. Atualizar AssetsApiService e seus testes
  - [x] 2.1 Atualizar os caminhos HTTP no `assets-api.service.ts`
    - Substituir `/api/assets` por `/api/v1/assets` nos metodos `list()` e `getByTicker()`
    - Arquivo: `src/app/features/assets/infrastructure/assets-api.service.ts`
    - _Requisitos: 2.1, 2.2_
  - [x] 2.2 Atualizar as URLs de expectativa no `assets-api.service.spec.ts`
    - Substituir todas as ocorrencias de `/api/assets` por `/api/v1/assets` nos `httpTesting.expectOne()`
    - Arquivo: `src/app/features/assets/infrastructure/assets-api.service.spec.ts`
    - _Requisitos: 2.3_
  - [x] 2.3 Executar os testes do AssetsApiService e verificar que passam
    - Executar `npx vitest --run src/app/features/assets/infrastructure/assets-api.service.spec.ts`
    - _Requisitos: 2.3, 6.1_

- [x] 3. Atualizar AuthApiService e seus testes
  - [x] 3.1 Atualizar os caminhos HTTP no `auth-api.service.ts`
    - Substituir `/api/auth/register` por `/api/v1/auth/register` no metodo `register()`
    - Substituir `/api/auth/login` por `/api/v1/auth/login` no metodo `login()`
    - Arquivo: `src/app/features/auth/infrastructure/auth-api.service.ts`
    - _Requisitos: 3.1, 3.2_
  - [x] 3.2 Atualizar as URLs de expectativa no `auth-api.service.spec.ts`
    - Substituir `/api/auth/register` por `/api/v1/auth/register` e `/api/auth/login` por `/api/v1/auth/login` nos `httpTesting.expectOne()`
    - Arquivo: `src/app/features/auth/infrastructure/auth-api.service.spec.ts`
    - _Requisitos: 3.3_
  - [x] 3.3 Executar os testes do AuthApiService e verificar que passam
    - Executar `npx vitest --run src/app/features/auth/infrastructure/auth-api.service.spec.ts`
    - _Requisitos: 3.3, 6.1_

- [x] 4. Checkpoint - Verificar progresso parcial
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Atualizar RulesApiService e seus testes
  - [x] 5.1 Atualizar os caminhos HTTP no `rules-api.service.ts`
    - Substituir `/api/rules` por `/api/v1/rules` nos metodos `list()`, `create()`, `update()` e `delete()`
    - Arquivo: `src/app/features/rules/infrastructure/rules-api.service.ts`
    - _Requisitos: 4.1, 4.2, 4.3, 4.4_
  - [x] 5.2 Atualizar as URLs de expectativa no `rules-api.service.spec.ts`
    - Substituir todas as ocorrencias de `/api/rules` por `/api/v1/rules` nos `httpTesting.expectOne()`
    - Arquivo: `src/app/features/rules/infrastructure/rules-api.service.spec.ts`
    - _Requisitos: 4.5_
  - [x] 5.3 Executar os testes do RulesApiService e verificar que passam
    - Executar `npx vitest --run src/app/features/rules/infrastructure/rules-api.service.spec.ts`
    - _Requisitos: 4.5, 6.1_

- [x] 6. Atualizar RuleGroupsApiService e seus testes
  - [x] 6.1 Atualizar o caminho HTTP no `rule-groups-api.service.ts`
    - Substituir `/api/rule-groups` por `/api/v1/rule-groups` nos metodos `list()` e `create()`
    - Arquivo: `src/app/features/rules/infrastructure/rule-groups-api.service.ts`
    - _Requisitos: 5.1, 5.2_
  - [x] 6.2 Atualizar as URLs de expectativa no `rule-groups-api.service.spec.ts`
    - Substituir todas as ocorrencias de `/api/rule-groups` por `/api/v1/rule-groups` nos `httpTesting.expectOne()`
    - Arquivo: `src/app/features/rules/infrastructure/rule-groups-api.service.spec.ts`
    - _Requisitos: 5.3_
  - [x] 6.3 Executar os testes do RuleGroupsApiService e verificar que passam
    - Executar `npx vitest --run src/app/features/rules/infrastructure/rule-groups-api.service.spec.ts`
    - _Requisitos: 5.3, 6.1_

- [x] 7. Checkpoint final - Executar todos os testes
  - Executar todos os testes da aplicacao para garantir que nenhum teste quebrou
  - Executar `npx vitest --run` para validacao completa
  - Ensure all tests pass, ask the user if questions arise.
  - _Requisitos: 6.1, 6.2_

## Notas

- Nenhuma tarefa de property-based testing e necessaria - o design confirma que PBT nao se aplica a esta feature
- Cada tarefa atualiza o servico E seu teste correspondente, seguido de execucao dos testes para validacao incremental
- A abordagem e substituicao direta de strings, sem constante centralizada, conforme decisao de design
- Todos os requisitos sao cobertos pelas tarefas de implementacao
