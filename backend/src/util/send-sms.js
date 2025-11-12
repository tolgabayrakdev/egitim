import Netgsm from "@netgsm/sms";

const netgsm = new Netgsm({
    username: process.env.NETGSM_NUMBER,
    password: process.env.NETGSM_PASSWORD,
    appname: ""
});

export async function sendSms({ msg, no }) {
    try {
        const response = await netgsm.sendRestSms({
            msgheader: process.env.NETGSM_NUMBER,
            encoding: "TR",
            messages: [{
                msg: msg,
                no: no
            }]
        });
        console.log("SMS sent:", response);
        return response.jobid;
    } catch (error) {
        console.error("❌ Failed to send SMS:", error);
        throw error;
    }
}