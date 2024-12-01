<template>
  <div v-if="taskData.permissions.action_0==1">
    <div v-show="taskData.method=='list'">
      <List/>
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
import List from './List.vue'

globalVariables.loadListData=true;
const route =useRoute()
const router =useRouter()

let taskData=reactive({
  api_url:systemFunctions.getTaskBaseURL(import.meta.url),
  method:'list',
  permissions:{},
  itemsPending: {},
  itemsDelivered: {},
  columns:{all:{},hidden:[],sort:{key:'',dir:''}},
  pagination: {current_page: 1,per_page_options: [10,20,50,100,500,1000],per_page:-1,show_all_items:true},
  trial_station_id:0,
  year:0,
  season_id:globalVariables.current_season_id,
  trial_stations:[],
  seasons:[],

})
labels.add([{language:globalVariables.language,file:'tasks'+taskData.api_url+'/labels.js'}])
const routing=async ()=>{

  let trial_station_id=route.params['trial_station_id']?route.params['trial_station_id']:0;
  let year=route.params['year']?route.params['year']:0;
  let season_id=route.params['season_id']?route.params['season_id']:globalVariables.current_season_id;
  if(taskData.trial_stations.length==0){
    toastFunctions.showErrorMessage("Setup Trial Station first");
    return;
  }
  if(trial_station_id==0 || year==0){
    trial_station_id=taskData.trial_stations[0].id;
    year=new Date().getFullYear();
    await router.push(taskData.api_url+'/'+trial_station_id+'/'+year+'/'+season_id)
    return;
  }
  taskData.trial_station_id=trial_station_id
  taskData.year=year
  taskData.season_id=season_id
  if(taskData.trial_station_id>0 && taskData.year>0 && taskData.season_id>0){
    await getItems(taskData.pagination);
  }
}
watch(route, () => {
  routing();
})
const init=async ()=>{
  await axios.get(taskData.api_url+'/initialize').then((res)=>{
    if (res.data.error == "") {
      taskData.trial_stations=res.data.trial_stations;
      taskData.seasons=res.data.seasons;
      taskData.permissions=res.data.permissions;
      if(res.data.hidden_columns){
        taskData.columns.hidden=res.data.hidden_columns;
      }
      routing();
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });
}
const getItems=async()=>{
  if(globalVariables.loadListData)
  {
    await axios.get(taskData.api_url+'/'+taskData.trial_station_id+'/'+taskData.year+'/'+taskData.season_id+'/get-items')
        .then(res => {
          if(res.data.error==''){
            taskData.itemsPending= res.data.itemsPending;
            taskData.itemsDelivered= res.data.itemsDelivered;
          }
          else{
            toastFunctions.showResponseError(res.data)
          }
          globalVariables.loadListData=false;
        })
  }
}
taskData.reloadItems=()=>{
  globalVariables.loadListData=true;
  getItems();
}
provide('taskData',taskData)
if(!(globalVariables.user.id>0)){
  router.push("/login")
}
else{
  init();
}
</script>
