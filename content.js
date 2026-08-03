console.log("TopicBlock iniciado");


// Aguarda o filtro carregar as configurações
window.addEventListener(
    "topicblock-ready",
    () => {

        if (typeof window.scanPage === "function") {

            window.scanPage();

        } else {

            console.error(
                "[TopicBlock] scanPage() não encontrada."
            );

        }


    }
);




// Inicia o observer

const observer = new window.Observer(async () => {

    observer.stop();

    try {

        if (typeof window.scanPage === "function") {
            window.scanPage();
        }

    } finally {

        observer.start();

    }

});

observer.start();