export default{
    fomat_time(timestamp,format){
        var date = new Date(parseInt(timestamp) * 1000); 
        var year=date.getFullYear(); 
        var month=date.getMonth()+1; 
        var day=date.getDate();   
        if(format == 'Y.m.d'){    
            return year+"."+month+"."+day; 
        }else if(format == 'm.d'){
            return month+"."+day;
        }
    }
}