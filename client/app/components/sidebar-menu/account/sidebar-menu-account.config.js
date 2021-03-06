angular.module("App").run(($q, $translatePartialLoader, $translate, SidebarMenu, User, constants) => {

    function buildMyAccountMenu () {
        const myAccountMenu = SidebarMenu.addMenuItem({
            name: "userAccountMenu",
            title: $translate.instant("menu_account_title"),
            allowSubItems: true,
            allowSearch: true,
            loadOnState: "app.account.useraccount",
            namespace: "account"
        });

        SidebarMenu.addMenuItem({
            title: $translate.instant("menu_infos"),
            state: "app.account.useraccount.infos"
        }, myAccountMenu);

        SidebarMenu.addMenuItem({
            title: $translate.instant("menu_security"),
            state: "app.account.useraccount.security"
        }, myAccountMenu);

        if (constants.target === "EU" || constants.target === "CA") {
            SidebarMenu.addMenuItem({
                title: $translate.instant("menu_emails"),
                state: "app.account.useraccount.emails"
            }, myAccountMenu);
        }

        if (constants.target === "EU") {
            SidebarMenu.addMenuItem({
                title: $translate.instant("menu_subscriptions"),
                state: "app.account.useraccount.subscriptions"
            }, myAccountMenu);
        }

        SidebarMenu.addMenuItem({
            title: $translate.instant("menu_ssh"),
            state: "app.account.useraccount.ssh"
        }, myAccountMenu);

        SidebarMenu.addMenuItem({
            title: $translate.instant("menu_credentials"),
            state: "app.account.useraccount.credentials"
        }, myAccountMenu);

        if (constants.target === "EU" || constants.target === "CA") {
            SidebarMenu.addMenuItem({
                title: $translate.instant("menu_advanced"),
                state: "app.account.useraccount.advanced"
            }, myAccountMenu);
        }

        if (constants.target === "US") {
            SidebarMenu.addMenuItem({
                title: $translate.instant("menu_users_management"),
                state: "app.account.useraccount.users"
            }, myAccountMenu);
        }
    }

    function buildBillingMenu () {
        const billingMenu = SidebarMenu.addMenuItem({
            name: "billingMenu",
            title: $translate.instant("menu_billing"),
            allowSubItems: true,
            allowSearch: true,
            loadOnState: "app.account.billing",
            namespace: "account"
        });

        SidebarMenu.addMenuItem({
            title: $translate.instant("menu_bills"),
            state: "app.account.billing.history"
        }, billingMenu);

        SidebarMenu.addMenuItem({
            title: $translate.instant("menu_payments"),
            state: "app.account.billing.payments"
        }, billingMenu);
    }

    function buildServicesMenu (curUser) {
        if (constants.target === "EU" || constants.target === "CA") {
            if (!curUser.isEnterprise) {
                const servicesMenu = SidebarMenu.addMenuItem({
                    name: "servicesMenu",
                    title: $translate.instant("menu_services"),
                    allowSubItems: true,
                    allowSearch: true,
                    loadOnState: "app.account.service",
                    namespace: "account"
                });

                SidebarMenu.addMenuItem({
                    title: $translate.instant("menu_services_management"),
                    state: "app.account.service.billing.autoRenew"
                }, servicesMenu);

                SidebarMenu.addMenuItem({
                    title: $translate.instant("menu_agreements"),
                    state: "app.account.service.useraccount.agreements"
                }, servicesMenu);
            } else {
                SidebarMenu.addMenuItem({
                    name: "servicesMenuAgreements",
                    title: $translate.instant("menu_agreements"),
                    state: "app.account.service.useraccount.agreements",
                    namespace: "account"
                });
            }
        }
    }

    function buildPaymentMenu () {
        const paymentMenu = SidebarMenu.addMenuItem({
            name: "paymentMenu",
            title: $translate.instant("menu_payment_methods"),
            allowSubItems: true,
            allowSearch: true,
            loadOnState: "app.account.payment",
            namespace: "account"
        });

        SidebarMenu.addMenuItem({
            title: $translate.instant("menu_means"),
            state: "app.account.payment.mean"
        }, paymentMenu);

        if (constants.target === "EU" || constants.target === "CA") {
            SidebarMenu.addMenuItem({
                title: $translate.instant("menu_ovhaccount"),
                state: "app.account.payment.ovhaccount"
            }, paymentMenu);
        }

        if (constants.target === "EU" || constants.target === "CA") {
            SidebarMenu.addMenuItem({
                title: $translate.instant("menu_vouchers"),
                state: "app.account.payment.vouchers"
            }, paymentMenu);
        }

        SidebarMenu.addMenuItem({
            title: $translate.instant("menu_refunds"),
            state: "app.account.payment.refunds"
        }, paymentMenu);

        if (constants.target === "EU") {
            SidebarMenu.addMenuItem({
                title: $translate.instant("menu_fidelity"),
                state: "app.account.payment.fidelity"
            }, paymentMenu);
        }

        SidebarMenu.addMenuItem({
            title: $translate.instant("menu_credits"),
            state: "app.account.payment.credits"
        }, paymentMenu);
    }

    function init () {
        $translatePartialLoader.addPart("components/sidebar-menu/account");

        return $q.all({
            translate: $translate.refresh(),
            user: User.getUser()
        }).then((result) => {

            SidebarMenu.addMenuItem({
                name: "billingBack",
                title: $translate.instant("menu_back"),
                state: "app.configuration",
                namespace: "account"
            });

            buildMyAccountMenu();

            // remove billing menu for accounts flagged as enterprise
            if (!result.user.isEnterprise) {
                buildBillingMenu();
            }
            buildServicesMenu(result.user);

            // remove payment menu and orders menu for accounts flagged as enterprise
            if (!result.user.isEnterprise) {
                buildPaymentMenu();

                SidebarMenu.addMenuItem({
                    name: "billingOrders",
                    title: $translate.instant("menu_orders"),
                    state: "app.account.orders",
                    namespace: "account"
                });
            }

            if (constants.target === "EU") {
                SidebarMenu.addMenuItem({
                    name: "billingContacts",
                    title: $translate.instant("menu_contacts"),
                    state: "app.account.useraccount.contacts.services",
                    namespace: "account"
                });
            }

            SidebarMenu.addMenuItem({
                name: "accountTickets",
                title: $translate.instant("menu_tickets"),
                state: "app.account.otrs-ticket",
                namespace: "account"
            });
        });
    }

    init();
});
