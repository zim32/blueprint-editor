import axios from "axios";

export default class {

    async saveData(data) {
        await axios.post('/node-editor/api/save-config', JSON.stringify(data));
    }

    async loadData({ url }) {
        let response = await axios.get(url, { params: { nounce: Date.now() } });
        return response.data;
    }

    async loadConfig() {

    }

}