

var myworker = null;


export default{
        
    init(script,callback) { 
        if(myworker != null) {
            return;
        }      
        myworker = new Worker(script);
        myworker.onerror = function (event) {
            console.log(event.data)
        };
        myworker.onmessage = function (event) {
            callback(event.data);
        };
    },
    postMessage(data) {
        if(myworker == null)
            return;
        myworker.postMessage(data);
    },
    terminate() {
        myworker.terminate()
    }

} 