<template>
  <div v-if="taskData.permissions.action_0==1">
    <div v-show="taskData.method=='list'">
      <List/>
    </div>
    <div v-if="taskData.method=='edit'">
      <AddEdit/>
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
import AddEdit from './AddEdit.vue'

globalVariables.loadListData=true;
const route =useRoute()
const router =useRouter()

let taskData=reactive({
  api_url:systemFunctions.getTaskBaseURL(import.meta.url),
  method:'',
  permissions:{},
  items: {},
  columns:{all:{},hidden:[],sort:{key:'',dir:''}},
  crop_id:0,
  form_id:0,
  trial_station_id:0,
  year:0,
  season_id:globalVariables.current_season_id,
  trial_stations:[],
  seasons:[],
  cropInfo:{},
  crop_features:{},
  formInfo:{},
  inputFields:[],

})
labels.add([{language:globalVariables.language,file:'tasks'+taskData.api_url+'/labels.js'}])

const routing=async ()=>{
  let crop_id=route.params['crop_id']?route.params['crop_id']:0;
  let form_id=route.params['form_id']?route.params['form_id']:0;

  if((taskData.crop_id!=crop_id)||(taskData.form_id!=form_id)){
    taskData.permissions={};//resetting permission to rerender
    globalVariables.loadListData=true;
    taskData.crop_id=crop_id;
    taskData.form_id=form_id;
    //taskData.method='list';
    await init();
  }
  let trial_station_id=route.params['trial_station_id']?route.params['trial_station_id']:0;
  let year=route.params['year']?route.params['year']:0;
  let season_id=route.params['season_id']?route.params['season_id']:globalVariables.current_season_id;
  if(trial_station_id==0 || year==0){
    trial_station_id=taskData.trial_stations[0].id;
    year=new Date().getFullYear();
    await router.push(taskData.api_url+'/'+crop_id+'/'+form_id+'/'+trial_station_id+'/'+year+'/'+season_id)
    console.log(taskData.api_url)
    return;
  }
  taskData.trial_station_id=trial_station_id
  taskData.year=year
  taskData.season_id=season_id
  if(taskData.trial_station_id>0 && taskData.year>0 && taskData.season_id>0){
    await getItems();
  }
  if(route.path==(taskData.api_url+'/'+taskData.crop_id+'/'+taskData.form_id+'/'+taskData.trial_station_id+'/'+taskData.year+'/'+taskData.season_id)){
    taskData.method='list';
  }
  else if(route.path.indexOf(taskData.api_url+'/'+taskData.crop_id+'/'+taskData.form_id+'/'+taskData.trial_station_id+'/'+taskData.year+'/'+taskData.season_id+'/edit/')!=-1)
  {
    taskData.method='edit';
  }

   console.log(crop_id+' '+form_id)
}
watch(route, () => {
  routing();
})
const getItems=async()=>{
  if(globalVariables.loadListData)
  {
    await axios.get(taskData.api_url+'/'+taskData.crop_id+'/'+taskData.form_id+'/'+taskData.trial_station_id+'/'+taskData.year+'/'+taskData.season_id+'/get-items')
        .then(res => {
          if(res.data.error==''){
            taskData.items= res.data.items;
          }
          else{
            toastFunctions.showResponseError(res.data)
          }
          globalVariables.loadListData=false;
        })
  }
}
const init=async ()=>{
  await axios.get(taskData.api_url+'/'+taskData.crop_id+'/'+taskData.form_id+'/initialize').then((res)=>{
    if (res.data.error == "") {
      taskData.permissions=res.data.permissions;
      taskData.cropInfo=res.data.cropInfo;
      taskData.crop_features=res.data.crop_features;
      taskData.formInfo=res.data.formInfo;
      taskData.inputFields=res.data.inputFields;
      taskData.trial_stations=res.data.trial_stations;
      taskData.seasons=res.data.seasons;
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });
}
provide('taskData',taskData)

taskData.reloadItems=()=>{
  globalVariables.loadListData=true;
  getItems();
}
if(!(globalVariables.user.id>0)){
  router.push("/login")
}
else{
  routing();
}
</script>
