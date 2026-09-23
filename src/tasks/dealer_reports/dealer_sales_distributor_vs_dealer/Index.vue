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
  columns:{all:[],selectable1:[],selectable2:[],selectable3:[],hidden:[],sort:{key:'',dir:''}},
  pagination: {current_page: 1,per_page_options: [10,20,50,100,500,1000],per_page:-1,show_all_items:true},

  analysis_years:[],
  location_parts:[],
  location_areas:[],
  location_territories:[],
  distributors:[],
  dealers:[],

  crops:[],
  crop_types:[],
  varieties:[],
  pack_sizes :[],
  user_locations:{},
  bonus_setup: {},

})
labels.add([{language:globalVariables.language,file:'tasks'+taskData.api_url+'/labels.js'}])

const routing=async ()=>{

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
      taskData.distributors=res.data.distributors;
      taskData.dealers=res.data.dealers;

      taskData.user_locations=res.data.user_locations;

      taskData.crops=res.data.crops;
      taskData.crop_types=res.data.crop_types;
      taskData.pack_sizes=res.data.pack_sizes;
      let bonus_setup={}
      for(let i in res.data.bonus_setup){
        let row=res.data.bonus_setup[i];
        row['crop_name']=taskData.crops.find(t=>t.id==row['crop_id'])?.name;
        let html='';
        let crop_type_ids=row['crop_type_ids'].split(',');
        for(let j=1;j<crop_type_ids.length-1;j++){
          let crop_type_id=crop_type_ids[j];
          html+=(taskData.crop_types.find(t=>t.id==crop_type_id)?.name+'<br>')
        }
        row['crop_type_name']=html
        bonus_setup[row['id']]=row;
      }
      taskData.bonus_setup=bonus_setup;

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
