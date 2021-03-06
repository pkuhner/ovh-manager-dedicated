angular.module("Module.ip.controllers").controller("IpGameFirewallCtrl", function ($scope, $rootScope, Ip, IpGameFirewall, Alerter, $q) {
    "use strict";

    const self = this;
    const alert = "ip_game_firewall_alert";

    self.constantes = {
        DELETE_RULE_PENDING: "deleteRulePending",
        OK: "ok"
    };

    self.datas = {
        selectedBlock: null,
        selectedIp: null,
        firewall: null
    };

    self.table = {
        rules: []
    };

    self.loaders = {
        firewall: false,
        rules: false
    };

    function init () {
        getFirewall();
        getRules();
    }

    function getFirewall () {
        self.loaders.firewall = true;
        self.datas.firewall = null;
        IpGameFirewall.get(self.datas.selectedBlock, self.datas.selectedIp)
            .then(
                (firewall) => {
                    self.datas.firewall = firewall;

                    if (firewall.state !== self.constantes.OK) {
                        IpGameFirewall.pollFirewallState(self.datas.selectedBlock, self.datas.selectedIp).then((_firewall) => {
                            self.datas.firewall = _firewall;
                        });
                    }
                },
                () => {
                    self.datas.firewall = null;
                }
            )
            .finally(() => {
                self.loaders.firewall = false;
            });
    }

    function getRules () {
        IpGameFirewall.killPollRuleState();
        self.loaders.rules = true;
        self.table.rules = [];
        IpGameFirewall.getRules(self.datas.selectedBlock, self.datas.selectedIp).then(
            (rules) => {
                const tablePromise = [];
                angular.forEach(rules, (ruleId) => {
                    tablePromise.push(
                        getRule(ruleId).then(
                            (rule) => {
                                self.table.rules.push(rule);
                            },
                            (error) => {
                                self.table.rules.push({ errorMessage: $scope.tr("ip_game_mitigation_table_partial_error_info", ruleId) });
                                return $q.reject(error);
                            }
                        )
                    );
                });

                if (tablePromise.length > 0) {
                    $q
                        .allSettled(tablePromise)
                        .then(
                            () => {
                                // nothing
                            },
                            () => {
                                Alerter.error($scope.tr("ip_game_mitigation_table_partial_error"), alert);
                            }
                        )
                        .finally(() => {
                            self.loaders.rules = false;
                        });
                } else {
                    self.loaders.rules = false;
                }
            },
            () => {
                self.table.rules = null;
                self.loaders.rules = false;
            }
        );
    }

    function getRule (ruleId) {
        return IpGameFirewall.getRule(self.datas.selectedBlock, self.datas.selectedIp, ruleId).then((rule) => {
            if (rule.state !== self.constantes.OK) {
                IpGameFirewall.pollRuleState(self.datas.selectedBlock, self.datas.selectedIp, ruleId).then((rulePoll) => {
                    switch (rulePoll.state) {
                    case self.constantes.DELETE_RULE_PENDING:
                        removeRule(ruleId);
                        break;
                    default:
                        changeStateRule(ruleId, rulePoll.state);
                        break;
                    }
                });
            }
            return rule;
        });
    }

    function changeStateRule (ruleId, state) {
        const index = _.findIndex(self.table.rules, { id: ruleId });
        if (index >= 0 && index < self.table.rules.length && self.table.rules[index]) {
            self.table.rules[index].state = state;
        }
    }

    function removeRule (ruleId) {
        self.table.rules = _.remove(self.table.rules, (ruleToDrop) => ruleToDrop.id !== ruleId);
    }

    self.refreshRules = function () {
        getRules();
    };

    self.hideGameFirewall = function () {
        $rootScope.$broadcast("ips.display", "table");
    };

    $scope.$on("ips.gameFirewall.display.remove", (event, ruleId) => {
        changeStateRule(ruleId, self.constantes.DELETE_RULE_PENDING);

        IpGameFirewall.pollRuleState(self.datas.selectedBlock, self.datas.selectedIp, ruleId).then(() => {
            removeRule(ruleId);
        });
    });

    $scope.$on("ips.gameFirewall.display.add", (event, rule) => {
        self.table.rules.push(rule);

        IpGameFirewall.pollRuleState(self.datas.selectedBlock, self.datas.selectedIp, rule.id).then((rulePoll) => {
            changeStateRule(rule.id, rulePoll.state);
        });
    });

    $scope.$on("ips.gameFirewall.display.firewall", () => {
        getFirewall();
    });

    $scope.$on("ips.gameFirewall.display", (event, params) => {
        self.datas.selectedBlock = params.ipBlock.ipBlock;
        self.datas.selectedIp = params.ip.ip;
        self.datas.firewall = params.firewall;
        init();
    });

    $scope.$on("$destroy", () => {
        IpGameFirewall.killPollRuleState();
    });
});
