import globalVariables from "@/assets/globalVariables";
import axios from "axios";
import {defineAsyncComponent} from "vue";
export default{
    changeLanguage(language)
    {
        localStorage.setItem(globalVariables.localStorageLanguageStr,language);
        window.location.reload();
    },
    setUser: function (data) {
        for (let item_key in data) {
            globalVariables.user[item_key] = data[item_key];
            if(item_key==globalVariables.localStorageAuthTokenStr){
                //set new AuthToken for axios Authorization
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + globalVariables.user[globalVariables.localStorageAuthTokenStr];
                localStorage.setItem(globalVariables.localStorageAuthTokenStr, data[item_key]);
            }
        }
    },
    getTaskBaseURL(file){
        return file.substring(file.indexOf('src/tasks')+9,file.indexOf('/Index.vue'));
    },
    getFilteredItems(data,columns){
        let filterItems= data.filter((item)=>{
            for(let  key in columns.all)
            {
                let column = columns.all[key];
                if(column.filterable){
                    if(column.type=='number'){
                        if(column.filter.from.toString().length>0){
                            if(parseFloat(item[key])<parseFloat(column.filter.from)){
                                return false;
                            }
                        }
                        if(column.filter.to.toString().length>0){
                            if(parseFloat(item[key])>parseFloat(column.filter.to)){
                                return false;
                            }
                        }
                    }
                    else if(column.type=='text'){
                        if(column.filter.from.toString().length>0){
                            if((!item[key])||(item[key].toLowerCase().indexOf(column.filter.from.toLowerCase())==-1))
                            {
                                return false;
                            }
                        }
                    }
                    else if(column.type=='dropdown'){
                        if(column.filter.from.toString().length>0){
                            if(item[key]!=column.filter.from)
                            {
                                return false;
                            }
                        }
                    }
                    else if(column.type=='date'){
                        if(column.filter.from.toString().length>0){
                            if(new Date(item[key])<new Date(column.filter.from+" 00:00:00"))
                            {
                                return false;
                            }
                        }
                        if(column.filter.to.toString().length>0){
                            if(new Date(item[key])>new Date(column.filter.to+" 00:00:00"))
                            {
                                return false;
                            }
                        }
                    }
                }
            }
            return true;
        });
        let key=columns.sort.key;
        let dir=columns.sort.dir;
        if(key!='' ){
            if((key in columns.all) &&((dir=='asc')||(dir=='desc')))
            {
                if(columns.all[key].type=='number')
                {
                    filterItems.sort((a,b)=> (a[key] > b[key] ? 1: -1 ));
                }
                else if(columns.all[key].type=='date')
                {
                    filterItems.sort((a,b)=> (new Date(a[key]) > new Date(b[key]) ? 1 : -1));
                }
                else{
                    filterItems.sort((a,b)=> (a[key].localeCompare(b[key])));
                }
                if(dir=='desc'){
                    filterItems.reverse();
                }
            }
        }
        return filterItems;
    },
    exportCsv(columns,data,filename="output.csv")
    {
        let csvStr="";
        for(let  key in columns.all){
            let column=columns.all[key];
            if((columns.hidden.indexOf(key))==-1){
                csvStr=csvStr+'"'+column.label+'",';
            }
        }
        csvStr+="\n";
        for (let j=0;j<data.length;j++)
        {
            for(let  key in columns.all){
                if((columns.hidden.indexOf(key))==-1){
                    csvStr=csvStr+'"'+data[j][key]+'",';
                }
            }
            csvStr+="\n";
        }
        let hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csvStr);
        hiddenElement.target = '_blank';
        hiddenElement.download = filename;
        hiddenElement.click();
    },
    //handle by browser
    downloadUrl(url){
        window.open(url)
    },
    displayDate(timestamp){
        let date = new Date(timestamp);
        if(date.getDate() && timestamp){
            return  ('0' + date.getDate()).slice(-2)
                +' '+date.toLocaleString('default', { month: 'short' })
                +' '+date.getFullYear();
        }
        else{
            return '';
        }
    },
    displayDateTime(timestamp){
        let date = new Date(timestamp);
        if(date.getDate() && timestamp){
            return  ('0' + date.getDate()).slice(-2)
                +' '+date.toLocaleString('default', { month: 'short' })
                +' '+date.getFullYear()+" "
                +('0' + date.getHours()).slice(-2)+":"
                +('0' + date.getMinutes()).slice(-2)+":"
                +('0' + date.getSeconds()).slice(-2)
        }
        else{
            return '';
        }
    },
    getDatePart(timestamp){
        return timestamp?timestamp.substring(0,10):'';
    },
    getImageFormData:async function(formId){
        let inputs = document.getElementById(formId).getElementsByTagName('input');
        let formData=new FormData();
        for(let i=0;i<inputs.length;i++)
        {
            if(inputs[i]['type']=='file')
            {
                if(inputs[i]['id'])//id will be treated as input name
                {
                    if(inputs[i].files[0])
                    {
                        let resizedImage=null;
                        let file=inputs[i].files[0];
                        let file_type=file.type;
                        if(file_type && file_type.substring(0,5)=="image")
                        {
                            let minimum_size_to_resize=1372022;//1372022=1.3mb,409600=400KB
                            if(inputs[i].hasAttribute('data-minimum-size-to-resize'))
                            {
                                minimum_size_to_resize=inputs[i].getAttribute('data-minimum-size-to-resize');
                            }
                            if(file.size>minimum_size_to_resize)
                            {
                                let resize_width = 800;
                                if(inputs[i].hasAttribute('data-resize-width'))
                                {
                                    resize_width=inputs[i].getAttribute('data-resize-width');
                                }
                                let resize_height = 600;
                                if(inputs[i].hasAttribute('data-resize-height'))
                                {
                                    resize_height=inputs[i].getAttribute('data-resize-height');
                                }
                                let img = new Image();
                                const imageLoadPromise = new Promise(resolve => {
                                    img.onload = resolve;
                                    img.src = img.src=URL.createObjectURL(file);
                                });
                                await imageLoadPromise;
                                let width = img.naturalWidth;
                                let height = img.naturalHeight;
                                console.log(width,height);
                                if((width>resize_width)||(height>resize_height))
                                {
                                    if((width/height)>(resize_width/resize_height))
                                    {
                                        height *= resize_width / width;
                                        width = resize_width;
                                    }
                                    else
                                    {
                                        width *= resize_height / height;
                                        height = resize_height;
                                    }
                                    let canvas = document.createElement("canvas");
                                    canvas.width = width;
                                    canvas.height = height;
                                    let context = canvas.getContext("2d");
                                    context.drawImage(img, 0, 0, width, height);
                                    resizedImage=await new Promise(resolve => {
                                        canvas.toBlob(function(blob)
                                        {
                                            resolve(blob);
                                        });
                                    });
                                }
                                else{
                                    console.log("error height width")
                                }

                            }
                        }
                        if(resizedImage)
                        {
                            console.log("Resized")
                            formData.set(inputs[i]['id'], resizedImage, file.name+'.png');
                        }
                        else
                        {
                            console.log("Not resized")
                            formData.set(inputs[i]['id'], file, file.name);
                        }
                    }
                }
            }
        }
        return  Promise.resolve(formData);

    },
    isFormDataEmpty(formData){
        return formData.entries().next().done;
    },
    getImageUrl(path,defaultPath='no_image.jpg'){
        //return url?url:globalVariables.baseUrl+'theme/images/no_image.jpg';
        if(path){
            return globalVariables.baseURLUploadedFilesLink+'/'+path;
        }
        if(defaultPath){
            //check if it is url then return url. check by splitting by/ or start with http
            return globalVariables.baseUrl+'theme/images/'+defaultPath;
        }
        return '';
    },
    delay: async function(ms){
        await new Promise(res => setTimeout(res, ms));
    }
}