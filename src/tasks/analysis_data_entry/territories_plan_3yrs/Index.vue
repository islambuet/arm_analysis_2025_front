<template>
  <div v-if="taskData.permissions.action_0==1">
    <div v-if="taskData.method=='add'">
      <AddEdit/>
    </div>
    <div v-if="taskData.method=='upload'">
      <Upload/>
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
import AddEdit from './AddEdit.vue'
import Upload from './Upload.vue'


globalVariables.loadListData=true;
const route =useRoute()
const router =useRouter()

let taskData=reactive({
  api_url:systemFunctions.getTaskBaseURL(import.meta.url),
  method:'',
  permissions:{},
  items: {data:[]},   //from Laravel server with pagination and info
  itemsFiltered: [],    //for display
  columns:{all:[],selectable:[],hidden:[],sort:{key:'',dir:''}},
  pagination: {current_page: 1,per_page_options: [10,20,50,100,500,1000],per_page:-1,show_all_items:true},

  analysis_years:[],
  location_parts:[],
  location_areas:[],
  location_territories:[],
  distributors:[],

  crops:[],
  crop_types:[],
  varieties:[],
  pack_sizes :[],
  user_locations:{},

})
labels.add([{language:globalVariables.language,file:'tasks'+taskData.api_url+'/labels.js'}])

const routing=async ()=>{
  if(route.path==taskData.api_url){
    taskData.method='add';
  }
  else if(route.path==taskData.api_url+'/upload'){
    taskData.method='upload';
  }
}
watch(route, () => {
  routing();
})

const init=async ()=>{
  await axios.get(taskData.api_url+'/initialize').then((res)=>{
    if (res.data.error == "") {
      taskData.permissions=res.data.permissions;

      taskData.location_parts=res.data.location_parts;
      taskData.location_areas=res.data.location_areas;
      taskData.location_territories=res.data.location_territories;

      taskData.user_locations=res.data.user_locations;
      taskData.crops=res.data.crops;
      taskData.crop_types=res.data.crop_types;
      taskData.varieties=res.data.varieties;

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

provide('taskData',taskData)
if(!(globalVariables.user.id>0)){
  router.push("/login")
}
else{
  init();
}
</script>
