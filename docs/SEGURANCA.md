# Segurança e segredos

## Segredos no repositório

Não versione tokens, senhas, chaves privadas, credenciais de serviços ou material de assinatura
dos aplicativos. Os arquivos `.env` e `.env.*` são ignorados pelo Git; somente arquivos
`.env.example` são permitidos como modelos.

Os valores de `legacy/server/.env.example` são exemplos e placeholders, não credenciais de
produção. Substitua-os por valores próprios antes de executar ou implantar o servidor legado.
Nunca coloque credenciais reais em um arquivo `.env.example`.

## GitHub Secret Scanning

O Secret Scanning e a push protection são controles das configurações do GitHub e não podem ser
ativados por um arquivo neste repositório. Um administrador deve abrir **Settings → Code security
and analysis** e habilitar **Secret scanning** e **Push protection** quando esses recursos estiverem
disponíveis para o repositório.

Revise os alertas gerados pelo GitHub. Se uma credencial for exposta, revogue-a ou faça sua rotação
imediatamente no serviço correspondente, remova-a dos arquivos e do histórico Git conforme o
procedimento da equipe e não publique seu valor em issues, pull requests ou logs.
