<template>
  <div v-if="taskData.permissions.action_0==1">
    <Search/>
    <div v-show="taskData.method=='list'">

    </div>

  </div>
</template>
<script setup>
import globalVariables from "@/assets/globalVariables";
import systemFunctions from "@/assets/systemFunctions";
import toastFunctions from "@/assets/toastFunctions";
import labels from '@/labels'
import {provide, reactive, watch} from 'vue'
import {useRoute,useRouter} from 'vue-router';
import axios from 'axios';
import Search from './Search.vue'


globalVariables.loadListData=true;
const route =useRoute()
const router =useRouter()

let taskData=reactive({
  api_url:systemFunctions.getTaskBaseURL(import.meta.url),
  method:'',
  permissions:{},
  items: {data:[]},   //from Laravel server with pagination and info
  itemsFiltered: [],    //for display
  columns:{all:{},hidden:[],sort:{key:'',dir:''}},
  pagination: {current_page: 1,per_page_options: [10,20,50,100,500,1000],per_page:-1,show_all_items:true},
  year:new Date().getFullYear(),
  trial_stations:[],
  seasons:[],
  crops:[],
  crop_types:[],
  crop_features:[],
  principals :[],
  competitors:[],

})
labels.add([{language:globalVariables.language,file:'tasks'+taskData.api_url+'/labels.js'}])


const init=async ()=>{
  await axios.get(taskData.api_url+'/initialize').then((res)=>{
    if (res.data.error == "") {
      taskData.permissions=res.data.permissions;
      taskData.trial_stations=res.data.trial_stations;
      taskData.seasons=res.data.seasons;
      taskData.crops=res.data.crops;
      taskData.principals=res.data.principals;
      taskData.competitors=res.data.competitors;
      taskData.crop_types=res.data.crop_types;
      taskData.crop_features=res.data.crop_features;
      if(res.data.hidden_columns){
        taskData.columns.hidden=res.data.hidden_columns;
      }
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });
}
taskData.setFilteredItems=()=>{
  taskData.itemsFiltered=systemFunctions.getFilteredItems(taskData.items.data,taskData.columns);
}
provide('taskData',taskData)
if(!(globalVariables.user.id>0)){
  router.push("/login")
}
else{
  init();
}
</script>
