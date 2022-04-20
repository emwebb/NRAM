namespace Account {
    export interface AccountModel {
        username : string;
        email : string;
        rank : number;
        emailVerified : boolean;
    }

    export class Model {
        username : KnockoutObservable<string>;
        email : KnockoutObservable<string>;
        rank : KnockoutObservable<number>;
        fnSave : () => void;
        constructor() {
            this.username = ko.observable('');
            this.email = ko.observable('');
            this.rank = ko.observable(0);
            this.fnSave = () => {
                this.save();
            }
            this.reloadAccount();
        }

        reloadAccount() {
            Utils.ajax<AccountModel, null>('/account/account/account', 'GET', null).then((account) => {
                this.username(account.username);
                this.email(account.email);
                this.rank(account.rank);
            });
        }

        save() {
            Utils.ajax<AccountModel,
                {
                    username : string,
                    email : string,
                    rank : number
                }>(
                    `/account/account/account`,
                    'POST', 
                    {
                        username : this.username(),
                        email : this.email(),
                        rank : this.rank()
                    }
                    )
                    .then((account) => {
                        this.reloadAccount();
                    });
        }
    }
}




$(function () {
    var account = new Account.Model();
    ko.applyBindings(account, document.getElementById('main'));
    $('#select').select2();
});