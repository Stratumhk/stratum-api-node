const axios = require('axios');
const crypto = require('crypto');
const qs = require('qs');
require('dotenv').config()

const API_USER  = process.env.API_USER
const API_KEY =  process.env.API_KEY
let BASE_URL = 'https://dev.stratum.global/api/';



let getWalletsPayload = {
    "wallet_id": 2
}

echo(getWalletsPayload).then(res => {
    console.log(res)
}).catch(err => {
    console.log(err)
})



getWallets(getWalletsPayload).then(res => {
    console.log(res)
}).catch(err => {
    console.log(err)
})


async function echo(payload) {
    const url = 'test/echo';
    return await baseRequest(url, payload)
}


async function listWallets(payload) {
    const url = 'wallets/list';
    return await baseRequest(url, payload)
}
async function getWallets(payload) {
    const url = 'wallets/get';
    return await baseRequest(url, payload)
}


async function baseRequest(url, jsonPayload = null) {


    const userKeys = {
        "api_user": API_USER,
        "api_key": API_KEY
    }


    let time = Math.floor(+new Date() / 1000);
    let str = `api_ts=${time}&api_user=${userKeys.api_user}&payload=${JSON.stringify(jsonPayload)}`;
    const hmac = crypto.createHmac('sha256', userKeys.api_key);
    hmac.update(str);
    let api_sig = hmac.digest('hex');

    try {
        const body = {
            'api_sig': api_sig,
            'api_ts': time,
            'api_user': userKeys.api_user,
            'payload': JSON.stringify(jsonPayload),
        }

        const config = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        const resp = await axios.post(BASE_URL + url, qs.stringify(body), config)
        const data = resp.data;

        if (data && data.status === "ok") {
            return data.data;
        } else if (data && data.status === 'failed') {
            const errorsArray = Object.entries(data.data)
            let arrayOfErrors = [];
            errorsArray.forEach(([key, value]) => {
                arrayOfErrors.push(new CustomError(key, value))
            })
            throw arrayOfErrors

        } else {
            throw new Error("server error")
        }


    } catch (e) {
        logError(e)
        throw e
    }
}