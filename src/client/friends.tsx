import { History, Location } from "history";
import * as _ from "lodash";
import * as React from "react";
import Money from "../shared/Money";
import { Friend } from "../shared/types";
import Poplet from "./components/poplet";
import * as util from "./util";

interface Props {
    friends: Friend[];
    pendingFriends: Friend[];
    invites: Friend[];
    debts: {[email: string]: Money};
    location: Location;
    history: History;
    onSettle: (email: string) => void;
}

type State = {};

export default class Friends extends React.Component<Props, State> {
    settle(email: string): Promise<void> {
        return util.apiPost({
            path: "/api/friend/settle",
            body: {
                amount: this.props.debts[email],
                email,
            },
            location: this.props.location,
            history: this.props.history,
        }).then(() => {
            this.props.onSettle(email);
        });
    }

    name = (email: string) => {
        let name = email;
        this.props.friends.forEach(f => {
            if (f.email === email) {
                name = f.name || f.email;
            }
        });
        return name;
    }

    render() {
        const allFriends: {[email: string]: {
            debt?: Money,
            pending?: true,
            invite?: true,
        }} = _.mapValues(this.props.debts, amount => ({
            debt: amount,
        }));
        this.props.friends.forEach(f => {
            if (allFriends[f.email] == undefined) {
                allFriends[f.email] = {};
            }
        });
        this.props.pendingFriends.forEach(f => {
            if (allFriends[f.email] == undefined) {
                allFriends[f.email] = {pending: true};
            }
        });
        this.props.invites.forEach(f => {
            if (allFriends[f.email] == undefined) {
                allFriends[f.email] = {invite: true};
            }
        });
        const rows = _.map(allFriends, (val, email) => <tr>
            <td>{val.pending ? <span className="bean">Pending</span> : val.invite ? <span className="bean">Invite</span> : null}</td>
            <td>{this.name(email)}</td>
            <td>{val.debt && val.debt.cmp(Money.Zero) > 0 ? val.debt.formatted() : null}</td>
            <td>{val.debt && val.debt.cmp(Money.Zero) < 0 ? val.debt.negate().formatted() : null}</td>
            <td>{val.debt && val.debt.cmp(Money.Zero) != 0 ? <Poplet text="Settle Debt">
                <h2>Settle debts with {email}</h2>
                <p>{val.debt.cmp(Money.Zero) > 0 ? `Do this after you've paid ${email} ${val.debt.formatted()}.` :
                    `Do this after ${email} has paid you ${val.debt.negate().formatted()}.`}</p>
                <button className="button" onClick={() => this.settle(email)}>Settle Debt</button>
            </Poplet> : null}</td>
            <td><span className="clickable">{val.invite ? "Accept Friend" : "Remove Friend"}</span></td>
        </tr>);
        return <div className="friends">
            <table>
                <tbody>
                    <tr><th></th><th>Friend</th><th>You owe</th><th>They Owe</th><th></th><th></th></tr>
                    {rows}
                </tbody>
            </table>

        </div>;
    }
}
