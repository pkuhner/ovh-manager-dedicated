/**
 * @ngdoc controller
 * @name Billing.controllers.AutoRenew.delete
 * @description
 */
angular.module("Billing.controllers").controller("Billing.controllers.AutoRenew.delete", [
    "$rootScope",
    "$scope",
    "$q",
    "$filter",
    "BillingAutoRenew",
    "Alerter",
    "AUTORENEW_EVENT",
    function ($rootScope, $scope, $q, $filter, AutoRenew, Alerter, AUTORENEW_EVENT) {
        "use strict";

        $scope.selectedServices = $scope.currentActionData;
        $scope.selectedServices[0].expirationText = $filter("date")($scope.selectedServices[0].expiration, "mediumDate");

        function errorFunction (err) {
            Alerter.alertFromSWS($scope.tr("autorenew_service_update_step2_error"), err);
            return $q.reject(err);
        }

        function setManual () {
            const result = [];
            angular.forEach($scope.selectedServices, (service) => {
                service.renew.automatic = false;
                result.push(_.pick(service, ["serviceId", "serviceType", "renew"]));
            });
            return AutoRenew.updateServices(result);
        }

        function setDelete () {
            const result = [];
            angular.forEach($scope.selectedServices, (service) => {
                service.renew.deleteAtExpiration = true;
                result.push(_.pick(service, ["serviceId", "serviceType", "renew"]));
            });
            return AutoRenew.updateServices(result).then(() => {
                $scope.$emit(AUTORENEW_EVENT.TERMINATE_AT_EXPIRATION, result);
                Alerter.set("alert-success", $scope.tr("autorenew_service_update_step2_success"));
            }, errorFunction);
        }

        $scope.deleteRenew = function () {
            const AUTO_RENEW_TYPES = ["automaticV2014", "automaticV2016", "automaticForcedProduct"];
            const renewType = $scope.selectedServices[0].service ? $scope.selectedServices[0].service.renewalType : $scope.selectedServices[0].renewalType;
            if ($scope.selectedServices[0].renew.automatic && !AUTO_RENEW_TYPES.includes(renewType)) {
                setManual()
                    .then(setDelete)
                    .catch(errorFunction)
                    .finally(() => {
                        $rootScope.$broadcast(AutoRenew.events.AUTORENEW_CHANGED);
                        $scope.resetAction();
                    });
            } else {
                setDelete()
                    .catch(errorFunction)
                    .finally(() => {
                        $rootScope.$broadcast(AutoRenew.events.AUTORENEW_CHANGED);
                        $scope.resetAction();
                    });
            }
        };
    }
]);
