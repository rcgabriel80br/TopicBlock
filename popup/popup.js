import {
    DEFAULT_GROUPS,
    GROUP_LABELS
} from "../js/core/constants.js";

const CONFIG = {
    STORAGE_KEY: "topicblock_settings"
};

const toggle =
    document.getElementById("toggle");

const toggleText =
    document.getElementById("toggleText");

const showUnfilteredPageButton =
    document.getElementById("showUnfilteredPage");
	
const groupList =
    document.getElementById("groupList");

const wordList =
    document.getElementById("wordList");

const wordCount =
    document.getElementById("wordCount");

const input =
    document.getElementById("newWord");

const addButton =
    document.getElementById("addWord");

const resetButton =
    document.getElementById("resetWords");


const hibernateInput =
    document.getElementById("hibernateWord");

const hibernate7 =
    document.getElementById("hibernate7");

const hibernate15 =
    document.getElementById("hibernate15");

const hibernate30 =
    document.getElementById("hibernate30");


const hibernateList =
    document.getElementById("hibernateList");

const hibernateCount =
    document.getElementById("hibernateCount");

const ignoredSitesList =
    document.getElementById("ignoredSitesList");

const ignoredSitesCount =
    document.getElementById("ignoredSitesCount");

const ignoredSiteInput =
    document.getElementById("newIgnoredSite");

const addIgnoredSiteButton =
    document.getElementById("addIgnoredSite");

const blockedSession =
    document.getElementById("blockedSession");

const blockedTotal =
    document.getElementById("blockedTotal");

let settings = {

    enabled: true,

    ignoredSites: [
        "chatgpt.com",
        "outlook.live.com",
        "web.whatsapp.com"
    ],

groups:
    structuredClone(
        DEFAULT_GROUPS
    )
	
};



async function saveSettings() {

    await chrome.storage.local.set({

        [CONFIG.STORAGE_KEY]: settings

    });

}



function createHibernateWord(word, days) {

    const date =
        new Date();

    date.setDate(
        date.getDate() + days
    );


    return {

        text: word,

        expires:
            date.toISOString()

    };

}



function formatDate(date) {

    return new Date(date)
        .toLocaleDateString("pt-BR");

}



function getCustomWords() {

    return (
        settings.groups.personalizado.words || []
    );

}



function getHibernateWords() {

    return (
        settings.groups.hibernados.words || []
    );

}



function cleanExpiredHibernate() {

    const now =
        new Date();


    settings.groups.hibernados.words =
        settings.groups.hibernados.words.filter(item =>
            new Date(item.expires) > now
        );

}

async function loadSettings() {


    const data =
        await chrome.storage.local.get(
            CONFIG.STORAGE_KEY
        );


    if (data[CONFIG.STORAGE_KEY]) {


        settings = {

            ...settings,

            ...data[CONFIG.STORAGE_KEY]

        };


        if (!settings.groups) {

settings.groups =
    structuredClone(
        DEFAULT_GROUPS
    );
	
        }


    }


    // garante grupo novo para versões antigas
    if (!settings.groups.hibernados) {

        settings.groups.hibernados = {

            enabled: true,

            words: []

        };

    }

if (!settings.ignoredSites) {

    settings.ignoredSites = [
        "chatgpt.com",
        "outlook.live.com",
        "web.whatsapp.com"
    ];

}

    cleanExpiredHibernate();


await saveSettings();


render();

loadStatistics();

}





function renderGroups() {


    groupList.innerHTML = "";


    Object.entries(settings.groups)
        .forEach(([name, group]) => {


            const card =
                document.createElement("div");


            card.className =
                "group-card";


            const row =
                document.createElement("label");


            row.className =
                "group-row";


            const checkbox =
                document.createElement("input");


            checkbox.type =
                "checkbox";


            checkbox.checked =
                group.enabled;



            checkbox.addEventListener(
                "change",
                async () => {


                    group.enabled =
                        checkbox.checked;


                    await saveSettings();


                }
            );



            const title =
                document.createElement("span");


            title.className =
                "group-name";


            title.textContent =
                GROUP_LABELS[name] || name;



            const count =
                document.createElement("span");


            count.className =
                "group-count";


            count.textContent =
                group.words.length;



            row.appendChild(checkbox);

            row.appendChild(title);

            row.appendChild(count);



            card.appendChild(row);


            groupList.appendChild(card);


        });


}



async function loadStatistics() {

    const sessionData =
        await chrome.storage.session.get(
            "blockedSession"
        );


    const localData =
        await chrome.storage.local.get(
            CONFIG.STORAGE_KEY
        );


    if (blockedSession) {

        blockedSession.innerText =
            sessionData.blockedSession || 0;

    }


    if (blockedTotal) {

        blockedTotal.innerText =
            localData[CONFIG.STORAGE_KEY]?.blockedTotal || 0;

    }

}



function render() {


    toggle.checked =
        settings.enabled;


toggleText.innerText =
    settings.enabled
        ? "Ativado"
        : "Desativado";

    renderGroups();



    // palavras personalizadas

    wordList.innerHTML = "";


    const customWords =
        getCustomWords();



    wordCount.innerText =
        ` (${customWords.length})`;



    customWords.forEach(word => {


        const li =
            document.createElement("li");


        li.textContent =
            word;



        const remove =
            document.createElement("button");


        remove.textContent =
            "❌";


        remove.className =
            "remove";



        remove.onclick =
            async () => {


                settings.groups.personalizado.words =
                    settings.groups.personalizado.words.filter(
                        item => item !== word
                    );


                await saveSettings();

                render();

            };



        li.appendChild(remove);


        wordList.appendChild(li);


    });




    // hibernados

    if (hibernateList) {


        hibernateList.innerHTML = "";


        const words =
            getHibernateWords();



        if (hibernateCount) {

            hibernateCount.innerText =
                ` (${words.length})`;

        }



        words.forEach(item => {


            const li =
                document.createElement("li");



            li.innerHTML =
                `${item.text}
                 <span> - Expira: ${formatDate(item.expires)}</span>`;



            const remove =
                document.createElement("button");



            remove.textContent =
                "❌";


            remove.className =
                "remove";



            remove.onclick =
                async () => {


                    settings.groups.hibernados.words =
                        settings.groups.hibernados.words.filter(
                            word =>
                                word.text !== item.text
                        );


                    await saveSettings();


                    render();

                };



            li.appendChild(remove);


            hibernateList.appendChild(li);


        });


    }


// sites ignorados

if (ignoredSitesList) {

    ignoredSitesList.innerHTML = "";

    const sites = settings.ignoredSites || [];

    if (ignoredSitesCount) {

        ignoredSitesCount.innerText =
            ` (${sites.length})`;

    }

    sites
        .slice()
        .sort()
        .forEach(site => {

            const li =
                document.createElement("li");

            li.textContent =
                site;

            const remove =
                document.createElement("button");

            remove.textContent = "❌";

            remove.className = "remove";

            remove.onclick = async () => {

                settings.ignoredSites =
                    settings.ignoredSites.filter(
                        item => item !== site
                    );

                await saveSettings();

                render();

            };

            li.appendChild(remove);

            ignoredSitesList.appendChild(li);

        });

}




}







toggle.addEventListener(
    "change",
    async () => {


        settings.enabled =
            toggle.checked;


        await saveSettings();


        render();


    }
);


showUnfilteredPageButton.addEventListener(
    "click",
    async () => {


        console.log(
            "[TopicBlock Popup] Clique liberar página"
        );


        const tabs =
            await chrome.tabs.query({
                active: true,
                currentWindow: true
            });


        if (tabs[0]) {


            console.log(
                "[TopicBlock Popup] Enviando mensagem para:",
                tabs[0].id
            );


chrome.tabs.sendMessage(
    tabs[0].id,
    {
        action: "showUnfilteredPage"
    },
    () => {

        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message);
        }

    }
);


            setTimeout(() => {

                chrome.tabs.reload(
                    tabs[0].id
                );

            }, 300);


        }

    }
);




addButton.addEventListener(
    "click",
    async () => {


        const word =
            input.value
                .trim()
                .toLowerCase();



        if (!word) return;



        if (
            !settings.groups.personalizado.words.includes(word)
        ) {


            settings.groups.personalizado.words.push(word);


        }



        input.value = "";


        await saveSettings();


        render();


    }
);


addIgnoredSiteButton.addEventListener(
    "click",
    async () => {

        let site =
            ignoredSiteInput.value.trim().toLowerCase();

        if (!site) return;

        site = site
            .replace(/^https?:\/\//, "")
            .replace(/\/.*$/, "");

        if (!settings.ignoredSites.includes(site)) {

            settings.ignoredSites.push(site);

            settings.ignoredSites.sort();

        }

        ignoredSiteInput.value = "";

        await saveSettings();

        render();

    }
);




function registerHibernate(button, days) {


    if (!button || !hibernateInput) {

        return;

    }



    button.addEventListener(
        "click",
        async () => {


            const word =
                hibernateInput.value
                    .trim()
                    .toLowerCase();



            if (!word) return;



            settings.groups.hibernados.words.push(

                createHibernateWord(
                    word,
                    days
                )

            );



            hibernateInput.value = "";



            await saveSettings();


            render();


        }
    );


}



registerHibernate(
    hibernate7,
    7
);


registerHibernate(
    hibernate15,
    15
);


registerHibernate(
    hibernate30,
    30
);






resetButton.addEventListener(
    "click",
    async () => {


        settings.groups =
structuredClone(
    DEFAULT_GROUPS
)

        await saveSettings();


        render();


    }
);






loadSettings();