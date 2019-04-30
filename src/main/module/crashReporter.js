import { crashReporter } from "electron"
export default {
    crashReporter() {
        crashReporter.start({
            productName: 'QianqianMusic',
            companyName: 'YinZhiBang',
            submitURL: 'https://report.qianqian.com/crash',
            uploadToServer: true
        })
    }
}