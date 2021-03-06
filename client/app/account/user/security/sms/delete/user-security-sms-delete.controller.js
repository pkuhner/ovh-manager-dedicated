angular.module("UserAccount.controllers").controller("UserAccount.controllers.doubleAuth.sms.delete", [
    "$rootScope",
    "$scope",
    "$q",
    "UserAccount.services.doubleAuth.sms",
    "Alerter",
    function ($rootScope, $scope, $q, DoubleAuthSmsService, Alerter) {
        "use strict";

        $scope.sms = {
            smsAccount: _.get($scope, "currentActionData", {}),
            code: null,
            isLoading: false,
            isDeleting: false
        };

        /* ===============================
        =            HELPERS            =
        =============================== */

        /**
         * Check if step is valid.
         * @return {Boolean}
         */
        $scope.doesStepIsValid = () => $scope.sms.smsAccount.status === "disabled" ? true : !_.isEmpty($scope.sms.code);

        /* -----  End of HELPERS  ------ */

        /* ===============================
        =            ACTIONS            =
        =============================== */

        /**
         * Delete double auth SMS account.
         * @return {Promise}
         */
        $scope.deleteDoubleAuthSms = () => {
            let promise = $q.when(true);
            if ($scope.sms.smsAccount.status === "enabled") {
                promise = DoubleAuthSmsService.disable($scope.sms.smsAccount.id, $scope.sms.code);
            }
            $scope.sms.isDeleting = true;
            return promise
                .then(() => DoubleAuthSmsService.delete($scope.sms.smsAccount.id, $scope.sms.code))
                .then(() => {
                    Alerter.success($scope.tr("user_account_security_double_auth_type_sms_delete_success"), "doubleAuthAlertSms");
                    $rootScope.$broadcast("doubleAuthSMS.reload");
                    $scope.resetAction();
                })
                .catch((err) => Alerter.alertFromSWS($scope.tr("user_account_security_double_auth_type_sms_delete_error"), err, "doubleAuthAlertSmsDelete"))
                .finally(() => {
                    $scope.sms.isDeleting = false;
                });
        };

        /**
         * Cancel SMS delete modal.
         */
        $scope.cancel = () => $scope.resetAction();

        /* -----  End of ACTIONS  ------ */

        /* ======================================
        =            INITIALIZATION            =
        ====================================== */

        /**
         * Init.
         * @return {Promise}
         */
        $scope.init = () => {
            let promise = $q.when(true);
            if ($scope.sms.smsAccount.status === "enabled") {
                promise = DoubleAuthSmsService.sendCode($scope.sms.smsAccount.id);
            }
            $scope.sms.isLoading = true;
            return promise
                .catch((err) => {
                    Alerter.alertFromSWS($scope.tr("user_account_security_double_auth_type_sms_delete_send_code_error"), err.data, "doubleAuthAlertSms");
                    $scope.resetAction();
                })
                .finally(() => {
                    $scope.sms.isLoading = false;
                });
        };

        /* -----  End of INITIALIZATION  ------ */
    }
]);
