# Política de Privacidade / Privacy Policy — TopicBlock

Última atualização / Last updated: 23/09/2026

## Português (Brasil)

### Sobre esta política

O TopicBlock é uma extensão gratuita para Google Chrome, mantida como projeto pessoal. Sua finalidade é ocultar conteúdos de páginas que correspondam às listas de palavras e assuntos ativas, incluindo assuntos hibernados temporariamente.

Esta política descreve o funcionamento da extensão. Contato do desenvolvedor para questões de privacidade: [topicblockapp@gmail.com](mailto:topicblockapp@gmail.com).

### Dados processados e finalidade

O processamento ocorre no próprio navegador:

| Dados | Uso e armazenamento |
| --- | --- |
| Texto e elementos das páginas acessíveis à extensão | Identificar termos nas listas ativas e ocultar os cards correspondentes. Os elementos originais são mantidos temporariamente na memória da página para permitir sua restauração; a extensão não salva um arquivo ou histórico desses conteúdos. |
| Palavras, grupos, assuntos hibernados e datas de expiração | Aplicar as preferências de bloqueio. São salvos no armazenamento local da extensão. |
| Sites ignorados e opções do filtro | Definir onde e como o filtro atua. São salvos no armazenamento local da extensão. |
| Endereço da página e domínio da aba ativa | Verificar sites ignorados e atender às ações do popup. Ao usar “Ver página original”, o endereço atual é guardado temporariamente no `sessionStorage` da página e removido na próxima execução do filtro após o recarregamento. Esse armazenamento pertence à página e pode ser acessado por scripts do próprio site. |
| Quantidade de bloqueios | Exibir estatísticas numéricas. O total é salvo localmente; o contador da sessão usa o armazenamento temporário de sessão da extensão. Esses contadores não guardam quais sites ou textos foram bloqueados. |

A extensão não mantém um histórico de navegação nem cria perfis para publicidade. Os logs de diagnóstico estão desativados na versão distribuída; mensagens de erro podem aparecer no console local do navegador e não são enviadas automaticamente ao desenvolvedor.

### Transmissão e compartilhamento

O TopicBlock não envia o conteúdo das páginas, as configurações ou os contadores ao desenvolvedor ou a servidores externos. Não utiliza serviços de análise de uso, rastreadores publicitários ou sincronização dessas informações por `chrome.storage.sync`. Não vende nem compartilha esses dados com anunciantes.

Os sites visitados continuam sujeitos às suas próprias políticas e podem realizar suas próprias requisições de rede. Esta política não cobre o tratamento de dados feito pelo Chrome, pela Chrome Web Store, pelo GitHub ou pelos sites visitados.

Se você enviar um e-mail ao contato do projeto, o desenvolvedor receberá seu endereço e o conteúdo que você escolher enviar para responder à solicitação. Esse contato é voluntário, ocorre pelo serviço de e-mail e não é um envio automático feito pela extensão.

### Permissões

- **`storage`:** salvar preferências e estatísticas no navegador.
- **`tabs`:** consultar a aba ativa e seu endereço para as ações do popup, como ignorar o site atual e mostrar a página original. A extensão também envia comandos ao filtro dessa aba e pode recarregá-la a pedido do usuário.
- **Acesso aos sites (`<all_urls>`):** permitir a execução automática do filtro nas páginas autorizadas pelo Chrome, inclusive em conteúdo carregado dinamicamente. O usuário pode cadastrar sites ignorados e controlar o acesso da extensão nas configurações do Chrome.

Esses acessos são usados para os recursos de filtragem e controle descritos acima.

### Retenção, controle e exclusão

Você pode editar ou remover palavras e sites ignorados, excluir assuntos hibernados e desativar grupos ou o filtro pelo popup. Assuntos hibernados deixam de bloquear após a expiração; as entradas expiradas são removidas da configuração ao abrir o popup.

As preferências e o total de bloqueios permanecem no armazenamento local até serem alterados ou até a remoção dos dados da extensão. Desinstalar o TopicBlock pelo Chrome remove seu armazenamento de extensão. Fechar a aba encerra o armazenamento temporário da página usado para “Ver página original”. Desativar o filtro não apaga suas preferências ou estatísticas.

O desenvolvedor não recebe uma cópia dos dados locais para consultá-los ou apagá-los remotamente. Para dúvidas ou solicitações relativas a mensagens enviadas por e-mail, utilize o contato acima.

### Atualizações

Alterações nesta política serão publicadas neste arquivo com a data de atualização. Mudanças no tratamento de dados deverão ser refletidas aqui e nas declarações da Chrome Web Store.

## English

### About this policy

TopicBlock is a free Google Chrome extension maintained as a personal project. Its purpose is to hide page content matching enabled word and topic lists, including temporarily hibernated topics.

This policy describes the extension's behavior. Developer contact for privacy questions: [topicblockapp@gmail.com](mailto:topicblockapp@gmail.com).

### Data processed and its purpose

Processing takes place in your browser:

| Data | Use and storage |
| --- | --- |
| Text and elements of pages accessible to the extension | Match enabled lists and hide corresponding cards. Original elements are temporarily retained in page memory for restoration; the extension does not save an archive or history of that content. |
| Words, groups, hibernated topics and expiration dates | Apply blocking preferences. Stored in the extension's local storage. |
| Ignored sites and filter options | Determine where and how filtering operates. Stored in the extension's local storage. |
| Page address and active tab domain | Check ignored sites and support popup actions. “View original page” temporarily stores the current address in the page's `sessionStorage`, then removes it the next time the filter runs after reloading. This storage belongs to the page and can be accessed by the site's own scripts. |
| Number of blocked items | Display numerical statistics. The total is stored locally; the session count uses the extension's temporary session storage. These counters do not record which sites or texts were blocked. |

The extension does not maintain a browsing history or create advertising profiles. Diagnostic logging is disabled in the distributed version; errors may appear in the browser's local console and are not automatically sent to the developer.

### Transmission and sharing

TopicBlock does not send page content, settings or counters to the developer or external servers. It does not use analytics services, advertising trackers or `chrome.storage.sync` to synchronize this information. It does not sell or share this data with advertisers.

Visited websites remain subject to their own policies and may make their own network requests. This policy does not cover data handling by Chrome, the Chrome Web Store, GitHub or visited websites.

If you email the project, the developer receives your email address and the content you choose to send in order to respond. This contact is voluntary, uses an email service and is not an automatic transmission by the extension.

### Permissions

- **`storage`:** save preferences and statistics in the browser.
- **`tabs`:** identify the active tab and its address for popup actions, such as ignoring the current site and viewing the original page. The extension also sends commands to that tab's filter and can reload it at the user's request.
- **Website access (`<all_urls>`):** run the filter automatically on pages permitted by Chrome, including dynamically loaded content. Users can configure ignored sites and control the extension's site access in Chrome settings.

These accesses support the filtering and control features described above.

### Retention, control and deletion

You can edit or remove words and ignored sites, delete hibernated topics and disable groups or the filter through the popup. Hibernated topics stop blocking after expiration; expired entries are removed from settings when the popup opens.

Preferences and the total counter remain in local storage until changed or until extension data is removed. Uninstalling TopicBlock through Chrome removes its extension storage. Closing the tab ends the page's temporary storage used for “View original page”. Disabling filtering does not erase preferences or statistics.

The developer does not receive a copy of your local data and cannot inspect or delete it remotely. For questions or requests concerning emails you have sent, use the contact above.

### Updates

Changes to this policy will be published in this file with an updated date. Changes to data handling must be reflected here and in the Chrome Web Store disclosures.
