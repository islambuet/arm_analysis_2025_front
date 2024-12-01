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
  varieties: {},
  itemsFiltered: [],
  reportFields:{},
  columns:{all:{},hidden:[],sort:{key:'',dir:''}},
  crop_id:0,
  report_id:0,
  trial_station_id:0,
  year:0,
  season_id:globalVariables.current_season_id,
  trial_stations:[],
  seasons:[],
  cropInfo:{},
  crop_features:{},
  reportInfo:{},
  // inputFields:[],

})
labels.add([{language:globalVariables.language,file:'tasks'+taskData.api_url+'/labels.js'}])

const routing=async ()=>{
  let crop_id=route.params['crop_id']?route.params['crop_id']:0;
  let report_id=route.params['report_id']?route.params['report_id']:0;

  if((taskData.crop_id!=crop_id)||(taskData.report_id!=report_id)){
    taskData.permissions={};//resetting permission to rerender
    globalVariables.loadListData=true;
    taskData.crop_id=crop_id;
    taskData.report_id=report_id;
    await init();
  }
  let trial_station_id=route.params['trial_station_id']?route.params['trial_station_id']:0;
  let year=route.params['year']?route.params['year']:0;
  let season_id=route.params['season_id']?route.params['season_id']:globalVariables.current_season_id;
  if(trial_station_id==0 || year==0){
    trial_station_id=taskData.trial_stations[0].id;
    year=new Date().getFullYear();
    await router.push(taskData.api_url+'/'+crop_id+'/'+report_id+'/'+trial_station_id+'/'+year+'/'+season_id)
    console.log(taskData.api_url)
    return;
  }
  taskData.trial_station_id=trial_station_id
  taskData.year=year
  taskData.season_id=season_id
  if(taskData.trial_station_id>0 && taskData.year>0 && taskData.season_id>0){
    await getVarieties();
  }
}
watch(route, () => {
  routing();
})
const getVarieties=async()=>{
  if(globalVariables.loadListData)
  {
    await axios.get(taskData.api_url+'/'+taskData.crop_id+'/'+taskData.report_id+'/'+taskData.trial_station_id+'/'+taskData.year+'/'+taskData.season_id+'/get-varieties')
        .then(res => {
          if(res.data.error==''){
            taskData.varieties= res.data.varieties;
          }
          else{
            toastFunctions.showResponseError(res.data)
          }
          globalVariables.loadListData=false;
        })
  }
}
const init=async ()=>{
  await axios.get(taskData.api_url+'/'+taskData.crop_id+'/'+taskData.report_id+'/initialize').then((res)=>{
    if (res.data.error == "") {
      taskData.permissions=res.data.permissions;
      taskData.cropInfo=res.data.cropInfo;
      taskData.crop_features=res.data.crop_features;
      taskData.reportInfo=res.data.reportInfo;
      taskData.trial_stations=res.data.trial_stations;
      taskData.seasons=res.data.seasons;
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });
}
provide('taskData',taskData)
if(!(globalVariables.user.id>0)){
  router.push("/login")
}
else{
  routing();
}
</script>
