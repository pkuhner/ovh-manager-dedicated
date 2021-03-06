angular.module("Billing.controllers").controller("Billing.controllers.OvhAccountRenew", ($scope, $rootScope, BillingOvhAccount, translator, OVH_ACCOUNT_EVENT) => {
    const tr = translator.tr;

    $scope.accountRenew = {
        amount: null,
        account: null,
        BC: null,
        loading: false,
        erreurMin: false,
        erreurFormat: false
    };

    $scope.loadAmount = function () {
        $scope.accountRenew.account = $scope.currentActionData;
        $scope.accountRenew.amount = ($scope.accountRenew.account.balance.value < 0 && $scope.accountRenew.account.balance.value * -1) || 10;
    };

    $scope.getBC = function () {
        $scope.accountRenew.loading = true;

        /* avoid display old value, even few milliseconds */
        $scope.accountRenew.BC = null;

        const amount = parseAmount($scope.accountRenew.amount);
        BillingOvhAccount.creditOvhAccount($scope.accountRenew.account.accountId, amount).then(
            (data) => {
                $scope.$emit(OVH_ACCOUNT_EVENT.CREDIT);
                $scope.accountRenew.BC = data.data;
                $scope.accountRenew.loading = false;
            },
            (data) => {
                $scope.accountRenew.loading = false;
                $scope.resetAction();
                $scope.setMessage(tr("ovhAccount_renew_step2_error"), data.data);
            }
        );
    };

    $scope.displayBC = function () {
        $scope.resetAction();
        $scope.setMessage(tr("ovhAccount_renew_step2_success", [$scope.accountRenew.BC.url, $scope.accountRenew.BC.orderId]));
        window.open($scope.accountRenew.BC.url, "_blank");
    };

    $scope.checkAmount = function () {
        let amount;
        let oldBalance;
        let balance;

        if ($scope.accountRenew.amount === "") {
            $scope.accountRenew.erreurMin = false;
            $scope.accountRenew.erreurFormat = false;
            return;
        }

        amount = parseAmount($scope.accountRenew.amount);
        if (amount) {
            $scope.accountRenew.erreurFormat = false;

            oldBalance = $scope.accountRenew.account.balance.value;
            balance = $scope.accountRenew.account.balance.value + amount;

            if (oldBalance >= 0 && amount < 10) {
                $scope.accountRenew.erreurMin = true;
            } else if (oldBalance < 0 && (balance < 0 || amount < 10)) {
                $scope.accountRenew.erreurMin = true;
            } else {
                $scope.accountRenew.erreurMin = false;
            }
        } else {
            $scope.accountRenew.erreurFormat = true;
            $scope.accountRenew.erreurMin = false;
        }
    };

    $scope.currency = function (cur) {
        const currencies = { EUR: "€", USD: "$" };
        const value = currencies[cur];
        if (value) {
            return value;
        }
        return cur;
    };

    function isAmount (val) {
        return val && /^[0-9]+((\.|,)[0-9]?[0-9]?)?$/.test(val);
    }

    function parseAmount (val) {
        if (isAmount(val)) {
            return parseFloat(val.toString().replace(/,/, "."));
        }

        return null;
    }

    $scope.renewStepValidator = function () {
        return !($scope.accountRenew.erreurMin || $scope.accountRenew.erreurFormat || !$scope.accountRenew.amount);
    };
});
