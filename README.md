# TopicBlock

TopicBlock é uma extensão para Google Chrome que ajuda a tornar a leitura de portais e sites de notícias mais limpa e personalizada.

A extensão identifica conteúdos relacionados a assuntos ou pessoas que o usuário não deseja acompanhar e substitui esses conteúdos por um bloco visual discreto.

## Objetivo

Portais de notícias frequentemente repetem os mesmos assuntos durante vários dias. O TopicBlock permite reduzir esse excesso de conteúdo sem bloquear o site inteiro.

O usuário continua acessando normalmente seus portais preferidos, mas escolhe quais temas não deseja visualizar.

## Principais funcionalidades

### Grupos de assuntos

As palavras bloqueadas são organizadas em grupos, como:

- Influenciadores
- Música
- Conteúdo adulto
- Funk
- BBB
- Palavras personalizadas
- Assuntos hibernados

Cada grupo pode ser ativado ou desativado individualmente.

### Palavras personalizadas

O usuário pode adicionar seus próprios termos de bloqueio.

Quando uma notícia contém um desses termos, o TopicBlock identifica o card correspondente e oculta seu conteúdo.

### Hibernação de assuntos

Um assunto pode ser bloqueado temporariamente por 7, 15 ou 30 dias.

Esse recurso é útil para temas que dominam o noticiário durante um período, mas que não precisam ser bloqueados permanentemente.

Após o prazo definido, o assunto deixa de ser bloqueado automaticamente.

### Sites ignorados

O usuário pode cadastrar sites nos quais o TopicBlock não deve atuar.

Isso permite manter a extensão instalada e ativa sem interferir em páginas específicas.

### Ver página original

O botão **Ver página original** recarrega a página atual temporariamente sem aplicar os filtros do TopicBlock.

A próxima página acessada volta a utilizar os filtros normalmente.

### Exibir conteúdo bloqueado

Cada notícia bloqueada apresenta a opção **Exibir conteúdo bloqueado**.

Ao selecionar essa opção, o conteúdo original é restaurado e permanece destacado com fundo amarelo, indicando que foi inicialmente bloqueado e posteriormente revelado pelo usuário.

## Estados visuais

O TopicBlock utiliza três estados visuais:

- **Conteúdo normal:** mantém a aparência original do site.
- **Conteúdo bloqueado:** é substituído por um bloco cinza.
- **Conteúdo revelado:** volta a ser exibido com fundo amarelo.

## Estatísticas

O popup da extensão apresenta:

- quantidade de conteúdos bloqueados na sessão atual;
- total histórico de conteúdos bloqueados.

## Instalação para desenvolvimento

1. Baixe ou clone este repositório.
2. Abra o Chrome.
3. Acesse `chrome://extensions/`.
4. Ative o **Modo do desenvolvedor**.
5. Clique em **Carregar sem compactação**.
6. Selecione a pasta do TopicBlock.

Após alterações no código, volte à página de extensões e clique em **Recarregar**.

## Como usar

1. Clique no ícone do TopicBlock na barra do Chrome.
2. Ative ou desative os grupos desejados.
3. Adicione palavras personalizadas quando necessário.
4. Utilize a hibernação para assuntos temporários.
5. Cadastre sites que não devem ser filtrados.
6. Navegue normalmente pelos portais de notícias.

## Privacidade

As configurações da extensão são mantidas no armazenamento local do Chrome.

O TopicBlock analisa o conteúdo exibido nas páginas acessadas para identificar os termos configurados.

## Tecnologia

- Chrome Extension Manifest V3
- JavaScript
- HTML
- CSS
- Chrome Storage API
- MutationObserver

## Status do projeto

O TopicBlock está em desenvolvimento ativo.

O comportamento pode variar entre sites, pois cada portal utiliza uma estrutura HTML diferente e alguns recriam conteúdos dinamicamente após o carregamento da página.

## Licença

A licença do projeto ainda será definida.
