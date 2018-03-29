angular.module("App")
    .controller("DedicatedServerFtpBackupEditController", class DedicatedServerFtpBackupEditController {
        constructor ($scope, $stateParams, Alerter, Server) {
            this.$scope = $scope;
            this.$stateParams = $stateParams;
            this.Alerter = Alerter;
            this.Server = Server;
        }

        $onInit () {
            this.model = {
                ftp: false,
                cifs: false,
                nfs: false
            };
            this.isEditing = false;
        }

        /**
         * Edit FTP Backup.
         * @return {Promise}
         */
        editFtpBackup () {
            this.isEditing = true;
            return this.Server
                .putFtpBackupIp(this.$stateParams.productId, this.$scope.ipbackupCurrentEdit.ipBlock, this.$scope.ipbackupCurrentEdit.ftp, this.$scope.ipbackupCurrentEdit.nfs, this.$scope.ipbackupCurrentEdit.cifs)
                .then(() => {
                    this.Alerter.success(this.$scope.tr("server_configuration_ftpbackup_set_success", this.$scope.ipbackupCurrentEdit.ipBlock), alert);
                })
                .catch((err) => {
                    this.Alerter.alertFromSWS(this.$scope.tr("server_configuration_ftpbackup_set_fail", this.$scope.ipbackupCurrentEdit.ipBlock), err.data, alert);
                })
                .finally(() => {
                    this.isEditing = false;
                });
        }
    });
