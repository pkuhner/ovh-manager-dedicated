angular.module("Billing.services").service("BillingFidelity", function ($http, $cacheFactory) {
    "use strict";

    const fidelityProxyPath = "apiv6/me/fidelityAccount";

    const fidelityAccountCache = $cacheFactory("UNIVERS_BILLING_FIDELITYACCOUNT");
    const movementsCache = $cacheFactory("UNIVERS_BILLING_FIDELITYMOVEMENTS");

    this.getFidelityAccount = function () {
        return $http
            .get(fidelityProxyPath, {
                cache: fidelityAccountCache
            })
            .then((response) => response.data);
    };

    this.getMovements = function (_dateStart, _dateEnd) {
        let dateStart = _dateStart;
        let dateEnd = _dateEnd;

        if (_dateStart) {
            dateStart = moment(_dateStart)
                .startOf("day")
                .toISOString();
        }
        if (_dateEnd) {
            dateEnd = moment(_dateEnd)
                .endOf("day")
                .toISOString();
        }

        return $http
            .get([fidelityProxyPath, "movements"].join("/"), {
                cache: movementsCache,
                params: {
                    "date.from": dateStart,
                    "date.to": dateEnd
                }
            })
            .then((response) => response.data);
    };

    this.getMovementsDetails = function (movementId) {
        return $http
            .get([fidelityProxyPath, "movements", movementId].join("/"), {
                cache: movementsCache
            })
            .then((response) => response.data);
    };

    this.creditOrder = function (amount) {
        return $http
            .post([fidelityProxyPath, "creditOrder"].join("/"), {
                amount
            })
            .then((response) => response.data);
    };
});
