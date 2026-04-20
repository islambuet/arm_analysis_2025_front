<template>
  <div v-if="taskData.permissions.action_0==1">
    <div v-show="taskData.method=='list'">
      <List/>
    </div>
    <div v-if="taskData.method=='add'">
      <AddEdit/>
    </div>
    <div v-if="taskData.method=='edit'">
      <AddEdit/>
    </div>
    <div v-if="taskData.method=='details'">
      <Details/>
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
import Details from './Details.vue'

globalVariables.loadListData=false;
const route =useRoute()
const router =useRouter()

let taskData=reactive({
  api_url:systemFunctions.getTaskBaseURL(import.meta.url),
  method:'list',

  permissions:{},

  items: {data:[]},   //from Laravel server with pagination and info
  itemsFiltered: [],    //for display
  columns:{all:{},hidden:[],sort:{key:'',dir:''}},
  pagination: {current_page: 1,per_page_options: [10,20,50,100,200,500,1000],per_page:200,show_all_items:false},

  analysis_years:[],
  location_parts:[],
  location_areas:[],
  location_territories:[],
  location_upazilas:[],
  distributors:[],
  seasons:[],

  crops:[],
  crop_types:[],
  varieties:[],
  varieties_competitor_typewise:{},
  varieties_competitor_typewise_ordered:{},
  varieties_arm_typewise:{},
  varieties_arm_typewise_ordered:{},
  pack_sizes :[],
  user_locations:{},
})
labels.add([{language:globalVariables.language,file:'tasks'+taskData.api_url+'/labels.js'}])

const routing=async ()=>{
  //await getItems(taskData.pagination);//Load at least once
  if(route.path==taskData.api_url){
    taskData.method='list';
  }
  else if(route.path==taskData.api_url+'/add'){
    taskData.method='add';
  }
  else if(route.path.indexOf(taskData.api_url+'/edit/')!=-1)
  {
    taskData.method='edit';
  }
  else if(route.path.indexOf(taskData.api_url+'/details/')!=-1)
  {
    taskData.method='details';
  }
}
watch(route, () => {
  routing();
})


const getItems=async(pagination)=>{
  if(globalVariables.loadListData)
  {
    let formData=new FormData(document.getElementById('formListSearch'))
    formData.set('page',pagination.current_page)
    formData.set('perPage',pagination.per_page)
    await axios.post(taskData.api_url+'/get-items',formData)
        .then(res => {
          if (res.data.error == '') {
            taskData.items= res.data.items;
            taskData.setFilteredItems();
          } else {
            toastFunctions.showResponseError(res.data)
          }
          globalVariables.loadListData = false;
        })
  }
}
taskData.setFilteredItems=()=>{
  taskData.itemsFiltered=systemFunctions.getFilteredItems(taskData.items.data,taskData.columns);
}
taskData.reloadItems=(pagination)=>{
  globalVariables.loadListData=true;
  getItems(pagination);
}
const init=async ()=>{
  await axios.get(taskData.api_url+'/initialize').then((res)=>{
    if (res.data.error == "") {
      taskData.permissions=res.data.permissions;
      taskData.location_parts=res.data.location_parts;
      taskData.location_areas=res.data.location_areas;
      taskData.location_territories=res.data.location_territories;
      taskData.location_upazilas=res.data.location_upazilas;

      taskData.crops=res.data.crops;
      taskData.crop_types=res.data.crop_types;
      taskData.varieties_competitor_typewise=res.data.varieties_competitor_typewise;
      taskData.varieties_competitor_typewise_ordered=res.data.varieties_competitor_typewise_ordered;
      taskData.varieties_arm_typewise=res.data.varieties_arm_typewise;
      taskData.varieties_arm_typewise_ordered=res.data.varieties_arm_typewise_ordered;


      taskData.user_locations=res.data.user_locations;
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
taskData.getPartDropdownHtml=()=>{
  let html='<option value="">'+labels.get('label_select')+'</option>';
  for(let i in taskData.location_parts){
    let location=taskData.location_parts[i];
    html+=('<option value="'+location['id']+'">'+location['name']+'</option>');
  }
  return html;
}
taskData.getAreaDropdownHtml=(part_id)=>{
  let html='<option value="">'+labels.get('label_select')+'</option>';
  for(let i in taskData.location_areas){
    let location=taskData.location_areas[i];
    if(location['part_id']==part_id){
      html+=('<option value="'+location['id']+'">'+location['name']+'</option>');
    }
  }
  return html;
}
taskData.getTerritoryDropdownHtml=(area_id)=>{
  let html='<option value="">'+labels.get('label_select')+'</option>';
  for(let i in taskData.location_territories){
    let location=taskData.location_territories[i];
    if(location['area_id']==area_id){
      html+=('<option value="'+location['id']+'">'+location['name']+'</option>');
    }
  }
  return html;
}
taskData.getUpazilaDropdownHtml=(territory_id)=>{
  let html='<option value="">'+labels.get('label_select')+'</option>';
  for(let i in taskData.location_upazilas){
    let location=taskData.location_upazilas[i];
    if(location['territory_id']==territory_id){
      html+=('<option value="'+location['id']+'">'+(location['name']+'-'+location['district_name'])+'</option>');
    }
  }
  return html;
}
provide('taskData',taskData)
if(!(globalVariables.user.id>0)){
  router.push("/login")
}
else{
  init();
}
</script>
