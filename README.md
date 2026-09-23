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

O bloco pode informar qual termo e grupo provocaram o bloqueio. Essa informação pode ser ocultada pelo controle *Exibir motivo do bloqueio*.

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

Após o prazo escolhido, o assunto deixa de ser bloqueado automaticamente. Isso também vale para páginas que continuam abertas.

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

O TopicBlock processa o texto das páginas no próprio navegador para aplicar as listas de bloqueio ativas. As configurações e os contadores são armazenados localmente, sem envio ao desenvolvedor ou a servidores da extensão.

A extensão não usa serviços de análise de uso, não mantém um histórico dos sites visitados e não vende dados. Não é necessário criar uma conta para utilizá-la.

Consulte a [Política de Privacidade / Privacy Policy](PRIVACY.md) para conhecer os dados processados, as permissões utilizadas e as opções de exclusão.

## Sobre o projeto e contato

O TopicBlock é um projeto pessoal e gratuito.

Para dúvidas, sugestões ou relato de problemas: [topicblockapp@gmail.com](mailto:topicblockapp@gmail.com).

## Como usar

1. Clique no ícone do TopicBlock na barra do Chrome.
2. Ative ou desative a extensão e a exibição do motivo do bloqueio.
3. Ative ou desative os grupos desejados.
4. Use a engrenagem para editar as palavras de um grupo padrão.
5. Adicione palavras personalizadas quando necessário.
6. Utilize a hibernação para assuntos temporários.
7. Cadastre sites que não devem ser filtrados.
8. Navegue normalmente pelos seus portais preferidos.

As alterações de palavras, grupos, hibernação, sites ignorados e ativação do filtro são aplicadas às páginas já abertas, sem recarregá-las. Conteúdos que deixarem de corresponder às regras são restaurados. Conteúdos revelados manualmente continuam visíveis naquela página.

## Tecnologia

* Chrome Extension Manifest V3
* JavaScript
* HTML
* CSS
* Chrome Storage API
* Chrome Internationalization API
* MutationObserver

## Versão e compatibilidade

Versão atual: **1.0.0**, para Google Chrome (Manifest V3).

O comportamento pode variar entre sites, pois cada portal utiliza uma estrutura HTML diferente e alguns recriam seus conteúdos dinamicamente após o carregamento da página.

## Licença

A licença do projeto ainda será definida.
