export default class CreateNewConnectionContext {

    constructor(node, pin) {
        this.initiator = { node, pin };
        this.newNode   = null;
    }

}