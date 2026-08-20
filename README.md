# TopicBlock

*Navegue sem distrações.*

TopicBlock é uma extensão gratuita para Google Chrome que torna a leitura de portais e sites de notícias mais limpa, tranquila e personalizada.

Não gosta de determinado assunto? *Bloqueie.*

Cansou de ver a mesma notícia viralizada? *Hiberne o assunto por alguns dias.*

Você continua acessando normalmente seus sites preferidos, mas escolhe quais conteúdos merecem a sua atenção.

## Por que usar o TopicBlock?

Portais de notícias frequentemente repetem os mesmos assuntos durante vários dias. Outros conteúdos podem simplesmente não fazer parte dos interesses do usuário.

O TopicBlock ajuda a reduzir esse excesso sem bloquear o acesso ao site inteiro.

* Navegação mais limpa e personalizada
* Menos notícias repetitivas ou viralizadas
* Bloqueios permanentes ou temporários
* Ícone discreto no navegador
* Controle total do usuário
* Interface em português do Brasil e inglês
* Sem monitoramento da navegação
* Sem venda de dados
* Sempre gratuito

## Como funciona

O TopicBlock identifica conteúdos relacionados a assuntos, palavras ou pessoas que o usuário não deseja acompanhar.

Quando encontra um termo configurado, a extensão oculta o card correspondente e o substitui por um bloco visual discreto.

Durante a fase de testes, o bloco informa qual termo e grupo provocaram o bloqueio para facilitar a identificação de falsos positivos.

O conteúdo não é removido do site e pode ser revelado pelo usuário a qualquer momento.

## Principais funcionalidades

### Grupos de assuntos

As palavras bloqueadas são organizadas em grupos, como:

* Influenciadores
* Música
* Conteúdo adulto
* Funk
* BBB
* Palavras personalizadas
* Assuntos hibernados

Cada grupo pode ser ativado ou desativado individualmente. As listas dos
grupos padrão também podem ser editadas pelo usuário no popup da extensão.

### Sobre as listas padrão

As listas padrão do TopicBlock refletem exclusivamente preferências pessoais do desenvolvedor e servem como uma configuração inicial e um exemplo de uso da extensão.

A presença de uma pessoa, assunto ou termo nessas listas não representa crítica, acusação, juízo de valor ou afirmação de qualquer conduta inadequada. Em muitos casos, não existe outro motivo além da escolha pessoal de não acompanhar determinado conteúdo.

A proposta do TopicBlock é justamente permitir que cada usuário escolha o que deseja ou não ver. Todas as palavras e grupos podem ser editados, removidos ou desativados de acordo com as preferências de cada pessoa.

### Palavras personalizadas

O usuário pode adicionar seus próprios termos de bloqueio.

Quando uma notícia contém um desses termos, o TopicBlock identifica o card correspondente e oculta seu conteúdo.

Não gosta de determinado assunto? Adicione uma palavra e deixe o TopicBlock cuidar do restante.

### Hibernação de assuntos

Um assunto pode ser bloqueado temporariamente por 7, 15 ou 30 dias.

Esse recurso é útil para notícias e temas que dominam o noticiário durante determinado período, mas que não precisam ser bloqueados permanentemente.

Após o prazo escolhido, o assunto deixa de ser bloqueado automaticamente.

### Sites ignorados

O usuário pode cadastrar sites nos quais o TopicBlock não deve atuar.

O site aberto também pode ser ignorado com um único clique no popup.

Isso permite manter a extensão instalada e ativa sem interferir em páginas específicas.

### Ver página original

O botão *Ver página original* recarrega temporariamente a página atual sem aplicar os filtros do TopicBlock.

A próxima página acessada volta a utilizar os filtros normalmente.

### Motivo do bloqueio

Por padrão, cada bloco informa qual palavra e grupo causaram o bloqueio. O controle *Exibir motivo do bloqueio*, disponível na seção *Geral* do popup, permite ocultar ou voltar a exibir essa informação.

### Exibir conteúdo bloqueado

Cada notícia bloqueada apresenta a opção *Exibir conteúdo bloqueado*.

Ao selecionar essa opção, o conteúdo original é restaurado e permanece destacado com fundo amarelo, indicando que foi inicialmente bloqueado e posteriormente revelado pelo usuário.

## Estados visuais

O TopicBlock utiliza três estados visuais:

* *Conteúdo normal:* mantém a aparência original do site.
* *Conteúdo bloqueado:* é substituído por um bloco cinza discreto.
* *Conteúdo revelado:* volta a ser exibido com fundo amarelo.

## Estatísticas

O popup da extensão apresenta:

* quantidade de conteúdos bloqueados na sessão atual;
* total histórico de conteúdos bloqueados.

## Privacidade

O TopicBlock foi desenvolvido para filtrar conteúdos, não para monitorar usuários.

As configurações da extensão são mantidas no armazenamento local do Chrome.

A extensão analisa o conteúdo exibido na página atual somente para identificar os termos configurados pelo próprio usuário.

O TopicBlock:

* não monitora o histórico de navegação;
* não cria perfis de navegação;
* não vende dados dos usuários.

## Uso corporativo e customizações

O TopicBlock também pode ser adaptado para empresas, instituições de ensino e outros ambientes que desejem reduzir distrações durante o trabalho ou estudo — sem monitorar a atividade dos usuários.

Projetos personalizados podem incluir:

* listas de assuntos definidas conforme as necessidades da organização;
* grupos e regras de filtragem específicos;
* configuração dos sites nos quais o filtro deve ou não atuar;
* identidade visual personalizada;
* recursos adicionais para implantação e administração corporativa.

A extensão TopicBlock continuará gratuita.

Empresas interessadas em customizações específicas ou parcerias podem entrar em contato:

*Contato:* [topicblockapp@gmail.com](mailto:topicblockapp@gmail.com)

## Como usar

1. Clique no ícone do TopicBlock na barra do Chrome.
2. Ative ou desative a extensão e a exibição do motivo do bloqueio.
3. Ative ou desative os grupos desejados.
4. Use a engrenagem para editar as palavras de um grupo padrão.
5. Adicione palavras personalizadas quando necessário.
6. Utilize a hibernação para assuntos temporários.
7. Cadastre sites que não devem ser filtrados.
8. Navegue normalmente pelos seus portais preferidos.

## Instalação para desenvolvimento

1. Baixe ou clone este repositório.
2. Abra o Google Chrome.
3. Acesse `chrome://extensions/`.
4. Ative o *Modo do desenvolvedor*.
5. Clique em *Carregar sem compactação*.
6. Selecione a pasta do TopicBlock.

Após realizar alterações no código, volte à página de extensões e clique em *Recarregar*.

## Tecnologia

* Chrome Extension Manifest V3
* JavaScript
* HTML
* CSS
* Chrome Storage API
* Chrome Internationalization API
* MutationObserver

## Testes

Os testes permanentes de correspondência de palavras, migração de configurações, sites ignorados e traduções podem ser executados com:

```bash
node --test
```

## Status do projeto

O TopicBlock 0.6.0 está em desenvolvimento ativo e em fase de testes.

O comportamento pode variar entre sites, pois cada portal utiliza uma estrutura HTML diferente e alguns recriam seus conteúdos dinamicamente após o carregamento da página.

## Licença

A licença do projeto ainda será definida.
