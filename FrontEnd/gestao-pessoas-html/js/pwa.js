if (
  "serviceWorker" in navigator
) {
  window.addEventListener(
    "load",
    function () {
      navigator
        .serviceWorker
        .register(
          "./service-worker.js"
        )
        .then(
          function (
            registration
          ) {
            console.log(
              "Service Worker registrado:",
              registration.scope
            );
          }
        )
        .catch(
          function (
            error
          ) {
            console.error(
              "Erro ao registrar Service Worker:",
              error
            );
          }
        );
    }
  );
}