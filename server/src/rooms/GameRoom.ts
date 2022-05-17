import { Room, Client } from "colyseus";

import { StateHandler } from "./StateHandler";
import { Player } from "../entities/Player";

export class GameRoom extends Room<StateHandler> {
    maxClients = 8;
    boxData={
        targetId:null,
        position:null,
        quaternion:null
    }

    onCreate (options) {
        this.setSimulationInterval(() => this.onUpdate());
        this.setState(new StateHandler());

        this.onMessage("playData", (client, message) => {
            this.state.players.get(client.sessionId).playerData = message;
        });

        this.onMessage("boxUpdate", (client, message) => {
            this.boxData= message;
        });
    }

    onJoin (client) {
        const player = new Player();
        player.name = `Player ${ this.clients.length }`;
        this.state.players.set(client.sessionId, player);
    }

    onUpdate () {
        this.broadcast("boxUpdate",this.boxData)
        this.state.players.forEach((player, sessionId) => {
            player.position.x = player.playerData.position.x
            player.position.y = player.playerData.position.y
            player.position.z = player.playerData.position.z

            player.quaternion.x = player.playerData.quaternion.x
            player.quaternion.y = player.playerData.quaternion.y
            player.quaternion.z = player.playerData.quaternion.z
            player.quaternion.w = player.playerData.quaternion.w
        });
    }

    onLeave (client: Client) {
        this.state.players.delete(client.sessionId);
    }

    onDispose () {
    }

}
