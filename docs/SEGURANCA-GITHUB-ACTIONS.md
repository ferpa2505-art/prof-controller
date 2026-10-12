# Segurança do GitHub Actions

As ações externas nos workflows são fixadas em SHAs completos de commits, em vez
de tags mutáveis. O workflow `Validate action pins` verifica todos os arquivos
YAML em `.github/workflows` em cada pull request e push para `main`.

## Permissões dos workflows

| Workflow | Antes | Depois |
| --- | --- | --- |
| Android, iOS e Windows | Sem permissões explícitas; herdavam as permissões padrão do repositório. | `contents: read` para checkout e build. |
| GitHub Pages | `contents: read`, `pages: write` e `id-token: write` aplicados ao build e à publicação. | Build com `contents: read`; somente o job de publicação recebe `pages: write` e `id-token: write`. |
| Claude | `contents: write`, `pull-requests: write`, `issues: write`, `actions: read` e `id-token: write`. | Mantém esses escopos explícitos: escrita em `contents` para commits/branches, em pull requests e issues para responder; `actions: read` para consultar resultados de CI; e `id-token: write`, exigido pela autenticação do GitHub App Claude. |

O job do Claude continua limitado a eventos com `@claude` iniciados pelo dono do
repositório. As credenciais configuradas como secrets autenticam Claude; o token
OIDC continua necessário separadamente para a autenticação do GitHub App.
