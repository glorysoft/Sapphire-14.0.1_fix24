(function () {    
    document.addEventListener("DOMContentLoaded", function () {
        var smsConfirmationActive = document.querySelector('#smsConfirmationStart');
        if (smsConfirmationActive === null)
            return;

        var loginBySmsButton = document.querySelector('.sms-confirmation-login-link');

        var isMobile = smsConfirmationActive.dataset.isMobile;

        // Вставка кнопки "Войти по SMS" в десктопе
        if (isMobile === 'false') { 
            var loginButton = document.querySelector('.toolbar-top-link-alt[href$="login"]');

            if (loginButton != null) {
                var buttonBySmsInterval = setInterval(function () {
                    loginButton.replaceWith(loginBySmsButton);
                    //loginButton.insertAdjacentElement('afterend', loginBySmsButton);
                    clearInterval(buttonBySmsInterval);
                }, 250);
            }
        }
        // Вставка кнопки "Войти по SMS" в моб. версии
        else {

            var loginButton = document.querySelector('.bottom-panel__menu-link[href$="login"]');

            if (loginButton != null) {
                var buttonBySmsInterval = setInterval(function () {
                    loginBySmsButton.className = 'mobile-header__item mobile-header--hidden-on-search-active';
                    loginButton.replaceWith(loginBySmsButton);
                    clearInterval(buttonBySmsInterval);
                }, 250);

            } else {
                var header = document.querySelector('#header');
                if(header) {
                    var buttonBySmsInterval = setTimeout(function () {
                        loginBySmsButton.className = 'mobile-header__item mobile-header--hidden-on-search-active';
                        header.appendChild(loginBySmsButton)
                        clearTimeout(buttonBySmsInterval);
                    }, 250);
                }
            }
        }
    });

})();
