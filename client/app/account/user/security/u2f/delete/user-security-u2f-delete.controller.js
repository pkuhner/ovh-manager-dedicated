angular.module("UserAccount.controllers").controller("UserAccount.controllers.doubleAuth.u2f.delete", [
    "$rootScope",
    "$scope",
    "$q",
    "UserAccount.services.doubleAuth.u2f",
    "Alerter",
    function ($rootScope, $scope, $q, DoubleAuthU2fService, Alerter) {
        "use strict";

        $scope.u2f = {
            u2fAccount: _.get($scope, "currentActionData", {}),
            isLoading: false,
            isDeleting: false,
            hasError: false
        };

        /* ===============================
        =            HELPERS            =
        =============================== */

        $scope.doesStepIsValid = () => !$scope.u2f.isLoading && $scope.u2f.u2fAccount.status === "enabled" ? !$scope.u2f.hasError : true;

        /* -----  End of HELPERS  ------ */

        /* ===============================
        =            ACTIONS            =
        =============================== */

        /**
         * Delete double auth U2F key.
         * @return {Promise}
         */
        $scope.deleteDoubleAuthU2fKey = () => {
            $scope.u2f.isDeleting = true;
            return DoubleAuthU2fService.delete($scope.u2f.u2fAccount.id)
                .then(() => {
                    $rootScope.$broadcast("doubleAuthU2F.reload");
                    $scope.resetAction();
                })
                .catch((err) => {
                    Alerter.alertFromSWS($scope.tr("user_account_security_double_auth_type_u2f_delete_error"), err.data, "doubleAuthAlertU2f");
                })
                .finally(() => {
                    $scope.u2f.isDeleting = false;
                });
        };

        /**
         * Cancel U2F delete modal.
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
            if ($scope.u2f.u2fAccount.status === "enabled") {
                $scope.u2f.isUpdating = true;
                promise = DoubleAuthU2fService.challenge($scope.u2f.u2fAccount.id, $scope.u2f.u2fAccount.status);
            }
            $scope.u2f.isLoading = true;
            $scope.u2f.hasError = false;
            return promise
                .then(() => $scope.deleteDoubleAuthU2fKey())
                .catch((err) => {
                    let key = null;
                    if (err.request.errorCode === 3 || err.request.errorCode === 4) {
                        key = `user_account_security_double_auth_type_u2f_add_error_code_${err.request.errorCode}`;
                    } else {
                        key = "user_account_security_double_auth_type_u2f_add_error";
                    }
                    $scope.u2f.isLoading = false;
                    $scope.u2f.hasError = true;
                    Alerter.error($scope.tr(key), "doubleAuthAlertU2fDelete");
                })
                .finally(() => {
                    $scope.u2f.isLoading = false;
                });
        };

        /* -----  End of INITIALIZATION  ------ */
    }
]);
